// ============================================
// SUBWAY LINES — Toggle, Render, Animate
// ============================================

let subwayVisible = false;
let subwayLayerIds = [];
let subwaySourceIds = [];
let subwayStationMarkers = [];
let activeSubwayPopup = null;
let trainAnimationId = null;
let trainMarker = null;

// ─── Toggle subway lines on/off ─────────────────────────────────
function toggleSubwayLines() {
  const btn = document.getElementById('subway-toggle');
  if (!btn) return;

  if (!hoodMap || !hoodMapReady) return;

  subwayVisible = !subwayVisible;
  btn.classList.toggle('active', subwayVisible);

  if (subwayVisible) {
    addSubwayLayers();
  } else {
    removeSubwayLayers();
    closeSubwayPopup();
    stopTrainAnimation();
  }
}

// ─── Add subway line layers to the map ──────────────────────────
function addSubwayLayers() {
  if (!hoodMap || typeof SUBWAY_LINES === 'undefined') return;

  SUBWAY_LINES.forEach(line => {
    const sourceId = 'subway-line-' + line.id;
    const layerId = 'subway-layer-' + line.id;
    const casingId = 'subway-casing-' + line.id;

    // Skip if already added
    if (hoodMap.getSource(sourceId)) return;

    // Build GeoJSON LineString from route
    const geojson = {
      type: 'Feature',
      properties: {
        lineId: line.id,
        name: line.name,
        color: line.color
      },
      geometry: {
        type: 'LineString',
        coordinates: line.route
      }
    };

    hoodMap.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    });

    // White casing behind the line for contrast
    hoodMap.addLayer({
      id: casingId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 5,
        'line-opacity': 0.8
      }
    });

    // Colored line
    hoodMap.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': line.color,
        'line-width': 3,
        'line-opacity': 0.9
      }
    });

    subwaySourceIds.push(sourceId);
    subwayLayerIds.push(casingId, layerId);

    // Click handler on the colored line
    hoodMap.on('click', layerId, function(e) {
      e.preventDefault();
      if (e.originalEvent) e.originalEvent.stopPropagation();
      showSubwayInfo(line);
    });

    // Cursor change on hover
    hoodMap.on('mouseenter', layerId, function() {
      hoodMap.getCanvas().style.cursor = 'pointer';
    });
    hoodMap.on('mouseleave', layerId, function() {
      hoodMap.getCanvas().style.cursor = '';
    });
  });

  // Add station dots
  addStationMarkers();
}

// ─── Add station dot markers ────────────────────────────────────
function addStationMarkers() {
  if (typeof SUBWAY_STATIONS === 'undefined') return;

  // Deduplicate by name+coords (many stations appear for multiple lines)
  const seen = {};
  const unique = [];
  SUBWAY_STATIONS.forEach(s => {
    const key = s.name + '|' + s.lat.toFixed(4) + '|' + s.lng.toFixed(4);
    if (!seen[key]) {
      seen[key] = true;
      unique.push(s);
    }
  });

  // Use a single GeoJSON source for stations
  const stationFeatures = unique.map(s => ({
    type: 'Feature',
    properties: {
      name: s.name,
      lines: s.lines.join(', '),
      isTransfer: s.isTransfer
    },
    geometry: {
      type: 'Point',
      coordinates: [s.lng, s.lat]
    }
  }));

  const sourceId = 'subway-stations';
  if (hoodMap.getSource(sourceId)) return;

  hoodMap.addSource(sourceId, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: stationFeatures }
  });

  // Transfer station outlines (larger)
  hoodMap.addLayer({
    id: 'subway-stations-transfer',
    type: 'circle',
    source: sourceId,
    filter: ['==', ['get', 'isTransfer'], true],
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['zoom'],
        10, 2,
        14, 5,
        16, 7
      ],
      'circle-color': '#ffffff',
      'circle-stroke-color': '#1C1C1C',
      'circle-stroke-width': [
        'interpolate', ['linear'], ['zoom'],
        10, 0.5,
        14, 1.5
      ],
      'circle-opacity': 0.9
    }
  });

  // Regular stations
  hoodMap.addLayer({
    id: 'subway-stations-regular',
    type: 'circle',
    source: sourceId,
    filter: ['==', ['get', 'isTransfer'], false],
    paint: {
      'circle-radius': [
        'interpolate', ['linear'], ['zoom'],
        10, 1.5,
        14, 3.5,
        16, 5
      ],
      'circle-color': '#ffffff',
      'circle-stroke-color': '#666666',
      'circle-stroke-width': [
        'interpolate', ['linear'], ['zoom'],
        10, 0.5,
        14, 1
      ],
      'circle-opacity': 0.85
    }
  });

  subwayLayerIds.push('subway-stations-transfer', 'subway-stations-regular');
  subwaySourceIds.push(sourceId);
}

// ─── Remove all subway layers ───────────────────────────────────
function removeSubwayLayers() {
  subwayLayerIds.forEach(id => {
    if (hoodMap.getLayer(id)) hoodMap.removeLayer(id);
  });
  subwaySourceIds.forEach(id => {
    if (hoodMap.getSource(id)) hoodMap.removeSource(id);
  });
  subwayLayerIds = [];
  subwaySourceIds = [];
}

// ─── Show line info popup ───────────────────────────────────────
function showSubwayInfo(line) {
  closeSubwayPopup();
  stopTrainAnimation();

  // Get stations for this line
  const lineStations = getStationsForLine(line.id);

  const mapWrap = document.querySelector('.hood-map-wrap');
  if (!mapWrap) return;

  const popup = document.createElement('div');
  popup.className = 'subway-info-popup';
  popup.id = 'subway-info-popup';

  // Badge text — use line ID (e.g. "1", "A", "SIR")
  const badgeText = line.id.length <= 3 ? line.id : line.id.charAt(0);

  popup.innerHTML = `
    <div class="subway-info-header">
      <div class="subway-info-badge" style="background:${line.color}">${escHtml(badgeText)}</div>
      <div>
        <div class="subway-info-title">${escHtml(line.name)}</div>
        <div class="subway-info-subtitle">${escHtml(line.termini[0])} → ${escHtml(line.termini[1])}</div>
      </div>
      <button class="subway-info-close" onclick="closeSubwayPopup()">×</button>
    </div>
    <div class="subway-info-body">
      <div class="subway-info-stops" id="subway-stops-list">
        ${lineStations.map((s, i) => `
          <div class="subway-stop-item" data-station-idx="${i}">
            <div class="subway-stop-line" style="background:${line.color}"></div>
            <div class="subway-stop-dot" style="border-color:${line.color}"></div>
            <span>${escHtml(s.name)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="subway-info-actions">
      <button class="subway-ride-btn" id="ride-btn" style="background:${line.color}" onclick="startTrainRide('${line.id}')">
        Ride the ${escHtml(line.id)} Train
      </button>
    </div>
  `;

  mapWrap.appendChild(popup);
  activeSubwayPopup = popup;
}

// ─── Get unique stations along a line in route order ────────────
function getStationsForLine(lineId) {
  if (typeof SUBWAY_STATIONS === 'undefined') return [];

  const line = SUBWAY_LINES.find(l => l.id === lineId);
  if (!line) return [];

  // Get all stations that include this line
  const lineStations = SUBWAY_STATIONS.filter(s => s.lines.includes(lineId));

  // Deduplicate by name
  const seen = {};
  const unique = [];
  lineStations.forEach(s => {
    if (!seen[s.name]) {
      seen[s.name] = true;
      unique.push(s);
    }
  });

  // Sort stations by proximity along the route
  // For each station, find nearest point on the route and its fractional position
  unique.forEach(s => {
    let bestDist = Infinity;
    let bestT = 0;
    for (let i = 0; i < line.route.length - 1; i++) {
      const [x1, y1] = line.route[i];
      const [x2, y2] = line.route[i + 1];
      const dx = x2 - x1, dy = y2 - y1;
      const len2 = dx * dx + dy * dy;
      let t = len2 === 0 ? 0 : ((s.lng - x1) * dx + (s.lat - y1) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const px = x1 + t * dx, py = y1 + t * dy;
      const dist = Math.sqrt((s.lng - px) ** 2 + (s.lat - py) ** 2);
      const segT = i + t;
      if (dist < bestDist) {
        bestDist = dist;
        bestT = segT;
      }
    }
    s._routePos = bestT;
  });

  unique.sort((a, b) => a._routePos - b._routePos);
  return unique;
}

// ─── Close subway info popup ────────────────────────────────────
function closeSubwayPopup() {
  const popup = document.getElementById('subway-info-popup');
  if (popup) popup.remove();
  activeSubwayPopup = null;
}

// ─── Start train ride animation ─────────────────────────────────
function startTrainRide(lineId) {
  stopTrainAnimation();

  const line = SUBWAY_LINES.find(l => l.id === lineId);
  if (!line || !hoodMap) return;

  const rideBtn = document.getElementById('ride-btn');
  if (rideBtn) {
    rideBtn.disabled = true;
    rideBtn.textContent = 'Riding...';
  }

  const lineStations = getStationsForLine(lineId);

  // Interpolate dense points along the route for smooth animation
  const denseRoute = interpolateRoute(line.route, 200);

  // Create the moving train marker
  const el = document.createElement('div');
  el.className = 'subway-train-marker';
  el.style.background = line.color;
  el.textContent = line.id.length <= 2 ? line.id : line.id.charAt(0);

  trainMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat(denseRoute[0])
    .addTo(hoodMap);

  // Animation state
  let currentIdx = 0;
  const totalFrames = denseRoute.length;
  const msPerFrame = 30; // ~33fps, total ride ~6 seconds for 200 points

  // Pre-compute station trigger indices (route fraction → dense index)
  const stationTriggers = lineStations.map(s => {
    let bestDist = Infinity;
    let bestIdx = 0;
    denseRoute.forEach((pt, i) => {
      const d = Math.sqrt((pt[0] - s.lng) ** 2 + (pt[1] - s.lat) ** 2);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    return bestIdx;
  });

  // Track which stations/hoods have been highlighted
  const highlightedStations = new Set();
  const highlightedHoods = new Set();

  function animate() {
    if (currentIdx >= totalFrames) {
      finishTrainRide(lineId);
      return;
    }

    const pt = denseRoute[currentIdx];
    trainMarker.setLngLat(pt);

    // Check if we've reached a station
    stationTriggers.forEach((triggerIdx, stationI) => {
      if (currentIdx >= triggerIdx && !highlightedStations.has(stationI)) {
        highlightedStations.add(stationI);
        highlightStopInList(stationI);
        pulseStationOnMap(lineStations[stationI], line.color);
      }
    });

    // Check which neighborhood the train is in, highlight it
    highlightNeighborhoodAtPoint(pt, line.color, highlightedHoods);

    currentIdx++;
    trainAnimationId = setTimeout(animate, msPerFrame);
  }

  // Zoom to fit the line
  const bounds = new mapboxgl.LngLatBounds();
  line.route.forEach(pt => bounds.extend(pt));
  hoodMap.fitBounds(bounds, { padding: 60, duration: 800 });

  // Start after zoom settles
  setTimeout(animate, 900);
}

// ─── Interpolate route into N evenly-spaced points ──────────────
function interpolateRoute(route, numPoints) {
  // Compute cumulative distances
  const dists = [0];
  for (let i = 1; i < route.length; i++) {
    const dx = route[i][0] - route[i - 1][0];
    const dy = route[i][1] - route[i - 1][1];
    dists.push(dists[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalDist = dists[dists.length - 1];
  if (totalDist === 0) return [route[0]];

  const result = [];
  for (let n = 0; n < numPoints; n++) {
    const targetDist = (n / (numPoints - 1)) * totalDist;
    // Find segment
    let seg = 0;
    for (let i = 1; i < dists.length; i++) {
      if (dists[i] >= targetDist) { seg = i - 1; break; }
    }
    const segLen = dists[seg + 1] - dists[seg];
    const t = segLen === 0 ? 0 : (targetDist - dists[seg]) / segLen;
    const x = route[seg][0] + t * (route[seg + 1][0] - route[seg][0]);
    const y = route[seg][1] + t * (route[seg + 1][1] - route[seg][1]);
    result.push([x, y]);
  }
  return result;
}

// ─── Highlight stop in the sidebar list ─────────────────────────
function highlightStopInList(stationIdx) {
  const list = document.getElementById('subway-stops-list');
  if (!list) return;
  const items = list.querySelectorAll('.subway-stop-item');
  if (items[stationIdx]) {
    items[stationIdx].classList.add('highlighted');
    // Scroll into view
    items[stationIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ─── Pulse a station on the map ─────────────────────────────────
function pulseStationOnMap(station, color) {
  if (!hoodMap || !station) return;

  // Add a temporary pulsing circle
  const pulseId = 'pulse-' + station.id + '-' + Date.now();

  hoodMap.addSource(pulseId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [station.lng, station.lat]
      }
    }
  });

  hoodMap.addLayer({
    id: pulseId,
    type: 'circle',
    source: pulseId,
    paint: {
      'circle-radius': 12,
      'circle-color': color,
      'circle-opacity': 0.5,
      'circle-stroke-color': color,
      'circle-stroke-width': 2,
      'circle-stroke-opacity': 0.8
    }
  });

  // Animate pulse out
  let opacity = 0.5;
  let radius = 12;
  const pulseInterval = setInterval(() => {
    opacity -= 0.04;
    radius += 1;
    if (opacity <= 0 || !hoodMap.getLayer(pulseId)) {
      clearInterval(pulseInterval);
      if (hoodMap.getLayer(pulseId)) hoodMap.removeLayer(pulseId);
      if (hoodMap.getSource(pulseId)) hoodMap.removeSource(pulseId);
      return;
    }
    try {
      hoodMap.setPaintProperty(pulseId, 'circle-opacity', opacity);
      hoodMap.setPaintProperty(pulseId, 'circle-radius', radius);
      hoodMap.setPaintProperty(pulseId, 'circle-stroke-opacity', opacity);
    } catch (e) { clearInterval(pulseInterval); }
  }, 50);
}

// ─── Highlight neighborhood polygon as train passes through ─────
function highlightNeighborhoodAtPoint(lngLat, color, alreadyHighlighted) {
  if (!hoodMap) return;

  // Query map features under this point
  const point = hoodMap.project(lngLat);
  const features = hoodMap.queryRenderedFeatures(point, { layers: ['nta-fill'] });

  features.forEach(f => {
    const code = f.properties.ntaCode;
    if (code && !alreadyHighlighted.has(code)) {
      alreadyHighlighted.add(code);

      // Brief highlight using feature state
      const numId = f.id;
      if (numId !== undefined) {
        hoodMap.setFeatureState(
          { source: 'nta-polygons', id: numId },
          { subwayHighlight: true }
        );

        // Also check locality polygons
        if (hoodMap.getSource('locality-polygons')) {
          const locFeatures = hoodMap.queryRenderedFeatures(point, { layers: ['locality-fill'] });
          locFeatures.forEach(lf => {
            if (lf.id !== undefined) {
              hoodMap.setFeatureState(
                { source: 'locality-polygons', id: lf.id },
                { subwayHighlight: true }
              );
            }
          });
        }

        // Fade out the highlight after a moment
        setTimeout(() => {
          try {
            hoodMap.setFeatureState(
              { source: 'nta-polygons', id: numId },
              { subwayHighlight: false }
            );
          } catch (e) {}
        }, 2000);
      }
    }
  });
}

// ─── Finish the train ride ──────────────────────────────────────
function finishTrainRide(lineId) {
  const rideBtn = document.getElementById('ride-btn');
  if (rideBtn) {
    rideBtn.disabled = false;
    rideBtn.textContent = 'Ride Again';
  }

  // Remove train marker after a beat
  setTimeout(() => {
    if (trainMarker) {
      trainMarker.remove();
      trainMarker = null;
    }
  }, 1500);

  // Clear all subway highlights from neighborhoods
  clearSubwayHighlights();
}

// ─── Stop any running train animation ───────────────────────────
function stopTrainAnimation() {
  if (trainAnimationId) {
    clearTimeout(trainAnimationId);
    trainAnimationId = null;
  }
  if (trainMarker) {
    trainMarker.remove();
    trainMarker = null;
  }
  clearSubwayHighlights();
}

// ─── Clear subway highlight states from all features ────────────
function clearSubwayHighlights() {
  if (!hoodMap) return;

  // Reset feature states on NTA polygons
  try {
    if (hoodMap.getSource('nta-polygons')) {
      // Query all currently rendered NTA features and reset
      const features = hoodMap.queryRenderedFeatures({ layers: ['nta-fill'] });
      features.forEach(f => {
        if (f.id !== undefined) {
          hoodMap.setFeatureState(
            { source: 'nta-polygons', id: f.id },
            { subwayHighlight: false }
          );
        }
      });
    }
  } catch (e) {}
}

// ─── Add subway highlight paint expression to NTA fill layer ────
// Called after map loads to augment fill-opacity with subway highlight state
function augmentNTALayerForSubway() {
  if (!hoodMap) return;

  // Merge subway highlight into the existing fill-opacity expression
  // Original expression uses feature-state 'hover' and 'status'
  // We add a top-level check: if subwayHighlight → 0.6, else → original expression
  try {
    hoodMap.setPaintProperty('nta-fill', 'fill-opacity', [
      'case',
      ['boolean', ['feature-state', 'subwayHighlight'], false],
      0.6,  // Bright when train passes through
      // Original expression:
      ['case',
        ['boolean', ['feature-state', 'hover'], false],
        ['case',
          ['any',
            ['==', ['feature-state', 'status'], 'lived'],
            ['==', ['feature-state', 'status'], 'visited']
          ], 0.27,
          0.12
        ],
        ['==', ['feature-state', 'status'], 'lived'], 0.55,
        ['==', ['feature-state', 'status'], 'visited'], 0.40,
        0
      ]
    ]);
  } catch (e) {
    // Layer might not exist yet, that's ok
  }
}

// Hook into map load — augment layers once map is ready
(function() {
  const waitForMap = setInterval(() => {
    if (hoodMap && hoodMapReady) {
      clearInterval(waitForMap);
      // Wait a beat for all layers to be added
      setTimeout(augmentNTALayerForSubway, 500);
    }
  }, 200);
})();

// ============================================
// SUBWAY LINES — Individual Line Selection
// ============================================

let activeLines = new Set();
let subwayPickerPanel = null;
let activeSubwayPopup = null;
let trainAnimationId = null;
let trainMarker = null;

// ─── Toggle the line picker panel ───────────────────────────────
function toggleSubwayLines() {
  const btn = document.getElementById('subway-toggle');
  if (!btn) return;

  if (!hoodMap || !hoodMapReady) return;

  if (subwayPickerPanel) {
    closeSubwayPickerPanel();
  } else {
    openSubwayPickerPanel();
  }
}

// ─── Open the line picker panel ─────────────────────────────────
function openSubwayPickerPanel() {
  if (subwayPickerPanel) return;
  if (typeof SUBWAY_LINES === 'undefined') return;

  const mapWrap = document.querySelector('.hood-map-wrap');
  if (!mapWrap) return;

  const btn = document.getElementById('subway-toggle');
  if (btn) btn.classList.add('active');

  const panel = document.createElement('div');
  panel.className = 'subway-picker-panel';
  panel.id = 'subway-picker-panel';

  // Group lines by color family
  const grouped = groupLinesByColor(SUBWAY_LINES);

  let badgesHtml = '';
  grouped.forEach(group => {
    badgesHtml += '<div class="subway-badge-group">';
    group.forEach(line => {
      const badgeText = line.id.length <= 3 ? line.id : line.id.charAt(0);
      badgesHtml += `
        <button class="subway-line-badge"
                data-line-id="${line.id}"
                style="background-color: ${line.color}"
                onclick="toggleSingleLine('${line.id}')"
                title="${escHtml(line.name)}">
          ${escHtml(badgeText)}
        </button>
      `;
    });
    badgesHtml += '</div>';
  });

  panel.innerHTML = `
    <div class="subway-picker-header">
      <div class="subway-picker-title">Subway Lines</div>
      <button class="subway-picker-close" onclick="closeSubwayPickerPanel()">×</button>
    </div>
    <div class="subway-picker-grid">
      ${badgesHtml}
    </div>
  `;

  mapWrap.appendChild(panel);
  subwayPickerPanel = panel;
}

// ─── Close the line picker panel ────────────────────────────────
function closeSubwayPickerPanel() {
  if (subwayPickerPanel) {
    subwayPickerPanel.remove();
    subwayPickerPanel = null;
  }
  const btn = document.getElementById('subway-toggle');
  if (btn) btn.classList.remove('active');
}

// ─── Group lines by color family (MTA standard groupings) ─────
function groupLinesByColor(lines) {
  // MTA groups lines by shared trunk routes
  const groupDefs = [
    { ids: ['1', '2', '3'], label: 'red' },
    { ids: ['4', '5', '6'], label: 'green' },
    { ids: ['7'], label: 'purple' },
    { ids: ['A', 'C', 'E'], label: 'blue' },
    { ids: ['B', 'D', 'F', 'M'], label: 'orange' },
    { ids: ['N', 'Q', 'R', 'W'], label: 'yellow' },
    { ids: ['J', 'Z'], label: 'brown' },
    { ids: ['L'], label: 'gray-l' },
    { ids: ['G'], label: 'green-g' },
    { ids: ['S'], label: 'shuttle' },
    { ids: ['SIR'], label: 'sir' },
  ];

  const lineMap = {};
  lines.forEach(l => { lineMap[l.id] = l; });

  const result = [];
  groupDefs.forEach(g => {
    const group = g.ids.map(id => lineMap[id]).filter(Boolean);
    if (group.length > 0) result.push(group);
  });
  return result;
}

// ─── Toggle a single line on/off ───────────────────────────────
function toggleSingleLine(lineId) {
  if (activeLines.has(lineId)) {
    removeSingleLine(lineId);
  } else {
    addSingleLine(lineId);
  }

  // Update badge state
  updateLineBadgeState(lineId);
}

// ─── Update badge active state ─────────────────────────────────
function updateLineBadgeState(lineId) {
  if (!subwayPickerPanel) return;
  const badge = subwayPickerPanel.querySelector(`[data-line-id="${lineId}"]`);
  if (badge) {
    if (activeLines.has(lineId)) {
      badge.classList.add('active');
    } else {
      badge.classList.remove('active');
    }
  }
}

// ─── Add a single line to the map ──────────────────────────────
function addSingleLine(lineId) {
  if (!hoodMap || typeof SUBWAY_LINES === 'undefined') return;
  if (activeLines.has(lineId)) return;

  const line = SUBWAY_LINES.find(l => l.id === lineId);
  if (!line) return;

  // Ensure station dots layer exists
  ensureStationDotsLayer();

  const sourceId = 'subway-route-' + lineId;
  const casingId = 'subway-casing-' + lineId;
  const routeId = 'subway-route-layer-' + lineId;
  const dotsId = 'subway-dots-' + lineId;

  // Build GeoJSON LineString from station coords
  const lineStations = getStationsForLine(lineId);
  const coordinates = lineStations.map(s => [s.lng, s.lat]);

  if (coordinates.length === 0) return;

  // Add route source
  hoodMap.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {
        lineId: lineId,
        name: line.name,
        color: line.color
      },
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    }
  });

  // White casing
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

  // Colored route line
  hoodMap.addLayer({
    id: routeId,
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

  // Add station dots for this line
  const dotsGeoJSON = {
    type: 'FeatureCollection',
    features: lineStations.map((s, idx) => ({
      type: 'Feature',
      properties: {
        name: s.name,
        lineId: lineId,
        isTransfer: s.transfer || false,
        stationIdx: idx
      },
      geometry: {
        type: 'Point',
        coordinates: [s.lng, s.lat]
      }
    }))
  };

  hoodMap.addSource(dotsId, {
    type: 'geojson',
    data: dotsGeoJSON
  });

  // Transfer station dots (larger, darker)
  hoodMap.addLayer({
    id: dotsId + '-transfer',
    type: 'circle',
    source: dotsId,
    filter: ['==', ['get', 'isTransfer'], true],
    paint: {
      'circle-radius': 6,
      'circle-color': '#ffffff',
      'circle-stroke-color': line.color,
      'circle-stroke-width': 2.5,
      'circle-opacity': 0.95
    }
  });

  // Regular station dots
  hoodMap.addLayer({
    id: dotsId + '-regular',
    type: 'circle',
    source: dotsId,
    filter: ['==', ['get', 'isTransfer'], false],
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-color': line.color,
      'circle-stroke-width': 2,
      'circle-opacity': 0.9
    }
  });

  // Click handlers on the route line
  hoodMap.on('click', routeId, function(e) {
    e.preventDefault();
    if (e.originalEvent) e.originalEvent.stopPropagation();
    showSubwayInfo(line);
  });

  hoodMap.on('mouseenter', routeId, function() {
    hoodMap.getCanvas().style.cursor = 'pointer';
  });
  hoodMap.on('mouseleave', routeId, function() {
    hoodMap.getCanvas().style.cursor = '';
  });

  activeLines.add(lineId);
}

// ─── Remove a single line from the map ─────────────────────────
function removeSingleLine(lineId) {
  if (!hoodMap) return;
  if (!activeLines.has(lineId)) return;

  const sourceId = 'subway-route-' + lineId;
  const casingId = 'subway-casing-' + lineId;
  const routeId = 'subway-route-layer-' + lineId;
  const dotsId = 'subway-dots-' + lineId;

  // Remove layers
  ['transfer', 'regular'].forEach(suffix => {
    const layerId = dotsId + '-' + suffix;
    if (hoodMap.getLayer(layerId)) hoodMap.removeLayer(layerId);
  });

  if (hoodMap.getLayer(routeId)) hoodMap.removeLayer(routeId);
  if (hoodMap.getLayer(casingId)) hoodMap.removeLayer(casingId);

  // Remove sources
  if (hoodMap.getSource(sourceId)) hoodMap.removeSource(sourceId);
  if (hoodMap.getSource(dotsId)) hoodMap.removeSource(dotsId);

  activeLines.delete(lineId);
}

// ─── Ensure station dots reference layer exists ────────────────
function ensureStationDotsLayer() {
  if (!hoodMap) return;
  // This is just a placeholder; actual dots are added per-line
}

// ─── Show line info popup ─────────────────────────────────────
function showSubwayInfo(line) {
  closeSubwayPopup();
  stopTrainAnimation();

  const lineStations = getStationsForLine(line.id);

  const mapWrap = document.querySelector('.hood-map-wrap');
  if (!mapWrap) return;

  const popup = document.createElement('div');
  popup.className = 'subway-info-popup';
  popup.id = 'subway-info-popup';

  const badgeText = line.id.length <= 3 ? line.id : line.id.charAt(0);

  popup.innerHTML = `
    <div class="subway-info-header">
      <div class="subway-info-badge" style="background:${line.color}">${escHtml(badgeText)}</div>
      <div>
        <div class="subway-info-title">${escHtml(line.name)}</div>
        <div class="subway-info-subtitle">${escHtml(lineStations[0]?.name || '')} → ${escHtml(lineStations[lineStations.length - 1]?.name || '')}</div>
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

// ─── Close subway info popup ───────────────────────────────────
function closeSubwayPopup() {
  const popup = document.getElementById('subway-info-popup');
  if (popup) popup.remove();
  activeSubwayPopup = null;
}

// ─── Get unique stations along a line in route order ────────────
function getStationsForLine(lineId) {
  if (typeof SUBWAY_LINES === 'undefined') return [];

  const line = SUBWAY_LINES.find(l => l.id === lineId);
  if (!line) return [];

  // Get all stations that include this line
  const lineStations = line.stations || [];

  // Return stations as-is; they're already in order
  return lineStations;
}

// ─── Start train ride animation ───────────────────────────────
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
  if (lineStations.length === 0) return;

  // Build coordinate path from stations
  const stationCoords = lineStations.map(s => [s.lng, s.lat]);

  // Interpolate dense points for smooth animation
  const denseRoute = interpolateRoute(stationCoords, 200);

  // Create train marker
  const el = document.createElement('div');
  el.className = 'subway-train-marker';
  el.style.background = line.color;
  el.textContent = line.id.length <= 2 ? line.id : line.id.charAt(0);

  trainMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat(denseRoute[0])
    .addTo(hoodMap);

  let currentIdx = 0;
  const totalFrames = denseRoute.length;
  const msPerFrame = 30;

  // Pre-compute station trigger indices
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

  const highlightedStations = new Set();
  const highlightedHoods = new Set();

  function animate() {
    if (currentIdx >= totalFrames) {
      finishTrainRide(lineId);
      return;
    }

    const pt = denseRoute[currentIdx];
    trainMarker.setLngLat(pt);

    stationTriggers.forEach((triggerIdx, stationI) => {
      if (currentIdx >= triggerIdx && !highlightedStations.has(stationI)) {
        highlightedStations.add(stationI);
        highlightStopInList(stationI);
        pulseStationOnMap(lineStations[stationI], line.color);
      }
    });

    highlightNeighborhoodAtPoint(pt, line.color, highlightedHoods);

    currentIdx++;
    trainAnimationId = setTimeout(animate, msPerFrame);
  }

  // Zoom to fit
  const bounds = new mapboxgl.LngLatBounds();
  stationCoords.forEach(pt => bounds.extend(pt));
  hoodMap.fitBounds(bounds, { padding: 60, duration: 800 });

  // Start after zoom
  setTimeout(animate, 900);
}

// ─── Interpolate route into N evenly-spaced points ────────────
function interpolateRoute(route, numPoints) {
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
    let seg = 0;
    for (let i = 1; i < dists.length; i++) {
      if (dists[i] >= targetDist) {
        seg = i - 1;
        break;
      }
    }
    const segLen = dists[seg + 1] - dists[seg];
    const t = segLen === 0 ? 0 : (targetDist - dists[seg]) / segLen;
    const x = route[seg][0] + t * (route[seg + 1][0] - route[seg][0]);
    const y = route[seg][1] + t * (route[seg + 1][1] - route[seg][1]);
    result.push([x, y]);
  }
  return result;
}

// ─── Highlight stop in the list ────────────────────────────────
function highlightStopInList(stationIdx) {
  const list = document.getElementById('subway-stops-list');
  if (!list) return;
  const items = list.querySelectorAll('.subway-stop-item');
  if (items[stationIdx]) {
    items[stationIdx].classList.add('highlighted');
    items[stationIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ─── Pulse a station on the map ────────────────────────────────
function pulseStationOnMap(station, color) {
  if (!hoodMap || !station) return;

  const pulseId = 'pulse-' + (station.name || 'station').replace(/\s+/g, '-') + '-' + Date.now();

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
    } catch (e) {
      clearInterval(pulseInterval);
    }
  }, 50);
}

// ─── Highlight neighborhood at point ────────────────────────────
function highlightNeighborhoodAtPoint(lngLat, color, alreadyHighlighted) {
  if (!hoodMap) return;

  const point = hoodMap.project(lngLat);
  const features = hoodMap.queryRenderedFeatures(point, { layers: ['nta-fill'] });

  features.forEach(f => {
    const code = f.properties.ntaCode;
    if (code && !alreadyHighlighted.has(code)) {
      alreadyHighlighted.add(code);

      const numId = f.id;
      if (numId !== undefined) {
        hoodMap.setFeatureState(
          { source: 'nta-polygons', id: numId },
          { subwayHighlight: true }
        );

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

// ─── Finish the train ride ─────────────────────────────────────
function finishTrainRide(lineId) {
  const rideBtn = document.getElementById('ride-btn');
  if (rideBtn) {
    rideBtn.disabled = false;
    rideBtn.textContent = 'Ride Again';
  }

  setTimeout(() => {
    if (trainMarker) {
      trainMarker.remove();
      trainMarker = null;
    }
  }, 1500);

  clearSubwayHighlights();
}

// ─── Stop any running train animation ──────────────────────────
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

// ─── Clear subway highlight states from all features ───────────
function clearSubwayHighlights() {
  if (!hoodMap) return;

  try {
    if (hoodMap.getSource('nta-polygons')) {
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

// ─── Augment NTA layer for subway highlight ────────────────────
function augmentNTALayerForSubway() {
  if (!hoodMap) return;

  try {
    hoodMap.setPaintProperty('nta-fill', 'fill-opacity', [
      'case',
      ['boolean', ['feature-state', 'subwayHighlight'], false],
      0.6,
      ['case',
        ['boolean', ['feature-state', 'hover'], false],
        ['case',
          ['any',
            ['==', ['feature-state', 'status'], 'lived'],
            ['==', ['feature-state', 'status'], 'visited']
          ],
          0.27,
          0.12
        ],
        ['==', ['feature-state', 'status'], 'lived'],
        0.55,
        ['==', ['feature-state', 'status'], 'visited'],
        0.40,
        0
      ]
    ]);
  } catch (e) {}
}

// ─── Initialize on map ready ──────────────────────────────────
(function() {
  const waitForMap = setInterval(() => {
    if (hoodMap && hoodMapReady) {
      clearInterval(waitForMap);
      setTimeout(augmentNTALayerForSubway, 500);
    }
  }, 200);
})();

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
    closeSubwayPopup();
    stopTrainAnimation();
  } else {
    addSingleLine(lineId);

    // Auto-start: show info popup and begin ride immediately
    const line = SUBWAY_LINES.find(l => l.id === lineId);
    if (line) {
      showSubwayInfo(line);
      startTrainRide(lineId);
    }
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

  // Invisible wide hitbox for easier clicking (20px wide, transparent)
  const hitboxId = 'subway-hitbox-' + lineId;
  hoodMap.addLayer({
    id: hitboxId,
    type: 'line',
    source: sourceId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': 'transparent',
      'line-width': 20,
      'line-opacity': 0
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

  // Transfer station dots (slightly larger)
  hoodMap.addLayer({
    id: dotsId + '-transfer',
    type: 'circle',
    source: dotsId,
    filter: ['==', ['get', 'isTransfer'], true],
    paint: {
      'circle-radius': 3.5,
      'circle-color': '#ffffff',
      'circle-stroke-color': line.color,
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.9
    }
  });

  // Regular station dots
  hoodMap.addLayer({
    id: dotsId + '-regular',
    type: 'circle',
    source: dotsId,
    filter: ['==', ['get', 'isTransfer'], false],
    paint: {
      'circle-radius': 2.5,
      'circle-color': '#ffffff',
      'circle-stroke-color': line.color,
      'circle-stroke-width': 1.2,
      'circle-opacity': 0.85
    }
  });

  // Click handlers on the wide hitbox layer for easy clicking
  hoodMap.on('click', hitboxId, function(e) {
    e.preventDefault();
    if (e.originalEvent) {
      e.originalEvent.stopPropagation();
      e.originalEvent._subwayHandled = true; // Flag for neighborhood handler
    }
    showSubwayInfo(line);
  });

  hoodMap.on('mouseenter', hitboxId, function() {
    hoodMap.getCanvas().style.cursor = 'pointer';
  });
  hoodMap.on('mouseleave', hitboxId, function() {
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
  const hitboxId = 'subway-hitbox-' + lineId;
  const dotsId = 'subway-dots-' + lineId;

  // Remove layers
  ['transfer', 'regular'].forEach(suffix => {
    const layerId = dotsId + '-' + suffix;
    if (hoodMap.getLayer(layerId)) hoodMap.removeLayer(layerId);
  });

  if (hoodMap.getLayer(hitboxId)) hoodMap.removeLayer(hitboxId);
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

  // Interpolate dense points for smooth animation (more points = smoother)
  const denseRoute = interpolateRoute(stationCoords, 2000);

  // Create train marker
  const el = document.createElement('div');
  el.className = 'subway-train-marker';
  el.style.background = line.color;
  el.textContent = line.id.length <= 2 ? line.id : line.id.charAt(0);

  trainMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat(denseRoute[0])
    .addTo(hoodMap);

  // Total ride duration in milliseconds (~30 seconds for a full line)
  const totalDurationMs = 30000;

  // Pre-compute cumulative distances for time-based interpolation
  const cumDist = [0];
  for (let i = 1; i < denseRoute.length; i++) {
    const dx = denseRoute[i][0] - denseRoute[i - 1][0];
    const dy = denseRoute[i][1] - denseRoute[i - 1][1];
    cumDist.push(cumDist[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalDist = cumDist[cumDist.length - 1];

  // Pre-compute station trigger progress values (0-1)
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
    return cumDist[bestIdx] / totalDist; // progress fraction
  });

  const highlightedStations = new Set();
  let lastHoodCheckTime = 0;
  const hoodCheckInterval = 150; // check neighborhood every 150ms
  let lastCameraTime = 0;
  const cameraUpdateInterval = 200; // smooth camera updates

  // Helper: get position along route at progress fraction (0-1)
  function getPositionAtProgress(progress) {
    const targetDist = progress * totalDist;
    // Binary search for the right segment
    let lo = 0, hi = cumDist.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (cumDist[mid] <= targetDist) lo = mid;
      else hi = mid;
    }
    const seg = lo;
    const segLen = cumDist[seg + 1] - cumDist[seg];
    const t = segLen === 0 ? 0 : (targetDist - cumDist[seg]) / segLen;
    const x = denseRoute[seg][0] + t * (denseRoute[seg + 1][0] - denseRoute[seg][0]);
    const y = denseRoute[seg][1] + t * (denseRoute[seg + 1][1] - denseRoute[seg][1]);
    return [x, y];
  }

  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / totalDurationMs, 1);

    // Get continuous position
    const pt = getPositionAtProgress(progress);
    trainMarker.setLngLat(pt);

    // Smooth camera follow
    if (timestamp - lastCameraTime > cameraUpdateInterval) {
      lastCameraTime = timestamp;
      hoodMap.easeTo({
        center: pt,
        bearing: 29,
        duration: cameraUpdateInterval + 50,
        easing: t => t,
      });
    }

    // Check station triggers
    stationTriggers.forEach((triggerProgress, stationI) => {
      if (progress >= triggerProgress && !highlightedStations.has(stationI)) {
        highlightedStations.add(stationI);
        const station = lineStations[stationI];
        const hoodName = getNeighborhoodNameAtPoint([station.lng, station.lat]);
        highlightStopInList(stationI, hoodName);
        pulseStationOnMap(station, line.color);
        showStationToast(station.name, hoodName, line.color, station);
      }
    });

    // Update neighborhood highlight (throttled)
    if (timestamp - lastHoodCheckTime > hoodCheckInterval) {
      lastHoodCheckTime = timestamp;
      highlightNeighborhoodAtPoint(pt, line.color);
    }

    if (progress >= 1) {
      finishTrainRide(lineId);
      return;
    }

    trainAnimationId = requestAnimationFrame(animate);
  }

  // Zoom in close to the first station, then start riding
  hoodMap.easeTo({
    center: denseRoute[0],
    zoom: 14,
    bearing: 29,
    duration: 1000,
  });

  // Start after initial zoom
  setTimeout(() => {
    trainAnimationId = requestAnimationFrame(animate);
  }, 1100);
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
function highlightStopInList(stationIdx, hoodName) {
  const list = document.getElementById('subway-stops-list');
  if (!list) return;
  const items = list.querySelectorAll('.subway-stop-item');
  if (items[stationIdx]) {
    items[stationIdx].classList.add('highlighted');
    // Add neighborhood label if found
    if (hoodName && !items[stationIdx].querySelector('.subway-stop-hood')) {
      const hoodLabel = document.createElement('span');
      hoodLabel.className = 'subway-stop-hood';
      hoodLabel.textContent = hoodName;
      items[stationIdx].appendChild(hoodLabel);
    }
    items[stationIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ─── Point-in-polygon test (ray casting) ────────────────────────
function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i][0], xi = polygon[i][1];
    const yj = polygon[j][0], xj = polygon[j][1];
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// ─── Get neighborhood name at a map point ──────────────────────
// Uses direct point-in-polygon against LOCALITY_BOUNDARIES data for reliable
// detection (especially Manhattan sub-neighborhoods), then falls back to
// NEIGHBORHOODS data and finally to queryRenderedFeatures for NTA polygons.
function getNeighborhoodNameAtPoint(lngLat) {
  const lng = lngLat[0];
  const lat = lngLat[1];

  // 1) Check locality boundaries first (sub-neighborhoods like Chelsea, SoHo, etc.)
  if (typeof LOCALITY_BOUNDARIES !== 'undefined') {
    for (const name in LOCALITY_BOUNDARIES) {
      const loc = LOCALITY_BOUNDARIES[name];
      if (loc.polygon && pointInPolygon(lat, lng, loc.polygon)) {
        return name;
      }
    }
  }

  // 2) Fall back to queryRenderedFeatures for NTA polygons (outer boroughs)
  if (hoodMap) {
    try {
      const point = hoodMap.project(lngLat);
      const features = hoodMap.queryRenderedFeatures(point, { layers: ['nta-fill'] });
      if (features.length > 0) {
        const ntaName = features[0].properties.name;
        // Try to find a friendlier name from NEIGHBORHOODS
        if (typeof NEIGHBORHOODS !== 'undefined') {
          const code = features[0].properties.ntaCode;
          const match = NEIGHBORHOODS.find(n => n.id === code);
          if (match) return match.name;
        }
        return ntaName || null;
      }
    } catch (e) {}
  }

  return null;
}

// ─── Get locality key at a point (for highlighting) ─────────────
function getLocalityKeyAtPoint(lat, lng) {
  if (typeof LOCALITY_BOUNDARIES !== 'undefined') {
    for (const name in LOCALITY_BOUNDARIES) {
      const loc = LOCALITY_BOUNDARIES[name];
      if (loc.polygon && pointInPolygon(lat, lng, loc.polygon)) {
        return { type: 'locality', name: name };
      }
    }
  }
  return null;
}

// ─── Show station name popup on the map ─────────────────────────
let stationPopup = null;
let stationPopupTimeout = null;

function showStationToast(stationName, hoodName, color, station) {
  if (!hoodMap) return;

  // Remove any existing popup
  if (stationPopup) {
    stationPopup.remove();
    stationPopup = null;
  }
  if (stationPopupTimeout) clearTimeout(stationPopupTimeout);

  let html = `<div class="subway-station-popup">`;
  html += `<span class="popup-dot" style="background:${color}"></span>`;
  html += `<strong>${escHtml(stationName)}</strong>`;
  if (hoodName) {
    html += `<span class="popup-hood">· ${escHtml(hoodName)}</span>`;
  }
  html += `</div>`;

  stationPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    anchor: 'bottom',
    offset: [0, -8],
    className: 'subway-station-mapbox-popup',
  })
    .setLngLat([station.lng, station.lat])
    .setHTML(html)
    .addTo(hoodMap);

  // Fade out after 2.5 seconds
  stationPopupTimeout = setTimeout(() => {
    if (stationPopup) {
      stationPopup.remove();
      stationPopup = null;
    }
  }, 2500);
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

// ─── Highlight the current neighborhood the train is in ─────────
// Maintains a single active highlight — when the train enters a new
// neighborhood, the old one is un-highlighted and the new one lights up.
let currentHighlightIds = []; // array of { source, id } for active highlights

function highlightNeighborhoodAtPoint(lngLat, color) {
  if (!hoodMap) return;

  const point = hoodMap.project(lngLat);
  const newHighlights = [];

  // Find locality polygon at this point
  if (hoodMap.getSource('locality-polygons') && hoodMap.getLayer('locality-fill')) {
    const locFeatures = hoodMap.queryRenderedFeatures(point, { layers: ['locality-fill'] });
    locFeatures.forEach(lf => {
      if (lf.id !== undefined) {
        newHighlights.push({ source: 'locality-polygons', id: lf.id });
      }
    });
  }

  // Find NTA polygon at this point
  if (hoodMap.getSource('nta-polygons') && hoodMap.getLayer('nta-fill')) {
    const ntaFeatures = hoodMap.queryRenderedFeatures(point, { layers: ['nta-fill'] });
    ntaFeatures.forEach(f => {
      if (f.id !== undefined) {
        newHighlights.push({ source: 'nta-polygons', id: f.id });
      }
    });
  }

  // Build keys for comparison
  const newKeys = new Set(newHighlights.map(h => h.source + ':' + h.id));
  const oldKeys = new Set(currentHighlightIds.map(h => h.source + ':' + h.id));

  // Un-highlight features that are no longer under the train
  currentHighlightIds.forEach(h => {
    const key = h.source + ':' + h.id;
    if (!newKeys.has(key)) {
      try {
        hoodMap.setFeatureState(h, { subwayHighlight: false });
      } catch (e) {}
    }
  });

  // Highlight new features
  newHighlights.forEach(h => {
    const key = h.source + ':' + h.id;
    if (!oldKeys.has(key)) {
      try {
        hoodMap.setFeatureState(h, { subwayHighlight: true });
      } catch (e) {}
    }
  });

  currentHighlightIds = newHighlights;
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
    cancelAnimationFrame(trainAnimationId);
    trainAnimationId = null;
  }
  if (trainMarker) {
    trainMarker.remove();
    trainMarker = null;
  }
  // Remove station popup
  if (stationPopupTimeout) clearTimeout(stationPopupTimeout);
  if (stationPopup) { stationPopup.remove(); stationPopup = null; }

  // Clean up directions ride route if present
  if (typeof clearRideRouteLayers === 'function') clearRideRouteLayers();

  clearSubwayHighlights();
}

// ─── Clear subway highlight states from all features ───────────
function clearSubwayHighlights() {
  if (!hoodMap) return;

  // Clear any persistent highlight
  currentHighlightIds.forEach(h => {
    try {
      hoodMap.setFeatureState(h, { subwayHighlight: false });
    } catch (e) {}
  });
  currentHighlightIds = [];

  // Also clear any remaining NTA highlights
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
    if (hoodMap.getSource('locality-polygons')) {
      const features = hoodMap.queryRenderedFeatures({ layers: ['locality-fill'] });
      features.forEach(f => {
        if (f.id !== undefined) {
          hoodMap.setFeatureState(
            { source: 'locality-polygons', id: f.id },
            { subwayHighlight: false }
          );
        }
      });
    }
  } catch (e) {}
}

// ─── Augment NTA + locality layers for subway highlight ─────────
function augmentNTALayerForSubway() {
  if (!hoodMap) return;

  const highlightOpacityExpr = [
    'case',
    ['boolean', ['feature-state', 'subwayHighlight'], false],
    0.55,
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
  ];

  try {
    if (hoodMap.getLayer('nta-fill')) {
      hoodMap.setPaintProperty('nta-fill', 'fill-opacity', highlightOpacityExpr);
    }
  } catch (e) {}

  try {
    if (hoodMap.getLayer('locality-fill')) {
      hoodMap.setPaintProperty('locality-fill', 'fill-opacity', highlightOpacityExpr);
    }
  } catch (e) {}
}

// ─── Initialize on map ready ──────────────────────────────────
(function() {
  const waitForMap = setInterval(() => {
    if (hoodMap && hoodMapReady) {
      clearInterval(waitForMap);
      setTimeout(() => {
        augmentNTALayerForSubway();
      }, 500);
    }
  }, 200);
})();

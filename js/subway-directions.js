// ============================================
// SUBWAY DIRECTIONS — Address-to-address route planner
// ============================================

let directionsPanel = null;
let directionsRoute = null; // current computed route (includes walk legs)
let directionsLayers = []; // map layer IDs to clean up
let directionsMarkers = []; // map markers to clean up

// ─── Build the station graph on demand ─────────────────────────
let subwayGraph = null;

function buildSubwayGraph() {
  if (subwayGraph) return subwayGraph;
  if (typeof SUBWAY_LINES === 'undefined') return null;

  const nodes = {};
  const stationIndex = {};

  SUBWAY_LINES.forEach(line => {
    const stations = line.stations || [];
    stations.forEach((s, i) => {
      const key = line.id + '::' + s.name;
      nodes[key] = {
        lineId: line.id,
        lineName: line.name,
        lineColor: line.color,
        station: s,
        neighbors: [],
      };

      if (!stationIndex[s.name]) stationIndex[s.name] = [];
      stationIndex[s.name].push({ key, lat: s.lat, lng: s.lng, lineId: line.id });

      if (i > 0) {
        const prevKey = line.id + '::' + stations[i - 1].name;
        nodes[key].neighbors.push({ key: prevKey, weight: 1, type: 'travel' });
        if (nodes[prevKey]) {
          nodes[prevKey].neighbors.push({ key, weight: 1, type: 'travel' });
        }
      }
    });
  });

  // Transfer edges: stations within 300m on different lines
  const TRANSFER_RADIUS_M = 300;
  const allEntries = [];
  for (const name in stationIndex) {
    stationIndex[name].forEach(entry => allEntries.push({ ...entry, name }));
  }

  for (let i = 0; i < allEntries.length; i++) {
    for (let j = i + 1; j < allEntries.length; j++) {
      if (allEntries[i].lineId === allEntries[j].lineId) continue;
      const dlat = (allEntries[i].lat - allEntries[j].lat) * 111000;
      const dlng = (allEntries[i].lng - allEntries[j].lng) * 85000;
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      if (dist < TRANSFER_RADIUS_M) {
        nodes[allEntries[i].key].neighbors.push({ key: allEntries[j].key, weight: 3, type: 'transfer' });
        nodes[allEntries[j].key].neighbors.push({ key: allEntries[i].key, weight: 3, type: 'transfer' });
      }
    }
  }

  subwayGraph = { nodes, stationIndex };
  return subwayGraph;
}

// ─── Find shortest path using Dijkstra ─────────────────────────
function findRoute(fromName, toName) {
  const graph = buildSubwayGraph();
  if (!graph) return null;

  const fromEntries = graph.stationIndex[fromName];
  const toEntries = graph.stationIndex[toName];
  if (!fromEntries || !toEntries) return null;

  const toKeys = new Set(toEntries.map(e => e.key));
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = [];

  function pqPush(key, d) {
    pq.push({ key, d });
    pq.sort((a, b) => a.d - b.d);
  }

  fromEntries.forEach(entry => {
    dist[entry.key] = 0;
    prev[entry.key] = null;
    pqPush(entry.key, 0);
  });

  while (pq.length > 0) {
    const { key: current, d: currentDist } = pq.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    if (toKeys.has(current)) {
      const path = [];
      let node = current;
      while (node) { path.unshift(node); node = prev[node]; }
      return buildRouteDescription(path, graph);
    }

    const nodeData = graph.nodes[current];
    if (!nodeData) continue;

    nodeData.neighbors.forEach(nb => {
      if (visited.has(nb.key)) return;
      const newDist = currentDist + nb.weight;
      if (dist[nb.key] === undefined || newDist < dist[nb.key]) {
        dist[nb.key] = newDist;
        prev[nb.key] = current;
        pqPush(nb.key, newDist);
      }
    });
  }

  return null;
}

// ─── Build route description from path keys ────────────────────
function buildRouteDescription(pathKeys, graph) {
  const segments = [];
  let currentSegment = null;

  pathKeys.forEach(key => {
    const node = graph.nodes[key];
    const lineId = node.lineId;

    if (!currentSegment || currentSegment.lineId !== lineId) {
      if (currentSegment) segments.push(currentSegment);
      currentSegment = {
        lineId,
        lineColor: node.lineColor,
        lineName: node.lineName,
        stations: [],
      };
    }
    currentSegment.stations.push({
      name: node.station.name,
      lat: node.station.lat,
      lng: node.station.lng,
    });
  });
  if (currentSegment) segments.push(currentSegment);

  let totalStops = 0;
  segments.forEach(seg => { totalStops += seg.stations.length; });
  totalStops -= segments.length;

  return { segments, totalStops, transfers: segments.length - 1 };
}

// ─── Geocode an address using Mapbox ───────────────────────────
async function geocodeAddress(query) {
  if (!query || query.trim().length < 2) return [];
  const token = typeof MAPBOX_TOKEN !== 'undefined' ? MAPBOX_TOKEN : '';
  const bbox = '-74.26,40.49,-73.70,40.92'; // NYC bounding box
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&bbox=${bbox}&limit=5&types=address,poi,neighborhood,place`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.features) {
      return data.features.map(f => ({
        name: f.place_name,
        shortName: f.text + (f.address ? ' ' + f.address : ''),
        lng: f.center[0],
        lat: f.center[1],
      }));
    }
  } catch (e) {
    console.error('Geocoding error:', e);
  }
  return [];
}

// ─── Find nearest subway station to a lat/lng ──────────────────
function findNearestStations(lat, lng, count) {
  if (typeof SUBWAY_LINES === 'undefined') return [];
  count = count || 3;

  const seen = new Set();
  const results = [];

  SUBWAY_LINES.forEach(l => {
    (l.stations || []).forEach(s => {
      if (seen.has(s.name)) return;
      seen.add(s.name);
      const dlat = (s.lat - lat) * 111000;
      const dlng = (s.lng - lng) * 85000;
      const distM = Math.sqrt(dlat * dlat + dlng * dlng);
      results.push({ name: s.name, lat: s.lat, lng: s.lng, distM });
    });
  });

  results.sort((a, b) => a.distM - b.distM);
  return results.slice(0, count);
}

// ─── Estimate walking time ─────────────────────────────────────
function walkingMinutes(lat1, lng1, lat2, lng2) {
  const dlat = (lat1 - lat2) * 111000;
  const dlng = (lng1 - lng2) * 85000;
  const distM = Math.sqrt(dlat * dlat + dlng * dlng);
  // ~80m/min walking speed, 1.3x Manhattan grid factor
  return Math.round((distM * 1.3) / 80);
}

// ─── Get all unique station names ──────────────────────────────
function getAllStationNames() {
  if (typeof SUBWAY_LINES === 'undefined') return [];
  const names = new Set();
  SUBWAY_LINES.forEach(l => { (l.stations || []).forEach(s => names.add(s.name)); });
  return Array.from(names).sort();
}

// ─── Get lines serving a station ───────────────────────────────
function getStationLines(stationName) {
  if (typeof SUBWAY_LINES === 'undefined') return [];
  const lines = [];
  SUBWAY_LINES.forEach(l => {
    if ((l.stations || []).some(s => s.name === stationName)) {
      lines.push({ id: l.id, color: l.color });
    }
  });
  return lines;
}

// ─── Open directions panel ─────────────────────────────────────
function openDirectionsPanel() {
  if (directionsPanel) return;

  const mapWrap = document.querySelector('.hood-map-wrap');
  if (!mapWrap) return;

  const panel = document.createElement('div');
  panel.className = 'directions-panel';
  panel.id = 'directions-panel';

  panel.innerHTML = `
    <div class="directions-header">
      <div class="directions-title">Subway Directions</div>
      <button class="directions-close" onclick="closeDirectionsPanel()">×</button>
    </div>
    <div class="directions-inputs">
      <div class="directions-input-row">
        <span class="directions-label">From</span>
        <input type="text" id="directions-from" class="directions-input" placeholder="Address, place, or station..." autocomplete="off">
        <div class="directions-suggestions" id="suggestions-from"></div>
      </div>
      <button class="directions-swap" onclick="swapDirections()" title="Swap">⇅</button>
      <div class="directions-input-row">
        <span class="directions-label">To</span>
        <input type="text" id="directions-to" class="directions-input" placeholder="Address, place, or station..." autocomplete="off">
        <div class="directions-suggestions" id="suggestions-to"></div>
      </div>
    </div>
    <button class="directions-go-btn" id="directions-go-btn" onclick="computeDirections()">Get Directions</button>
    <div class="directions-result" id="directions-result"></div>
  `;

  mapWrap.appendChild(panel);
  directionsPanel = panel;

  // Set up hybrid autocomplete (stations + geocoded places)
  setupHybridAutocomplete('directions-from', 'suggestions-from');
  setupHybridAutocomplete('directions-to', 'suggestions-to');
}

// ─── Close directions panel ────────────────────────────────────
function closeDirectionsPanel() {
  clearDirectionsFromMap();
  if (directionsPanel) {
    directionsPanel.remove();
    directionsPanel = null;
  }
}

// ─── Swap from/to ──────────────────────────────────────────────
function swapDirections() {
  const fromEl = document.getElementById('directions-from');
  const toEl = document.getElementById('directions-to');
  if (!fromEl || !toEl) return;

  const tmpVal = fromEl.value;
  const tmpData = fromEl.dataset.lat;
  const tmpLng = fromEl.dataset.lng;
  const tmpType = fromEl.dataset.type;

  fromEl.value = toEl.value;
  fromEl.dataset.lat = toEl.dataset.lat || '';
  fromEl.dataset.lng = toEl.dataset.lng || '';
  fromEl.dataset.type = toEl.dataset.type || '';

  toEl.value = tmpVal;
  toEl.dataset.lat = tmpData || '';
  toEl.dataset.lng = tmpLng || '';
  toEl.dataset.type = tmpType || '';
}

// ─── Hybrid autocomplete: stations + Mapbox geocoding ──────────
function setupHybridAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const sugBox = document.getElementById(suggestionsId);
  if (!input || !sugBox) return;

  let debounceTimer = null;
  const allStationNames = getAllStationNames();

  input.addEventListener('input', function () {
    const val = this.value.trim();
    if (debounceTimer) clearTimeout(debounceTimer);

    if (val.length < 2) {
      sugBox.innerHTML = '';
      sugBox.style.display = 'none';
      return;
    }

    // Immediately show station matches
    const stationMatches = allStationNames
      .filter(n => n.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 4);

    renderSuggestions(sugBox, input, stationMatches, []);

    // Debounce geocoding (300ms)
    debounceTimer = setTimeout(async () => {
      const geoResults = await geocodeAddress(val);
      // Re-check current value hasn't changed
      if (input.value.trim() === val) {
        renderSuggestions(sugBox, input, stationMatches, geoResults);
      }
    }, 300);
  });

  input.addEventListener('focus', function () {
    if (sugBox.children.length > 0) sugBox.style.display = 'block';
  });

  document.addEventListener('click', function (e) {
    if (!input.contains(e.target) && !sugBox.contains(e.target)) {
      sugBox.style.display = 'none';
    }
  });
}

function renderSuggestions(sugBox, input, stationMatches, geoResults) {
  sugBox.innerHTML = '';

  if (stationMatches.length === 0 && geoResults.length === 0) {
    sugBox.style.display = 'none';
    return;
  }

  // Station matches first
  if (stationMatches.length > 0) {
    const header = document.createElement('div');
    header.className = 'suggestions-header';
    header.textContent = 'Stations';
    sugBox.appendChild(header);

    stationMatches.forEach(name => {
      const div = document.createElement('div');
      div.className = 'directions-suggestion-item';
      const lines = getStationLines(name);
      div.innerHTML = `
        <span class="suggestion-icon">🚇</span>
        <span class="suggestion-text">${escHtml(name)}</span>
        <span class="suggestion-lines">${lines.map(l =>
          `<span class="suggestion-line-dot" style="background:${l.color}">${escHtml(l.id)}</span>`
        ).join('')}</span>
      `;
      div.addEventListener('click', function () {
        input.value = name;
        input.dataset.type = 'station';
        input.dataset.stationName = name;
        input.dataset.lat = '';
        input.dataset.lng = '';
        sugBox.style.display = 'none';
      });
      sugBox.appendChild(div);
    });
  }

  // Geocoded places
  if (geoResults.length > 0) {
    const header = document.createElement('div');
    header.className = 'suggestions-header';
    header.textContent = 'Places';
    sugBox.appendChild(header);

    geoResults.forEach(place => {
      const div = document.createElement('div');
      div.className = 'directions-suggestion-item';
      div.innerHTML = `
        <span class="suggestion-icon">📍</span>
        <span class="suggestion-text">${escHtml(place.name)}</span>
      `;
      div.addEventListener('click', function () {
        input.value = place.name;
        input.dataset.type = 'place';
        input.dataset.lat = place.lat;
        input.dataset.lng = place.lng;
        input.dataset.stationName = '';
        sugBox.style.display = 'none';
      });
      sugBox.appendChild(div);
    });
  }

  sugBox.style.display = 'block';
}

// ─── Resolve an input to { lat, lng, stationName?, label } ─────
async function resolveInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return null;

  const val = input.value.trim();
  if (!val) return null;

  // If user selected a station from autocomplete
  if (input.dataset.type === 'station' && input.dataset.stationName) {
    return { type: 'station', stationName: input.dataset.stationName, label: input.dataset.stationName };
  }

  // If user selected a place from autocomplete
  if (input.dataset.type === 'place' && input.dataset.lat && input.dataset.lng) {
    return {
      type: 'place',
      lat: parseFloat(input.dataset.lat),
      lng: parseFloat(input.dataset.lng),
      label: val,
    };
  }

  // Otherwise, try exact station name match first
  const allNames = getAllStationNames();
  const stationMatch = allNames.find(n => n.toLowerCase() === val.toLowerCase());
  if (stationMatch) {
    return { type: 'station', stationName: stationMatch, label: stationMatch };
  }

  // Fall back to geocoding
  const results = await geocodeAddress(val);
  if (results.length > 0) {
    return {
      type: 'place',
      lat: results[0].lat,
      lng: results[0].lng,
      label: results[0].name,
    };
  }

  return null;
}

// ─── Compute and display directions ────────────────────────────
async function computeDirections() {
  const resultDiv = document.getElementById('directions-result');
  const goBtn = document.getElementById('directions-go-btn');
  if (!resultDiv) return;

  if (goBtn) { goBtn.disabled = true; goBtn.textContent = 'Finding route...'; }

  try {
    const from = await resolveInput('directions-from');
    const to = await resolveInput('directions-to');

    if (!from) {
      resultDiv.innerHTML = '<div class="directions-error">Could not find the starting location. Try a specific address or station name.</div>';
      return;
    }
    if (!to) {
      resultDiv.innerHTML = '<div class="directions-error">Could not find the destination. Try a specific address or station name.</div>';
      return;
    }

    // Determine origin station
    let fromStation, fromWalk = null;
    if (from.type === 'station') {
      fromStation = from.stationName;
    } else {
      const nearest = findNearestStations(from.lat, from.lng, 1);
      if (nearest.length === 0) {
        resultDiv.innerHTML = '<div class="directions-error">No subway stations found near the starting location.</div>';
        return;
      }
      fromStation = nearest[0].name;
      fromWalk = {
        fromLat: from.lat, fromLng: from.lng,
        toLat: nearest[0].lat, toLng: nearest[0].lng,
        stationName: nearest[0].name,
        minutes: walkingMinutes(from.lat, from.lng, nearest[0].lat, nearest[0].lng),
        label: from.label,
      };
    }

    // Determine destination station
    let toStation, toWalk = null;
    if (to.type === 'station') {
      toStation = to.stationName;
    } else {
      const nearest = findNearestStations(to.lat, to.lng, 1);
      if (nearest.length === 0) {
        resultDiv.innerHTML = '<div class="directions-error">No subway stations found near the destination.</div>';
        return;
      }
      toStation = nearest[0].name;
      toWalk = {
        fromLat: nearest[0].lat, fromLng: nearest[0].lng,
        toLat: to.lat, toLng: to.lng,
        stationName: nearest[0].name,
        minutes: walkingMinutes(nearest[0].lat, nearest[0].lng, to.lat, to.lng),
        label: to.label,
      };
    }

    if (fromStation === toStation) {
      // Both near same station — just walk
      if (fromWalk && toWalk) {
        const totalWalk = walkingMinutes(from.lat, from.lng, to.lat, to.lng);
        resultDiv.innerHTML = `<div class="directions-summary">These locations are close enough to walk (${totalWalk} min)</div>`;
        return;
      }
      resultDiv.innerHTML = '<div class="directions-error">Origin and destination are at the same station.</div>';
      return;
    }

    const route = findRoute(fromStation, toStation);
    if (!route) {
      resultDiv.innerHTML = '<div class="directions-error">No subway route found between those locations.</div>';
      return;
    }

    // Attach walk legs to route
    route.walkFrom = fromWalk;
    route.walkTo = toWalk;
    directionsRoute = route;

    // Calculate total time estimate
    const subwayMinutes = route.totalStops * 2; // ~2 min per stop
    const transferMinutes = route.transfers * 4; // ~4 min per transfer
    const walkMinutes = (fromWalk ? fromWalk.minutes : 0) + (toWalk ? toWalk.minutes : 0);
    const totalMinutes = subwayMinutes + transferMinutes + walkMinutes;

    // Render
    let html = `<div class="directions-summary">~${totalMinutes} min total · ${route.totalStops} stop${route.totalStops !== 1 ? 's' : ''}`;
    if (route.transfers > 0) {
      html += ` · ${route.transfers} transfer${route.transfers !== 1 ? 's' : ''}`;
    }
    html += `</div>`;

    // Walk to station
    if (fromWalk) {
      html += `<div class="directions-walk-leg">`;
      html += `<span class="walk-icon">🚶</span>`;
      html += `<span>Walk to <strong>${escHtml(fromWalk.stationName)}</strong></span>`;
      html += `<span class="walk-time">${fromWalk.minutes} min</span>`;
      html += `</div>`;
    }

    // Subway segments
    route.segments.forEach((seg, segIdx) => {
      const badge = seg.lineId.length <= 3 ? seg.lineId : seg.lineId.charAt(0);
      html += `<div class="directions-segment">`;
      html += `<div class="directions-segment-header">`;
      html += `<span class="directions-line-badge" style="background:${seg.lineColor}">${escHtml(badge)}</span>`;

      html += `<span>${escHtml(seg.stations[0].name)} → ${escHtml(seg.stations[seg.stations.length - 1].name)}</span>`;
      if (seg.stations.length > 2) {
        html += `<span class="directions-stop-count">${seg.stations.length - 1} stops</span>`;
      }
      html += `</div>`;

      if (seg.stations.length > 2) {
        html += `<div class="directions-stops-list">`;
        seg.stations.forEach((s, i) => {
          const cls = i === 0 ? ' first' : (i === seg.stations.length - 1 ? ' last' : '');
          html += `<div class="directions-stop${cls}">`;
          html += `<div class="directions-stop-dot" style="border-color:${seg.lineColor}"></div>`;
          html += `<span>${escHtml(s.name)}</span></div>`;
        });
        html += `</div>`;
      }

      html += `</div>`;

      if (segIdx < route.segments.length - 1) {
        html += `<div class="directions-transfer">Transfer</div>`;
      }
    });

    // Walk from station
    if (toWalk) {
      html += `<div class="directions-walk-leg">`;
      html += `<span class="walk-icon">🚶</span>`;
      html += `<span>Walk to <strong>${escHtml(toWalk.label)}</strong></span>`;
      html += `<span class="walk-time">${toWalk.minutes} min</span>`;
      html += `</div>`;
    }

    html += `<button class="directions-ride-btn" onclick="rideDirectionsRoute()">Ride This Route</button>`;

    resultDiv.innerHTML = html;
    drawDirectionsOnMap(route);

  } finally {
    if (goBtn) { goBtn.disabled = false; goBtn.textContent = 'Get Directions'; }
  }
}

// ─── Draw route on map with walk legs ──────────────────────────
function drawDirectionsOnMap(route) {
  clearDirectionsFromMap();
  if (!hoodMap) return;

  const allBoundsCoords = [];

  // Walk-from dashed line + pin
  if (route.walkFrom) {
    const wf = route.walkFrom;
    const srcId = 'directions-walk-from';
    const lyrId = 'directions-walk-from-layer';

    hoodMap.addSource(srcId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[wf.fromLng, wf.fromLat], [wf.toLng, wf.toLat]],
        },
      },
    });

    hoodMap.addLayer({
      id: lyrId,
      type: 'line',
      source: srcId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#666',
        'line-width': 3,
        'line-opacity': 0.6,
        'line-dasharray': [2, 2],
      },
    });

    directionsLayers.push({ sourceId: srcId, layerId: lyrId });
    allBoundsCoords.push([wf.fromLng, wf.fromLat]);

    // Origin pin
    const originEl = document.createElement('div');
    originEl.className = 'directions-pin origin-pin';
    originEl.textContent = 'A';
    const originMarker = new mapboxgl.Marker({ element: originEl, anchor: 'center' })
      .setLngLat([wf.fromLng, wf.fromLat])
      .addTo(hoodMap);
    directionsMarkers.push(originMarker);
  }

  // Subway route segments
  route.segments.forEach((seg, idx) => {
    const coords = seg.stations.map(s => [s.lng, s.lat]);
    const sourceId = 'directions-route-' + idx;
    const layerId = 'directions-layer-' + idx;

    hoodMap.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
      },
    });

    hoodMap.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': seg.lineColor,
        'line-width': 5,
        'line-opacity': 0.85,
      },
    });

    directionsLayers.push({ sourceId, layerId });
    coords.forEach(c => allBoundsCoords.push(c));
  });

  // Walk-to dashed line + pin
  if (route.walkTo) {
    const wt = route.walkTo;
    const srcId = 'directions-walk-to';
    const lyrId = 'directions-walk-to-layer';

    hoodMap.addSource(srcId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[wt.fromLng, wt.fromLat], [wt.toLng, wt.toLat]],
        },
      },
    });

    hoodMap.addLayer({
      id: lyrId,
      type: 'line',
      source: srcId,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#666',
        'line-width': 3,
        'line-opacity': 0.6,
        'line-dasharray': [2, 2],
      },
    });

    directionsLayers.push({ sourceId: srcId, layerId: lyrId });
    allBoundsCoords.push([wt.toLng, wt.toLat]);

    // Destination pin
    const destEl = document.createElement('div');
    destEl.className = 'directions-pin dest-pin';
    destEl.textContent = 'B';
    const destMarker = new mapboxgl.Marker({ element: destEl, anchor: 'center' })
      .setLngLat([wt.toLng, wt.toLat])
      .addTo(hoodMap);
    directionsMarkers.push(destMarker);
  }

  // Fit bounds
  if (allBoundsCoords.length > 1) {
    const bounds = allBoundsCoords.reduce(
      (b, c) => [
        [Math.min(b[0][0], c[0]), Math.min(b[0][1], c[1])],
        [Math.max(b[1][0], c[0]), Math.max(b[1][1], c[1])],
      ],
      [[allBoundsCoords[0][0], allBoundsCoords[0][1]], [allBoundsCoords[0][0], allBoundsCoords[0][1]]]
    );
    hoodMap.fitBounds(bounds, { padding: 60, bearing: 29, duration: 1000 });
  }
}

// ─── Clear directions from map ─────────────────────────────────
function clearDirectionsFromMap() {
  if (!hoodMap) return;
  directionsLayers.forEach(({ sourceId, layerId }) => {
    if (hoodMap.getLayer(layerId)) hoodMap.removeLayer(layerId);
    if (hoodMap.getSource(sourceId)) hoodMap.removeSource(sourceId);
  });
  directionsLayers = [];

  directionsMarkers.forEach(m => m.remove());
  directionsMarkers = [];
}

// ─── Ride the computed route (animated) ────────────────────────
function rideDirectionsRoute() {
  if (!directionsRoute || !hoodMap) return;

  const allCoords = [];
  directionsRoute.segments.forEach(seg => {
    seg.stations.forEach(s => { allCoords.push([s.lng, s.lat]); });
  });

  if (allCoords.length < 2) return;

  closeDirectionsPanel();
  stopTrainAnimation();

  const denseRoute = interpolateRoute(allCoords, 2000);
  const totalDurationMs = 90000;

  const el = document.createElement('div');
  el.className = 'subway-train-marker';
  el.style.background = directionsRoute.segments[0].lineColor;
  const lineLabel = directionsRoute.segments[0].lineId;
  el.textContent = lineLabel.length <= 2 ? lineLabel : lineLabel.charAt(0);

  trainMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat(denseRoute[0])
    .addTo(hoodMap);

  const cumDist = [0];
  for (let i = 1; i < denseRoute.length; i++) {
    const dx = denseRoute[i][0] - denseRoute[i - 1][0];
    const dy = denseRoute[i][1] - denseRoute[i - 1][1];
    cumDist.push(cumDist[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalDist = cumDist[cumDist.length - 1];

  const allStations = directionsRoute.segments.flatMap(seg =>
    seg.stations.map(s => ({ ...s, lineColor: seg.lineColor, lineId: seg.lineId }))
  );

  const stationTriggers = allStations.map(s => {
    let bestDist = Infinity, bestIdx = 0;
    denseRoute.forEach((pt, i) => {
      const d = Math.sqrt((pt[0] - s.lng) ** 2 + (pt[1] - s.lat) ** 2);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return cumDist[bestIdx] / totalDist;
  });

  const segTransitions = [];
  directionsRoute.segments.forEach(seg => {
    const lastStation = seg.stations[seg.stations.length - 1];
    let bestIdx = 0, bestDist = Infinity;
    denseRoute.forEach((pt, i) => {
      const d = Math.sqrt((pt[0] - lastStation.lng) ** 2 + (pt[1] - lastStation.lat) ** 2);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    segTransitions.push({ progress: cumDist[bestIdx] / totalDist, lineId: seg.lineId, lineColor: seg.lineColor });
  });

  const highlightedStations = new Set();
  let lastHoodCheckTime = 0, lastCameraTime = 0, currentSegIdx = 0;

  function getPositionAtProgress(progress) {
    const targetDist = progress * totalDist;
    let lo = 0, hi = cumDist.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (cumDist[mid] <= targetDist) lo = mid; else hi = mid;
    }
    const seg = lo;
    const segLen = cumDist[seg + 1] - cumDist[seg];
    const t = segLen === 0 ? 0 : (targetDist - cumDist[seg]) / segLen;
    return [
      denseRoute[seg][0] + t * (denseRoute[seg + 1][0] - denseRoute[seg][0]),
      denseRoute[seg][1] + t * (denseRoute[seg + 1][1] - denseRoute[seg][1]),
    ];
  }

  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / totalDurationMs, 1);
    const pt = getPositionAtProgress(progress);
    trainMarker.setLngLat(pt);

    while (currentSegIdx < segTransitions.length - 1 && progress > segTransitions[currentSegIdx].progress) {
      currentSegIdx++;
      const newSeg = directionsRoute.segments[currentSegIdx];
      if (newSeg) {
        el.style.background = newSeg.lineColor;
        el.textContent = newSeg.lineId.length <= 2 ? newSeg.lineId : newSeg.lineId.charAt(0);
      }
    }

    if (timestamp - lastCameraTime > 200) {
      lastCameraTime = timestamp;
      hoodMap.easeTo({ center: pt, bearing: 29, duration: 250, easing: t => t });
    }

    stationTriggers.forEach((triggerProgress, i) => {
      if (progress >= triggerProgress && !highlightedStations.has(i)) {
        highlightedStations.add(i);
        const s = allStations[i];
        const hoodName = getNeighborhoodNameAtPoint([s.lng, s.lat]);
        showStationToast(s.name, hoodName, s.lineColor, s);
        pulseStationOnMap(s, s.lineColor);
      }
    });

    if (timestamp - lastHoodCheckTime > 150) {
      lastHoodCheckTime = timestamp;
      highlightNeighborhoodAtPoint(pt, segTransitions[currentSegIdx]?.lineColor || '#666');
    }

    if (progress >= 1) { finishTrainRide(null); return; }
    trainAnimationId = requestAnimationFrame(animate);
  }

  hoodMap.easeTo({ center: denseRoute[0], zoom: 14, bearing: 29, duration: 1000 });
  setTimeout(() => { trainAnimationId = requestAnimationFrame(animate); }, 1100);
}

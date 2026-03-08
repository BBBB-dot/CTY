// ============================================
// SUBWAY DIRECTIONS — Route planner with transfers
// ============================================

let directionsPanel = null;
let directionsRoute = null; // current computed route
let directionsLayers = []; // map layer IDs to clean up

// ─── Build the station graph on demand ─────────────────────────
let subwayGraph = null;

function buildSubwayGraph() {
  if (subwayGraph) return subwayGraph;
  if (typeof SUBWAY_LINES === 'undefined') return null;

  // Node key: "lineName::stationName" (unique per line)
  // We also build a station-name index for transfers
  const nodes = {};     // nodeKey → { lineId, station, neighbors: [{nodeKey, weight, type}] }
  const stationIndex = {}; // stationName → [{nodeKey, lat, lng, lineId}]

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

      // Connect to previous station on same line (travel edge, weight = 1)
      if (i > 0) {
        const prevKey = line.id + '::' + stations[i - 1].name;
        nodes[key].neighbors.push({ key: prevKey, weight: 1, type: 'travel' });
        if (nodes[prevKey]) {
          nodes[prevKey].neighbors.push({ key, weight: 1, type: 'travel' });
        }
      }
    });
  });

  // Build transfer edges: connect stations within 300m on different lines
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
        // Transfer edge — weight 3 to penalize transfers in routing
        nodes[allEntries[i].key].neighbors.push({
          key: allEntries[j].key,
          weight: 3,
          type: 'transfer',
        });
        nodes[allEntries[j].key].neighbors.push({
          key: allEntries[i].key,
          weight: 3,
          type: 'transfer',
        });
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

  // Dijkstra from all start nodes
  const dist = {};
  const prev = {};
  const visited = new Set();

  // Simple priority queue (array-based, fine for ~800 nodes)
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
      // Reconstruct path
      const path = [];
      let node = current;
      while (node) {
        path.unshift(node);
        node = prev[node];
      }
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

  return null; // No route found
}

// ─── Build human-readable route from path ──────────────────────
function buildRouteDescription(pathKeys, graph) {
  const segments = []; // { lineId, lineColor, lineName, stations: [{name, lat, lng}] }
  let currentSegment = null;

  pathKeys.forEach(key => {
    const node = graph.nodes[key];
    const lineId = node.lineId;

    if (!currentSegment || currentSegment.lineId !== lineId) {
      // New segment (start or transfer)
      if (currentSegment) {
        segments.push(currentSegment);
      }
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

  // Count total stops (minus starting stations of each segment after first)
  let totalStops = 0;
  segments.forEach(seg => { totalStops += seg.stations.length; });
  totalStops -= segments.length; // don't count boarding station of each segment

  const transfers = segments.length - 1;

  return { segments, totalStops, transfers };
}

// ─── Get all unique station names for autocomplete ─────────────
function getAllStationNames() {
  if (typeof SUBWAY_LINES === 'undefined') return [];
  const names = new Set();
  SUBWAY_LINES.forEach(l => {
    (l.stations || []).forEach(s => names.add(s.name));
  });
  return Array.from(names).sort();
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
        <input type="text" id="directions-from" class="directions-input" placeholder="Start station..." autocomplete="off">
        <div class="directions-suggestions" id="suggestions-from"></div>
      </div>
      <button class="directions-swap" onclick="swapDirections()" title="Swap">⇅</button>
      <div class="directions-input-row">
        <span class="directions-label">To</span>
        <input type="text" id="directions-to" class="directions-input" placeholder="Destination..." autocomplete="off">
        <div class="directions-suggestions" id="suggestions-to"></div>
      </div>
    </div>
    <button class="directions-go-btn" id="directions-go-btn" onclick="computeDirections()">Get Directions</button>
    <div class="directions-result" id="directions-result"></div>
  `;

  mapWrap.appendChild(panel);
  directionsPanel = panel;

  // Set up autocomplete
  const allNames = getAllStationNames();
  setupAutocomplete('directions-from', 'suggestions-from', allNames);
  setupAutocomplete('directions-to', 'suggestions-to', allNames);
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
  if (fromEl && toEl) {
    const tmp = fromEl.value;
    fromEl.value = toEl.value;
    toEl.value = tmp;
  }
}

// ─── Autocomplete setup ────────────────────────────────────────
function setupAutocomplete(inputId, suggestionsId, allNames) {
  const input = document.getElementById(inputId);
  const sugBox = document.getElementById(suggestionsId);
  if (!input || !sugBox) return;

  input.addEventListener('input', function () {
    const val = this.value.toLowerCase().trim();
    sugBox.innerHTML = '';
    if (val.length < 2) { sugBox.style.display = 'none'; return; }

    const matches = allNames.filter(n => n.toLowerCase().includes(val)).slice(0, 8);
    if (matches.length === 0) { sugBox.style.display = 'none'; return; }

    matches.forEach(m => {
      const div = document.createElement('div');
      div.className = 'directions-suggestion-item';
      // Show which lines serve this station
      const lines = getStationLines(m);
      div.innerHTML = `<span>${escHtml(m)}</span><span class="suggestion-lines">${lines.map(l => `<span class="suggestion-line-dot" style="background:${l.color}">${escHtml(l.id)}</span>`).join('')}</span>`;
      div.addEventListener('click', function () {
        input.value = m;
        sugBox.style.display = 'none';
      });
      sugBox.appendChild(div);
    });
    sugBox.style.display = 'block';
  });

  input.addEventListener('focus', function() {
    if (sugBox.children.length > 0) sugBox.style.display = 'block';
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', function (e) {
    if (!input.contains(e.target) && !sugBox.contains(e.target)) {
      sugBox.style.display = 'none';
    }
  });
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

// ─── Compute and display directions ────────────────────────────
function computeDirections() {
  const fromVal = document.getElementById('directions-from')?.value.trim();
  const toVal = document.getElementById('directions-to')?.value.trim();
  const resultDiv = document.getElementById('directions-result');
  if (!resultDiv) return;

  if (!fromVal || !toVal) {
    resultDiv.innerHTML = '<div class="directions-error">Please enter both stations.</div>';
    return;
  }

  // Exact match station names
  const allNames = getAllStationNames();
  const fromMatch = allNames.find(n => n.toLowerCase() === fromVal.toLowerCase());
  const toMatch = allNames.find(n => n.toLowerCase() === toVal.toLowerCase());

  if (!fromMatch) {
    resultDiv.innerHTML = `<div class="directions-error">Station "${escHtml(fromVal)}" not found.</div>`;
    return;
  }
  if (!toMatch) {
    resultDiv.innerHTML = `<div class="directions-error">Station "${escHtml(toVal)}" not found.</div>`;
    return;
  }

  if (fromMatch === toMatch) {
    resultDiv.innerHTML = '<div class="directions-error">Origin and destination are the same.</div>';
    return;
  }

  const route = findRoute(fromMatch, toMatch);
  if (!route) {
    resultDiv.innerHTML = '<div class="directions-error">No route found between those stations.</div>';
    return;
  }

  directionsRoute = route;

  // Render route
  let html = `<div class="directions-summary">${route.totalStops} stop${route.totalStops !== 1 ? 's' : ''}`;
  if (route.transfers > 0) {
    html += ` · ${route.transfers} transfer${route.transfers !== 1 ? 's' : ''}`;
  }
  html += `</div>`;

  route.segments.forEach((seg, segIdx) => {
    const badge = seg.lineId.length <= 3 ? seg.lineId : seg.lineId.charAt(0);
    html += `<div class="directions-segment">`;
    html += `<div class="directions-segment-header">`;
    html += `<span class="directions-line-badge" style="background:${seg.lineColor}">${escHtml(badge)}</span>`;

    if (seg.stations.length > 2) {
      html += `<span>${escHtml(seg.stations[0].name)} → ${escHtml(seg.stations[seg.stations.length - 1].name)}</span>`;
      html += `<span class="directions-stop-count">${seg.stations.length - 1} stops</span>`;
    } else {
      html += `<span>${escHtml(seg.stations[0].name)} → ${escHtml(seg.stations[seg.stations.length - 1].name)}</span>`;
    }
    html += `</div>`;

    // Show intermediate stations collapsed
    if (seg.stations.length > 2) {
      html += `<div class="directions-stops-list">`;
      seg.stations.forEach((s, i) => {
        const cls = i === 0 ? ' first' : (i === seg.stations.length - 1 ? ' last' : '');
        html += `<div class="directions-stop${cls}" style="--line-color: ${seg.lineColor}">`;
        html += `<div class="directions-stop-dot" style="border-color:${seg.lineColor}"></div>`;
        html += `<span>${escHtml(s.name)}</span></div>`;
      });
      html += `</div>`;
    }

    html += `</div>`;

    // Transfer indicator between segments
    if (segIdx < route.segments.length - 1) {
      html += `<div class="directions-transfer">Transfer</div>`;
    }
  });

  html += `<button class="directions-ride-btn" onclick="rideDirectionsRoute()">Ride This Route</button>`;

  resultDiv.innerHTML = html;

  // Draw route on map
  drawDirectionsOnMap(route);
}

// ─── Draw the directions route on the map ──────────────────────
function drawDirectionsOnMap(route) {
  clearDirectionsFromMap();
  if (!hoodMap) return;

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
  });

  // Fit map to route bounds
  const allCoords = route.segments.flatMap(seg => seg.stations.map(s => [s.lng, s.lat]));
  if (allCoords.length > 1) {
    const bounds = allCoords.reduce(
      (b, c) => {
        return [
          [Math.min(b[0][0], c[0]), Math.min(b[0][1], c[1])],
          [Math.max(b[1][0], c[0]), Math.max(b[1][1], c[1])],
        ];
      },
      [[allCoords[0][0], allCoords[0][1]], [allCoords[0][0], allCoords[0][1]]]
    );
    hoodMap.fitBounds(bounds, { padding: 60, bearing: 29, duration: 1000 });
  }
}

// ─── Clear directions layers from map ──────────────────────────
function clearDirectionsFromMap() {
  if (!hoodMap) return;
  directionsLayers.forEach(({ sourceId, layerId }) => {
    if (hoodMap.getLayer(layerId)) hoodMap.removeLayer(layerId);
    if (hoodMap.getSource(sourceId)) hoodMap.removeSource(sourceId);
  });
  directionsLayers = [];
}

// ─── Ride the computed directions route (animated) ─────────────
function rideDirectionsRoute() {
  if (!directionsRoute || !hoodMap) return;

  // Build a combined coordinate path across all segments
  const allCoords = [];
  const segmentColors = [];

  directionsRoute.segments.forEach(seg => {
    seg.stations.forEach(s => {
      allCoords.push([s.lng, s.lat]);
      segmentColors.push(seg.lineColor);
    });
  });

  if (allCoords.length < 2) return;

  // Close directions panel to make room
  closeDirectionsPanel();

  // Use the existing ride animation system with custom multi-line route
  stopTrainAnimation();

  const denseRoute = interpolateRoute(allCoords, 2000);
  const totalDurationMs = 90000;

  // Create train marker with first segment color
  const el = document.createElement('div');
  el.className = 'subway-train-marker';
  el.style.background = directionsRoute.segments[0].lineColor;
  const lineLabel = directionsRoute.segments[0].lineId;
  el.textContent = lineLabel.length <= 2 ? lineLabel : lineLabel.charAt(0);

  trainMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
    .setLngLat(denseRoute[0])
    .addTo(hoodMap);

  // Cumulative distances
  const cumDist = [0];
  for (let i = 1; i < denseRoute.length; i++) {
    const dx = denseRoute[i][0] - denseRoute[i - 1][0];
    const dy = denseRoute[i][1] - denseRoute[i - 1][1];
    cumDist.push(cumDist[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalDist = cumDist[cumDist.length - 1];

  // Station triggers from all segments
  const allStations = directionsRoute.segments.flatMap(seg =>
    seg.stations.map(s => ({ ...s, lineColor: seg.lineColor, lineId: seg.lineId }))
  );

  const stationTriggers = allStations.map(s => {
    let bestDist = Infinity;
    let bestIdx = 0;
    denseRoute.forEach((pt, i) => {
      const d = Math.sqrt((pt[0] - s.lng) ** 2 + (pt[1] - s.lat) ** 2);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return cumDist[bestIdx] / totalDist;
  });

  // Segment transition progress values (to update marker color)
  const segTransitions = [];
  let stationCount = 0;
  directionsRoute.segments.forEach(seg => {
    stationCount += seg.stations.length;
    const lastStation = seg.stations[seg.stations.length - 1];
    let bestIdx = 0, bestDist = Infinity;
    denseRoute.forEach((pt, i) => {
      const d = Math.sqrt((pt[0] - lastStation.lng) ** 2 + (pt[1] - lastStation.lat) ** 2);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    segTransitions.push({
      progress: cumDist[bestIdx] / totalDist,
      lineId: seg.lineId,
      lineColor: seg.lineColor,
    });
  });

  const highlightedStations = new Set();
  let lastHoodCheckTime = 0;
  let lastCameraTime = 0;
  let currentSegIdx = 0;

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
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / totalDurationMs, 1);
    const pt = getPositionAtProgress(progress);
    trainMarker.setLngLat(pt);

    // Update marker color on segment transitions
    while (currentSegIdx < segTransitions.length - 1 && progress > segTransitions[currentSegIdx].progress) {
      currentSegIdx++;
      const newSeg = directionsRoute.segments[currentSegIdx];
      if (newSeg) {
        el.style.background = newSeg.lineColor;
        el.textContent = newSeg.lineId.length <= 2 ? newSeg.lineId : newSeg.lineId.charAt(0);
      }
    }

    // Camera follow
    if (timestamp - lastCameraTime > 200) {
      lastCameraTime = timestamp;
      hoodMap.easeTo({ center: pt, bearing: 29, duration: 250, easing: t => t });
    }

    // Station triggers
    stationTriggers.forEach((triggerProgress, i) => {
      if (progress >= triggerProgress && !highlightedStations.has(i)) {
        highlightedStations.add(i);
        const s = allStations[i];
        const hoodName = getNeighborhoodNameAtPoint([s.lng, s.lat]);
        showStationToast(s.name, hoodName, s.lineColor, s);
        pulseStationOnMap(s, s.lineColor);
      }
    });

    // Neighborhood highlight
    if (timestamp - lastHoodCheckTime > 150) {
      lastHoodCheckTime = timestamp;
      highlightNeighborhoodAtPoint(pt, segTransitions[currentSegIdx]?.lineColor || '#666');
    }

    if (progress >= 1) {
      finishTrainRide(null);
      return;
    }

    trainAnimationId = requestAnimationFrame(animate);
  }

  hoodMap.easeTo({ center: denseRoute[0], zoom: 14, bearing: 29, duration: 1000 });
  setTimeout(() => { trainAnimationId = requestAnimationFrame(animate); }, 1100);
}

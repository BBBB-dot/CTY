// Neighborhoods Page — Leaflet Tile Map with CartoDB Dark base
// Replaces previous D3 SVG implementation with real street tiles

let currentFilter = 'all';
let currentSearch = '';
let currentHoodId = null;
let hoodGeoData = null;
let hoodMapReady = false;

// Leaflet map references
let hoodMap = null;
let hoodPolygonLayers = {};   // subId/ntaCode → L.polygon
let hoodBgLayers = [];        // background NTA shapes
let centralParkLayer = null;

// ─── Borough color fill ─────────────────────────────────────────
// Subtle lightness variation within each borough — keeps neighborhoods
// visually distinct without the chaotic hue shifts.
function getNTAFill(ntaCode, borough, index, total) {
  const base = getBoroughColor(borough);
  const r = parseInt(base.slice(1, 3), 16) / 255;
  const g = parseInt(base.slice(3, 5), 16) / 255;
  const b = parseInt(base.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Very subtle variation: only lightness shifts ±6%, no hue shift
  const t = total > 1 ? index / (total - 1) : 0.5;
  const lightShift = (t - 0.5) * 0.06;

  l = Math.max(0.25, Math.min(0.55, l + lightShift));

  return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

// ─── Get sub-neighborhoods for an NTA code ──────────────────────
function getSubsForNTA(ntaCode) {
  if (typeof SUB_TO_NTA === 'undefined') return [];
  return NEIGHBORHOODS.filter(h => h.parent && getSubNTA(h.id) === ntaCode);
}

// ─── Polygon area (shoelace) for lat/lng arrays ─────────────────
function latlngPolyArea(coords) {
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  return Math.abs(area / 2);
}

// ─── Get short abbreviation ─────────────────────────────────────
function getHoodAbbr(name) {
  const words = name.split(/[-\s(]+/);
  if (words.length === 1) return name.length > 5 ? name.substring(0, 4) : name;
  return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
}

// ─── Sub-neighborhood ID → locality boundary name ───────────────
const SUB_TO_LOCALITY = {
  'MN-FiDi': 'Financial District', 'MN-BPC': 'Battery Park City',
  'MN-Tribeca': 'TriBeCa', 'MN-CivCtr': 'Civic Center',
  'MN-SoHo': 'SoHo', 'MN-LittleItaly': 'Little Italy',
  'MN-HudsonSq': 'Hudson Square', 'MN-Nolita': 'NoLita',
  'MN-GrnwchVlg': 'Greenwich Village', 'MN-NoHo': 'NoHo',
  'MN-WestVlg': 'West Village', 'MN-Meatpacking': 'Meatpacking District',
  'MN-Chinatown': 'Chinatown', 'MN-TwoBridges': 'Two Bridges',
  'MN-LES': 'Lower East Side', 'MN-Bowery': 'Bowery',
  'MN-EastVlg': 'East Village', 'MN-AlphaCity': 'Alphabet City',
  'MN-Chelsea': 'Chelsea', 'MN-HudsonYards': 'Hudson Yards',
  'MN-HellsK': "Hell's Kitchen", 'MN-GarmentDist': 'Garment District',
  'MN-Flatiron': 'Flatiron District', 'MN-UnionSq': 'Union Square',
  'MN-NoMad': 'NoMad', 'MN-Koreatown': 'Koreatown',
  'MN-Midtown': 'Midtown Center', 'MN-TimesSq': 'Theater District',
  'MN-DiamondDist': 'Diamond District',
  'MN-StuyTown': 'Stuyvesant Town', 'MN-PeterCooper': 'Peter Cooper Village',
  'MN-Gramercy': 'Gramercy Park', 'MN-RoseHill': 'Rose Hill',
  'MN-MurrayHill': 'Murray Hill', 'MN-KipsBay': 'Kips Bay',
  'MN-EastMidtown': 'Midtown East', 'MN-TurtleBay': 'Turtle Bay',
  'MN-SuttonPl': 'Sutton Place', 'MN-TudorCity': 'Tudor City',
  'MN-LincolnSq': 'Lincoln Square',
  'MN-UWS': 'Upper West Side', 'MN-ManValley': 'Manhattan Valley',
  'MN-LenoxHill': 'Lenox Hill', 'MN-UES': 'Upper East Side',
  'MN-CarnegieHill': 'Carnegie Hill', 'MN-Yorkville': 'Yorkville',
  'MN-MorningsideHts': 'Morningside Heights',
  'MN-Manhattanville': 'Manhattanville',
  'MN-HamiltonHts': 'Hamilton Heights', 'MN-SugarHill': 'Sugar Hill',
  'MN-Harlem': 'Harlem',
  'MN-SpanishHarlem': 'East Harlem',
};

// ─── Map rotation (degrees east of north) ────────────────────────
// Manhattan's street grid runs ~29° east of true north. Rotating the
// map by this amount makes the island vertical — the classic NYC
// subway-map orientation.
const MAP_ROTATION_DEG = -29;

// ─── Load GeoJSON + render Leaflet map ──────────────────────────
function initHoodMap() {
  if (hoodMapReady) return;

  const container = document.getElementById('hood-map-container');
  if (!container) return;

  // Ensure container has height for Leaflet
  if (!container.style.height) {
    const w = container.clientWidth || 900;
    container.style.height = Math.round(w * 0.85) + 'px';
  }

  // CSS rotation for vertical Manhattan. Expand container to 150%
  // so rotated corners are clipped by the wrapper's overflow:hidden.
  container.style.transform = `rotate(${MAP_ROTATION_DEG}deg)`;
  container.style.transformOrigin = 'center center';
  container.style.width = '150%';
  container.style.height = '150%';
  container.style.marginLeft = '-25%';
  container.style.marginTop = '-25%';

  // Create Leaflet map
  hoodMap = L.map('hood-map-container', {
    zoomControl: false,
    attributionControl: false,
    minZoom: 10,
    maxZoom: 18,
  }).setView([40.758, -73.985], 12);

  // CartoDB Dark Matter with labels — readable streets & landmarks
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(hoodMap);

  // Load NTA GeoJSON for borough boundaries
  d3.json('data/nyc-neighborhoods.json').then(function(geo) {
    hoodGeoData = geo;
    renderLeafletMap(geo);
    hoodMapReady = true;
  }).catch(function(err) {
    console.error('GeoJSON load error:', err);
    // Even without GeoJSON, render locality boundaries
    renderLocalityOnly();
    hoodMapReady = true;
  });
}

// ─── Render all layers onto the Leaflet map ─────────────────────
function renderLeafletMap(geo) {
  const ntaPaths = [];
  let centralParkFeature = null;

  geo.features.forEach(f => {
    const code = NTA_NAME_TO_CODE[f.properties.name];
    if (f.properties.name === 'Central Park') {
      centralParkFeature = f;
    } else if (f.properties.ntatype === '0' && code) {
      f.properties.ntaCode = code;
      ntaPaths.push(f);
    }
  });

  // Track which NTAs have subs
  const ntasWithSubs = {};
  if (typeof SUB_TO_NTA !== 'undefined') {
    Object.values(SUB_TO_NTA).forEach(ntaCode => { ntasWithSubs[ntaCode] = true; });
  }

  // Borough color index for variation
  const boroughCounts = {};
  ntaPaths.forEach(f => {
    const boro = f.properties.borough.toLowerCase().replace(/ /g, '_');
    if (!boroughCounts[boro]) boroughCounts[boro] = 0;
    boroughCounts[boro]++;
  });
  const boroughIdx = {};

  // ─── 1. Background NTA shapes ───
  // NTAs with subs: faint backdrop; NTAs without subs: interactive polygons
  ntaPaths.forEach(f => {
    const boro = f.properties.borough.toLowerCase().replace(/ /g, '_');
    if (!boroughIdx[boro]) boroughIdx[boro] = 0;
    const idx = boroughIdx[boro]++;
    const total = boroughCounts[boro];
    const fill = getNTAFill(f.properties.ntaCode, boro, idx, total);
    f.properties._fill = fill;
    f.properties._boro = boro;

    const hasSubs = ntasWithSubs[f.properties.ntaCode];
    const latlngs = geoJSONToLatLngs(f.geometry);
    if (!latlngs) return;

    // Start invisible — only visited/lived will get color via refreshMapColors()
    const layer = L.polygon(latlngs, {
      color: 'transparent',
      weight: 0,
      fillColor: fill,
      fillOpacity: 0,
      interactive: !hasSubs,
    }).addTo(hoodMap);

    if (!hasSubs) {
      const code = f.properties.ntaCode;
      layer.on('click', function() { openHoodDetail(code); });
      layer.on('mouseover', function(e) {
        showHoodTooltipLeaflet(e, code);
        // Subtle hover outline — don't fill unless visited/lived
        const status = getNeighborhoodStatus(code);
        if (status === 'lived' || status === 'visited') {
          layer.setStyle({ ...STYLE.hover, fillColor: fill, fillOpacity: STYLE.hover.fillOpacity + 0.15 });
        } else {
          layer.setStyle({ ...STYLE.hover, fillColor: fill });
        }
      });
      layer.on('mouseout', function() {
        hideHoodTooltip();
        refreshSingleLayer(code);
      });
      hoodPolygonLayers[code] = layer;
    }
    hoodBgLayers.push({ layer, feature: f, hasSubs });
  });

  // ─── 2. Central Park ───
  if (centralParkFeature) {
    const latlngs = geoJSONToLatLngs(centralParkFeature.geometry);
    if (latlngs) {
      centralParkLayer = L.polygon(latlngs, {
        color: 'rgba(125,175,107,0.4)',
        weight: 1,
        fillColor: '#2d5a3a',
        fillOpacity: 0.55,
      }).addTo(hoodMap);
      centralParkLayer.on('click', function() { openHoodDetail('MN-CentralPark'); });
      centralParkLayer.on('mouseover', function(e) { showHoodTooltipLeaflet(e, 'MN-CentralPark'); });
      centralParkLayer.on('mouseout', hideHoodTooltip);
    }
  }

  // ─── 3. Sub-neighborhood polygons from LOCALITY_BOUNDARIES ───
  renderLocalityPolygons(ntaPaths, ntasWithSubs, boroughCounts);

  // ─── 4. Apply visited/lived colors ───
  refreshMapColors();
}

// ─── Render locality-only (fallback if no GeoJSON) ──────────────
function renderLocalityOnly() {
  renderLocalityPolygons([], {}, {});
  refreshMapColors();
}

// ─── Render sub-neighborhood polygons with priority z-ordering ──
function renderLocalityPolygons(ntaPaths, ntasWithSubs, boroughCounts) {
  const hasLocality = typeof LOCALITY_BOUNDARIES !== 'undefined';
  const hasPriority = typeof NEIGHBORHOOD_PRIORITY !== 'undefined';
  if (!hasLocality) return;

  // Collect all sub-neighborhoods that have locality polygon data
  const subEntries = [];

  // Process NTAs that have subs
  const processedNTAs = new Set();
  ntaPaths.forEach(feature => {
    const ntaCode = feature.properties.ntaCode;
    if (!ntasWithSubs || !ntasWithSubs[ntaCode]) return;
    processedNTAs.add(ntaCode);

    const subs = getSubsForNTA(ntaCode);
    subs.forEach((sub, i) => {
      const localityName = SUB_TO_LOCALITY[sub.id];
      const localityData = localityName ? LOCALITY_BOUNDARIES[localityName] : null;
      if (!localityData || !localityData.polygon) return;

      const priority = hasPriority && NEIGHBORHOOD_PRIORITY[sub.id]
        ? NEIGHBORHOOD_PRIORITY[sub.id] : 0;

      subEntries.push({
        subId: sub.id,
        hood: sub,
        polygon: localityData.polygon,
        borough: sub.borough,
        priority: priority,
        ntaCode: ntaCode,
        idx: i,
        totalInNTA: subs.length,
      });
    });
  });

  // Also check for locality polygons that match neighborhoods not in NTA system
  // (e.g., islands, standalone areas)
  NEIGHBORHOODS.forEach(hood => {
    if (hood.borough !== 'manhattan') return;
    if (hoodPolygonLayers[hood.id]) return; // already rendered as NTA
    const localityName = SUB_TO_LOCALITY[hood.id];
    const localityData = localityName ? LOCALITY_BOUNDARIES[localityName] : null;
    if (!localityData || !localityData.polygon) return;
    if (subEntries.some(e => e.subId === hood.id)) return; // already queued

    const priority = hasPriority && NEIGHBORHOOD_PRIORITY[hood.id]
      ? NEIGHBORHOOD_PRIORITY[hood.id] : 0;

    subEntries.push({
      subId: hood.id,
      hood: hood,
      polygon: localityData.polygon,
      borough: hood.borough,
      priority: priority,
      ntaCode: hood.parent || hood.id,
      idx: 0,
      totalInNTA: 1,
    });
  });

  // Sort by priority ascending (lowest first → added to map first → behind)
  // For ties, larger area behind
  subEntries.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return latlngPolyArea(b.polygon) - latlngPolyArea(a.polygon);
  });

  // Render each sub-neighborhood polygon
  subEntries.forEach(entry => {
    // Convert [lat, lng] polygon to Leaflet-compatible format
    const latlngs = entry.polygon.map(p => [p[0], p[1]]);
    // Use borough base color directly — subtle variation comes from getNTAFill
    const subFill = getBoroughColor(entry.borough);

    // Use pane with z-index based on priority for stacking order
    const paneName = 'sub-' + entry.priority;
    if (!hoodMap.getPane(paneName)) {
      hoodMap.createPane(paneName);
      hoodMap.getPane(paneName).style.zIndex = 400 + entry.priority;
    }

    // Start invisible — refreshMapColors() will light up visited/lived
    const layer = L.polygon(latlngs, {
      pane: paneName,
      color: 'transparent',
      weight: 0,
      fillColor: subFill,
      fillOpacity: 0,
      interactive: true,
    }).addTo(hoodMap);

    layer._subFill = subFill;
    layer._subId = entry.subId;
    layer._borough = entry.borough;
    layer._priority = entry.priority;

    layer.on('click', function() {
      openHoodDetail(entry.subId);
      hoodMap.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 15 });
    });

    layer.on('mouseover', function(e) {
      showHoodTooltipLeaflet(e, entry.subId);
      const status = getNeighborhoodStatus(entry.subId);
      if (status === 'lived' || status === 'visited') {
        layer.setStyle({ ...STYLE.hover, fillColor: subFill, fillOpacity: STYLE.hover.fillOpacity + 0.15 });
      } else {
        layer.setStyle({ ...STYLE.hover, fillColor: subFill });
      }
    });

    layer.on('mouseout', function() {
      hideHoodTooltip();
      refreshSingleLayer(entry.subId);
    });

    hoodPolygonLayers[entry.subId] = layer;
  });
}

// ─── Convert GeoJSON geometry to Leaflet latlngs ────────────────
function geoJSONToLatLngs(geometry) {
  if (!geometry) return null;

  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ring =>
      ring.map(coord => [coord[1], coord[0]])
    );
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(poly =>
      poly.map(ring => ring.map(coord => [coord[1], coord[0]]))
    );
  }
  return null;
}

// ─── Tooltip (uses same tooltip element as before) ──────────────
function showHoodTooltipLeaflet(e, hoodId) {
  const tooltip = document.getElementById('tooltip');
  const hood = getNeighborhoodById(hoodId);
  if (!hood || !tooltip) return;

  const status = getNeighborhoodStatus(hoodId);
  const statusText = status === 'lived' ? ' · Lived' : status === 'visited' ? ' · Visited' : '';

  document.getElementById('t-name').textContent = hood.name;
  document.getElementById('t-sub').textContent = getBoroughName(hood.borough) + statusText;

  tooltip.style.display = 'block';
  tooltip.style.left = (e.originalEvent.pageX + 12) + 'px';
  tooltip.style.top = (e.originalEvent.pageY - 10) + 'px';
}

function showHoodTooltip(event, hoodId) {
  const tooltip = document.getElementById('tooltip');
  const hood = getNeighborhoodById(hoodId);
  if (!hood || !tooltip) return;

  const status = getNeighborhoodStatus(hoodId);
  const statusText = status === 'lived' ? ' · Lived' : status === 'visited' ? ' · Visited' : '';

  document.getElementById('t-name').textContent = hood.name;
  document.getElementById('t-sub').textContent = getBoroughName(hood.borough) + statusText;

  tooltip.style.display = 'block';
  tooltip.style.left = event.pageX + 12 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
}

function hideHoodTooltip() {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

// ─── Style constants ────────────────────────────────────────────
// Consistent opacity levels across all neighborhoods
const STYLE = {
  // Unvisited: completely invisible — no fill, no border
  unvisited:  { fillOpacity: 0, color: 'transparent', weight: 0 },
  overlapped: { fillOpacity: 0, color: 'transparent', weight: 0 },
  // Hover: subtle outline so users can see what they're pointing at
  hover:      { fillOpacity: 0.12, color: 'rgba(255,255,255,0.35)', weight: 1.2 },
  // Visited/lived: these are the only states that show color
  visited:    { fillOpacity: 0.40, color: 'rgba(255,255,255,0.18)', weight: 0.8 },
  lived:      { fillOpacity: 0.55, color: 'rgba(255,255,255,0.28)', weight: 1.0 },
};

// ─── Refresh map colors based on visited/lived status ───────────
function refreshMapColors() {
  if (!hoodMap) return;

  // NTA background layers (non-sub)
  hoodBgLayers.forEach(entry => {
    if (entry.hasSubs) return;
    const code = entry.feature.properties.ntaCode;
    const fill = entry.feature.properties._fill;
    const status = getNeighborhoodStatus(code);

    if (status === 'lived') {
      entry.layer.setStyle({ fillColor: fill, ...STYLE.lived });
    } else if (status === 'visited') {
      entry.layer.setStyle({ fillColor: fill, ...STYLE.visited });
    } else {
      entry.layer.setStyle({ fillColor: fill, ...STYLE.unvisited });
    }
  });

  // Sub-neighborhood polygon layers
  const hasPriority = typeof NEIGHBORHOOD_PRIORITY !== 'undefined';

  // Build overlap map for dimming
  const subEntries = [];
  Object.entries(hoodPolygonLayers).forEach(([subId, layer]) => {
    if (!layer._subFill) return; // skip NTA-only layers
    const priority = layer._priority || 0;
    const bounds = layer.getBounds();
    subEntries.push({ subId, layer, priority, bounds });
  });

  subEntries.forEach(entry => {
    const status = getNeighborhoodStatus(entry.subId);
    const fill = entry.layer._subFill;

    // Check if overlapped by higher-priority neighbor
    const isOverlapped = subEntries.some(other =>
      other.subId !== entry.subId &&
      other.priority > entry.priority &&
      entry.bounds.intersects(other.bounds)
    );

    if (status === 'lived') {
      entry.layer.setStyle({ fillColor: fill, ...STYLE.lived });
    } else if (status === 'visited') {
      entry.layer.setStyle({ fillColor: fill, ...STYLE.visited });
    } else if (isOverlapped) {
      entry.layer.setStyle({ fillColor: fill, ...STYLE.overlapped });
    } else {
      entry.layer.setStyle({ fillColor: fill, ...STYLE.unvisited });
    }
  });
}

// ─── Refresh a single layer (used on mouseout) ─────────────────
function refreshSingleLayer(subId) {
  const layer = hoodPolygonLayers[subId];
  if (!layer) return;
  const fill = layer._subFill || (function() {
    // For NTA layers, find fill from bgLayers
    const bg = hoodBgLayers.find(e => e.feature.properties.ntaCode === subId);
    return bg ? bg.feature.properties._fill : '#fff';
  })();
  const status = getNeighborhoodStatus(subId);
  const priority = layer._priority || 0;

  if (status === 'lived') {
    layer.setStyle({ fillColor: fill, ...STYLE.lived });
  } else if (status === 'visited') {
    layer.setStyle({ fillColor: fill, ...STYLE.visited });
  } else {
    // Check for overlap
    const hasPriority = typeof NEIGHBORHOOD_PRIORITY !== 'undefined';
    const bounds = layer.getBounds();
    let isOverlapped = false;
    if (hasPriority) {
      Object.entries(hoodPolygonLayers).some(([otherId, other]) => {
        if (otherId === subId || !other._subFill) return false;
        const otherPri = other._priority || 0;
        if (otherPri > priority && bounds.intersects(other.getBounds())) {
          isOverlapped = true;
          return true;
        }
        return false;
      });
    }
    layer.setStyle({ fillColor: fill, ...(isOverlapped ? STYLE.overlapped : STYLE.unvisited) });
  }
}

// ─── Zoom controls ──────────────────────────────────────────────
function zoomMapIn() {
  if (!hoodMap) return;
  hoodMap.zoomIn();
}

function zoomMapOut() {
  if (!hoodMap) return;
  hoodMap.zoomOut();
}

function resetMapZoom() {
  if (!hoodMap) return;
  hoodMap.setView([40.758, -73.985], 12, { animate: true });
}

// ─── Zoom to a specific neighborhood ────────────────────────────
function zoomToFeature(feature) {
  if (!hoodMap || !feature) return;
  const latlngs = geoJSONToLatLngs(feature.geometry);
  if (latlngs) {
    const bounds = L.polygon(latlngs).getBounds();
    hoodMap.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
  }
}

function zoomToPoint(lat, lng, zoomLevel) {
  if (!hoodMap) return;
  hoodMap.setView([lat, lng], zoomLevel || 15, { animate: true });
}

// ─── Render neighborhood cards grid ─────────────────────────────
function renderNeighborhoods(filter) {
  if (filter) currentFilter = filter;

  let neighborhoods = filterNeighborhoodsByBorough(currentFilter);

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    neighborhoods = neighborhoods.filter(h => h.name.toLowerCase().includes(q));
  }

  const grid = document.getElementById('neighborhoods-grid');
  grid.innerHTML = '';

  const sorted = [...neighborhoods].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach(hood => {
    const status = getNeighborhoodStatus(hood.id);
    const color = getBoroughColor(hood.borough);
    const spots = getTotalSpotsCount(hood.id);
    const visited = getVisitedSpotsCount(hood.id);

    const card = document.createElement('div');
    card.className = 'hood-btn';
    if (status === 'lived') card.classList.add('lived');
    else if (status === 'visited') card.classList.add('visited');
    if (hood.parent) card.classList.add('sub-hood');

    const abbr = getHoodAbbr(hood.name);
    card.innerHTML = `
      <div class="hb-accent" style="background:${color}"></div>
      <div class="hb-abbr" style="color:${status ? color : 'rgba(255,255,255,0.4)'}">${abbr}</div>
      <div class="hb-name">${escHtml(hood.name)}</div>
      ${spots > 0 ? `<div class="hb-meta">${visited}/${spots}</div>` : ''}
    `;

    card.onclick = () => {
      openHoodDetail(hood.id);
      // Zoom map to this neighborhood
      const layer = hoodPolygonLayers[hood.id];
      if (layer) {
        hoodMap.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 15, animate: true });
      } else if (hood.parent && hoodGeoData) {
        const ntaCode = getSubNTA(hood.id);
        const feat = hoodGeoData.features.find(f => f.properties.ntaCode === ntaCode);
        if (feat) zoomToFeature(feat);
      } else if (hoodGeoData) {
        const feat = hoodGeoData.features.find(f => f.properties.ntaCode === hood.id);
        if (feat) zoomToFeature(feat);
      }
    };
    grid.appendChild(card);
  });
}

// ─── Search / Borough filter ────────────────────────────────────
function filterHoodSearch(value) {
  currentSearch = value;
  renderNeighborhoods();
}

function filterBorough(borough, btn) {
  document.querySelectorAll('.borough-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNeighborhoods(borough);
}

// ─── Open neighborhood detail popup ─────────────────────────────
function openHoodDetail(hoodId) {
  currentHoodId = hoodId;
  const hood = getNeighborhoodById(hoodId);
  if (!hood) return;

  const popup = document.getElementById('hood-detail');
  const color = getBoroughColor(hood.borough);
  const status = getNeighborhoodStatus(hoodId);

  document.getElementById('hd-accent').style.background = color;
  document.getElementById('hd-name').textContent = hood.name;
  document.getElementById('hd-borough').textContent = getBoroughName(hood.borough);
  document.getElementById('hd-borough').style.color = color;

  document.getElementById('hd-desc').textContent = '';
  document.getElementById('hd-tags').innerHTML = '';

  updateStatusButtons(hoodId, status, color);

  const visitedCount = getVisitedSpotsCount(hoodId);
  const total = getTotalSpotsCount(hoodId);
  const pct = total > 0 ? (visitedCount / total) * 100 : 0;
  document.getElementById('hd-progress-text').textContent = visitedCount + '/' + total + ' spots collected';
  const progressBar = document.getElementById('hd-progress-bar');
  progressBar.style.width = pct + '%';
  progressBar.style.background = color;

  buildMiniMap(hoodId, color);
  renderSpotsList(hoodId);

  popup.classList.add('active');
  document.getElementById('hood-detail-overlay').classList.add('active');
}

// ─── Status buttons ─────────────────────────────────────────────
function updateStatusButtons(hoodId, status, color) {
  const visitedBtn = document.getElementById('hd-visited-btn');
  const livedBtn = document.getElementById('hd-lived-btn');

  if (status === 'visited') {
    visitedBtn.classList.add('active');
    visitedBtn.style.background = color;
    visitedBtn.style.color = '#fff';
    visitedBtn.style.borderColor = color;
    visitedBtn.textContent = '✓ Visited';
  } else {
    visitedBtn.classList.remove('active');
    visitedBtn.style.background = 'rgba(255,255,255,0.06)';
    visitedBtn.style.color = 'rgba(255,255,255,0.5)';
    visitedBtn.style.borderColor = 'rgba(255,255,255,0.15)';
    visitedBtn.textContent = 'Mark Visited';
  }

  if (status === 'lived') {
    livedBtn.classList.add('active');
    livedBtn.style.background = color;
    livedBtn.style.color = '#fff';
    livedBtn.style.borderColor = color;
    livedBtn.textContent = '✓ Lived Here';
  } else {
    livedBtn.classList.remove('active');
    livedBtn.style.background = 'rgba(255,255,255,0.06)';
    livedBtn.style.color = 'rgba(255,255,255,0.5)';
    livedBtn.style.borderColor = 'rgba(255,255,255,0.15)';
    livedBtn.textContent = 'Lived Here';
  }
}

function toggleHoodVisited() {
  if (!currentHoodId) return;
  const status = getNeighborhoodStatus(currentHoodId);
  const newStatus = status === 'visited' ? false : 'visited';
  syncNeighborhoodStatus(currentHoodId, newStatus);
  const color = getBoroughColor(getNeighborhoodById(currentHoodId).borough);
  updateStatusButtons(currentHoodId, newStatus, color);
  refreshMapColors();
  renderNeighborhoods();
  updateHoodStats();
  updateNavStats();
  showToast(newStatus ? 'Marked as visited' : 'Removed visited status');
}

function toggleHoodLived() {
  if (!currentHoodId) return;
  const status = getNeighborhoodStatus(currentHoodId);
  const newStatus = status === 'lived' ? false : 'lived';
  syncNeighborhoodStatus(currentHoodId, newStatus);
  const color = getBoroughColor(getNeighborhoodById(currentHoodId).borough);
  updateStatusButtons(currentHoodId, newStatus, color);
  refreshMapColors();
  renderNeighborhoods();
  updateHoodStats();
  updateNavStats();
  showToast(newStatus ? 'Marked as lived' : 'Removed lived status');
}

// ─── Build mini map (D3 — self-contained for detail popup) ──────
function buildMiniMap(hoodId, color) {
  const container = document.getElementById('hd-minimap');
  container.innerHTML = '';

  const hood = getNeighborhoodById(hoodId);
  if (!hood || !hoodGeoData) return;

  const restaurants = getNeighborhoodRestaurants(hoodId);
  const attractions = getNeighborhoodAttractions(hoodId);
  const allSpots = [
    ...restaurants.map(r => ({ ...r, spotType: 'restaurant' })),
    ...attractions.map(a => ({ ...a, spotType: 'attraction' }))
  ].filter(s => s.lat && s.lng);

  const w = 280, h = 200;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('border-radius', '8px')
    .style('background', 'rgba(255,255,255,0.03)');

  const ntaCode = hood.parent ? getSubNTA(hoodId) : hoodId;
  const feature = hoodGeoData.features.find(f => f.properties.ntaCode === ntaCode);

  if (feature) {
    const fc = { type: 'FeatureCollection', features: [feature] };
    const miniProj = d3.geoMercator().fitSize([w - 20, h - 20], fc);
    const miniPath = d3.geoPath().projection(miniProj);
    const g = svg.append('g').attr('transform', 'translate(10,10)');

    g.append('path')
      .datum(feature)
      .attr('d', miniPath)
      .style('fill', color + '20')
      .style('stroke', color)
      .style('stroke-width', 1.5)
      .style('stroke-opacity', 0.6);

    if (hood.parent) {
      const projected = miniProj([hood.center[1], hood.center[0]]);
      if (projected && !isNaN(projected[0])) {
        g.append('circle')
          .attr('cx', projected[0]).attr('cy', projected[1]).attr('r', 6)
          .style('fill', color).style('stroke', '#fff').style('stroke-width', 2);
        g.append('text')
          .attr('x', projected[0]).attr('y', projected[1] - 10)
          .text(hood.name)
          .style('font-size', '8px').style('fill', '#fff')
          .style('text-anchor', 'middle').style('font-family', 'Space Grotesk, sans-serif')
          .style('font-weight', '600');
      }
    }

    allSpots.forEach((spot, i) => {
      const projected = miniProj([spot.lng, spot.lat]);
      if (!projected) return;
      const isVisited = spot.spotType === 'restaurant' ? isRestaurantVisited(spot.id) : isAttractionVisited(spot.id);
      g.append('circle')
        .attr('cx', projected[0]).attr('cy', projected[1]).attr('r', 4)
        .style('fill', isVisited ? color : 'rgba(255,255,255,0.3)')
        .style('stroke', isVisited ? '#fff' : 'rgba(255,255,255,0.2)')
        .style('stroke-width', 1);
      if (i < 5) {
        g.append('text')
          .attr('x', projected[0] + 6).attr('y', projected[1] + 3)
          .text(spot.name.length > 14 ? spot.name.substring(0, 13) + '…' : spot.name)
          .style('font-size', '7px').style('fill', 'rgba(255,255,255,0.5)')
          .style('font-family', 'Space Grotesk, sans-serif').style('pointer-events', 'none');
      }
    });
    return;
  }

  if (allSpots.length > 0) {
    const lats = allSpots.map(s => s.lat);
    const lngs = allSpots.map(s => s.lng);
    const pad = 0.003;
    const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
    const minLng = Math.min(...lngs) - pad, maxLng = Math.max(...lngs) + pad;
    const scaleX = (w - 40) / (maxLng - minLng || 0.01);
    const scaleY = (h - 40) / (maxLat - minLat || 0.01);

    allSpots.forEach(spot => {
      const x = 20 + (spot.lng - minLng) * scaleX;
      const y = h - 20 - (spot.lat - minLat) * scaleY;
      const isVisited = spot.spotType === 'restaurant' ? isRestaurantVisited(spot.id) : isAttractionVisited(spot.id);
      svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 4)
        .style('fill', isVisited ? color : 'rgba(255,255,255,0.3)')
        .style('stroke', '#fff').style('stroke-width', 1);
    });
  } else {
    svg.append('text').attr('x', w/2).attr('y', h/2).attr('text-anchor', 'middle')
      .style('fill', 'rgba(255,255,255,0.3)').style('font-size', '12px')
      .text('No spots mapped yet');
  }
}

// ─── Render spots list in detail popup ──────────────────────────
function renderSpotsList(hoodId) {
  const restaurants = getNeighborhoodRestaurants(hoodId);
  const attractions = getNeighborhoodAttractions(hoodId);

  const restDiv = document.getElementById('hd-restaurants');
  restDiv.innerHTML = '';
  if (restaurants.length === 0) {
    restDiv.innerHTML = '<div class="hd-empty">No restaurants tracked here yet</div>';
  } else {
    restaurants.forEach(rest => {
      const visited = isRestaurantVisited(rest.id);
      const row = document.createElement('div');
      row.className = 'hd-spot-row' + (visited ? ' visited' : '');
      row.innerHTML = `
        <div class="hd-spot-info">
          <div class="hd-spot-name">${escHtml(rest.name)}</div>
          <div class="hd-spot-category">${getCategoryName(rest.category)}</div>
        </div>
        <input type="checkbox" class="hd-spot-check" ${visited ? 'checked' : ''} onchange="toggleSpot('restaurant','${rest.id}',this.checked)">
      `;
      restDiv.appendChild(row);
    });
  }

  const attrDiv = document.getElementById('hd-attractions');
  attrDiv.innerHTML = '';
  if (attractions.length === 0) {
    attrDiv.innerHTML = '<div class="hd-empty">No attractions tracked here yet</div>';
  } else {
    attractions.forEach(attr => {
      const visited = isAttractionVisited(attr.id);
      const row = document.createElement('div');
      row.className = 'hd-spot-row' + (visited ? ' visited' : '');
      row.innerHTML = `
        <div class="hd-spot-info">
          <div class="hd-spot-name">${escHtml(attr.name)}</div>
          <div class="hd-spot-category">${getCategoryName(attr.category)}</div>
        </div>
        <input type="checkbox" class="hd-spot-check" ${visited ? 'checked' : ''} onchange="toggleSpot('attraction','${attr.id}',this.checked)">
      `;
      attrDiv.appendChild(row);
    });
  }
}

// ─── Close detail popup ─────────────────────────────────────────
function closeHoodDetail() {
  document.getElementById('hood-detail').classList.remove('active');
  document.getElementById('hood-detail-overlay').classList.remove('active');
  currentHoodId = null;
}
function closeHoodDrawer() { closeHoodDetail(); }

// ─── Toggle spot visited ────────────────────────────────────────
function toggleSpot(type, id, visited) {
  if (type === 'restaurant') syncVisitedRestaurant(id, visited);
  else if (type === 'attraction') syncVisitedAttraction(id, visited);

  updateHoodStats();
  updateNavStats();

  if (currentHoodId) {
    const color = getBoroughColor(getNeighborhoodById(currentHoodId).borough);
    buildMiniMap(currentHoodId, color);
    renderSpotsList(currentHoodId);
    const visitedCount = getVisitedSpotsCount(currentHoodId);
    const total = getTotalSpotsCount(currentHoodId);
    const pct = total > 0 ? (visitedCount / total) * 100 : 0;
    document.getElementById('hd-progress-text').textContent = visitedCount + '/' + total + ' spots collected';
    document.getElementById('hd-progress-bar').style.width = pct + '%';
  }

  renderNeighborhoods();
}

// ─── Close on overlay click ─────────────────────────────────────
document.addEventListener('click', function(e) {
  if (e.target.id === 'hood-detail-overlay') closeHoodDetail();
});

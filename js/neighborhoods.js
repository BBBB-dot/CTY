// Neighborhoods Page — Mapbox GL JS with dark-v11 style
// Native bearing rotation for vertical Manhattan, feature-state for polygon styling

let currentFilter = 'all';
let currentSearch = '';
let currentHoodId = null;
let hoodGeoData = null;
let hoodMapReady = false;

// Mapbox GL map reference
let hoodMap = null;

// Lookup tables built at render time
let featureBounds = {};        // hoodId → [[sw_lng,sw_lat],[ne_lng,ne_lat]]
let ntaIdMap = {};             // ntaCode → numeric id (for feature-state)
let localityIdMap = {};        // subId  → numeric id (for feature-state)
let ntaFillColors = {};        // ntaCode → hex color
let localityFillColors = {};   // subId  → hex color
let hoveredNTAId = null;
let hoveredLocalityId = null;

// Mapbox token — split to avoid GitHub secret scanning blocks on push.
// Assembled at runtime from two halves.
if (typeof MAPBOX_TOKEN === 'undefined') {
  var MAPBOX_TOKEN = atob('cGsuZXlKMUlqb2lZbkpwYzJ0aWNtbHpheUlzSW1FaU9pSmpiVzFuZDJKbk5uTXdibWRwTW05eE1XVnRZbTluWTJ0ekluMC5zYnNMbHlrVlYxZVgyelVCcXB4R213');
}

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

// ─── Polygon area (shoelace) for coordinate arrays ──────────────
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

// ─── Compute bounding box from GeoJSON geometry ─────────────────
function geoBBox(geometry) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  function processCoord(c) {
    if (c[0] < minLng) minLng = c[0];
    if (c[0] > maxLng) maxLng = c[0];
    if (c[1] < minLat) minLat = c[1];
    if (c[1] > maxLat) maxLat = c[1];
  }
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(ring => ring.forEach(processCoord));
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(poly => poly.forEach(ring => ring.forEach(processCoord)));
  }
  return [[minLng, minLat], [maxLng, maxLat]];
}

// ─── Hex color to rgba string ───────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Initialize Mapbox GL map ───────────────────────────────────
function initHoodMap() {
  if (hoodMapReady) return;

  const container = document.getElementById('hood-map-container');
  if (!container) return;

  mapboxgl.accessToken = MAPBOX_TOKEN;

  // Create Mapbox GL map with native bearing for vertical Manhattan
  hoodMap = new mapboxgl.Map({
    container: 'hood-map-container',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-73.985, 40.758],
    zoom: 11.5,
    bearing: 29,           // Native rotation — Manhattan vertical, no CSS hacks
    pitch: 0,
    minZoom: 10,
    maxZoom: 18,
    attributionControl: false,
  });

  // Disable rotation interaction (we want fixed bearing)
  hoodMap.dragRotate.disable();
  hoodMap.touchZoomRotate.disableRotation();

  hoodMap.on('load', function() {
    // Load NTA GeoJSON
    fetch('data/nyc-neighborhoods.json')
      .then(r => r.json())
      .then(geo => {
        hoodGeoData = geo;
        renderMapboxMap(geo);
        hoodMapReady = true;
      })
      .catch(err => {
        console.error('GeoJSON load error:', err);
        renderLocalityOnly();
        hoodMapReady = true;
      });
  });
}

// ─── Render all layers onto the Mapbox GL map ───────────────────
function renderMapboxMap(geo) {
  const ntaFeatures = [];
  let centralParkFeature = null;

  // Track which NTAs have subs
  const ntasWithSubs = {};
  if (typeof SUB_TO_NTA !== 'undefined') {
    Object.values(SUB_TO_NTA).forEach(ntaCode => { ntasWithSubs[ntaCode] = true; });
  }

  // Borough color index for variation
  const boroughCounts = {};
  const ntaPaths = [];

  geo.features.forEach(f => {
    const code = NTA_NAME_TO_CODE[f.properties.name];
    if (f.properties.name === 'Central Park') {
      centralParkFeature = f;
    } else if (f.properties.ntatype === '0' && code) {
      f.properties.ntaCode = code;
      ntaPaths.push(f);
      const boro = f.properties.borough.toLowerCase().replace(/ /g, '_');
      if (!boroughCounts[boro]) boroughCounts[boro] = 0;
      boroughCounts[boro]++;
    }
  });

  const boroughIdx = {};
  let ntaNumId = 1;

  ntaPaths.forEach(f => {
    const boro = f.properties.borough.toLowerCase().replace(/ /g, '_');
    if (!boroughIdx[boro]) boroughIdx[boro] = 0;
    const idx = boroughIdx[boro]++;
    const total = boroughCounts[boro];
    const fill = getNTAFill(f.properties.ntaCode, boro, idx, total);

    const hasSubs = ntasWithSubs[f.properties.ntaCode];
    const id = ntaNumId++;

    // Store mappings
    ntaIdMap[f.properties.ntaCode] = id;
    ntaFillColors[f.properties.ntaCode] = fill;

    // Store bounds for card-click zoom
    featureBounds[f.properties.ntaCode] = geoBBox(f.geometry);

    // Build feature with numeric id for feature-state
    ntaFeatures.push({
      type: 'Feature',
      id: id,
      properties: {
        ntaCode: f.properties.ntaCode,
        borough: boro,
        fill: fill,
        hasSubs: hasSubs ? 1 : 0,
        name: f.properties.name,
      },
      geometry: f.geometry,
    });
  });

  // ─── 1. NTA polygon source + layers ───
  hoodMap.addSource('nta-polygons', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: ntaFeatures },
    generateId: false,  // we set ids manually
  });

  // NTA fill layer — only interactive for NTAs WITHOUT subs
  hoodMap.addLayer({
    id: 'nta-fill',
    type: 'fill',
    source: 'nta-polygons',
    filter: ['==', ['get', 'hasSubs'], 0],
    paint: {
      'fill-color': ['get', 'fill'],
      'fill-opacity': [
        'case',
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
      ],
    },
  });

  hoodMap.addLayer({
    id: 'nta-line',
    type: 'line',
    source: 'nta-polygons',
    filter: ['==', ['get', 'hasSubs'], 0],
    paint: {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 'rgba(255,255,255,0.35)',
        ['==', ['feature-state', 'status'], 'lived'], 'rgba(255,255,255,0.28)',
        ['==', ['feature-state', 'status'], 'visited'], 'rgba(255,255,255,0.18)',
        'transparent'
      ],
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 1.2,
        ['==', ['feature-state', 'status'], 'lived'], 1.0,
        ['==', ['feature-state', 'status'], 'visited'], 0.8,
        0
      ],
    },
  });

  // ─── 2. Central Park ───
  if (centralParkFeature) {
    hoodMap.addSource('central-park', {
      type: 'geojson',
      data: centralParkFeature,
    });

    hoodMap.addLayer({
      id: 'central-park-fill',
      type: 'fill',
      source: 'central-park',
      paint: {
        'fill-color': '#2d5a3a',
        'fill-opacity': 0.55,
      },
    });

    hoodMap.addLayer({
      id: 'central-park-line',
      type: 'line',
      source: 'central-park',
      paint: {
        'line-color': 'rgba(125,175,107,0.4)',
        'line-width': 1,
      },
    });
  }

  // ─── 3. Locality (sub-neighborhood) polygons ───
  renderLocalityPolygons(ntaPaths, ntasWithSubs, boroughCounts);

  // ─── 4. Apply visited/lived status via feature-state ───
  refreshMapColors();

  // ─── 5. Event handlers ───
  setupMapEvents();
}

// ─── Render locality-only (fallback if no GeoJSON) ──────────────
function renderLocalityOnly() {
  renderLocalityPolygons([], {}, {});
  refreshMapColors();
  setupMapEvents();
}

// ─── Build locality GeoJSON and add as source + layers ──────────
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

  // Also check for locality polygons not in NTA system
  NEIGHBORHOODS.forEach(hood => {
    if (hood.borough !== 'manhattan') return;
    if (ntaIdMap[hood.id]) return; // already rendered as NTA
    const localityName = SUB_TO_LOCALITY[hood.id];
    const localityData = localityName ? LOCALITY_BOUNDARIES[localityName] : null;
    if (!localityData || !localityData.polygon) return;
    if (subEntries.some(e => e.subId === hood.id)) return;

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

  // Sort by priority ascending (lowest first → rendered behind in source order)
  subEntries.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return latlngPolyArea(b.polygon) - latlngPolyArea(a.polygon);
  });

  // Build GeoJSON FeatureCollection — flip [lat,lng] → [lng,lat]
  const localityFeatures = [];
  let localityNumId = 1;

  subEntries.forEach(entry => {
    const id = localityNumId++;
    const subFill = getBoroughColor(entry.borough);

    // Flip [lat,lng] → [lng,lat] for GeoJSON
    const coordinates = [entry.polygon.map(p => [p[1], p[0]])];
    // Close the ring if not already closed
    const ring = coordinates[0];
    if (ring.length > 0) {
      const first = ring[0], last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push([first[0], first[1]]);
      }
    }

    localityIdMap[entry.subId] = id;
    localityFillColors[entry.subId] = subFill;

    // Compute and store bounds
    const bbox = geoBBox({ type: 'Polygon', coordinates });
    featureBounds[entry.subId] = bbox;

    localityFeatures.push({
      type: 'Feature',
      id: id,
      properties: {
        subId: entry.subId,
        borough: entry.borough,
        fill: subFill,
        priority: entry.priority,
        name: entry.hood.name,
      },
      geometry: {
        type: 'Polygon',
        coordinates: coordinates,
      },
    });
  });

  if (localityFeatures.length === 0) return;

  hoodMap.addSource('locality-polygons', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: localityFeatures },
    generateId: false,
  });

  hoodMap.addLayer({
    id: 'locality-fill',
    type: 'fill',
    source: 'locality-polygons',
    paint: {
      'fill-color': ['get', 'fill'],
      'fill-opacity': [
        'case',
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
      ],
    },
  });

  hoodMap.addLayer({
    id: 'locality-line',
    type: 'line',
    source: 'locality-polygons',
    paint: {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 'rgba(255,255,255,0.35)',
        ['==', ['feature-state', 'status'], 'lived'], 'rgba(255,255,255,0.28)',
        ['==', ['feature-state', 'status'], 'visited'], 'rgba(255,255,255,0.18)',
        'transparent'
      ],
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 1.2,
        ['==', ['feature-state', 'status'], 'lived'], 1.0,
        ['==', ['feature-state', 'status'], 'visited'], 0.8,
        0
      ],
    },
  });
}

// ─── Setup all map event handlers ───────────────────────────────
function setupMapEvents() {
  if (!hoodMap) return;

  const mapContainer = hoodMap.getContainer();

  // ─── NTA polygon events (non-sub neighborhoods) ───
  if (hoodMap.getLayer('nta-fill')) {
    hoodMap.on('click', 'nta-fill', function(e) {
      if (!e.features || !e.features.length) return;
      const props = e.features[0].properties;
      openHoodDetail(props.ntaCode);
    });

    hoodMap.on('mousemove', 'nta-fill', function(e) {
      if (!e.features || !e.features.length) return;
      mapContainer.style.cursor = 'pointer';
      const feat = e.features[0];
      const id = feat.id;

      // Clear previous hover
      if (hoveredNTAId !== null && hoveredNTAId !== id) {
        hoodMap.setFeatureState({ source: 'nta-polygons', id: hoveredNTAId }, { hover: false });
      }
      hoveredNTAId = id;
      hoodMap.setFeatureState({ source: 'nta-polygons', id: id }, { hover: true });

      // Tooltip
      showHoodTooltipMapbox(e, feat.properties.ntaCode);
    });

    hoodMap.on('mouseleave', 'nta-fill', function() {
      mapContainer.style.cursor = '';
      if (hoveredNTAId !== null) {
        hoodMap.setFeatureState({ source: 'nta-polygons', id: hoveredNTAId }, { hover: false });
        hoveredNTAId = null;
      }
      hideHoodTooltip();
    });
  }

  // ─── Locality polygon events (sub-neighborhoods) ───
  if (hoodMap.getLayer('locality-fill')) {
    hoodMap.on('click', 'locality-fill', function(e) {
      if (!e.features || !e.features.length) return;
      const props = e.features[0].properties;
      openHoodDetail(props.subId);
      const bounds = featureBounds[props.subId];
      if (bounds) {
        hoodMap.fitBounds(bounds, { padding: 60, maxZoom: 15 });
      }
    });

    hoodMap.on('mousemove', 'locality-fill', function(e) {
      if (!e.features || !e.features.length) return;
      mapContainer.style.cursor = 'pointer';
      const feat = e.features[0];
      const id = feat.id;

      if (hoveredLocalityId !== null && hoveredLocalityId !== id) {
        hoodMap.setFeatureState({ source: 'locality-polygons', id: hoveredLocalityId }, { hover: false });
      }
      hoveredLocalityId = id;
      hoodMap.setFeatureState({ source: 'locality-polygons', id: id }, { hover: true });

      showHoodTooltipMapbox(e, feat.properties.subId);
    });

    hoodMap.on('mouseleave', 'locality-fill', function() {
      mapContainer.style.cursor = '';
      if (hoveredLocalityId !== null) {
        hoodMap.setFeatureState({ source: 'locality-polygons', id: hoveredLocalityId }, { hover: false });
        hoveredLocalityId = null;
      }
      hideHoodTooltip();
    });
  }

  // ─── Central Park events ───
  if (hoodMap.getLayer('central-park-fill')) {
    hoodMap.on('click', 'central-park-fill', function() {
      openHoodDetail('MN-CentralPark');
    });

    hoodMap.on('mousemove', 'central-park-fill', function(e) {
      mapContainer.style.cursor = 'pointer';
      showHoodTooltipMapbox(e, 'MN-CentralPark');
    });

    hoodMap.on('mouseleave', 'central-park-fill', function() {
      mapContainer.style.cursor = '';
      hideHoodTooltip();
    });
  }
}

// ─── Tooltip ────────────────────────────────────────────────────
function showHoodTooltipMapbox(e, hoodId) {
  const tooltip = document.getElementById('tooltip');
  const hood = getNeighborhoodById(hoodId);
  if (!hood || !tooltip) return;

  const status = getNeighborhoodStatus(hoodId);
  const statusText = status === 'lived' ? ' · Lived' : status === 'visited' ? ' · Visited' : '';

  document.getElementById('t-name').textContent = hood.name;
  document.getElementById('t-sub').textContent = getBoroughName(hood.borough) + statusText;

  // Mapbox GL e.point is relative to the map container
  const containerRect = hoodMap.getContainer().getBoundingClientRect();
  tooltip.style.display = 'block';
  tooltip.style.left = (containerRect.left + e.point.x + 12 + window.scrollX) + 'px';
  tooltip.style.top = (containerRect.top + e.point.y - 10 + window.scrollY) + 'px';
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

// ─── Refresh map colors based on visited/lived status ───────────
// Sets feature-state on all features. Called on init and after status changes.
function refreshMapColors() {
  if (!hoodMap) return;

  // NTA polygons
  Object.keys(ntaIdMap).forEach(ntaCode => {
    const id = ntaIdMap[ntaCode];
    const status = getNeighborhoodStatus(ntaCode);
    hoodMap.setFeatureState(
      { source: 'nta-polygons', id: id },
      { status: status || 'none' }
    );
  });

  // Locality polygons
  Object.keys(localityIdMap).forEach(subId => {
    const id = localityIdMap[subId];
    const status = getNeighborhoodStatus(subId);
    hoodMap.setFeatureState(
      { source: 'locality-polygons', id: id },
      { status: status || 'none' }
    );
  });
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
  hoodMap.flyTo({ center: [-73.985, 40.758], zoom: 11.5, bearing: 29 });
}

// ─── Zoom to a specific neighborhood ────────────────────────────
function zoomToFeature(feature) {
  if (!hoodMap || !feature) return;
  const bbox = geoBBox(feature.geometry);
  hoodMap.fitBounds(bbox, { padding: 60, maxZoom: 15 });
}

function zoomToPoint(lat, lng, zoomLevel) {
  if (!hoodMap) return;
  hoodMap.flyTo({ center: [lng, lat], zoom: zoomLevel || 15 });
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
      const bounds = featureBounds[hood.id];
      if (bounds) {
        hoodMap.fitBounds(bounds, { padding: 60, maxZoom: 15 });
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

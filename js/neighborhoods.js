// Neighborhoods Page — Real NYC NTA Boundary Map + Cards + Detail Popup

let currentFilter = 'all';
let currentHoodId = null;
let hoodGeoData = null;
let hoodSvg = null;
let hoodProjection = null;
let hoodPath = null;
let hoodMapReady = false;

// ─── Load GeoJSON and render map ───────────────────────────────
function initHoodMap() {
  if (hoodMapReady) return;

  const container = document.getElementById('hood-map-container');
  if (!container) return;

  const w = container.clientWidth || 900;
  const h = Math.round(w * 0.75); // maintain aspect ratio

  hoodSvg = d3.select('#hood-map-container')
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('background', 'transparent');

  d3.json('data/nyc-neighborhoods.json').then(function(geo) {
    hoodGeoData = geo;

    // Fit projection to full NYC bounds
    hoodProjection = d3.geoMercator()
      .fitSize([w - 40, h - 40], geo);

    hoodPath = d3.geoPath().projection(hoodProjection);

    // Separate features: mapped neighborhoods vs background
    const mapped = [];
    const background = [];

    geo.features.forEach(f => {
      const ntaName = f.properties.name;
      const ctyId = NTA_TO_CTY[ntaName];
      if (ctyId) {
        f.properties.ctyId = ctyId;
        mapped.push(f);
      } else {
        background.push(f);
      }
    });

    // Draw background features first (parks, water, unmapped areas)
    hoodSvg.selectAll('.bg-path')
      .data(background)
      .enter()
      .append('path')
      .attr('class', 'bg-path')
      .attr('d', hoodPath)
      .style('fill', function(d) {
        const t = d.properties.ntatype;
        if (t === '5') return '#0c1a14'; // parks
        if (t === '6' || t === '8') return '#080e12'; // water/airports/cemeteries
        if (t === '7' || t === '9') return '#0a0a0e'; // misc non-residential
        return '#151515'; // unmapped residential neighborhoods
      })
      .style('stroke', 'rgba(255,255,255,0.06)')
      .style('stroke-width', 0.3);

    // Draw mapped neighborhood paths
    hoodSvg.selectAll('.hood-path')
      .data(mapped)
      .enter()
      .append('path')
      .attr('class', 'hood-path')
      .attr('d', hoodPath)
      .attr('data-id', d => d.properties.ctyId)
      .attr('data-nta', d => d.properties.name)
      .attr('data-borough', d => d.properties.borough ? d.properties.borough.toLowerCase().replace(/ /g, '_') : '')
      .on('click', function(event, d) {
        event.stopPropagation();
        openHoodDetail(d.properties.ctyId);
      })
      .on('mouseenter', function(event, d) {
        showHoodTooltip(event, d.properties.ctyId);
      })
      .on('mouseleave', hideHoodTooltip);

    // Add neighborhood labels (one per CTY neighborhood, at centroid of first NTA)
    const labeledIds = new Set();
    mapped.forEach(f => {
      const ctyId = f.properties.ctyId;
      if (labeledIds.has(ctyId)) return;
      labeledIds.add(ctyId);

      const centroid = hoodPath.centroid(f);
      if (isNaN(centroid[0])) return;

      hoodSvg.append('text')
        .attr('class', 'hood-label')
        .attr('x', centroid[0])
        .attr('y', centroid[1])
        .text(getHoodAbbr(ctyId))
        .style('font-size', '6.5px')
        .style('pointer-events', 'none');
    });

    // Add borough labels (large, semi-transparent)
    const boroughCentroids = {};
    mapped.forEach(f => {
      const boro = f.properties.borough;
      if (!boro) return;
      const c = hoodPath.centroid(f);
      if (isNaN(c[0])) return;
      if (!boroughCentroids[boro]) boroughCentroids[boro] = { x: 0, y: 0, n: 0 };
      boroughCentroids[boro].x += c[0];
      boroughCentroids[boro].y += c[1];
      boroughCentroids[boro].n++;
    });

    Object.entries(boroughCentroids).forEach(([boro, data]) => {
      const boroKey = boro.toLowerCase().replace(/ /g, '_');
      hoodSvg.append('text')
        .attr('class', 'borough-label')
        .attr('x', data.x / data.n)
        .attr('y', data.y / data.n)
        .text(boro.toUpperCase())
        .style('font-size', '14px')
        .style('font-weight', '800')
        .style('fill', getBoroughColor(boroKey))
        .style('fill-opacity', 0.15)
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .style('font-family', 'Syne, sans-serif')
        .style('letter-spacing', '3px');
    });

    refreshMapColors();
    hoodMapReady = true;
  }).catch(function(err) {
    console.error('GeoJSON load error:', err);
    container.innerHTML = '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.4)">Map data could not be loaded</div>';
  });
}

// ─── Get short abbreviation for label ──────────────────────────
function getHoodAbbr(id) {
  const abbrs = {
    financial_district: 'FiDi', tribeca: 'TRI', soho: 'SoHo', noho: 'NoHo',
    chinatown: 'CTN', little_italy: 'LI', lower_east_side: 'LES',
    east_village: 'EV', west_village: 'WV', greenwich_village: 'GV',
    chelsea: 'CHE', flatiron: 'FLT', gramercy: 'GRM', murray_hill: 'MH',
    midtown: 'MID', hell_kitchen: 'HK', upper_west_side: 'UWS',
    upper_east_side: 'UES', harlem: 'HAR', washington_heights: 'WH',
    williamsburg: 'WBG', greenpoint: 'GP', dumbo: 'DUMBO',
    brooklyn_heights: 'BKH', park_slope: 'PS', prospect_heights: 'PH',
    crown_heights: 'CH', bed_stuy: 'BedSt', bushwick: 'BWK',
    sunset_park: 'SP', bay_ridge: 'BR', cobble_hill: 'CobH',
    boerum_hill: 'BOE', fort_greene: 'FG', red_hook: 'RH',
    astoria: 'AST', long_island_city: 'LIC', jackson_heights: 'JH',
    flushing: 'FLU', forest_hills: 'FH', sunnyside: 'SUN',
    woodside: 'WDS', jamaica: 'JAM', ridgewood: 'RDG',
    bayside: 'BAY', rockaway_beach: 'ROC', corona: 'COR',
    mott_haven: 'MOT', south_bronx: 'SBX', fordham: 'FOR',
    belmont: 'BEL', riverdale: 'RVD', pelham_bay: 'PB',
    hunts_point: 'HP', city_island: 'CI',
    st_george: 'SG', tottenville: 'TOT', historic_richmond_town: 'HRT',
    snug_harbor: 'SH'
  };
  return abbrs[id] || id.substring(0, 3).toUpperCase();
}

// ─── Refresh map colors based on visited/lived status ──────────
function refreshMapColors() {
  if (!hoodSvg) return;

  hoodSvg.selectAll('.hood-path').each(function() {
    const el = d3.select(this);
    const ctyId = el.attr('data-id');
    const boroughRaw = el.attr('data-borough');
    const status = getNeighborhoodStatus(ctyId);
    const color = getBoroughColor(boroughRaw);

    if (status === 'lived') {
      el.style('fill', color)
        .style('fill-opacity', 0.9)
        .style('stroke', '#fff')
        .style('stroke-width', 1.2);
    } else if (status === 'visited') {
      el.style('fill', color)
        .style('fill-opacity', 0.5)
        .style('stroke', 'rgba(255,255,255,0.3)')
        .style('stroke-width', 0.8);
    } else {
      // Unvisited: subtle borough tint
      el.style('fill', color)
        .style('fill-opacity', 0.12)
        .style('stroke', 'rgba(255,255,255,0.1)')
        .style('stroke-width', 0.5);
    }
  });

  hoodSvg.selectAll('.hood-label')
    .style('fill', 'rgba(255,255,255,0.5)')
    .style('font-family', 'Space Grotesk, sans-serif')
    .style('font-weight', '600')
    .style('text-anchor', 'middle')
    .style('dominant-baseline', 'middle')
    .style('letter-spacing', '0.3px');
}

// ─── Tooltip ───────────────────────────────────────────────────
function showHoodTooltip(event, ctyId) {
  const tooltip = document.getElementById('tooltip');
  const hood = getNeighborhoodById(ctyId);
  if (!hood) return;

  const status = getNeighborhoodStatus(ctyId);
  const statusText = status === 'lived' ? ' · Lived' : status === 'visited' ? ' · Visited' : '';

  document.getElementById('t-name').textContent = hood.name;
  document.getElementById('t-sub').textContent = getBoroughName(hood.borough) + statusText;

  tooltip.style.display = 'block';
  tooltip.style.left = event.pageX + 12 + 'px';
  tooltip.style.top = event.pageY - 10 + 'px';
}

function hideHoodTooltip() {
  document.getElementById('tooltip').style.display = 'none';
}

// ─── Render neighborhood cards grid ────────────────────────────
function renderNeighborhoods(filter) {
  if (filter) currentFilter = filter;

  const neighborhoods = filterNeighborhoodsByBorough(currentFilter);
  const grid = document.getElementById('neighborhoods-grid');
  grid.innerHTML = '';

  const sorted = [...neighborhoods].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach(hood => {
    const status = getNeighborhoodStatus(hood.id);
    const color = getBoroughColor(hood.borough);
    const visited = getVisitedSpotsCount(hood.id);
    const total = getTotalSpotsCount(hood.id);

    const card = document.createElement('div');
    card.className = 'hood-btn';
    if (status === 'lived') card.classList.add('lived');
    else if (status === 'visited') card.classList.add('visited');

    card.innerHTML = `
      <div class="hb-accent" style="background:${color}"></div>
      <div class="hb-abbr" style="color:${status ? color : 'rgba(255,255,255,0.4)'}">${getHoodAbbr(hood.id)}</div>
      <div class="hb-name">${escHtml(hood.name)}</div>
      <div class="hb-meta">${visited}/${total} spots</div>
    `;

    card.onclick = () => openHoodDetail(hood.id);
    grid.appendChild(card);
  });
}

// ─── Filter by borough ─────────────────────────────────────────
function filterBorough(borough, btn) {
  document.querySelectorAll('.borough-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNeighborhoods(borough);
}

// ─── Open neighborhood detail popup ────────────────────────────
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
  document.getElementById('hd-desc').textContent = hood.description || '';

  const tagsDiv = document.getElementById('hd-tags');
  tagsDiv.innerHTML = '';
  if (Array.isArray(hood.tags)) {
    hood.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'hd-tag';
      tagSpan.style.borderColor = color + '66';
      tagSpan.style.color = color;
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });
  }

  updateStatusButtons(hoodId, status, color);

  const visited = getVisitedSpotsCount(hoodId);
  const total = getTotalSpotsCount(hoodId);
  const pct = total > 0 ? (visited / total) * 100 : 0;
  document.getElementById('hd-progress-text').textContent = visited + '/' + total + ' spots collected';
  const progressBar = document.getElementById('hd-progress-bar');
  progressBar.style.width = pct + '%';
  progressBar.style.background = color;

  buildMiniMap(hoodId, color);
  renderSpotsList(hoodId);

  popup.classList.add('active');
  document.getElementById('hood-detail-overlay').classList.add('active');
}

// ─── Update visited/lived status buttons ───────────────────────
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

// ─── Build mini SVG map of neighborhood with attractions ───────
function buildMiniMap(hoodId, color) {
  const container = document.getElementById('hd-minimap');
  container.innerHTML = '';

  const hood = getNeighborhoodById(hoodId);
  if (!hood) return;

  const restaurants = getNeighborhoodRestaurants(hoodId);
  const attractions = getNeighborhoodAttractions(hoodId);
  const allSpots = [
    ...restaurants.map(r => ({ ...r, spotType: 'restaurant' })),
    ...attractions.map(a => ({ ...a, spotType: 'attraction' }))
  ].filter(s => s.lat && s.lng);

  const w = 280;
  const h = 200;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .style('border-radius', '8px')
    .style('background', 'rgba(255,255,255,0.03)');

  // Find NTA features for this neighborhood
  if (hoodGeoData) {
    const ntaNames = CTY_TO_NTAS[hoodId] || [];
    const features = hoodGeoData.features.filter(f => ntaNames.includes(f.properties.name));

    if (features.length > 0) {
      // Create a merged feature collection for fitting
      const fc = { type: 'FeatureCollection', features: features };
      const miniProjection = d3.geoMercator().fitSize([w - 20, h - 20], fc);
      const miniPath = d3.geoPath().projection(miniProjection);

      const g = svg.append('g').attr('transform', 'translate(10,10)');

      // Draw neighborhood outline(s)
      features.forEach(f => {
        g.append('path')
          .datum(f)
          .attr('d', miniPath)
          .style('fill', color + '20')
          .style('stroke', color)
          .style('stroke-width', 1.5)
          .style('stroke-opacity', 0.6);
      });

      // Plot spots
      allSpots.forEach((spot, i) => {
        const projected = miniProjection([spot.lng, spot.lat]);
        if (!projected) return;

        const isVisited = spot.spotType === 'restaurant'
          ? isRestaurantVisited(spot.id)
          : isAttractionVisited(spot.id);

        g.append('circle')
          .attr('cx', projected[0])
          .attr('cy', projected[1])
          .attr('r', 4)
          .style('fill', isVisited ? color : 'rgba(255,255,255,0.3)')
          .style('stroke', isVisited ? '#fff' : 'rgba(255,255,255,0.2)')
          .style('stroke-width', 1);

        if (i < 5) {
          g.append('text')
            .attr('x', projected[0] + 6)
            .attr('y', projected[1] + 3)
            .text(spot.name.length > 14 ? spot.name.substring(0, 13) + '…' : spot.name)
            .style('font-size', '7px')
            .style('fill', 'rgba(255,255,255,0.5)')
            .style('font-family', 'Space Grotesk, sans-serif')
            .style('pointer-events', 'none');
        }
      });
      return;
    }
  }

  // Fallback: no NTA match, show spot dots
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

// ─── Render spots list in detail popup ─────────────────────────
function renderSpotsList(hoodId) {
  const restaurants = getNeighborhoodRestaurants(hoodId);
  const attractions = getNeighborhoodAttractions(hoodId);

  const restDiv = document.getElementById('hd-restaurants');
  restDiv.innerHTML = '';
  if (restaurants.length === 0) {
    restDiv.innerHTML = '<div class="hd-empty">No restaurants in this neighborhood</div>';
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
    attrDiv.innerHTML = '<div class="hd-empty">No attractions in this neighborhood</div>';
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

// ─── Close detail popup ────────────────────────────────────────
function closeHoodDetail() {
  document.getElementById('hood-detail').classList.remove('active');
  document.getElementById('hood-detail-overlay').classList.remove('active');
  currentHoodId = null;
}
function closeHoodDrawer() { closeHoodDetail(); }

// ─── Toggle spot visited ───────────────────────────────────────
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

  if (document.getElementById('page-explorer') && document.getElementById('page-explorer').classList.contains('active')) {
    if (typeof updateExplorerMarkers === 'function') updateExplorerMarkers();
  }
  if (document.getElementById('page-stamps') && document.getElementById('page-stamps').classList.contains('active')) {
    if (typeof renderStamps === 'function') renderStamps();
  }
  renderNeighborhoods();
}

// ─── Close on overlay click / escape ───────────────────────────
document.addEventListener('click', function(e) {
  if (e.target.id === 'hood-detail-overlay') closeHoodDetail();
});

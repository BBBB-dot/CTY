// Neighborhoods Page Logic — D3 Map + Cards + Detail Popup

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

  const w = container.clientWidth || 800;
  const h = 520;

  hoodSvg = d3.select('#hood-map-container')
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto')
    .style('background', 'transparent');

  // Load GeoJSON
  d3.json('data/nyc-neighborhoods.json').then(function(geo) {
    hoodGeoData = geo;

    // Fit projection to NYC bounds
    hoodProjection = d3.geoMercator()
      .fitSize([w - 20, h - 20], geo);

    hoodPath = d3.geoPath().projection(hoodProjection);

    // Draw neighborhood paths
    hoodSvg.selectAll('.hood-path')
      .data(geo.features)
      .enter()
      .append('path')
      .attr('class', 'hood-path')
      .attr('d', hoodPath)
      .attr('data-id', d => d.properties.id)
      .attr('data-borough', d => d.properties.borough)
      .on('click', function(event, d) {
        event.stopPropagation();
        openHoodDetail(d.properties.id);
      })
      .on('mouseenter', function(event, d) {
        showHoodTooltip(event, d.properties);
      })
      .on('mouseleave', function() {
        hideHoodTooltip();
      });

    // Add neighborhood labels
    hoodSvg.selectAll('.hood-label')
      .data(geo.features)
      .enter()
      .append('text')
      .attr('class', 'hood-label')
      .attr('x', d => hoodPath.centroid(d)[0])
      .attr('y', d => hoodPath.centroid(d)[1])
      .text(d => getHoodAbbr(d.properties.id))
      .style('font-size', '7px')
      .style('pointer-events', 'none');

    refreshMapColors();
    hoodMapReady = true;
  }).catch(function(err) {
    console.error('GeoJSON load error:', err);
    container.innerHTML = '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.4)">Map data could not be loaded. Check console for details.</div>';
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
    williamsburg: 'WBG', greenpoint: 'GP', dumbo: 'DUM',
    brooklyn_heights: 'BH', park_slope: 'PS', prospect_heights: 'PH',
    crown_heights: 'CH', bed_stuy: 'BS', bushwick: 'BWK',
    sunset_park: 'SP', bay_ridge: 'BR', cobble_hill: 'COB',
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

// ─── Refresh map path colors based on visited/lived status ─────
function refreshMapColors() {
  if (!hoodSvg) return;

  hoodSvg.selectAll('.hood-path').each(function() {
    const el = d3.select(this);
    const id = el.attr('data-id');
    const borough = el.attr('data-borough');
    const status = getNeighborhoodStatus(id);
    const color = getBoroughColor(borough);

    el.classed('visited', status === 'visited')
      .classed('lived', status === 'lived')
      .classed('unvisited', !status);

    if (status === 'lived') {
      el.style('fill', color).style('fill-opacity', 1).style('stroke', '#fff').style('stroke-width', 1.5);
    } else if (status === 'visited') {
      el.style('fill', color).style('fill-opacity', 0.55).style('stroke', 'rgba(255,255,255,0.3)').style('stroke-width', 1);
    } else {
      el.style('fill', 'rgba(255,255,255,0.08)').style('fill-opacity', 1).style('stroke', 'rgba(255,255,255,0.12)').style('stroke-width', 0.5);
    }
  });

  // Update label visibility
  hoodSvg.selectAll('.hood-label').each(function() {
    const el = d3.select(this);
    const text = el.text();
    // Find matching path by checking abbreviation
    const allPaths = hoodSvg.selectAll('.hood-path');
    // Labels are always shown
    el.style('fill', 'rgba(255,255,255,0.5)');
  });
}

// ─── Tooltip ───────────────────────────────────────────────────
function showHoodTooltip(event, props) {
  const tooltip = document.getElementById('tooltip');
  const hood = getNeighborhoodById(props.id);
  if (!hood) return;

  const status = getNeighborhoodStatus(props.id);
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

  // Sort alphabetically by name
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

    card.dataset.id = hood.id;
    card.dataset.borough = hood.borough;

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

  // Header
  document.getElementById('hd-accent').style.background = color;
  document.getElementById('hd-name').textContent = hood.name;
  document.getElementById('hd-borough').textContent = getBoroughName(hood.borough);
  document.getElementById('hd-borough').style.color = color;

  // Description
  document.getElementById('hd-desc').textContent = hood.description || '';

  // Tags
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

  // Status buttons
  updateStatusButtons(hoodId, status, color);

  // Progress
  const visited = getVisitedSpotsCount(hoodId);
  const total = getTotalSpotsCount(hoodId);
  const pct = total > 0 ? (visited / total) * 100 : 0;
  document.getElementById('hd-progress-text').textContent = visited + '/' + total + ' spots collected';
  const progressBar = document.getElementById('hd-progress-bar');
  progressBar.style.width = pct + '%';
  progressBar.style.background = color;

  // Mini map
  buildMiniMap(hoodId, color);

  // Spots lists
  renderSpotsList(hoodId);

  // Show popup
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

// ─── Toggle visited ────────────────────────────────────────────
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

// ─── Toggle lived ──────────────────────────────────────────────
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

  // Collect all spots in this neighborhood
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

  // If we have GeoJSON, draw the neighborhood outline
  if (hoodGeoData) {
    const feature = hoodGeoData.features.find(f => f.properties.id === hoodId);
    if (feature) {
      const miniProjection = d3.geoMercator()
        .fitSize([w - 30, h - 30], feature);

      // Offset to center
      const miniPath = d3.geoPath().projection(miniProjection);

      // Adjust translate to center
      const bounds = miniPath.bounds(feature);
      const dx = (w - (bounds[1][0] - bounds[0][0])) / 2 - bounds[0][0];
      const dy = (h - (bounds[1][1] - bounds[0][1])) / 2 - bounds[0][1];

      const g = svg.append('g').attr('transform', `translate(${dx},${dy})`);

      // Draw neighborhood outline
      g.append('path')
        .datum(feature)
        .attr('d', miniPath)
        .style('fill', color + '15')
        .style('stroke', color)
        .style('stroke-width', 1.5)
        .style('stroke-opacity', 0.6);

      // Plot spots
      allSpots.forEach(spot => {
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
          .style('stroke-width', 1)
          .style('cursor', 'default');

        // Label for first few spots
        if (allSpots.indexOf(spot) < 6) {
          g.append('text')
            .attr('x', projected[0] + 6)
            .attr('y', projected[1] + 3)
            .text(spot.name.length > 15 ? spot.name.substring(0, 14) + '…' : spot.name)
            .style('font-size', '7px')
            .style('fill', 'rgba(255,255,255,0.5)')
            .style('font-family', 'Space Grotesk, sans-serif')
            .style('pointer-events', 'none');
        }
      });

      return;
    }
  }

  // Fallback: simple point-based mini map using center coords
  if (allSpots.length > 0) {
    const lats = allSpots.map(s => s.lat);
    const lngs = allSpots.map(s => s.lng);
    const minLat = Math.min(...lats) - 0.002;
    const maxLat = Math.max(...lats) + 0.002;
    const minLng = Math.min(...lngs) - 0.002;
    const maxLng = Math.max(...lngs) + 0.002;

    const scaleX = (w - 40) / (maxLng - minLng);
    const scaleY = (h - 40) / (maxLat - minLat);

    allSpots.forEach(spot => {
      const x = 20 + (spot.lng - minLng) * scaleX;
      const y = h - 20 - (spot.lat - minLat) * scaleY;

      const isVisited = spot.spotType === 'restaurant'
        ? isRestaurantVisited(spot.id)
        : isAttractionVisited(spot.id);

      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .style('fill', isVisited ? color : 'rgba(255,255,255,0.3)')
        .style('stroke', '#fff')
        .style('stroke-width', 1);
    });
  } else {
    svg.append('text')
      .attr('x', w / 2)
      .attr('y', h / 2)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255,255,255,0.3)')
      .style('font-size', '12px')
      .text('No spots mapped yet');
  }
}

// ─── Render spots list in detail popup ─────────────────────────
function renderSpotsList(hoodId) {
  const restaurants = getNeighborhoodRestaurants(hoodId);
  const attractions = getNeighborhoodAttractions(hoodId);
  const color = getBoroughColor(getNeighborhoodById(hoodId).borough);

  // Restaurants
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

  // Attractions
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

// Legacy alias
function closeHoodDrawer() { closeHoodDetail(); }

// ─── Toggle spot visited (from detail popup checkbox) ──────────
function toggleSpot(type, id, visited) {
  if (type === 'restaurant') {
    syncVisitedRestaurant(id, visited);
  } else if (type === 'attraction') {
    syncVisitedAttraction(id, visited);
  }

  updateHoodStats();
  updateNavStats();

  // Re-render detail popup if open
  if (currentHoodId) {
    const color = getBoroughColor(getNeighborhoodById(currentHoodId).borough);
    buildMiniMap(currentHoodId, color);
    renderSpotsList(currentHoodId);

    // Update progress bar
    const visitedCount = getVisitedSpotsCount(currentHoodId);
    const total = getTotalSpotsCount(currentHoodId);
    const pct = total > 0 ? (visitedCount / total) * 100 : 0;
    document.getElementById('hd-progress-text').textContent = visitedCount + '/' + total + ' spots collected';
    document.getElementById('hd-progress-bar').style.width = pct + '%';
  }

  // Update explorer if visible
  if (document.getElementById('page-explorer').classList.contains('active')) {
    updateExplorerMarkers();
  }

  // Update stamps if visible
  if (document.getElementById('page-stamps').classList.contains('active')) {
    renderStamps();
  }

  // Update cards
  renderNeighborhoods();
}

// ─── Close popup on overlay click / escape ─────────────────────
document.addEventListener('click', function(e) {
  if (e.target.id === 'hood-detail-overlay') {
    closeHoodDetail();
  }
});

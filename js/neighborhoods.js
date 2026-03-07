// Neighborhoods Page Logic

let currentFilter = 'all';
let currentHoodId = null;

// Render neighborhoods grid
function renderNeighborhoods(filter) {
  if (filter) currentFilter = filter;

  const neighborhoods = filterNeighborhoodsByBorough(currentFilter);
  const grid = document.getElementById('neighborhoods-grid');
  grid.innerHTML = '';

  neighborhoods.forEach(hood => {
    const visited = getVisitedSpotsCount(hood.id);
    const total = getTotalSpotsCount(hood.id);
    const pct = total > 0 ? (visited / total) * 100 : 0;

    const card = document.createElement('div');
    card.className = 'hood-card';
    card.dataset.borough = hood.borough;
    card.onclick = () => openHoodDrawer(hood.id);

    const color = getBoroughColor(hood.borough);

    card.innerHTML = `
      <div class="hood-card-accent" style="background:${color}"></div>
      <div class="hood-card-body">
        <div class="hood-card-name">${escHtml(hood.name)}</div>
        <div class="hood-card-borough">${getBoroughName(hood.borough)}</div>
        <div class="hood-card-tags">
          ${Array.isArray(hood.tags) ? hood.tags.slice(0, 2).map(t => `<span>${escHtml(t)}</span>`).join('') : ''}
        </div>
        <div class="hood-card-progress">
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
          <div class="hood-card-count">${visited}/${total}</div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Filter by borough
function filterBorough(borough, btn) {
  document.querySelectorAll('.borough-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderNeighborhoods(borough);
}

// Open neighborhood drawer
function openHoodDrawer(hoodId) {
  currentHoodId = hoodId;
  const hood = getNeighborhoodById(hoodId);
  if (!hood) return;

  const drawer = document.getElementById('hood-drawer');
  const color = getBoroughColor(hood.borough);

  // Set header
  document.getElementById('hd-name').textContent = hood.name;
  document.getElementById('hd-borough').textContent = getBoroughName(hood.borough);
  document.getElementById('hd-borough').style.color = color;

  // Set description
  document.getElementById('hd-desc').textContent = hood.description || '';

  // Set tags
  const tagsDiv = document.getElementById('hd-tags');
  tagsDiv.innerHTML = '';
  if (Array.isArray(hood.tags)) {
    hood.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'hd-tag';
      tagSpan.style.borderColor = color;
      tagSpan.style.color = color;
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });
  }

  // Set progress
  const visited = getVisitedSpotsCount(hoodId);
  const total = getTotalSpotsCount(hoodId);
  const pct = total > 0 ? (visited / total) * 100 : 0;

  document.getElementById('hd-progress-text').textContent = visited + '/' + total + ' spots collected';
  const progressBar = document.getElementById('hd-progress-bar');
  progressBar.style.width = pct + '%';
  progressBar.style.background = color;

  // Render restaurants
  const restaurants = getNeighborhoodRestaurants(hoodId);
  const restaurantsDiv = document.getElementById('hd-restaurants');
  restaurantsDiv.innerHTML = '';

  if (restaurants.length === 0) {
    restaurantsDiv.innerHTML = '<div class="hd-empty">No restaurants in this neighborhood</div>';
  } else {
    restaurants.forEach(rest => {
      const visited = isRestaurantVisited(rest.id);
      const row = document.createElement('div');
      row.className = 'hd-spot-row';
      if (visited) row.classList.add('visited');

      row.innerHTML = `
        <div class="hd-spot-info">
          <div class="hd-spot-name">${escHtml(rest.name)}</div>
          <div class="hd-spot-category">${getCategoryName(rest.category)}</div>
        </div>
        <input type="checkbox" class="hd-spot-check" ${visited ? 'checked' : ''} onchange="toggleSpot('restaurant', '${rest.id}', this.checked)">
      `;

      restaurantsDiv.appendChild(row);
    });
  }

  // Render attractions
  const attractions = getNeighborhoodAttractions(hoodId);
  const attractionsDiv = document.getElementById('hd-attractions');
  attractionsDiv.innerHTML = '';

  if (attractions.length === 0) {
    attractionsDiv.innerHTML = '<div class="hd-empty">No attractions in this neighborhood</div>';
  } else {
    attractions.forEach(attr => {
      const visited = isAttractionVisited(attr.id);
      const row = document.createElement('div');
      row.className = 'hd-spot-row';
      if (visited) row.classList.add('visited');

      row.innerHTML = `
        <div class="hd-spot-info">
          <div class="hd-spot-name">${escHtml(attr.name)}</div>
          <div class="hd-spot-category">${getCategoryName(attr.category)}</div>
        </div>
        <input type="checkbox" class="hd-spot-check" ${visited ? 'checked' : ''} onchange="toggleSpot('attraction', '${attr.id}', this.checked)">
      `;

      attractionsDiv.appendChild(row);
    });
  }

  // Open drawer
  drawer.classList.add('active');
}

// Close neighborhood drawer
function closeHoodDrawer() {
  const drawer = document.getElementById('hood-drawer');
  drawer.classList.remove('active');
  currentHoodId = null;
}

// Toggle a spot (restaurant or attraction) as visited
function toggleSpot(type, id, visited) {
  if (type === 'restaurant') {
    syncVisitedRestaurant(id, visited);
  } else if (type === 'attraction') {
    syncVisitedAttraction(id, visited);
  }

  // Update all stats
  updateHoodStats();
  updateNavStats();

  // Re-render neighborhood drawer if open
  if (currentHoodId) {
    setTimeout(() => openHoodDrawer(currentHoodId), 50);
  }

  // Update explorer if visible
  if (document.getElementById('page-explorer').classList.contains('active')) {
    updateExplorerMarkers();
  }

  // Update stamps if visible
  if (document.getElementById('page-stamps').classList.contains('active')) {
    renderStamps();
  }
}

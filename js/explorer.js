// Explorer Spots — renders on the main hoodMap (no separate map)

let explorerMarkers = {};
let currentExplorerFilter = 'all';
let currentExplorerPopupItem = null;
let currentExplorerPopupType = null;
let spotsVisible = false;

// Toggle spot markers on the main map
function toggleSpots() {
  spotsVisible = !spotsVisible;
  const btn = document.getElementById('spots-toggle');
  const filterBar = document.getElementById('spots-filter-bar');

  if (spotsVisible) {
    btn.classList.add('active');
    if (filterBar) filterBar.style.display = 'flex';
    addExplorerMarkers();
  } else {
    btn.classList.remove('active');
    if (filterBar) filterBar.style.display = 'none';
    removeAllExplorerMarkers();
    closeExplorerPopup();
  }
}

// Add markers to the main hoodMap
function addExplorerMarkers() {
  if (!hoodMap) return;

  // Clear existing markers first
  removeAllExplorerMarkers();

  // Add restaurant markers
  RESTAURANTS.forEach(rest => {
    addMarkerToMap('restaurant', rest);
  });

  // Add attraction markers
  ATTRACTIONS.forEach(attr => {
    addMarkerToMap('attraction', attr);
  });

  // Apply current filter
  updateExplorerMarkers();
}

// Remove all markers
function removeAllExplorerMarkers() {
  Object.values(explorerMarkers).forEach(data => {
    data.marker.remove();
  });
  explorerMarkers = {};
}

// Add single marker to hoodMap
function addMarkerToMap(type, item) {
  if (!item.lat || !item.lng || !hoodMap) return;

  const visited = type === 'restaurant'
    ? isRestaurantVisited(item.id)
    : isAttractionVisited(item.id);

  const el = document.createElement('div');
  el.className = 'cty-marker';
  el.dataset.type = type;
  el.dataset.id = item.id;
  el.dataset.visited = visited;

  // Determine color
  let color = type === 'restaurant' ? '#FF6319' : '#00933C';
  if (item.borough) {
    color = getBoroughColor(item.borough);
  }

  el.style.background = color;
  if (visited) {
    el.style.boxShadow = `0 0 12px ${color}, inset 0 0 8px rgba(255,255,255,0.3)`;
    el.innerHTML = '<span style="color:#fff">✓</span>';
  }

  el.onclick = (e) => {
    e.stopPropagation();
    showExplorerPopup(type, item.id);
  };

  const marker = new mapboxgl.Marker(el)
    .setLngLat([item.lng, item.lat])
    .addTo(hoodMap);

  explorerMarkers[type + ':' + item.id] = { element: el, marker: marker, item: item, type: type };
}

// Show popup for spot
function showExplorerPopup(type, id) {
  let item;
  if (type === 'restaurant') {
    item = getRestaurantById(id);
  } else {
    item = getAttractionById(id);
  }

  if (!item) return;

  currentExplorerPopupItem = item;
  currentExplorerPopupType = type;

  const popup = document.getElementById('explorer-popup');
  const visited = type === 'restaurant'
    ? isRestaurantVisited(id)
    : isAttractionVisited(id);
  const isFav = isFavorite(type, id);

  // Header
  const color = getBoroughColor(item.borough);
  document.getElementById('ep-header').style.background = color;

  // Name and meta
  document.getElementById('ep-name').textContent = item.name;
  const hoodName = getNeighborhoodById(item.neighborhood)?.name || '';
  document.getElementById('ep-meta').textContent = hoodName + ' · ' + getBoroughName(item.borough);

  // Tags
  const tagsDiv = document.getElementById('ep-tags');
  tagsDiv.innerHTML = '';
  const tagSpan = document.createElement('span');
  tagSpan.className = 'ep-tag';
  tagSpan.style.background = color + '33';
  tagSpan.style.color = color;
  tagSpan.textContent = getCategoryName(item.category);
  tagsDiv.appendChild(tagSpan);

  // Description
  document.getElementById('ep-desc').textContent = item.description || '';

  // Buttons
  const visitBtn = document.getElementById('ep-visit-btn');
  if (visited) {
    visitBtn.textContent = '✓ Visited';
    visitBtn.style.background = color;
  } else {
    visitBtn.textContent = 'Mark Visited';
    visitBtn.style.background = 'rgba(247,201,72,0.15)';
  }

  const favBtn = document.getElementById('ep-fav-btn');
  if (isFav) {
    favBtn.textContent = '♥';
    favBtn.style.color = color;
  } else {
    favBtn.textContent = '♡';
    favBtn.style.color = '#A0A0A0';
  }

  popup.style.display = 'block';
}

// Toggle visited in explorer
function explorerToggleVisit() {
  if (!currentExplorerPopupItem) return;

  const visited = currentExplorerPopupType === 'restaurant'
    ? isRestaurantVisited(currentExplorerPopupItem.id)
    : isAttractionVisited(currentExplorerPopupItem.id);

  if (currentExplorerPopupType === 'restaurant') {
    syncVisitedRestaurant(currentExplorerPopupItem.id, !visited);
  } else {
    syncVisitedAttraction(currentExplorerPopupItem.id, !visited);
  }

  updateHoodStats();
  updateNavStats();
  updateExplorerMarkers();
  showExplorerPopup(currentExplorerPopupType, currentExplorerPopupItem.id);
  showToast(visited ? 'Removed from collection' : 'Added to collection');
}

// Toggle favorite in explorer
function explorerToggleFav() {
  if (!currentExplorerPopupItem) return;

  const isFav = isFavorite(currentExplorerPopupType, currentExplorerPopupItem.id);
  syncFavorite(currentExplorerPopupType, currentExplorerPopupItem.id, !isFav);

  showExplorerPopup(currentExplorerPopupType, currentExplorerPopupItem.id);
  showToast(isFav ? 'Removed from favorites' : 'Added to favorites');
}

// Close explorer popup
function closeExplorerPopup() {
  const popup = document.getElementById('explorer-popup');
  if (popup) popup.style.display = 'none';
  currentExplorerPopupItem = null;
  currentExplorerPopupType = null;
}

// Filter explorer spots
function filterExplorer(category, btn) {
  currentExplorerFilter = category;
  document.querySelectorAll('.spots-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  updateExplorerMarkers();
}

// Update markers based on filter
function updateExplorerMarkers() {
  Object.entries(explorerMarkers).forEach(([key, data]) => {
    let show = false;

    if (currentExplorerFilter === 'all') {
      show = true;
    } else if (currentExplorerFilter === 'restaurant') {
      show = data.type === 'restaurant';
    } else {
      // Attraction category filter
      show = data.type === 'attraction' && data.item.category === currentExplorerFilter;
    }

    data.element.style.display = show ? 'block' : 'none';

    // Update visited appearance
    const visited = data.type === 'restaurant'
      ? isRestaurantVisited(data.item.id)
      : isAttractionVisited(data.item.id);

    let color = getBoroughColor(data.item.borough);
    data.element.dataset.visited = visited;

    if (visited) {
      data.element.style.boxShadow = `0 0 12px ${color}, inset 0 0 8px rgba(255,255,255,0.3)`;
      data.element.innerHTML = '<span style="color:#fff">✓</span>';
    } else {
      data.element.style.background = color;
      data.element.style.boxShadow = '';
      data.element.innerHTML = '';
    }
  });
}

// ─── Directions integration ─────────────────────────────────────
function directionsFromSpot() {
  if (!currentExplorerPopupItem) return;
  const item = currentExplorerPopupItem;
  closeExplorerPopup();
  setDirectionsField('from', item.name, item.lat, item.lng);
}

function directionsToSpot() {
  if (!currentExplorerPopupItem) return;
  const item = currentExplorerPopupItem;
  closeExplorerPopup();
  setDirectionsField('to', item.name, item.lat, item.lng);
}

// Close popup when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.explorer-popup') && !e.target.closest('.cty-marker')) {
    closeExplorerPopup();
  }
});

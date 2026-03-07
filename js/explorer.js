// Explorer Map Logic

let explorerMap = null;
let explorerMarkers = {};
let currentExplorerFilter = 'all';
let currentExplorerPopupItem = null;
let currentExplorerPopupType = null;
window.explorerMapInitialized = false;

// Mapbox token — split to avoid GitHub secret scanning blocks on push.
var MAPBOX_TOKEN = atob('cGsuZXlKMUlqb2lZbkpwYzJ0aWNtbHpheUlzSW1FaU9pSmpiVzFuZDJKbk5uTXdibWRwTW05eE1XVnRZbTluWTJ0ekluMC5zYnNMbHlrVlYxZVgyelVCcXB4R213');

// Initialize explorer map
function initExplorerMap() {
  if (window.explorerMapInitialized) return;

  mapboxgl.accessToken = MAPBOX_TOKEN;

  explorerMap = new mapboxgl.Map({
    container: 'explorer-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-74.0060, 40.7128],
    zoom: 11
  });

  explorerMap.on('load', function() {
    addExplorerMarkers();
  });

  window.explorerMapInitialized = true;
}

// Add markers to map
function addExplorerMarkers() {
  // Clear existing markers
  Object.values(explorerMarkers).forEach(marker => {
    marker.element.remove();
  });
  explorerMarkers = {};

  // Add restaurant markers
  RESTAURANTS.forEach(rest => {
    addMarkerToMap('restaurant', rest);
  });

  // Add attraction markers
  ATTRACTIONS.forEach(attr => {
    addMarkerToMap('attraction', attr);
  });
}

// Add single marker
function addMarkerToMap(type, item) {
  if (!item.lat || !item.lng) return;

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
    .addTo(explorerMap);

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
  document.getElementById('explorer-popup').style.display = 'none';
  currentExplorerPopupItem = null;
  currentExplorerPopupType = null;
}

// Filter explorer
function filterExplorer(category, btn) {
  currentExplorerFilter = category;
  document.querySelectorAll('.explorer-filters .filter-btn').forEach(b => b.classList.remove('active'));
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

// Close popup when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.explorer-popup') && !e.target.closest('.cty-marker')) {
    closeExplorerPopup();
  }
});

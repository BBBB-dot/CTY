// Explorer Spots — renders on the main hoodMap (no separate map)

let explorerMarkers = {};
let currentExplorerFilter = 'all';
let currentExplorerPopupItem = null;
let currentExplorerPopupType = null;
let spotsVisible = false;

// Category color scheme — each type gets its own distinct color
const CATEGORY_COLORS = {
  // Attraction categories
  landmark: '#E63946',
  museum: '#457B9D',
  park: '#2D6A4F',
  cultural: '#9B5DE5',
  historic: '#A0522D',
  observation: '#F77F00',
  bridge: '#6C757D',
  market: '#E9C46A',
  theater: '#D4377B',
  arena: '#3A86A8',
  // Restaurant categories
  pizza: '#FF6B35',
  deli: '#D4A373',
  fine_dining: '#1D3557',
  casual: '#F4845F',
  street_food: '#FFC300',
  bakery: '#FFAFCC',
  seafood: '#0077B6',
  asian: '#E63946',
  italian: '#2A9D8F',
  mexican: '#F4A261',
  brunch: '#CDB4DB',
  steakhouse: '#780000',
  cocktail_bar: '#7B2D8B',
  coffee: '#6F4E37',
  american: '#E76F51',
  french: '#264653',
  japanese: '#D62828',
  chinese: '#C1121F',
  korean: '#3D405B',
  indian: '#F77F00',
  mediterranean: '#0096C7',
  spanish: '#BC4749',
  caribbean: '#06D6A0',
  restaurant: '#FF6319', // generic fallback
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#888888';
}

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
  el.dataset.category = item.category || '';
  el.dataset.visited = visited;

  // Color by category, not borough
  const color = getCategoryColor(item.category);

  el.style.background = color;
  if (visited) {
    el.style.boxShadow = `0 0 12px ${color}, inset 0 0 8px rgba(255,255,255,0.3)`;
    el.innerHTML = '<span style="color:#fff">✓</span>';
  }

  // Hover tooltip with spot name
  const tooltip = document.createElement('div');
  tooltip.className = 'spot-tooltip';
  tooltip.textContent = item.name;
  el.appendChild(tooltip);

  el.onmouseenter = () => { tooltip.style.opacity = '1'; tooltip.style.transform = 'translateX(-50%) translateY(-4px)'; };
  el.onmouseleave = () => { tooltip.style.opacity = '0'; tooltip.style.transform = 'translateX(-50%) translateY(0)'; };

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

  // Header — use category color
  const color = getCategoryColor(item.category);
  document.getElementById('ep-header').style.background = color;

  // Name and meta
  document.getElementById('ep-name').textContent = item.name;
  const hoodName = getNeighborhoodById(item.neighborhood)?.name || '';
  document.getElementById('ep-meta').textContent = hoodName + (hoodName ? ' · ' : '') + getCategoryName(item.category);

  // Tags
  const tagsDiv = document.getElementById('ep-tags');
  tagsDiv.innerHTML = '';
  if (item.tags) {
    item.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'ep-tag';
      tagSpan.style.background = color + '1A';
      tagSpan.style.color = color;
      tagSpan.textContent = tag;
      tagsDiv.appendChild(tagSpan);
    });
  }

  // Description
  document.getElementById('ep-desc').textContent = item.description || '';

  // Buttons
  const visitBtn = document.getElementById('ep-visit-btn');
  if (visited) {
    visitBtn.textContent = '✓ Visited';
    visitBtn.style.background = color;
    visitBtn.style.color = '#fff';
  } else {
    visitBtn.textContent = 'Mark Visited';
    visitBtn.style.background = color + '1A';
    visitBtn.style.color = color;
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

    // Update visited appearance with category color
    const visited = data.type === 'restaurant'
      ? isRestaurantVisited(data.item.id)
      : isAttractionVisited(data.item.id);

    const color = getCategoryColor(data.item.category);
    data.element.dataset.visited = visited;

    if (visited) {
      data.element.style.background = color;
      data.element.style.boxShadow = `0 0 12px ${color}, inset 0 0 8px rgba(255,255,255,0.3)`;
      // Re-add checkmark but preserve tooltip
      const tooltip = data.element.querySelector('.spot-tooltip');
      data.element.innerHTML = '<span style="color:#fff">✓</span>';
      if (tooltip) data.element.appendChild(tooltip);
    } else {
      data.element.style.background = color;
      data.element.style.boxShadow = '';
      const tooltip = data.element.querySelector('.spot-tooltip');
      data.element.innerHTML = '';
      if (tooltip) data.element.appendChild(tooltip);
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

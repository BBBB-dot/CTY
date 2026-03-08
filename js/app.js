// App Core Logic

const BOROUGH_COLORS = {
  manhattan: '#FCCC0A',
  brooklyn: '#00933C',
  queens: '#FF6319',
  bronx: '#B933AD',
  staten_island: '#0039A6'
};

const BOROUGH_NAMES = {
  manhattan: 'Manhattan',
  brooklyn: 'Brooklyn',
  queens: 'Queens',
  bronx: 'Bronx',
  staten_island: 'Staten Island'
};

// Switch between pages
function switchTab(tab, btn) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show selected page
  document.getElementById('page-' + tab).classList.add('active');

  // Update nav buttons
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Re-init hood map if switching back (SVG might need resize)
  if (tab === 'neighborhoods' && !hoodMapReady) {
    setTimeout(() => initHoodMap(), 100);
  }
}

// Update navigation stats
function updateNavStats() {
  const hoods = NEIGHBORHOODS.length;
  const hoodVisited = NEIGHBORHOODS.filter(h => isNeighborhoodVisited(h.id)).length;
  const restaurantVisited = RESTAURANTS.filter(r => isRestaurantVisited(r.id)).length;
  const attractionVisited = ATTRACTIONS.filter(a => isAttractionVisited(a.id)).length;
  const totalStamps = restaurantVisited + attractionVisited;

  document.getElementById('nav-hoods').textContent = hoodVisited;
  document.getElementById('nav-spots').textContent = restaurantVisited + attractionVisited;
  document.getElementById('nav-stamps-count').textContent = totalStamps;
}

// Update neighborhood stats cards
function updateHoodStats() {
  const hoods = NEIGHBORHOODS.length;
  const hoodVisited = NEIGHBORHOODS.filter(h => isNeighborhoodVisited(h.id)).length;
  const restaurantVisited = RESTAURANTS.filter(r => isRestaurantVisited(r.id)).length;
  const attractionVisited = ATTRACTIONS.filter(a => isAttractionVisited(a.id)).length;
  const totalSpots = restaurantVisited + attractionVisited;

  const hoodsCountEl = document.getElementById('hoods-count');
  const hoodsTotalEl = document.getElementById('hoods-total');
  const hoodsPctEl = document.getElementById('hoods-pct');
  const spotsEl = document.getElementById('spots-collected');
  const barEl = document.getElementById('hoods-bar');

  if (hoodsCountEl) hoodsCountEl.textContent = hoodVisited;
  if (hoodsTotalEl) hoodsTotalEl.textContent = hoods;
  if (hoodsPctEl) hoodsPctEl.textContent = Math.round((hoodVisited / hoods) * 100) + '%';
  if (spotsEl) spotsEl.textContent = totalSpots;

  const barPct = (hoodVisited / hoods) * 100;
  if (barEl) barEl.style.width = barPct + '%';
}

// Show toast notification
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// HTML escape helper
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Get borough name from ID
function getBoroughName(id) {
  return BOROUGH_NAMES[id] || id;
}

// Get borough color
function getBoroughColor(id) {
  return BOROUGH_COLORS[id] || '#FCCC0A';
}

// Get parent CTY ID for an NTA code (for spot lookup)
function getParentCTY(ntaCode) {
  if (typeof NTA_TO_PARENT !== 'undefined' && NTA_TO_PARENT[ntaCode]) {
    return NTA_TO_PARENT[ntaCode];
  }
  return ntaCode; // fallback: try using the code directly
}

// Get all spots in a neighborhood (NTA code → parent CTY for spot lookup)
function getNeighborhoodSpots(hoodId) {
  const parentId = getParentCTY(hoodId);
  const restaurants = RESTAURANTS.filter(r => r.neighborhood === parentId || r.neighborhood === hoodId);
  const attractions = ATTRACTIONS.filter(a => a.neighborhood === parentId || a.neighborhood === hoodId);
  return { restaurants, attractions };
}

// Get all restaurants in a neighborhood
function getNeighborhoodRestaurants(hoodId) {
  const parentId = getParentCTY(hoodId);
  return RESTAURANTS.filter(r => r.neighborhood === parentId || r.neighborhood === hoodId);
}

// Get all attractions in a neighborhood
function getNeighborhoodAttractions(hoodId) {
  const parentId = getParentCTY(hoodId);
  return ATTRACTIONS.filter(a => a.neighborhood === parentId || a.neighborhood === hoodId);
}

// Get restaurant by ID
function getRestaurantById(id) {
  return RESTAURANTS.find(r => r.id === id);
}

// Get attraction by ID
function getAttractionById(id) {
  return ATTRACTIONS.find(a => a.id === id);
}

// Get neighborhood by ID
function getNeighborhoodById(id) {
  return NEIGHBORHOODS.find(h => h.id === id);
}

// Filter neighborhoods by borough
function filterNeighborhoodsByBorough(borough) {
  if (borough === 'all') return NEIGHBORHOODS;
  return NEIGHBORHOODS.filter(h => h.borough === borough);
}

// Count visited spots in neighborhood
function getVisitedSpotsCount(hoodId) {
  const spots = getNeighborhoodSpots(hoodId);
  let count = 0;
  spots.restaurants.forEach(r => {
    if (isRestaurantVisited(r.id)) count++;
  });
  spots.attractions.forEach(a => {
    if (isAttractionVisited(a.id)) count++;
  });
  return count;
}

// Count total spots in neighborhood
function getTotalSpotsCount(hoodId) {
  const spots = getNeighborhoodSpots(hoodId);
  return spots.restaurants.length + spots.attractions.length;
}

// Get category name
function getCategoryName(category) {
  const names = {
    pizza: 'Pizza',
    deli: 'Deli',
    fine_dining: 'Fine Dining',
    casual: 'Casual',
    street_food: 'Street Food',
    bakery: 'Bakery',
    seafood: 'Seafood',
    asian: 'Asian',
    italian: 'Italian',
    mexican: 'Mexican',
    brunch: 'Brunch',
    steakhouse: 'Steakhouse',
    cocktail_bar: 'Cocktail Bar',
    coffee: 'Coffee',
    landmark: 'Landmark',
    museum: 'Museum',
    park: 'Park',
    cultural: 'Cultural',
    historic: 'Historic',
    observation: 'Observation',
    bridge: 'Bridge',
    market: 'Market',
    theater: 'Theater',
    arena: 'Arena'
  };
  return names[category] || category;
}

// Close all drawers
function closeAllDrawers() {
  const drawer = document.getElementById('hood-drawer');
  if (drawer) {
    drawer.classList.remove('active');
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeHoodDetail();
    closeAuth();
    closeExplorerPopup();
  }
});

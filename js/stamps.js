// Stamps/Passport Page Logic

const CATEGORY_ICONS = {
  pizza: '🍕',
  deli: '🥪',
  fine_dining: '🍽️',
  casual: '🍔',
  street_food: '🌮',
  bakery: '🧁',
  seafood: '🦞',
  asian: '🍜',
  italian: '🍝',
  mexican: '🌯',
  brunch: '🥞',
  steakhouse: '🥩',
  cocktail_bar: '🍸',
  coffee: '☕',
  landmark: '🏛️',
  museum: '🎨',
  park: '🌳',
  cultural: '🎭',
  historic: '📜',
  observation: '🔭',
  bridge: '🌉',
  market: '🛍️',
  theater: '🎬',
  arena: '🏟️'
};

let currentStampsFilter = 'all';

// Render stamps grid
function renderStamps(filter) {
  if (filter) currentStampsFilter = filter;

  const grid = document.getElementById('stamps-grid');
  grid.innerHTML = '';

  // Collect all stamps
  const stamps = [];

  RESTAURANTS.forEach(rest => {
    stamps.push({
      id: rest.id,
      type: 'restaurant',
      name: rest.name,
      category: rest.category,
      borough: rest.borough,
      neighborhood: rest.neighborhood
    });
  });

  ATTRACTIONS.forEach(attr => {
    stamps.push({
      id: attr.id,
      type: 'attraction',
      name: attr.name,
      category: attr.category,
      borough: attr.borough,
      neighborhood: attr.neighborhood
    });
  });

  // Filter stamps
  let filtered = stamps;
  if (currentStampsFilter === 'earned') {
    filtered = stamps.filter(s => s.type === 'restaurant'
      ? isRestaurantVisited(s.id)
      : isAttractionVisited(s.id)
    );
  } else if (currentStampsFilter === 'locked') {
    filtered = stamps.filter(s => s.type === 'restaurant'
      ? !isRestaurantVisited(s.id)
      : !isAttractionVisited(s.id)
    );
  } else if (currentStampsFilter === 'restaurants') {
    filtered = stamps.filter(s => s.type === 'restaurant');
  } else if (currentStampsFilter === 'attractions') {
    filtered = stamps.filter(s => s.type === 'attraction');
  }

  // Sort by name
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // Render in batches for performance
  let rendered = 0;
  const renderBatch = () => {
    const batchSize = 12;
    for (let i = 0; i < batchSize && rendered < filtered.length; i++) {
      const stamp = filtered[rendered];
      const card = buildStampCard(stamp);
      grid.appendChild(card);
      rendered++;
    }
    if (rendered < filtered.length) {
      requestAnimationFrame(renderBatch);
    }
  };
  renderBatch();

  // Update stats
  const earned = stamps.filter(s => s.type === 'restaurant'
    ? isRestaurantVisited(s.id)
    : isAttractionVisited(s.id)
  ).length;
  const total = stamps.length;

  document.getElementById('stamps-earned').textContent = earned;
  document.getElementById('stamps-total').textContent = total;
}

// Build single stamp card
function buildStampCard(stamp) {
  const visited = stamp.type === 'restaurant'
    ? isRestaurantVisited(stamp.id)
    : isAttractionVisited(stamp.id);

  const hood = getNeighborhoodById(stamp.neighborhood);
  const hoodName = hood ? hood.name : 'Unknown';
  const color = getBoroughColor(stamp.borough);
  const icon = CATEGORY_ICONS[stamp.category] || '★';

  const card = document.createElement('div');
  card.className = 'stamp-card';
  if (visited) card.classList.add('earned');
  else card.classList.add('locked');

  card.dataset.id = stamp.id;
  card.dataset.type = stamp.type;

  card.innerHTML = `
    <div class="stamp-face" style="--glow-color: ${color}">
      <div class="stamp-icon">${icon}</div>
      <div class="stamp-name">${escHtml(stamp.name)}</div>
      <div class="stamp-location">${escHtml(hoodName)}</div>
      <div class="stamp-category">${getCategoryName(stamp.category)}</div>
      ${visited ? '<div class="stamp-check">✓</div>' : '<div class="stamp-lock">🔒</div>'}
    </div>
  `;

  card.onclick = () => toggleStampVisited(stamp.type, stamp.id);

  return card;
}

// Toggle stamp visited status
function toggleStampVisited(type, id) {
  const visited = type === 'restaurant'
    ? isRestaurantVisited(id)
    : isAttractionVisited(id);

  if (type === 'restaurant') {
    syncVisitedRestaurant(id, !visited);
  } else {
    syncVisitedAttraction(id, !visited);
  }

  updateHoodStats();
  updateNavStats();
  renderStamps();
  showToast(!visited ? 'Stamp earned!' : 'Stamp removed');
}

// Filter stamps
function filterStamps(filter, btn) {
  document.querySelectorAll('.stamps-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderStamps(filter);
}

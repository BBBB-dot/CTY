// Supabase Configuration
const SUPA_URL = 'https://mlqfniwkjweyfkbcgkns.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scWZuaXdrandleWZrYmNna25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjA5NjYsImV4cCI6MjA4Nzk5Njk2Nn0.nMfgRLuBPh_VTZQPjOI5dK4cHV2qcgx7N8vOqujpqD4';

const supabase = window.supabase.createClient(SUPA_URL, SUPA_KEY);

// Global user and data state
let currentUser = null;
let currentUserId = null;
let authMode = 'signin'; // 'signin' or 'signup'

// Data object structure
let D = {
  neighborhoods: {},
  restaurants: {},
  attractions: {},
  favorites: {}
};

// Initialize auth and data
async function initAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (data && data.session) {
      currentUser = data.session.user;
      currentUserId = currentUser.id;
      loadUserData();
      updateNavAuthUI();
    } else {
      checkLocalData();
      updateNavAuthUI();
    }
  } catch (e) {
    console.warn('Auth init error:', e);
    checkLocalData();
  }
}

// Load user data from Supabase
function loadUserData() {
  const key = 'cty_user_' + currentUserId;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      D = JSON.parse(stored);
    } catch (e) {
      D = { neighborhoods: {}, restaurants: {}, attractions: {}, favorites: {} };
    }
  } else {
    D = { neighborhoods: {}, restaurants: {}, attractions: {}, favorites: {} };
  }
}

// Check for local (offline) data
function checkLocalData() {
  const stored = localStorage.getItem('cty_offline_data');
  if (stored) {
    try {
      D = JSON.parse(stored);
    } catch (e) {
      D = { neighborhoods: {}, restaurants: {}, attractions: {}, favorites: {} };
    }
  } else {
    D = { neighborhoods: {}, restaurants: {}, attractions: {}, favorites: {} };
  }
}

// Open auth modal
function openAuth() {
  document.getElementById('auth-overlay').style.display = 'flex';
  document.getElementById('auth-email').focus();
}

// Close auth modal
function closeAuth() {
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-error').textContent = '';
  clearAuthInputs();
}

// Clear auth form inputs
function clearAuthInputs() {
  document.getElementById('auth-name').value = '';
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-password').value = '';
}

// Toggle between sign in and sign up
function toggleAuthMode() {
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  const nameField = document.getElementById('auth-name');
  const title = document.getElementById('auth-title');
  const sub = document.getElementById('auth-sub');
  const btn = document.getElementById('auth-submit');
  const toggle = document.getElementById('auth-toggle-btn');
  const toggleText = document.getElementById('auth-toggle-text');

  if (authMode === 'signup') {
    nameField.style.display = 'block';
    title.textContent = 'Create Account';
    sub.textContent = 'Join the CTY explorer community';
    btn.textContent = 'Sign Up';
    toggleText.textContent = 'Already have an account?';
    toggle.textContent = 'Sign In';
  } else {
    nameField.style.display = 'none';
    title.textContent = 'Sign In';
    sub.textContent = 'Your collection syncs across all devices';
    btn.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account?";
    toggle.textContent = 'Sign Up';
  }
  clearAuthInputs();
}

// Submit auth form
async function submitAuth() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value.trim();
  const name = document.getElementById('auth-name').value.trim();
  const errorDiv = document.getElementById('auth-error');

  if (!email || !password) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Email and password are required';
    return;
  }

  if (authMode === 'signup' && !name) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'Name is required';
    return;
  }

  errorDiv.style.display = 'none';

  try {
    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { display_name: name }
        }
      });

      if (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message || 'Signup failed';
        return;
      }

      if (data.user) {
        currentUser = data.user;
        currentUserId = data.user.id;
        loadUserData();
        updateNavAuthUI();
        updateNavStats();
        showToast('Account created! Welcome to CTY.');
        closeAuth();
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message || 'Sign in failed';
        return;
      }

      if (data.user) {
        currentUser = data.user;
        currentUserId = data.user.id;
        loadUserData();
        updateNavAuthUI();
        updateNavStats();
        renderNeighborhoods();
        renderStamps();
        showToast('Welcome back!');
        closeAuth();
      }
    }
  } catch (e) {
    console.error('Auth error:', e);
    errorDiv.style.display = 'block';
    errorDiv.textContent = 'An error occurred. Please try again.';
  }
}

// Sign out
async function signOut() {
  try {
    await supabase.auth.signOut();
    currentUser = null;
    currentUserId = null;
    authMode = 'signin';
    clearAuthInputs();
    D = { neighborhoods: {}, restaurants: {}, attractions: {}, favorites: {} };
    updateNavAuthUI();
    updateNavStats();
    renderNeighborhoods();
    renderStamps();
    showToast('Signed out');
  } catch (e) {
    console.error('Sign out error:', e);
  }
}

// Update nav auth UI
function updateNavAuthUI() {
  const btn = document.getElementById('nav-auth-btn');
  if (currentUser) {
    btn.textContent = 'Sign Out';
    btn.onclick = signOut;
  } else {
    btn.textContent = 'Sign In';
    btn.onclick = openAuth;
  }
}

// Sync neighborhood status to Supabase (status: false, 'visited', or 'lived')
async function syncNeighborhoodStatus(hoodId, status) {
  if (!currentUser) {
    if (status) {
      D.neighborhoods[hoodId] = status;
    } else {
      delete D.neighborhoods[hoodId];
    }
    localStorage.setItem('cty_offline_data', JSON.stringify(D));
    return;
  }

  if (status) {
    D.neighborhoods[hoodId] = status;
  } else {
    delete D.neighborhoods[hoodId];
  }
  const key = 'cty_user_' + currentUserId;
  localStorage.setItem(key, JSON.stringify(D));

  try {
    await supabase.from('cty_visited_neighborhoods').upsert({
      user_id: currentUserId,
      neighborhood_id: hoodId,
      status: status || null
    });
  } catch (e) {
    console.warn('Sync error:', e);
  }
}

// Legacy wrapper
async function syncVisitedNeighborhood(hoodId, visited) {
  syncNeighborhoodStatus(hoodId, visited ? 'visited' : false);
}

// Sync visited restaurant to Supabase
async function syncVisitedRestaurant(restaurantId, visited) {
  if (!currentUser) {
    D.restaurants[restaurantId] = visited;
    localStorage.setItem('cty_offline_data', JSON.stringify(D));
    return;
  }

  D.restaurants[restaurantId] = visited;
  const key = 'cty_user_' + currentUserId;
  localStorage.setItem(key, JSON.stringify(D));

  try {
    await supabase.from('cty_visited_restaurants').upsert({
      user_id: currentUserId,
      restaurant_id: restaurantId,
      visited: visited
    });
  } catch (e) {
    console.warn('Sync error:', e);
  }
}

// Sync visited attraction to Supabase
async function syncVisitedAttraction(attractionId, visited) {
  if (!currentUser) {
    D.attractions[attractionId] = visited;
    localStorage.setItem('cty_offline_data', JSON.stringify(D));
    return;
  }

  D.attractions[attractionId] = visited;
  const key = 'cty_user_' + currentUserId;
  localStorage.setItem(key, JSON.stringify(D));

  try {
    await supabase.from('cty_visited_attractions').upsert({
      user_id: currentUserId,
      attraction_id: attractionId,
      visited: visited
    });
  } catch (e) {
    console.warn('Sync error:', e);
  }
}

// Sync favorite
async function syncFavorite(type, id, isFavorite) {
  if (!currentUser) {
    if (!D.favorites) D.favorites = {};
    const key = type + ':' + id;
    if (isFavorite) {
      D.favorites[key] = true;
    } else {
      delete D.favorites[key];
    }
    localStorage.setItem('cty_offline_data', JSON.stringify(D));
    return;
  }

  if (!D.favorites) D.favorites = {};
  const key = type + ':' + id;
  if (isFavorite) {
    D.favorites[key] = true;
  } else {
    delete D.favorites[key];
  }
  const userKey = 'cty_user_' + currentUserId;
  localStorage.setItem(userKey, JSON.stringify(D));

  try {
    await supabase.from('cty_favorites').upsert({
      user_id: currentUserId,
      item_type: type,
      item_id: id,
      is_favorite: isFavorite
    });
  } catch (e) {
    console.warn('Favorite sync error:', e);
  }
}

// Check if restaurant is visited
function isRestaurantVisited(id) {
  return D.restaurants && D.restaurants[id] === true;
}

// Check if attraction is visited
function isAttractionVisited(id) {
  return D.attractions && D.attractions[id] === true;
}

// Check if neighborhood is visited (any status)
function isNeighborhoodVisited(id) {
  return D.neighborhoods && (D.neighborhoods[id] === true || D.neighborhoods[id] === 'visited' || D.neighborhoods[id] === 'lived');
}

// Get neighborhood status: false, 'visited', or 'lived'
function getNeighborhoodStatus(id) {
  if (!D.neighborhoods) return false;
  const val = D.neighborhoods[id];
  if (val === true || val === 'visited') return 'visited';
  if (val === 'lived') return 'lived';
  return false;
}

// Check if item is favorite
function isFavorite(type, id) {
  if (!D.favorites) return false;
  return D.favorites[type + ':' + id] === true;
}

// Initialize on load
initAuth();

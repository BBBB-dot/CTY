// App Initialization

document.addEventListener('DOMContentLoaded', function() {
  try {
    // Initialize D3 neighborhood map
    initHoodMap();

    // Render neighborhood cards
    renderNeighborhoods();

    // Update stats
    updateHoodStats();
    updateNavStats();

    // Hide page loader after initial render
    setTimeout(() => {
      const loader = document.querySelector('.page-loader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
      }
    }, 800);
  } catch(e) {
    console.warn('Init error:', e);
  }
});

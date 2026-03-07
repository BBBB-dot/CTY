// App Initialization

document.addEventListener('DOMContentLoaded', function() {
  try {
    renderNeighborhoods();
    updateHoodStats();
    updateNavStats();

    // Hide page loader after initial render
    setTimeout(() => {
      const loader = document.querySelector('.page-loader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
      }
    }, 500);
  } catch(e) {
    console.warn('Init error:', e);
  }
});

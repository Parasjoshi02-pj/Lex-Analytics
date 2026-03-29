// ============================================================
// LEX ANALYTICS — Client-side Router
// ============================================================

const Router = {
  currentView: 'input',

  init() {
    window.addEventListener('hashchange', () => this.navigate());
    this.navigate();
  },

  navigate(hash) {
    if (hash) window.location.hash = hash;
    const target = (window.location.hash || '#input').replace('#', '');
    this.show(target);
  },

  show(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    // Show target
    const view = document.getElementById(`view-${viewId}`);
    if (view) {
      view.classList.add('active');
      this.currentView = viewId;
    } else {
      // Fallback to input
      const fallback = document.getElementById('view-input');
      if (fallback) fallback.classList.add('active');
      this.currentView = 'input';
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.view === (view ? viewId : 'input'));
    });

    // Scroll to top
    document.querySelector('.main')?.scrollTo(0, 0);
  },

  getCurrentView() {
    return this.currentView;
  }
};

// ============================================================
// LEX ANALYTICS — Utilities
// ============================================================

const Utils = {
  // Generate a unique ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },

  // Clamp a number between min and max
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  // Format percentage
  pct(val) {
    return `${Math.round(val)}%`;
  },

  // Animate a counter from 0 to target
  animateCounter(el, target, duration = 1200, suffix = '') {
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  // Set circular progress ring
  setProgressRing(svg, percent, color) {
    const circle = svg.querySelector('.progress-ring__circle');
    if (!circle) return;
    const radius = circle.getAttribute('r');
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference - (percent / 100) * circumference}`;
    circle.style.stroke = color;
  },

  // Debounce function
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Safely get nested property
  get(obj, path, fallback = null) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : fallback), obj);
  },

  // Escape HTML
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Simple slug
  slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  },

  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Color scale based on value (0-100)
  scoreColor(val) {
    if (val >= 70) return 'var(--color-secondary)';
    if (val >= 40) return 'var(--color-accent)';
    return 'var(--color-danger)';
  },

  // Risk level from score
  riskLevel(score) {
    if (score >= 70) return { level: 'High', class: 'high' };
    if (score >= 40) return { level: 'Moderate', class: 'moderate' };
    return { level: 'Low', class: 'low' };
  },

  // Confidence level from score
  confidenceLevel(score) {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  },

  // Strength classification
  alignmentStrength(score) {
    if (score >= 75) return 'Strong';
    if (score >= 40) return 'Moderate';
    return 'Weak';
  },

  // Simple text similarity (Jaccard-like)
  textSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
  },

  // Section overlap calculation
  sectionOverlap(sections1, sections2) {
    const s1 = new Set(sections1.map(s => s.toUpperCase().trim()));
    const s2 = new Set(sections2.map(s => s.toUpperCase().trim()));
    const intersection = new Set([...s1].filter(s => s2.has(s)));
    const union = new Set([...s1, ...s2]);
    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
  },

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 600;
      padding: 12px 20px; border-radius: 10px; font-size: 13px;
      font-weight: 500; color: white; animation: fadeInUp 0.3s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    `;
    const colors = { info: 'var(--color-primary)', success: 'var(--color-secondary)', warning: 'var(--color-accent)', error: 'var(--color-danger)' };
    toast.style.background = colors[type] || colors.info;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'fadeIn 0.3s ease reverse'; setTimeout(() => toast.remove(), 300); }, 3000);
  },

  // Create SVG progress ring HTML
  createProgressRingSVG(size = 100, strokeWidth = 6) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    return `
      <svg class="progress-ring__svg" width="${size}" height="${size}">
        <circle class="progress-ring__circle-bg" cx="${size/2}" cy="${size/2}" r="${radius}"/>
        <circle class="progress-ring__circle" cx="${size/2}" cy="${size/2}" r="${radius}"
          style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${circumference}"/>
      </svg>`;
  },
};

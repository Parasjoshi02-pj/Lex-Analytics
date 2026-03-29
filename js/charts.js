// ============================================================
// LEX ANALYTICS — Chart.js Visualization Wrapper
// ============================================================

const Charts = {
  instances: {},

  colors: {
    primary: 'rgba(59, 130, 246, 0.8)',
    primaryBg: 'rgba(59, 130, 246, 0.15)',
    success: 'rgba(16, 185, 129, 0.8)',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: 'rgba(234, 179, 8, 0.8)',
    warningBg: 'rgba(234, 179, 8, 0.15)',
    danger: 'rgba(239, 68, 68, 0.8)',
    dangerBg: 'rgba(239, 68, 68, 0.15)',
    purple: 'rgba(139, 92, 246, 0.8)',
    purpleBg: 'rgba(139, 92, 246, 0.15)',
    cyan: 'rgba(6, 182, 212, 0.8)',
    cyanBg: 'rgba(6, 182, 212, 0.15)',
    grid: 'rgba(255, 255, 255, 0.06)',
    text: 'rgba(255, 255, 255, 0.5)',
  },

  defaults() {
    Chart.defaults.color = this.colors.text;
    Chart.defaults.borderColor = this.colors.grid;
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
    Chart.defaults.plugins.legend.labels.padding = 12;
  },

  destroy(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  /**
   * Prediction Doughnut Chart
   */
  renderPredictionChart(canvasId, prediction) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    this.instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Conviction', 'Bail', 'Success (Defense)'],
        datasets: [{
          data: [prediction.convictionProbability, prediction.bailProbability, prediction.successProbability],
          backgroundColor: [this.colors.danger, this.colors.success, this.colors.primary],
          borderWidth: 0,
          spacing: 4,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` }
          }
        }
      }
    });
  },

  /**
   * Risk Radar Chart
   */
  renderRiskRadar(canvasId, riskData) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const categories = {};
    riskData.issues.forEach(i => {
      const score = i.severity === 'high' ? 90 : i.severity === 'moderate' ? 55 : 25;
      if (!categories[i.type] || categories[i.type] < score) categories[i.type] = score;
    });

    const labels = Object.keys(categories).map(k => k.charAt(0).toUpperCase() + k.slice(1));
    const values = Object.values(categories);

    while (labels.length < 3) {
      labels.push('General');
      values.push(10);
    }

    this.instances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Risk Level',
          data: values,
          backgroundColor: this.colors.dangerBg,
          borderColor: this.colors.danger,
          borderWidth: 2,
          pointBackgroundColor: this.colors.danger,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 25, display: false },
            grid: { color: this.colors.grid },
            angleLines: { color: this.colors.grid },
            pointLabels: { font: { size: 11 } }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  },

  /**
   * Section Success Rate Bar Chart
   */
  renderSectionChart(canvasId, sectionAnalysis) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const sections = sectionAnalysis.filter(s => s.found && s.successRate != null);
    if (sections.length === 0) return;

    const labels = sections.map(s => s.section);
    const data = sections.map(s => s.successRate);
    const bgColors = data.map(v => v >= 50 ? this.colors.success : v >= 30 ? this.colors.warning : this.colors.danger);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Success Rate (%)',
          data,
          backgroundColor: bgColors,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: this.colors.grid } },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `Success Rate: ${ctx.parsed.x}%` } }
        }
      }
    });
  },

  /**
   * Timeline / Milestones Chart
   */
  renderTimelineChart(canvasId, milestones) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const labels = milestones.map(m => m.phase.length > 14 ? m.phase.substring(0, 12) + '..' : m.phase);
    const data = milestones.map(m => m.month);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Months',
          data,
          backgroundColor: milestones.map(m =>
            m.status === 'completed' ? this.colors.success : this.colors.primaryBg
          ),
          borderColor: milestones.map(m =>
            m.status === 'completed' ? this.colors.success : this.colors.primary
          ),
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Months' }, grid: { color: this.colors.grid } },
          x: { grid: { display: false }, ticks: { font: { size: 9 } } }
        },
        plugins: { legend: { display: false } }
      }
    });
  },

  /**
   * Comparison Polar Area Chart
   */
  renderComparisonChart(canvasId, comparisons) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (comparisons.length === 0) return;

    const labels = comparisons.slice(0, 5).map(c => c.caseName.length > 20 ? c.caseName.substring(0, 18) + '..' : c.caseName);
    const scores = comparisons.slice(0, 5).map(c => c.alignmentScore);

    this.instances[canvasId] = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels,
        datasets: [{
          data: scores,
          backgroundColor: [this.colors.primaryBg, this.colors.successBg, this.colors.purpleBg, this.colors.warningBg, this.colors.cyanBg],
          borderColor: [this.colors.primary, this.colors.success, this.colors.purple, this.colors.warning, this.colors.cyan],
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false },
            grid: { color: this.colors.grid },
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 9 }, padding: 8 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed.r}% match` } }
        }
      }
    });
  },
};

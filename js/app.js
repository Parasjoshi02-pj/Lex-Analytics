// ============================================================
// LEX ANALYTICS — Main Application Controller
// ============================================================

const App = {
  result: null,

  init() {
    Charts.defaults();
    Router.init();
    this.bindEvents();
    this.loadSampleCase();
  },

  bindEvents() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigate(`#${item.dataset.view}`);
        // Close mobile sidebar
        document.querySelector('.sidebar')?.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('active');
      });
    });

    // Mobile toggle
    document.getElementById('mobileToggle')?.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.toggle('open');
      document.querySelector('.sidebar-overlay')?.classList.toggle('active');
    });

    // Overlay click to close
    document.querySelector('.sidebar-overlay')?.addEventListener('click', () => {
      document.querySelector('.sidebar')?.classList.remove('open');
      document.querySelector('.sidebar-overlay')?.classList.remove('active');
    });

    // Analyze button
    document.getElementById('btnAnalyze')?.addEventListener('click', () => this.runAnalysis());

    // Clear button
    document.getElementById('btnClear')?.addEventListener('click', () => this.clearInput());

    // Sample case button
    document.getElementById('btnSample')?.addEventListener('click', () => this.loadSampleCase());

    // Copilot send
    document.getElementById('btnCopilotSend')?.addEventListener('click', () => this.sendCopilotMessage());
    document.getElementById('copilotInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendCopilotMessage(); }
    });

    // Quick copilot questions
    document.querySelectorAll('.copilot-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('copilotInput').value = btn.dataset.question;
        this.sendCopilotMessage();
      });
    });
  },

  loadSampleCase() {
    const sample = `FIR No. 245/2024 filed at PS Saket, New Delhi

State v. Rajesh Verma

The accused Rajesh Verma, aged 34, is charged under Section 302 IPC read with Section 34 IPC for the murder of Sunil Kumar on 15 March 2024. 

The incident occurred at approximately 11:30 PM near the Qutub Minar area. The victim was found with multiple stab wounds. An eyewitness, Mohan Lal (neighbor), reported seeing the accused fleeing the scene with a blood-stained knife. 

The FIR was registered on 16 March 2024 by the victim's brother, Anil Kumar. The accused was arrested on 18 March 2024 from his residence. During investigation, the murder weapon (a kitchen knife) was recovered from a drain near the crime scene based on the accused's disclosure statement.

The accused has no prior criminal record. He claims alibi, stating he was at a friend's house at the time of the incident. Mobile tower location data is being examined. The accused and victim had a dispute over a property matter.

Medical examination confirmed cause of death as hemorrhagic shock due to multiple stab wounds. Post-mortem conducted at AIIMS on 16 March 2024.

The case is being heard before the Sessions Court, Saket, New Delhi. The accused has applied for bail which was denied by the Sessions Court. An appeal for bail is being considered at the Delhi High Court.`;

    const textarea = document.getElementById('caseInput');
    if (textarea) textarea.value = sample;

    // Set metadata
    const courtSelect = document.getElementById('courtInput');
    if (courtSelect) courtSelect.value = 'Sessions Court';
    const typeSelect = document.getElementById('typeInput');
    if (typeSelect) typeSelect.value = 'criminal';
    const stateInput = document.getElementById('stateInput');
    if (stateInput) stateInput.value = 'Delhi';
  },

  clearInput() {
    document.getElementById('caseInput').value = '';
    document.getElementById('courtInput').value = '';
    document.getElementById('judgeInput').value = '';
    document.getElementById('typeInput').value = '';
    document.getElementById('stateInput').value = '';
    document.getElementById('sectionsInput').value = '';
  },

  async runAnalysis() {
    const rawText = document.getElementById('caseInput')?.value?.trim();
    if (!rawText) {
      Utils.showToast('Please enter case details', 'warning');
      return;
    }

    const metadata = {
      court: document.getElementById('courtInput')?.value || '',
      judge: document.getElementById('judgeInput')?.value || '',
      caseType: document.getElementById('typeInput')?.value || '',
      state: document.getElementById('stateInput')?.value || '',
    };

    // Additional sections from manual input
    const manualSections = document.getElementById('sectionsInput')?.value || '';
    if (manualSections) {
      metadata.additionalSections = manualSections.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Show loading
    this.showLoading(true);

    try {
      this.result = await AnalysisEngine.runFullAnalysis(rawText, metadata);

      // Merge manual sections
      if (metadata.additionalSections) {
        metadata.additionalSections.forEach(s => {
          if (!this.result.sections.includes(s)) this.result.sections.push(s);
        });
      }

      this.renderAllViews();
      Router.navigate('#dashboard');
      Utils.showToast(this.result.aiEnhanced ? 'Analysis complete with AI enhancement ✨' : 'Analysis complete', 'success');
    } catch (err) {
      console.error('Analysis error:', err);
      Utils.showToast('Analysis failed: ' + err.message, 'error');
    } finally {
      this.showLoading(false);
    }
  },

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
  },

  // ── RENDER ALL VIEWS ──
  renderAllViews() {
    const r = this.result;
    if (!r) return;

    this.renderDashboard(r);
    this.renderSummary(r);
    this.renderSimilarCases(r);
    this.renderComparison(r);
    this.renderPrediction(r);
    this.renderJudgeInsights(r);
    this.renderSectionAnalysis(r);
    this.renderBailInsights(r);
    this.renderRiskAlerts(r);
    this.renderStrategy(r);
    this.renderTimeline(r);

    // Enable nav badges
    if (r.riskAssessment.issues.length > 0) {
      const riskBadge = document.querySelector('[data-view="risks"] .nav-item__badge');
      if (riskBadge) {
        riskBadge.textContent = r.riskAssessment.issues.length;
        riskBadge.style.display = 'inline';
      }
    }
  },

  // ── DASHBOARD VIEW ──
  renderDashboard(r) {
    // Metric cards
    this.setMetric('metricSuccess', r.dashboard.successScore, '%');
    this.setMetric('metricRisk', r.riskAssessment.riskScore, '%');
    this.setMetric('metricConfidence', r.prediction.confidenceScore, '%');
    this.setMetric('metricCases', r.similarCases.length, '');

    // Progress rings
    this.renderRing('ringSuccess', r.dashboard.successScore, Utils.scoreColor(r.dashboard.successScore));
    this.renderRing('ringRisk', r.riskAssessment.riskScore, Utils.scoreColor(100 - r.riskAssessment.riskScore));
    this.renderRing('ringConfidence', r.prediction.confidenceScore, Utils.scoreColor(r.prediction.confidenceScore));

    // Charts
    Charts.renderPredictionChart('chartPrediction', r.prediction);
    Charts.renderRiskRadar('chartRisk', r.riskAssessment);

    // AI Summary
    const aiBox = document.getElementById('aiSummaryBox');
    if (aiBox) {
      if (r.aiEnhanced && r.aiSummary) {
        aiBox.innerHTML = `<div class="insight-box insight-box--success"><div class="insight-box__title">✨ AI-Enhanced Summary</div><div class="insight-box__text">${Utils.escapeHtml(r.aiSummary)}</div></div>`;
        if (r.aiInsights?.length) {
          aiBox.innerHTML += r.aiInsights.map(i => `<div class="insight-box"><div class="insight-box__text">💡 ${Utils.escapeHtml(i)}</div></div>`).join('');
        }
      } else {
        aiBox.innerHTML = `<div class="insight-box"><div class="insight-box__title">📄 Case Overview</div><div class="insight-box__text">${r.caseSummary.caseType.charAt(0).toUpperCase() + r.caseSummary.caseType.slice(1)} case (${r.caseSummary.category}) involving ${r.sections.join(', ') || 'sections under analysis'}. Court: ${r.caseSummary.court}. ${r.comparison.summary}</div></div>`;
      }
    }
  },

  setMetric(id, value, suffix) {
    const el = document.getElementById(id);
    if (el) Utils.animateCounter(el, value, 1200, suffix);
  },

  renderRing(id, value, color) {
    const container = document.getElementById(id);
    if (!container) return;
    const size = 120;
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    container.innerHTML = `
      <div class="progress-ring">
        <svg class="progress-ring__svg" width="${size}" height="${size}">
          <circle class="progress-ring__circle-bg" cx="${size/2}" cy="${size/2}" r="${radius}"/>
          <circle class="progress-ring__circle" cx="${size/2}" cy="${size/2}" r="${radius}"
            style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${circumference}; stroke: ${color}"/>
        </svg>
        <span class="progress-ring__label" id="${id}Label">0%</span>
      </div>`;
    // Animate after a tick
    setTimeout(() => {
      const circle = container.querySelector('.progress-ring__circle');
      if (circle) circle.style.strokeDashoffset = circumference - (value / 100) * circumference;
      Utils.animateCounter(document.getElementById(`${id}Label`), value, 1500, '%');
    }, 100);
  },

  // ── SUMMARY VIEW ──
  renderSummary(r) {
    const el = document.getElementById('summaryContent');
    if (!el) return;

    let html = `<div class="summary-panel">`;
    html += this.summaryRow('📌 Case Type', `${r.caseSummary.caseType} (${r.caseSummary.category})`);
    html += this.summaryRow('🏛️ Court', r.caseSummary.court);
    html += this.summaryRow('👨‍⚖️ Judge', r.caseSummary.judge || 'Not specified');
    html += this.summaryRow('📍 State', r.caseSummary.state || 'Not specified');
    html += this.summaryRow('📚 Sections', r.sections.map(s => `<span class="badge badge--primary">${s}</span>`).join(' ') || 'None identified');
    html += `</div>`;

    html += `<div class="card mt-4"><div class="card__header"><h3 class="card__title">📋 Key Facts</h3></div>`;
    html += `<ul style="list-style:none;padding:0">`;
    r.caseSummary.facts.forEach(f => {
      html += `<li style="padding:8px 0;border-bottom:1px solid var(--glass-border);color:var(--text-secondary);font-size:var(--text-sm)">• ${Utils.escapeHtml(f)}</li>`;
    });
    html += `</ul></div>`;

    html += `<div class="card mt-4"><div class="card__header"><h3 class="card__title">⚖️ Legal Issues</h3></div>`;
    html += `<ul style="list-style:none;padding:0">`;
    r.caseSummary.issues.forEach(i => {
      html += `<li style="padding:8px 0;border-bottom:1px solid var(--glass-border);color:var(--text-secondary);font-size:var(--text-sm)">• ${Utils.escapeHtml(i)}</li>`;
    });
    html += `</ul></div>`;

    // Timeline
    html += `<div class="card mt-4"><div class="card__header"><h3 class="card__title">📊 Events Timeline</h3></div><div class="timeline">`;
    r.timeline.forEach(t => {
      html += `<div class="timeline__item"><div class="timeline__dot"></div><div class="timeline__date">${Utils.escapeHtml(t.date)}</div><div class="timeline__title">${Utils.escapeHtml(t.event)}</div></div>`;
    });
    html += `</div></div>`;

    el.innerHTML = html;
  },

  summaryRow(key, val) {
    return `<div class="summary-panel__row"><div class="summary-panel__key">${key}</div><div class="summary-panel__val">${val}</div></div>`;
  },

  // ── SIMILAR CASES VIEW ──
  renderSimilarCases(r) {
    const el = document.getElementById('similarCasesContent');
    if (!el) return;

    if (r.similarCases.length === 0) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📚</div><div class="empty-state__title">No Similar Cases Found</div><div class="empty-state__desc">The case data may not match any precedents in the database.</div></div>`;
      return;
    }

    let html = `<p class="mb-4" style="color:var(--text-secondary)">Found ${r.similarCases.length} relevant precedents ranked by relevance score</p>`;
    r.similarCases.forEach((c, i) => {
      html += `<div class="case-card animate-in mb-4">
        <div class="case-card__header">
          <div><span class="badge badge--neutral">#${i + 1}</span> <span class="case-card__name" style="margin-left:8px">${Utils.escapeHtml(c.caseName)}</span></div>
          <div class="case-card__score">${c.matchScore}%</div>
        </div>
        <div class="case-card__meta">
          <span class="case-card__meta-item">🏛️ ${c.court}</span>
          <span class="case-card__meta-item">📅 ${c.year}</span>
          <span class="case-card__meta-item"><span class="badge ${c.outcome.toLowerCase().includes('conviction') ? 'badge--danger' : c.outcome.toLowerCase().includes('acquittal') ? 'badge--success' : 'badge--primary'}">${c.outcome}</span></span>
        </div>
        <div class="case-card__summary">${Utils.escapeHtml(c.facts.substring(0, 200))}...</div>
        <div class="case-card__outcome"><strong>Reasoning:</strong> ${Utils.escapeHtml(c.reasoning.substring(0, 250))}...</div>
        <div class="tag-group mt-2">${c.sections.map(s => `<span class="badge badge--primary">${s}</span>`).join('')}</div>
      </div>`;
    });
    el.innerHTML = html;
  },

  // ── COMPARISON VIEW ──
  renderComparison(r) {
    const el = document.getElementById('comparisonContent');
    if (!el) return;

    let html = `<div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 style="font-size:var(--text-lg)">Overall Alignment</h3>
          <p style="color:var(--text-secondary);font-size:var(--text-sm)">${r.comparison.summary}</p>
        </div>
        <div style="text-align:center">
          <div style="font-size:var(--text-3xl);font-weight:700;color:${Utils.scoreColor(r.comparison.alignmentScore)}">${r.comparison.alignmentScore}%</div>
          <span class="badge ${r.comparison.classification === 'Strong' ? 'badge--success' : r.comparison.classification === 'Moderate' ? 'badge--warning' : 'badge--danger'}">${r.comparison.classification} Match</span>
        </div>
      </div>
    </div>`;

    if (r.comparison.details?.length) {
      html += `<div class="dashboard-row"><div><canvas id="chartComparison"></canvas></div><div>`;
      r.comparison.details.forEach(c => {
        html += `<div class="card mb-4"><h4 style="margin-bottom:8px">${Utils.escapeHtml(c.caseName)}</h4>`;
        html += `<div class="comparison-row"><div class="comparison-row__label">Match Score</div><div class="comparison-row__bar"><div class="comparison-row__fill progress__bar--blue" style="width:${c.alignmentScore}%">${c.alignmentScore}%</div></div></div>`;
        if (c.similarities.length) html += `<p style="font-size:var(--text-xs);color:var(--color-secondary-light)">✓ ${c.similarities.join(' | ')}</p>`;
        if (c.differences.length) html += `<p style="font-size:var(--text-xs);color:var(--color-accent);margin-top:4px">△ ${c.differences.join(' | ')}</p>`;
        html += `</div>`;
      });
      html += `</div></div>`;
    }

    el.innerHTML = html;
    setTimeout(() => Charts.renderComparisonChart('chartComparison', r.comparison.details || []), 100);
  },

  // ── PREDICTION VIEW ──
  renderPrediction(r) {
    const el = document.getElementById('predictionContent');
    if (!el) return;

    let html = `<div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr)">
      ${this.predictionCard('Conviction', r.prediction.convictionProbability, 'red', '⚖️')}
      ${this.predictionCard('Bail', r.prediction.bailProbability, 'green', '🔓')}
      ${this.predictionCard('Defense Success', r.prediction.successProbability, 'blue', '🎯')}
    </div>`;

    html += `<div class="dashboard-row mt-6"><div class="card"><div class="card__header"><h3 class="card__title">📊 Probability Distribution</h3></div><canvas id="chartPrediction2"></canvas></div>`;
    html += `<div class="card"><div class="card__header"><h3 class="card__title">🔑 Key Factors</h3></div>`;
    if (r.prediction.factors.length) {
      html += `<div class="table-wrap"><table class="table"><thead><tr><th>Factor</th><th>Impact</th><th>Direction</th></tr></thead><tbody>`;
      r.prediction.factors.forEach(f => {
        html += `<tr><td>${Utils.escapeHtml(f.factor)}</td><td><span class="badge ${f.impact === 'High' ? 'badge--danger' : 'badge--warning'}">${f.impact}</span></td><td style="color:${f.direction === 'favorable' ? 'var(--color-secondary-light)' : 'var(--color-danger-light)'}"><strong>${f.direction === 'favorable' ? '↑ Favorable' : '↓ Against'}</strong></td></tr>`;
      });
      html += `</tbody></table></div>`;
    } else {
      html += `<p style="color:var(--text-tertiary)">Provide more case details for factor analysis</p>`;
    }
    html += `</div></div>`;

    html += `<div class="insight-box mt-4"><div class="insight-box__title">📋 Confidence: ${r.prediction.confidenceLevel}</div><div class="insight-box__text">Analysis confidence score: ${r.prediction.confidenceScore}%. Based on ${r.similarCases.length} matched precedents and ${r.sections.length} identified legal sections.</div></div>`;

    el.innerHTML = html;
    setTimeout(() => Charts.renderPredictionChart('chartPrediction2', r.prediction), 100);
  },

  predictionCard(label, value, color, icon) {
    return `<div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--${color}">${icon}</div><div class="metric-card__label">${label} Probability</div><div class="metric-card__value" style="color:var(--color-${color === 'red' ? 'danger' : color === 'green' ? 'secondary' : 'primary'})">${value}%</div><div class="progress mt-2"><div class="progress__bar progress__bar--${color === 'red' ? 'red' : color === 'green' ? 'green' : 'blue'}" style="width:${value}%"></div></div></div>`;
  },

  // ── JUDGE INSIGHTS VIEW ──
  renderJudgeInsights(r) {
    const el = document.getElementById('judgeContent');
    if (!el) return;

    if (!r.judgeInsights.available) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👨‍⚖️</div><div class="empty-state__title">Judge Data Unavailable</div><div class="empty-state__desc">${r.judgeInsights.message}</div></div>`;
      return;
    }

    const j = r.judgeInsights;
    let html = `<div class="summary-panel">`;
    html += this.summaryRow('Name', j.name);
    html += this.summaryRow('Court', j.court);
    html += this.summaryRow('Conviction Rate', `<strong style="color:var(--color-danger-light)">${j.convictionRate}%</strong>`);
    html += this.summaryRow('Bail Approval Rate', `<strong style="color:var(--color-secondary-light)">${j.bailApprovalRate}%</strong>`);
    html += this.summaryRow('Judicial Tendency', `<span class="badge ${j.bias.includes('strict') ? 'badge--danger' : j.bias.includes('liberal') ? 'badge--success' : 'badge--primary'}">${j.bias}</span>`);
    html += `</div>`;

    html += `<div class="insight-box insight-box--warning mt-4"><div class="insight-box__title">🧠 Behavioral Summary</div><div class="insight-box__text">${Utils.escapeHtml(j.behavioralSummary)}</div></div>`;

    // Section tendencies
    if (j.sectionTendencies) {
      html += `<div class="card mt-4"><div class="card__header"><h3 class="card__title">📊 Section-Wise Tendencies</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Section</th><th>Tendency</th></tr></thead><tbody>`;
      Object.entries(j.sectionTendencies).forEach(([sec, tendency]) => {
        const cls = tendency === 'strict' ? 'badge--danger' : tendency === 'liberal' ? 'badge--success' : 'badge--primary';
        html += `<tr><td>${sec}</td><td><span class="badge ${cls}">${tendency}</span></td></tr>`;
      });
      html += `</tbody></table></div></div>`;
    }

    // Comparative metrics
    if (j.metrics) {
      html += `<div class="dashboard-grid mt-4" style="grid-template-columns:repeat(3,1fr)">
        <div class="metric-card"><div class="metric-card__label">Conv. vs Average</div><div class="metric-card__value" style="color:${j.metrics.convictionVsAvg > 0 ? 'var(--color-danger-light)' : 'var(--color-secondary-light)'}">${j.metrics.convictionVsAvg > 0 ? '+' : ''}${j.metrics.convictionVsAvg}%</div></div>
        <div class="metric-card"><div class="metric-card__label">Bail vs Average</div><div class="metric-card__value" style="color:${j.metrics.bailVsAvg > 0 ? 'var(--color-secondary-light)' : 'var(--color-danger-light)'}">${j.metrics.bailVsAvg > 0 ? '+' : ''}${j.metrics.bailVsAvg}%</div></div>
        <div class="metric-card"><div class="metric-card__label">Strictness Index</div><div class="metric-card__value">${j.metrics.strictnessScore}</div></div>
      </div>`;
    }

    el.innerHTML = html;
  },

  // ── SECTION ANALYSIS VIEW ──
  renderSectionAnalysis(r) {
    const el = document.getElementById('sectionContent');
    if (!el) return;

    let html = '';
    if (r.sectionStats) {
      html += `<div class="dashboard-grid mb-6" style="grid-template-columns:repeat(3,1fr)">
        <div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--blue">📊</div><div class="metric-card__label">Avg Success Rate</div><div class="metric-card__value">${r.sectionStats.averageSuccessRate}%</div></div>
        <div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--red">⚡</div><div class="metric-card__label">Most Severe</div><div class="metric-card__value" style="font-size:var(--text-md)">${r.sectionStats.mostSevereSection?.section || 'N/A'}</div></div>
        <div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--green">📚</div><div class="metric-card__label">Sections Analyzed</div><div class="metric-card__value">${r.sectionStats.foundInDb}/${r.sectionStats.totalSections}</div></div>
      </div>`;
    }

    html += `<div class="dashboard-row"><div class="card"><div class="card__header"><h3 class="card__title">📉 Section Success Rates</h3></div><canvas id="chartSections"></canvas></div>`;

    html += `<div class="card"><div class="card__header"><h3 class="card__title">📋 Section Details</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Section</th><th>Title</th><th>Severity</th><th>Success Rate</th><th>Bail</th></tr></thead><tbody>`;
    r.sectionAnalysis.forEach(s => {
      const sevCls = s.severity === 'extreme' ? 'badge--danger' : s.severity === 'high' ? 'badge--warning' : s.severity === 'medium' ? 'badge--primary' : 'badge--neutral';
      html += `<tr><td><strong>${s.section}</strong></td><td>${s.title || 'N/A'}</td><td><span class="badge ${sevCls}">${s.severity || 'N/A'}</span></td><td>${s.successRate != null ? s.successRate + '%' : 'N/A'}</td><td>${s.bailEligible === true ? '<span class="badge badge--success">Yes</span>' : s.bailEligible === false ? '<span class="badge badge--danger">No</span>' : 'N/A'}</td></tr>`;
    });
    html += `</tbody></table></div></div></div>`;

    el.innerHTML = html;
    setTimeout(() => Charts.renderSectionChart('chartSections', r.sectionAnalysis), 100);
  },

  // ── BAIL INSIGHTS VIEW ──
  renderBailInsights(r) {
    const el = document.getElementById('bailContent');
    if (!el) return;

    const b = r.bailInsights;
    let html = `<div class="metric-card mb-6" style="text-align:center;padding:var(--space-8)">
      <div style="font-size:var(--text-4xl);font-weight:700;color:${Utils.scoreColor(r.prediction.bailProbability)}">${r.prediction.bailProbability}%</div>
      <div style="font-size:var(--text-md);color:var(--text-secondary);margin-top:var(--space-2)">Bail Probability</div>
    </div>`;

    if (b.recommendation) {
      html += `<div class="insight-box insight-box--success mb-4"><div class="insight-box__title">💡 Recommendation</div><div class="insight-box__text">${Utils.escapeHtml(b.recommendation)}</div></div>`;
    }

    if (b.trends.length) {
      html += `<div class="card mb-4"><div class="card__header"><h3 class="card__title">📈 Bail Trends</h3></div><ul style="list-style:none;padding:0">`;
      b.trends.forEach(t => { html += `<li style="padding:8px 0;border-bottom:1px solid var(--glass-border);color:var(--text-secondary);font-size:var(--text-sm)">📌 ${Utils.escapeHtml(t)}</li>`; });
      html += `</ul></div>`;
    }

    if (b.keyFactors.length) {
      html += `<div class="card"><div class="card__header"><h3 class="card__title">🔑 Key Decision Factors</h3></div><div class="tag-group">`;
      b.keyFactors.forEach(f => { html += `<span class="badge badge--warning">${Utils.escapeHtml(f)}</span>`; });
      html += `</div></div>`;
    }

    el.innerHTML = html;
  },

  // ── RISK ALERTS VIEW ──
  renderRiskAlerts(r) {
    const el = document.getElementById('risksContent');
    if (!el) return;

    let html = `<div class="flex items-center gap-4 mb-6">
      <div class="risk-indicator risk-indicator--${r.riskAssessment.riskLevel.toLowerCase()}">
        <div class="risk-indicator__dot"></div> ${r.riskAssessment.riskLevel} Risk
      </div>
      <span style="font-size:var(--text-2xl);font-weight:700;color:${Utils.scoreColor(100 - r.riskAssessment.riskScore)}">${r.riskAssessment.riskScore}%</span>
    </div>`;

    if (r.riskAssessment.issues.length === 0) {
      html += `<div class="empty-state"><div class="empty-state__icon">✅</div><div class="empty-state__title">No Critical Risks</div></div>`;
    } else {
      html += `<div class="dashboard-row"><div><canvas id="chartRisk2"></canvas></div><div>`;
      r.riskAssessment.issues.forEach((issue, i) => {
        const cls = issue.severity === 'high' ? 'insight-box--danger' : issue.severity === 'moderate' ? 'insight-box--warning' : '';
        html += `<div class="insight-box ${cls} mb-4 animate-in"><div class="insight-box__title"><span class="badge ${issue.severity === 'high' ? 'badge--danger' : issue.severity === 'moderate' ? 'badge--warning' : 'badge--neutral'}">${issue.severity.toUpperCase()}</span> <span style="margin-left:8px">${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Risk</span></div><div class="insight-box__text">${Utils.escapeHtml(issue.description)}</div></div>`;
      });
      html += `</div></div>`;
    }

    el.innerHTML = html;
    setTimeout(() => Charts.renderRiskRadar('chartRisk2', r.riskAssessment), 100);
  },

  // ── STRATEGY VIEW ──
  renderStrategy(r) {
    const el = document.getElementById('strategyContent');
    if (!el) return;

    let html = `<div class="dashboard-row mb-6">`;
    // Strengths
    html += `<div class="strategy-card"><div class="strategy-card__header"><div class="strategy-card__icon" style="background:var(--color-secondary-glow);color:var(--color-secondary-light)">💪</div><h3>Strengths</h3></div><ul class="strategy-card__list">`;
    r.strategy.strengths.forEach(s => { html += `<li><span style="color:var(--color-secondary)">✓</span> ${Utils.escapeHtml(s)}</li>`; });
    html += `</ul></div>`;
    // Weaknesses
    html += `<div class="strategy-card"><div class="strategy-card__header"><div class="strategy-card__icon" style="background:var(--color-danger-glow);color:var(--color-danger-light)">⚠️</div><h3>Weaknesses</h3></div><ul class="strategy-card__list">`;
    r.strategy.weaknesses.forEach(w => { html += `<li><span style="color:var(--color-danger)">✗</span> ${Utils.escapeHtml(w)}</li>`; });
    html += `</ul></div>`;
    html += `</div>`;

    // Missing arguments
    if (r.strategy.missingArguments.length) {
      html += `<div class="card mb-6"><div class="card__header"><h3 class="card__title">💡 Missing Arguments</h3></div><ul style="list-style:none;padding:0">`;
      r.strategy.missingArguments.forEach(m => { html += `<li style="padding:8px 0;border-bottom:1px solid var(--glass-border);color:var(--color-accent);font-size:var(--text-sm)">→ ${Utils.escapeHtml(m)}</li>`; });
      html += `</ul></div>`;
    }

    // Defense strategies
    html += `<div class="card mb-6"><div class="card__header"><h3 class="card__title">🛡️ Defense Strategies</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Priority</th><th>Strategy</th><th>Rationale</th></tr></thead><tbody>`;
    r.strategy.defense.forEach(s => {
      html += `<tr><td><span class="badge ${s.priority === 'High' ? 'badge--danger' : 'badge--warning'}">${s.priority}</span></td><td style="color:var(--text-primary)">${Utils.escapeHtml(s.action)}</td><td>${Utils.escapeHtml(s.rationale)}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;

    // Prosecution strategies
    html += `<div class="card"><div class="card__header"><h3 class="card__title">⚔️ Prosecution Perspective</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Priority</th><th>Strategy</th><th>Rationale</th></tr></thead><tbody>`;
    r.strategy.prosecution.forEach(s => {
      html += `<tr><td><span class="badge ${s.priority === 'High' ? 'badge--danger' : 'badge--warning'}">${s.priority}</span></td><td style="color:var(--text-primary)">${Utils.escapeHtml(s.action)}</td><td>${Utils.escapeHtml(s.rationale)}</td></tr>`;
    });
    html += `</tbody></table></div></div>`;

    el.innerHTML = html;
  },

  // ── TIMELINE VIEW ──
  renderTimeline(r) {
    const el = document.getElementById('timelineContent');
    if (!el) return;

    const tp = r.timelinePrediction;
    let html = `<div class="dashboard-grid mb-6" style="grid-template-columns:repeat(4,1fr)">
      <div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--blue">⏱</div><div class="metric-card__label">Estimated Duration</div><div class="metric-card__value" style="font-size:var(--text-lg)">${tp.duration.estimated}</div></div>
      <div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--purple">📅</div><div class="metric-card__label">Hearings</div><div class="metric-card__value">~${tp.hearings.estimated}</div></div>
      <div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--yellow">⚡</div><div class="metric-card__label">Delay Probability</div><div class="metric-card__value">${tp.delayProbability}%</div></div>
      <div class="metric-card"><div class="metric-card__icon-wrap metric-card__icon-wrap--cyan">🧩</div><div class="metric-card__label">Complexity</div><div class="metric-card__value" style="font-size:var(--text-lg);text-transform:capitalize">${tp.complexity}</div></div>
    </div>`;

    html += `<div class="dashboard-row"><div class="card"><div class="card__header"><h3 class="card__title">📊 Case Milestones</h3></div><canvas id="chartTimeline"></canvas></div>`;

    html += `<div class="card"><div class="card__header"><h3 class="card__title">🗓️ Milestone Schedule</h3></div><div class="timeline">`;
    tp.milestones.forEach(m => {
      html += `<div class="timeline__item"><div class="timeline__dot" style="${m.status === 'completed' ? 'background:var(--color-secondary)' : ''}"></div><div class="timeline__date">${m.date}</div><div class="timeline__title">${m.phase}</div><div class="timeline__desc">${m.status === 'completed' ? '✅ Completed' : `Month ${m.month}`}</div></div>`;
    });
    html += `</div></div></div>`;

    // Duration factors
    html += `<div class="card mt-6"><div class="card__header"><h3 class="card__title">📋 Duration Factors</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Factor</th><th>Impact</th></tr></thead><tbody>`;
    tp.factors.forEach(f => { html += `<tr><td>${Utils.escapeHtml(f.factor)}</td><td>${Utils.escapeHtml(f.impact)}</td></tr>`; });
    html += `</tbody></table></div></div>`;

    el.innerHTML = html;
    setTimeout(() => Charts.renderTimelineChart('chartTimeline', tp.milestones), 100);
  },

  // ── COPILOT ──
  async sendCopilotMessage() {
    const input = document.getElementById('copilotInput');
    const question = input?.value?.trim();
    if (!question) return;

    const messages = document.getElementById('copilotMessages');
    // Add user message
    messages.innerHTML += `<div class="chat-bubble chat-bubble--user">${Utils.escapeHtml(question)}</div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Show typing
    messages.innerHTML += `<div class="chat-bubble chat-bubble--ai" id="typingIndicator"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    messages.scrollTop = messages.scrollHeight;

    const answer = await AnalysisEngine.askCopilot(question);

    // Remove typing, add answer
    document.getElementById('typingIndicator')?.remove();
    messages.innerHTML += `<div class="chat-bubble chat-bubble--ai">${answer.replace(/\n/g, '<br>')}</div>`;
    messages.scrollTop = messages.scrollHeight;
  },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

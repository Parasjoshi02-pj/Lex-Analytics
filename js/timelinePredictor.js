// ============================================================
// LEX ANALYTICS — Timeline & Duration Predictor
// ============================================================

const TimelinePredictor = {
  /**
   * Predict case timeline
   */
  predict(caseData) {
    const courtKey = this.normalizeCourtKey(caseData.court);
    const baseStats = STATISTICS.caseDuration[courtKey] || STATISTICS.caseDuration['District Court'];
    const typeModifier = STATISTICS.caseTypeModifiers[caseData.caseType] || { durationMultiplier: 1.0, complexityFactor: 'medium' };

    const durationMonths = Math.round(baseStats.avgMonths * typeModifier.durationMultiplier);
    const hearings = Math.round(baseStats.hearings.avg * typeModifier.durationMultiplier);
    const delayProbability = Math.round(baseStats.delayProbability * 100);

    // Complexity adjustment
    let complexity = typeModifier.complexityFactor;
    if (caseData.sections.length > 4) complexity = 'high';
    if (caseData.sections.length > 7) complexity = 'very high';

    return {
      duration: {
        estimated: `${durationMonths} months`,
        minimum: `${Math.round(baseStats.minMonths * typeModifier.durationMultiplier)} months`,
        maximum: `${Math.round(baseStats.maxMonths * typeModifier.durationMultiplier)} months`,
        months: durationMonths,
      },
      hearings: {
        estimated: hearings,
        minimum: Math.round(baseStats.hearings.min * typeModifier.durationMultiplier),
        maximum: Math.round(baseStats.hearings.max * typeModifier.durationMultiplier),
      },
      delayProbability: delayProbability,
      complexity: complexity,
      court: caseData.court,
      factors: this.getDurationFactors(caseData, typeModifier),
      milestones: this.generateMilestones(durationMonths, caseData),
    };
  },

  normalizeCourtKey(court) {
    if (!court) return 'District Court';
    const l = court.toLowerCase();
    if (l.includes('supreme')) return 'Supreme Court';
    if (l.includes('high court')) return 'High Court';
    if (l.includes('sessions')) return 'Sessions Court';
    if (l.includes('fast track')) return 'Fast Track Court';
    if (l.includes('magistrate')) return 'Magistrate Court';
    return 'District Court';
  },

  getDurationFactors(caseData, modifier) {
    const factors = [];
    factors.push({ factor: `Case type: ${caseData.caseType}`, impact: `${modifier.durationMultiplier}x duration modifier` });
    factors.push({ factor: `Court: ${caseData.court}`, impact: 'Base duration reference' });
    factors.push({ factor: `Sections involved: ${caseData.sections.length}`, impact: caseData.sections.length > 4 ? 'Adds complexity' : 'Standard' });
    factors.push({ factor: `Complexity: ${modifier.complexityFactor}`, impact: 'Overall case complexity assessment' });

    // National pendency
    const courtKey = this.normalizeCourtKey(caseData.court);
    const pendencyKey = courtKey === 'Supreme Court' ? 'Supreme Court' : (courtKey.includes('High') ? 'High Courts' : 'District Courts');
    const pendency = STATISTICS.pendency[pendencyKey];
    if (pendency) {
      factors.push({ factor: `Court pendency: ${(pendency.pending / 1000000).toFixed(1)}M cases`, impact: 'May cause additional delays' });
    }

    return factors;
  },

  generateMilestones(totalMonths, caseData) {
    const milestones = [];
    const now = new Date();

    milestones.push({ phase: 'FIR / Case Filing', month: 0, status: 'completed', date: 'Completed' });
    milestones.push({ phase: 'Investigation & Chargesheet', month: Math.max(1, Math.round(totalMonths * 0.15)), status: 'upcoming' });
    milestones.push({ phase: 'Charges Framed', month: Math.round(totalMonths * 0.25), status: 'upcoming' });
    milestones.push({ phase: 'Prosecution Evidence', month: Math.round(totalMonths * 0.45), status: 'upcoming' });
    milestones.push({ phase: 'Defense Evidence', month: Math.round(totalMonths * 0.65), status: 'upcoming' });
    milestones.push({ phase: 'Arguments', month: Math.round(totalMonths * 0.8), status: 'upcoming' });
    milestones.push({ phase: 'Judgment', month: totalMonths, status: 'upcoming' });

    // Add estimated dates
    milestones.forEach(m => {
      if (m.status === 'upcoming') {
        const date = new Date(now);
        date.setMonth(date.getMonth() + m.month);
        m.date = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
      }
    });

    return milestones;
  }
};

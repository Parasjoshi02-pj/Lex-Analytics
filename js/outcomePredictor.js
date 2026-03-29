// ============================================================
// LEX ANALYTICS — Outcome Prediction Engine
// ============================================================

const OutcomePredictor = {
  /**
   * Predict outcomes based on precedent patterns and section data
   */
  predict(caseData, similarCases, sectionAnalysis) {
    const conviction = this.calculateConvictionProbability(caseData, similarCases, sectionAnalysis);
    const bail = this.calculateBailProbability(caseData, sectionAnalysis);
    const success = this.calculateSuccessProbability(conviction, bail, caseData);
    const confidence = this.calculateConfidence(similarCases, caseData);

    return {
      convictionProbability: conviction,
      bailProbability: bail,
      successProbability: success,
      confidenceLevel: Utils.confidenceLevel(confidence),
      confidenceScore: confidence,
      factors: this.getKeyFactors(caseData, similarCases, sectionAnalysis),
      bailInsights: this.generateBailInsights(caseData, sectionAnalysis),
    };
  },

  calculateConvictionProbability(caseData, similarCases, sectionAnalysis) {
    let prob = 50; // Base

    // Factor 1: Precedent outcomes (40% weight)
    if (similarCases.length > 0) {
      const convictions = similarCases.filter(c =>
        c.outcome.toLowerCase().includes('conviction') ||
        c.outcome.toLowerCase().includes('death')
      ).length;
      const precedentRate = (convictions / similarCases.length) * 100;
      prob = prob * 0.6 + precedentRate * 0.4;
    }

    // Factor 2: Section severity (30% weight)
    if (sectionAnalysis.length > 0) {
      const avgSuccessRate = sectionAnalysis.reduce((s, a) => s + (a.successRate || 40), 0) / sectionAnalysis.length;
      prob = prob * 0.7 + avgSuccessRate * 0.3;
    }

    // Factor 3: Evidence indicators
    const text = caseData.rawText?.toLowerCase() || caseData.facts.join(' ').toLowerCase();
    if (text.includes('dna evidence') || text.includes('cctv') || text.includes('forensic')) prob += 8;
    if (text.includes('eyewitness') || text.includes('eye witness')) prob += 5;
    if (text.includes('confession')) prob += 6;
    if (text.includes('circumstantial') || text.includes('no direct evidence')) prob -= 10;
    if (text.includes('benefit of doubt')) prob -= 12;
    if (text.includes('hostile witness')) prob -= 8;

    return Utils.clamp(Math.round(prob), 5, 95);
  },

  calculateBailProbability(caseData, sectionAnalysis) {
    let prob = 50;

    // Check section bail eligibility
    const nonBailableSections = sectionAnalysis.filter(s => s.bailEligible === false);
    if (nonBailableSections.length > 0) {
      prob -= nonBailableSections.length * 12;
    }

    const bailableSections = sectionAnalysis.filter(s => s.bailEligible === true);
    if (bailableSections.length > 0 && nonBailableSections.length === 0) {
      prob += 30;
    }

    // Case type adjustments
    const bailStats = STATISTICS.bailStats.byOffenceType;
    const typeMap = {
      'murder': 'murder', 'NDPS': 'NDPS commercial', 'money laundering': 'PMLA',
      'sexual offence': 'rape', 'dowry harassment': '498A', 'cheating': 'economic offence',
    };
    const statKey = typeMap[caseData.caseType];
    if (statKey && bailStats[statKey]) {
      prob = prob * 0.5 + bailStats[statKey].approvalRate * 0.5;
    }

    // Custody period factor
    const text = caseData.rawText?.toLowerCase() || '';
    if (text.includes('prolonged custody') || text.includes('extended detention') || text.match(/in\s+custody\s+for\s+\d+\s+(?:years?|months?)/)) {
      prob += 15;
    }

    // First offender
    if (text.includes('first offender') || text.includes('no prior') || text.includes('clean record')) {
      prob += 10;
    }

    // Flight risk
    if (text.includes('flight risk') || text.includes('absconding') || text.includes('fled')) {
      prob -= 20;
    }

    return Utils.clamp(Math.round(prob), 5, 95);
  },

  calculateSuccessProbability(conviction, bail, caseData) {
    // For defense: success = acquittal + bail
    // Calculate from defense perspective
    const acquittalProb = 100 - conviction;
    const success = (acquittalProb * 0.6 + bail * 0.4);
    return Utils.clamp(Math.round(success), 5, 95);
  },

  calculateConfidence(similarCases, caseData) {
    let confidence = 30; // Base

    // More similar cases = higher confidence
    if (similarCases.length >= 5) confidence += 25;
    else if (similarCases.length >= 3) confidence += 15;
    else if (similarCases.length >= 1) confidence += 8;

    // Strong match scores
    const avgMatch = similarCases.length > 0
      ? similarCases.reduce((s, c) => s + c.matchScore, 0) / similarCases.length
      : 0;
    confidence += (avgMatch / 100) * 30;

    // Sections in database
    if (caseData.sections.length > 0) confidence += 10;

    // Detailed facts
    if (caseData.facts.length >= 3) confidence += 5;

    return Utils.clamp(Math.round(confidence), 10, 90);
  },

  getKeyFactors(caseData, similarCases, sectionAnalysis) {
    const factors = [];
    if (sectionAnalysis.some(s => s.severity === 'extreme'))
      factors.push({ factor: 'Severe sections charged', impact: 'High', direction: 'against' });
    if (sectionAnalysis.some(s => s.bailEligible === false))
      factors.push({ factor: 'Non-bailable offences', impact: 'High', direction: 'against' });
    if (similarCases.some(c => c.outcome.toLowerCase().includes('acquittal')))
      factors.push({ factor: 'Acquittal precedents exist', impact: 'Medium', direction: 'favorable' });

    const text = (caseData.rawText || caseData.facts.join(' ')).toLowerCase();
    if (text.includes('eyewitness')) factors.push({ factor: 'Eyewitness testimony present', impact: 'High', direction: 'against' });
    if (text.includes('circumstantial')) factors.push({ factor: 'Circumstantial evidence only', impact: 'Medium', direction: 'favorable' });
    if (text.includes('confession')) factors.push({ factor: 'Confession recorded', impact: 'High', direction: 'against' });
    if (text.includes('hostile')) factors.push({ factor: 'Hostile witnesses', impact: 'Medium', direction: 'favorable' });
    if (text.includes('motive')) factors.push({ factor: 'Motive established', impact: 'Medium', direction: 'against' });
    if (text.includes('alibi')) factors.push({ factor: 'Alibi defense raised', impact: 'Medium', direction: 'favorable' });

    return factors;
  },

  generateBailInsights(caseData, sectionAnalysis) {
    const insights = {
      trends: [],
      keyFactors: [],
      recommendation: '',
    };

    const nonBailable = sectionAnalysis.filter(s => s.bailEligible === false);
    const bailable = sectionAnalysis.filter(s => s.bailEligible === true);

    if (nonBailable.length === 0 && bailable.length > 0) {
      insights.trends.push('All sections are bailable — bail as a matter of right');
      insights.recommendation = 'Strong case for bail under Section 436 CrPC. Bail is a right for bailable offences.';
    } else if (nonBailable.length > 0) {
      insights.trends.push(`${nonBailable.length} non-bailable section(s) charged`);
      insights.keyFactors.push('Gravity of offence', 'Evidence strength', 'Flight risk assessment', 'Criminal antecedents');
      insights.recommendation = `Bail under Section 437/439 CrPC requires showing reasonable grounds. Focus on cooperation with investigation, community ties, and absence of flight risk.`;
    }

    // NDPS special
    if (caseData.sections.some(s => s.includes('NDPS'))) {
      insights.trends.push('NDPS Act twin conditions under Section 37 apply');
      insights.keyFactors.push('Quantity threshold (small/commercial)', 'Twin conditions satisfaction');
      insights.recommendation = 'Extremely stringent bail conditions. Must satisfy both twin conditions under Section 37.';
    }

    // PMLA special
    if (caseData.sections.some(s => s.includes('PMLA'))) {
      insights.trends.push('PMLA Section 45 twin conditions apply');
      insights.recommendation = 'Very restrictive bail regime. Focus on challenging the predicate offence or procedural irregularities.';
    }

    return insights;
  }
};

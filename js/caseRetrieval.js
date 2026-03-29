// ============================================================
// LEX ANALYTICS — Similar Case Retrieval Engine
// ============================================================

const CaseRetrieval = {
  /**
   * Find similar cases from the precedent database
   * @param {Object} caseData - Parsed case data
   * @returns {Array} Top matches with scores
   */
  findSimilar(caseData) {
    const scored = PRECEDENTS.map(precedent => {
      const score = this.calculateMatchScore(caseData, precedent);
      return { ...precedent, matchScore: Math.round(score) };
    });

    return scored
      .filter(c => c.matchScore > 15)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  },

  /**
   * Calculate composite match score between case and precedent
   */
  calculateMatchScore(caseData, precedent) {
    const sectionScore = Utils.sectionOverlap(caseData.sections, precedent.sections) * 0.40;
    const factScore = Utils.textSimilarity(
      caseData.facts.join(' '),
      precedent.facts
    ) * 0.30;
    const categoryScore = this.categoryMatch(caseData, precedent) * 0.20;
    const typeScore = this.typeMatch(caseData.caseType, precedent.subcategory) * 0.10;

    return Utils.clamp(sectionScore + factScore + categoryScore + typeScore, 0, 98);
  },

  /**
   * Category matching score
   */
  categoryMatch(caseData, precedent) {
    if (caseData.category === precedent.category) return 80;
    return 10;
  },

  /**
   * Case type matching
   */
  typeMatch(type1, type2) {
    if (!type1 || !type2) return 20;
    if (type1.toLowerCase() === type2.toLowerCase()) return 100;
    // Related types
    const related = {
      'murder': ['homicide', 'death penalty', 'culpable homicide'],
      'sexual offence': ['rape', 'sexual assault', 'pocso'],
      'cheating': ['fraud', 'economic offence', 'forgery'],
      'dowry harassment': ['matrimonial dispute', 'cruelty', '498a'],
      'bail application': ['bail', 'anticipatory bail', 'bail reform'],
      'NDPS': ['narcotics', 'drug offence'],
    };
    for (const [key, vals] of Object.entries(related)) {
      if ((key === type1 && vals.some(v => type2.includes(v))) ||
          (key === type2 && vals.some(v => type1.includes(v)))) {
        return 60;
      }
    }
    return 10;
  },

  /**
   * Compare input case with a specific matched case
   * Returns detailed comparison analysis
   */
  compareWithCase(caseData, matchedCase) {
    const similarities = [];
    const differences = [];
    const missingElements = [];

    // Section comparison
    const caseSections = new Set(caseData.sections.map(s => s.toUpperCase()));
    const matchSections = new Set(matchedCase.sections.map(s => s.toUpperCase()));

    const commonSections = [...caseSections].filter(s => matchSections.has(s));
    const uniqueToCase = [...caseSections].filter(s => !matchSections.has(s));
    const uniqueToMatch = [...matchSections].filter(s => !caseSections.has(s));

    if (commonSections.length > 0) {
      similarities.push(`Both cases involve ${commonSections.join(', ')}`);
    }
    if (uniqueToCase.length > 0) {
      differences.push(`Current case additionally involves ${uniqueToCase.join(', ')}`);
    }
    if (uniqueToMatch.length > 0) {
      missingElements.push(`Precedent case also involved ${uniqueToMatch.join(', ')} which may be relevant`);
    }

    // Category comparison
    if (caseData.category === matchedCase.category) {
      similarities.push(`Both are ${caseData.category} cases`);
    } else {
      differences.push(`Different case categories: ${caseData.category} vs ${matchedCase.category}`);
    }

    // Court level
    if (caseData.court && matchedCase.court) {
      if (caseData.court.toLowerCase().includes(matchedCase.court.split(' ')[0].toLowerCase())) {
        similarities.push(`Similar court level`);
      }
    }

    const alignmentScore = matchedCase.matchScore || 50;
    const classification = Utils.alignmentStrength(alignmentScore);

    return {
      similarities,
      differences,
      missingElements,
      alignmentScore,
      classification
    };
  },

  /**
   * Generate overall comparison analysis across all matched cases
   */
  generateComparisonAnalysis(caseData, matchedCases) {
    if (matchedCases.length === 0) {
      return {
        alignmentScore: 0,
        classification: 'Weak',
        summary: 'No sufficiently similar precedents found in the database.',
        comparisons: []
      };
    }

    const comparisons = matchedCases.slice(0, 5).map(mc => ({
      caseName: mc.caseName,
      ...this.compareWithCase(caseData, mc)
    }));

    const avgScore = Math.round(
      comparisons.reduce((sum, c) => sum + c.alignmentScore, 0) / comparisons.length
    );

    return {
      alignmentScore: avgScore,
      classification: Utils.alignmentStrength(avgScore),
      summary: this.generateComparisonSummary(avgScore, matchedCases.length),
      comparisons
    };
  },

  generateComparisonSummary(avgScore, count) {
    if (avgScore >= 75) return `Strong precedent alignment found across ${count} similar cases. The case has well-established judicial precedents supporting analysis.`;
    if (avgScore >= 40) return `Moderate precedent alignment identified with ${count} partially similar cases. Some judicial precedents are applicable but case-specific factors may influence outcome.`;
    return `Weak precedent alignment. Only ${count} cases with limited similarity were found. The case may involve novel legal questions or unique fact patterns.`;
  }
};

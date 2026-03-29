// ============================================================
// LEX ANALYTICS — Section-wise Analyzer
// ============================================================

const SectionAnalyzer = {
  /**
   * Analyze all sections found in the case
   */
  analyze(sections) {
    return sections.map(section => {
      const data = SECTIONS_DB[section.toUpperCase()] || SECTIONS_DB[section];
      if (data) {
        return { section, ...data, found: true };
      }
      return {
        section,
        title: 'Section data not available',
        description: 'This section is not in the current database',
        successRate: null,
        typicalOutcome: 'Data not available',
        bailEligible: null,
        severity: 'unknown',
        found: false,
      };
    });
  },

  /**
   * Get aggregated statistics for all sections
   */
  getAggregateStats(sectionAnalysis) {
    const found = sectionAnalysis.filter(s => s.found);
    if (found.length === 0) return null;

    const avgSuccess = Math.round(found.reduce((s, a) => s + (a.successRate || 0), 0) / found.length);
    const mostSevere = this.getMostSevere(found);
    const allBailable = found.every(s => s.bailEligible !== false);
    const anyNonBailable = found.some(s => s.bailEligible === false);

    return {
      averageSuccessRate: avgSuccess,
      mostSevereSection: mostSevere,
      allBailable,
      anyNonBailable,
      totalSections: sectionAnalysis.length,
      foundInDb: found.length,
    };
  },

  getMostSevere(sections) {
    const severityOrder = ['extreme', 'high', 'medium', 'low', 'procedural'];
    for (const level of severityOrder) {
      const match = sections.find(s => s.severity === level);
      if (match) return match;
    }
    return sections[0];
  }
};

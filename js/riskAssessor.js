// ============================================================
// LEX ANALYTICS — Risk Assessor
// ============================================================

const RiskAssessor = {
  /**
   * Assess risks in the case
   */
  assess(caseData, similarCases, sectionAnalysis) {
    const issues = [];
    const text = (caseData.rawText || caseData.facts.join(' ')).toLowerCase();

    // Evidence gaps
    if (!text.includes('witness') && !text.includes('eyewitness')) {
      issues.push({ type: 'evidence', severity: 'moderate', description: 'No witness testimony mentioned — case may rely on circumstantial evidence' });
    }
    if (!text.includes('forensic') && !text.includes('dna') && !text.includes('medical') && !text.includes('post-mortem')) {
      if (['murder', 'sexual offence', 'assault'].includes(caseData.caseType)) {
        issues.push({ type: 'evidence', severity: 'high', description: 'No forensic/medical evidence mentioned for a case requiring physical evidence' });
      }
    }
    if (text.includes('hostile witness') || text.includes('turned hostile')) {
      issues.push({ type: 'evidence', severity: 'high', description: 'Hostile witness(es) — prosecution case weakened significantly' });
    }
    if (text.includes('delay') || text.includes('belated') || text.includes('late fir') || text.includes('delayed complaint')) {
      issues.push({ type: 'procedural', severity: 'moderate', description: 'Delay in filing FIR/complaint — defense may challenge credibility' });
    }

    // Precedent alignment
    if (similarCases.length === 0) {
      issues.push({ type: 'precedent', severity: 'high', description: 'No similar precedents found — case may involve novel legal questions' });
    } else if (similarCases.length < 3) {
      issues.push({ type: 'precedent', severity: 'moderate', description: 'Limited precedent alignment — fewer than 3 similar cases found' });
    }

    // Contradictory facts
    if (text.includes('contradict') || text.includes('inconsisten')) {
      issues.push({ type: 'factual', severity: 'high', description: 'Contradictions or inconsistencies detected in facts/testimony' });
    }
    if (text.includes('no motive') || text.includes('motive unclear') || text.includes('without motive')) {
      issues.push({ type: 'factual', severity: 'moderate', description: 'Motive not established — weakens prosecution case' });
    }

    // Section risks
    const unknownSections = sectionAnalysis.filter(s => !s.found);
    if (unknownSections.length > 0) {
      issues.push({ type: 'data', severity: 'low', description: `${unknownSections.length} section(s) not found in database — analysis may be incomplete` });
    }

    // Missing elements
    if (caseData.sections.length === 0) {
      issues.push({ type: 'input', severity: 'high', description: 'No legal sections identified — manual input recommended for accurate analysis' });
    }
    if (caseData.facts.length < 2) {
      issues.push({ type: 'input', severity: 'moderate', description: 'Insufficient facts extracted — provide more detailed case description' });
    }

    // Overall risk level
    const highCount = issues.filter(i => i.severity === 'high').length;
    const modCount = issues.filter(i => i.severity === 'moderate').length;
    let riskLevel, riskScore;

    if (highCount >= 2) { riskLevel = 'High'; riskScore = 80; }
    else if (highCount >= 1 || modCount >= 3) { riskLevel = 'Moderate'; riskScore = 55; }
    else if (modCount >= 1) { riskLevel = 'Moderate'; riskScore = 40; }
    else { riskLevel = 'Low'; riskScore = 20; }

    // Adjust score based on issue count
    riskScore = Utils.clamp(riskScore + issues.length * 3, 10, 95);

    return { riskLevel, riskScore, issues };
  }
};

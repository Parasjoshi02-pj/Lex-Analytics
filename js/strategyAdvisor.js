// ============================================================
// LEX ANALYTICS — Strategy Advisor
// ============================================================

const StrategyAdvisor = {
  /**
   * Generate strategic analysis
   */
  analyze(caseData, prediction, riskAssessment, similarCases, sectionAnalysis) {
    return {
      strengths: this.identifyStrengths(caseData, prediction, similarCases),
      weaknesses: this.identifyWeaknesses(caseData, riskAssessment, prediction),
      missingArguments: this.identifyMissingArguments(caseData, similarCases, sectionAnalysis),
      defense: this.defenseStrategy(caseData, prediction, similarCases, sectionAnalysis),
      prosecution: this.prosecutionStrategy(caseData, prediction, similarCases),
    };
  },

  identifyStrengths(caseData, prediction, similarCases) {
    const strengths = [];
    const text = (caseData.rawText || caseData.facts.join(' ')).toLowerCase();

    if (prediction.bailProbability >= 60) strengths.push('High probability of bail based on section analysis and precedents');
    if (prediction.convictionProbability <= 35) strengths.push('Low conviction probability — prosecution case appears weak');
    if (text.includes('alibi')) strengths.push('Alibi defense available');
    if (text.includes('no eyewitness') || text.includes('no witness')) strengths.push('Absence of direct eyewitness testimony');
    if (text.includes('circumstantial')) strengths.push('Case relies on circumstantial evidence — requires complete chain');
    if (text.includes('first offender') || text.includes('clean record')) strengths.push('Clean criminal record — favorable for bail and sentencing');
    if (text.includes('hostile')) strengths.push('Hostile witnesses weaken prosecution case');
    if (text.includes('delay')) strengths.push('Delay in FIR/complaint can be used to challenge prosecution');
    if (similarCases.some(c => c.outcome.toLowerCase().includes('acquittal'))) strengths.push('Acquittal precedents available in similar cases');
    if (text.includes('cooperation') || text.includes('cooperating')) strengths.push('Cooperation with investigation — favorable for bail');

    return strengths.length > 0 ? strengths : ['Further case details needed to identify specific strengths'];
  },

  identifyWeaknesses(caseData, riskAssessment, prediction) {
    const weaknesses = [];
    const text = (caseData.rawText || caseData.facts.join(' ')).toLowerCase();

    if (prediction.convictionProbability >= 65) weaknesses.push('High conviction probability based on precedent patterns');
    if (prediction.bailProbability <= 30) weaknesses.push('Low bail probability — severe sections charged');
    riskAssessment.issues.filter(i => i.severity === 'high').forEach(i => weaknesses.push(i.description));
    if (text.includes('confession')) weaknesses.push('Confession recorded — even if retracted, carries evidentiary weight');
    if (text.includes('recovery') || text.includes('recovered')) weaknesses.push('Recovery of evidence/weapon strengthens prosecution');
    if (text.includes('motive established') || text.includes('clear motive')) weaknesses.push('Motive established by prosecution');
    if (text.includes('flight risk') || text.includes('absconding')) weaknesses.push('Flight risk or absconding history — negative for bail');
    if (text.includes('repeat offender') || text.includes('prior conviction')) weaknesses.push('Prior criminal history — aggravating factor');

    return weaknesses.length > 0 ? weaknesses : ['No critical weaknesses identified based on available information'];
  },

  identifyMissingArguments(caseData, similarCases, sectionAnalysis) {
    const missing = [];
    const text = (caseData.rawText || caseData.facts.join(' ')).toLowerCase();

    if (!text.includes('article 21') && caseData.category === 'criminal') {
      missing.push('Article 21 (right to personal liberty) argument for bail/rights protection');
    }
    if (!text.includes('section 41') && !text.includes('41a') && caseData.category === 'criminal') {
      missing.push('Arnesh Kumar guidelines compliance (Section 41/41A CrPC) — challenge arrest legality');
    }
    if (sectionAnalysis.some(s => s.section.includes('498A')) && !text.includes('misuse')) {
      missing.push('498A misuse argument — cite Sushil Kumar Sharma and Rajesh Sharma precedents');
    }
    if (!text.includes('bail is the rule')) {
      missing.push("'Bail is the rule, jail is the exception' — State of Rajasthan v. Balchand principle");
    }
    if (text.includes('ndps') && !text.includes('section 50') && !text.includes('compliance')) {
      missing.push('NDPS Act Section 50 compliance — mandatory for search validity');
    }
    if (!text.includes('speedy trial') && caseData.category === 'criminal') {
      missing.push('Right to speedy trial under Article 21 — Hussainara Khatoon principle');
    }

    return missing;
  },

  defenseStrategy(caseData, prediction, similarCases, sectionAnalysis) {
    const strategies = [];

    // Bail strategy
    if (prediction.bailProbability >= 40) {
      strategies.push({ action: 'Apply for bail emphasizing personal liberty under Article 21', priority: 'High', rationale: 'Favorable bail conditions based on section analysis' });
    }
    if (prediction.bailProbability < 40 && prediction.bailProbability > 15) {
      strategies.push({ action: 'Apply for anticipatory bail under Section 438 CrPC with conditions', priority: 'High', rationale: 'Pre-emptive liberty protection given low but possible bail prospects' });
    }

    // Evidence challenges
    const text = (caseData.rawText || caseData.facts.join(' ')).toLowerCase();
    if (text.includes('confession')) {
      strategies.push({ action: 'Challenge voluntariness of confession under Sections 24-27 Evidence Act', priority: 'High', rationale: 'Retracted or coerced confessions are inadmissible' });
    }
    if (text.includes('electronic') || text.includes('digital') || text.includes('cctv')) {
      strategies.push({ action: 'Verify Section 65B certificate for electronic evidence', priority: 'Medium', rationale: 'Without valid certificate, electronic evidence is inadmissible (Anwar P.V.)' });
    }

    // Section-specific
    if (sectionAnalysis.some(s => s.section.includes('302'))) {
      strategies.push({ action: 'Argue for reduction to Section 304 (Part I or II)', priority: 'High', rationale: 'If premeditation cannot be proven, the charge should be culpable homicide' });
    }
    if (sectionAnalysis.some(s => s.section.includes('498A'))) {
      strategies.push({ action: 'Seek quashing under Section 482 CrPC or approach family welfare committee', priority: 'Medium', rationale: 'Courts increasingly scrutinize 498A cases for misuse' });
    }

    // Procedural challenges
    strategies.push({ action: 'Verify FIR registration compliance with Lalita Kumari guidelines', priority: 'Medium', rationale: 'Procedural lapses can invalidate prosecution case' });
    strategies.push({ action: 'Examine investigation quality and compliance with CrPC procedures', priority: 'Medium', rationale: 'Faulty investigation can lead to acquittal (State of Gujarat v. Kishanbhai)' });

    return strategies;
  },

  prosecutionStrategy(caseData, prediction, similarCases) {
    const strategies = [];
    const text = (caseData.rawText || caseData.facts.join(' ')).toLowerCase();

    if (prediction.convictionProbability >= 50) {
      strategies.push({ action: 'Strengthen evidence chain with forensic and documentary proof', priority: 'High', rationale: 'Precedent patterns favor conviction; solidify evidence' });
    }
    if (text.includes('witness')) {
      strategies.push({ action: 'Protect key witnesses and ensure their testimony consistency', priority: 'High', rationale: 'Hostile witnesses are the primary cause of acquittals' });
    }
    strategies.push({ action: 'Establish clear motive and opportunity timeline', priority: 'Medium', rationale: 'Complete circumstantial chain requires motive establishment' });
    strategies.push({ action: 'Oppose bail citing gravity of offence and evidence tampering risk', priority: 'Medium', rationale: 'Release may lead to witness intimidation or evidence destruction' });

    return strategies;
  }
};

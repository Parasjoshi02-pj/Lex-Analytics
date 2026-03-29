// ============================================================
// LEX ANALYTICS — Judge Intelligence Analyzer
// ============================================================

const JudgeAnalyzer = {
  /**
   * Analyze judge behavioral patterns
   */
  analyze(judgeName) {
    if (!judgeName || judgeName.trim() === '') {
      return { available: false, message: 'No judge information provided. Judge analysis is unavailable.' };
    }

    const judge = this.findJudge(judgeName);
    if (!judge) {
      return { available: false, message: `No data available for "${judgeName}". The judge may not be in our database.` };
    }

    return {
      available: true,
      name: judge.name,
      court: judge.court,
      convictionRate: judge.convictionRate,
      bailApprovalRate: judge.bailApprovalRate,
      sectionTendencies: judge.sectionTendencies,
      profile: judge.profile,
      bias: judge.bias,
      behavioralSummary: this.generateSummary(judge),
      metrics: this.calculateMetrics(judge),
    };
  },

  /**
   * Find judge in database by name
   */
  findJudge(name) {
    const normalized = name.toLowerCase().replace(/justice|hon'?ble|judge|shri|smt|dr\.?/gi, '').trim();
    return JUDGES_DB.find(j => {
      const jName = j.name.toLowerCase().replace(/justice|hon'?ble/gi, '').trim();
      return jName.includes(normalized) || normalized.includes(jName.split(' ').pop());
    });
  },

  /**
   * Generate behavioral summary
   */
  generateSummary(judge) {
    const parts = [];

    // Conviction tendency
    if (judge.convictionRate >= 62) {
      parts.push(`The judge demonstrates a stricter approach with an above-average conviction rate of ${judge.convictionRate}%.`);
    } else if (judge.convictionRate <= 55) {
      parts.push(`The judge shows a more measured approach with a conviction rate of ${judge.convictionRate}%, slightly below the national average.`);
    } else {
      parts.push(`The judge maintains a balanced conviction rate of ${judge.convictionRate}%, close to the national average.`);
    }

    // Bail tendency
    if (judge.bailApprovalRate >= 52) {
      parts.push(`Bail approval rate of ${judge.bailApprovalRate}% indicates a relatively liberal stance on personal liberty.`);
    } else if (judge.bailApprovalRate <= 42) {
      parts.push(`Below-average bail approval rate of ${judge.bailApprovalRate}% suggests a cautious approach to granting bail.`);
    } else {
      parts.push(`Bail approval rate of ${judge.bailApprovalRate}% is within the expected range.`);
    }

    // Bias indicator
    const biasMap = {
      'progressive': 'Known for progressive jurisprudence, particularly in matters of fundamental rights and personal liberty.',
      'liberal': 'Tends toward a liberal interpretation of personal liberty and bail provisions.',
      'strict': 'Demonstrates a stricter approach, particularly in serious criminal and economic offence cases.',
      'strict-analytical': 'Takes a strict, analytical approach with emphasis on rule of law and statutory interpretation.',
      'balanced': 'Maintains a balanced judicial temperament across case types.',
      'balanced-liberal': 'Generally balanced with a slight lean toward liberal interpretation of rights.',
      'balanced-strict': 'Generally balanced but stricter in specific categories like sexual offences.',
    };

    if (biasMap[judge.bias]) {
      parts.push(biasMap[judge.bias]);
    }

    return parts.join(' ');
  },

  /**
   * Calculate comparative metrics
   */
  calculateMetrics(judge) {
    const avgConviction = JUDGES_DB.reduce((s, j) => s + j.convictionRate, 0) / JUDGES_DB.length;
    const avgBail = JUDGES_DB.reduce((s, j) => s + j.bailApprovalRate, 0) / JUDGES_DB.length;

    return {
      convictionVsAvg: Math.round(judge.convictionRate - avgConviction),
      bailVsAvg: Math.round(judge.bailApprovalRate - avgBail),
      strictnessScore: Math.round((judge.convictionRate / avgConviction) * 50 + ((100 - judge.bailApprovalRate) / (100 - avgBail)) * 50),
    };
  }
};

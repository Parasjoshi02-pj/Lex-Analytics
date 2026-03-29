// ============================================================
// LEX ANALYTICS — Core Analysis Engine with AI Integration
// ============================================================
// Orchestrates all analysis modules and optionally enhances with Gemini AI

const AnalysisEngine = {
  apiKey: 'AIzaSyCYlKk0wj_hCWIBgYCMtg_etW8GZGNvckQ',
  lastResult: null,

  /**
   * Get API key (hardcoded)
   */
  getApiKey() {
    return this.apiKey;
  },

  /**
   * Run full analysis pipeline — strict order per system spec
   */
  async runFullAnalysis(rawText, metadata = {}) {
    // Step 1: Parse case
    const caseData = CaseParser.parse(rawText, metadata);

    // Step 2: Section Analysis
    const sectionAnalysis = SectionAnalyzer.analyze(caseData.sections);
    const sectionStats = SectionAnalyzer.getAggregateStats(sectionAnalysis);

    // Step 3: Similar Case Matching
    const similarCases = CaseRetrieval.findSimilar(caseData);

    // Step 4: Comparison Analysis
    const comparison = CaseRetrieval.generateComparisonAnalysis(caseData, similarCases);

    // Step 5: Outcome Prediction
    const prediction = OutcomePredictor.predict(caseData, similarCases, sectionAnalysis);

    // Step 6: Judge Analysis
    const judgeInsights = JudgeAnalyzer.analyze(caseData.judge || metadata.judge);

    // Step 7: Risk Assessment
    const riskAssessment = RiskAssessor.assess(caseData, similarCases, sectionAnalysis);

    // Step 8: Strategic Analysis
    const strategy = StrategyAdvisor.analyze(caseData, prediction, riskAssessment, similarCases, sectionAnalysis);

    // Step 9: Timeline Prediction
    const timelinePrediction = TimelinePredictor.predict(caseData);

    // Step 10: Dashboard Metrics
    const dashboard = {
      successScore: prediction.successProbability,
      riskScore: riskAssessment.riskScore,
      confidenceScore: prediction.confidenceScore,
    };

    // Build result in strict JSON structure
    const result = {
      caseSummary: {
        facts: caseData.facts,
        issues: caseData.issues,
        parties: caseData.parties,
        court: caseData.court,
        judge: caseData.judge,
        caseType: caseData.caseType,
        category: caseData.category,
        state: caseData.state,
      },
      sections: caseData.sections,
      sectionAnalysis,
      sectionStats,
      timeline: caseData.timeline,
      similarCases,
      comparison: {
        alignmentScore: comparison.alignmentScore,
        classification: comparison.classification,
        summary: comparison.summary,
        details: comparison.comparisons,
      },
      prediction: {
        convictionProbability: prediction.convictionProbability,
        bailProbability: prediction.bailProbability,
        successProbability: prediction.successProbability,
        confidenceLevel: prediction.confidenceLevel,
        confidenceScore: prediction.confidenceScore,
        factors: prediction.factors,
      },
      bailInsights: prediction.bailInsights,
      judgeInsights,
      riskAssessment: {
        riskLevel: riskAssessment.riskLevel,
        riskScore: riskAssessment.riskScore,
        issues: riskAssessment.issues,
      },
      strategy: {
        strengths: strategy.strengths,
        weaknesses: strategy.weaknesses,
        missingArguments: strategy.missingArguments,
        defense: strategy.defense,
        prosecution: strategy.prosecution,
      },
      timelinePrediction,
      dashboard,
    };

    this.lastResult = result;

    // Enhance with AI if API key available
    if (this.getApiKey()) {
      try {
        const aiEnhanced = await this.enhanceWithAI(result, rawText);
        if (aiEnhanced) {
          result.aiSummary = aiEnhanced.summary || '';
          result.aiInsights = aiEnhanced.insights || [];
          result.aiEnhanced = true;
        }
      } catch (err) {
        console.warn('AI enhancement failed, using rule-based analysis:', err.message);
        result.aiEnhanced = false;
        result.aiError = err.message;
      }
    } else {
      result.aiEnhanced = false;
    }

    return result;
  },

  /**
   * Enhance analysis with Gemini AI
   */
  async enhanceWithAI(result, rawText) {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const prompt = this.buildAIPrompt(result, rawText);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              topP: 0.8,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty AI response');

      return JSON.parse(text);
    } catch (err) {
      throw err;
    }
  },

  /**
   * Build the AI prompt with case context and grounding data
   */
  buildAIPrompt(result, rawText) {
    return `You are a legal AI analyst specializing in Indian law. Analyze this case and provide enhanced insights.

CASE TEXT:
${rawText.substring(0, 3000)}

PARSED DATA:
- Case Type: ${result.caseSummary.caseType}
- Category: ${result.caseSummary.category}
- Sections: ${result.sections.join(', ')}
- Court: ${result.caseSummary.court}
- Judge: ${result.caseSummary.judge || 'Not specified'}

RULE-BASED ANALYSIS RESULTS:
- Conviction Probability: ${result.prediction.convictionProbability}%
- Bail Probability: ${result.prediction.bailProbability}%
- Success Probability: ${result.prediction.successProbability}%
- Risk Level: ${result.riskAssessment.riskLevel}
- Similar Cases Found: ${result.similarCases.length}
- Top Match: ${result.similarCases[0]?.caseName || 'None'}

Provide your response as JSON with these fields:
{
  "summary": "A concise 3-4 sentence professional legal summary of the case and its prospects",
  "insights": [
    "Specific actionable insight 1",
    "Specific actionable insight 2",
    "Specific actionable insight 3",
    "Specific actionable insight 4",
    "Specific actionable insight 5"
  ]
}

RULES:
- Be analytical and data-driven
- Reference real Indian legal principles
- Do NOT fabricate case citations
- Provide actionable insights only
- Maintain professional legal tone
- Do NOT provide legal advice; provide analytical insights only`;
  },

  /**
   * AI Copilot - answer follow-up questions
   */
  async askCopilot(question) {
    if (!this.lastResult) {
      return 'Please analyze a case first before asking follow-up questions.';
    }

    const apiKey = this.getApiKey();

    // If AI available, use it
    if (apiKey) {
      try {
        const prompt = `You are the AI Legal Copilot of Lex Analytics, specializing in Indian law.

CURRENT CASE CONTEXT:
- Type: ${this.lastResult.caseSummary.caseType}
- Sections: ${this.lastResult.sections.join(', ')}
- Conviction Probability: ${this.lastResult.prediction.convictionProbability}%
- Bail Probability: ${this.lastResult.prediction.bailProbability}%
- Risk Level: ${this.lastResult.riskAssessment.riskLevel}
- Strengths: ${this.lastResult.strategy.strengths.join('; ')}
- Weaknesses: ${this.lastResult.strategy.weaknesses.join('; ')}
- Similar Cases: ${this.lastResult.similarCases.slice(0, 3).map(c => c.caseName).join(', ')}

USER QUESTION: ${question}

Provide a concise, analytical, and actionable response based on the case context. Reference Indian legal principles where relevant. Do NOT provide legal advice; provide analytical insights only. Keep your response under 300 words.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
            }),
          }
        );

        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || this.fallbackCopilot(question);
      } catch {
        return this.fallbackCopilot(question);
      }
    }

    return this.fallbackCopilot(question);
  },

  /**
   * Rule-based copilot fallback
   */
  fallbackCopilot(question) {
    const q = question.toLowerCase();
    const r = this.lastResult;
    if (!r) return 'Please analyze a case first.';

    if (q.includes('weakest') || q.includes('weak point')) {
      return `Based on the analysis, the primary weaknesses are:\n\n${r.strategy.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\nRisk Level: ${r.riskAssessment.riskLevel} (${r.riskAssessment.riskScore}%)`;
    }
    if (q.includes('bail') || q.includes('chances of bail')) {
      return `Bail Probability: ${r.prediction.bailProbability}%\n\n${r.bailInsights.recommendation || 'Consider applying under appropriate CrPC provisions.'}\n\nKey Factors:\n${(r.bailInsights.keyFactors || []).map(f => `• ${f}`).join('\n')}`;
    }
    if (q.includes('precedent') || q.includes('similar case')) {
      if (r.similarCases.length === 0) return 'No similar precedents found in the database.';
      return `Top Precedents:\n\n${r.similarCases.slice(0, 5).map((c, i) => `${i + 1}. ${c.caseName} (${c.court}, ${c.year}) — ${c.matchScore}% match\n   Outcome: ${c.outcome}`).join('\n\n')}`;
    }
    if (q.includes('strength')) {
      return `Case Strengths:\n\n${r.strategy.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    }
    if (q.includes('strategy') || q.includes('recommend') || q.includes('improve')) {
      return `Defense Strategies:\n\n${r.strategy.defense.map((s, i) => `${i + 1}. [${s.priority}] ${s.action}\n   Rationale: ${s.rationale}`).join('\n\n')}`;
    }
    if (q.includes('risk') || q.includes('alert')) {
      return `Risk Level: ${r.riskAssessment.riskLevel} (${r.riskAssessment.riskScore}%)\n\nIssues:\n${r.riskAssessment.issues.map((i, idx) => `${idx + 1}. [${i.severity.toUpperCase()}] ${i.description}`).join('\n')}`;
    }
    if (q.includes('conviction')) {
      return `Conviction Probability: ${r.prediction.convictionProbability}% (Confidence: ${r.prediction.confidenceLevel})\n\nKey Factors:\n${r.prediction.factors.map(f => `• ${f.factor} — ${f.impact} [${f.direction}]`).join('\n')}`;
    }
    if (q.includes('timeline') || q.includes('duration') || q.includes('how long')) {
      return `Estimated Duration: ${r.timelinePrediction.duration.estimated}\nHearings: ~${r.timelinePrediction.hearings.estimated}\nDelay Probability: ${r.timelinePrediction.delayProbability}%\nComplexity: ${r.timelinePrediction.complexity}`;
    }
    if (q.includes('judge')) {
      if (r.judgeInsights.available) return r.judgeInsights.behavioralSummary;
      return r.judgeInsights.message;
    }

    return `Based on the current case analysis:\n\n• Success Probability: ${r.prediction.successProbability}%\n• Bail Probability: ${r.prediction.bailProbability}%\n• Risk Level: ${r.riskAssessment.riskLevel}\n\nYou can ask about: weakest points, bail chances, precedents, strategies, risks, conviction probability, timeline, or judge insights.`;
  },
};

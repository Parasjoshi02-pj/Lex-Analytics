// ============================================================
// LEX ANALYTICS — Case Parser Module
// ============================================================
// Extracts and structures case information from raw text input

const CaseParser = {
  /**
   * Parse raw case text and metadata into structured case data
   */
  parse(rawText, metadata = {}) {
    const caseData = {
      rawText: rawText.trim(),
      facts: this.extractFacts(rawText),
      issues: this.extractIssues(rawText),
      sections: this.extractSections(rawText),
      parties: this.extractParties(rawText),
      timeline: this.extractTimeline(rawText),
      court: metadata.court || this.detectCourt(rawText),
      judge: metadata.judge || this.detectJudge(rawText),
      caseType: metadata.caseType || this.detectCaseType(rawText),
      state: metadata.state || '',
      category: this.detectCategory(rawText),
    };
    return caseData;
  },

  /**
   * Extract key facts from the text
   */
  extractFacts(text) {
    const facts = [];
    const sentences = text.split(/[.!]\s+/).filter(s => s.trim().length > 15);
    const factKeywords = ['accused', 'victim', 'complainant', 'alleged', 'reportedly', 'incident', 'occurred', 'arrested', 'charged', 'evidence', 'witness', 'recovered', 'seized', 'confiscated', 'statement', 'murder', 'assault', 'fraud', 'stolen', 'threat', 'injury', 'death', 'killed', 'committed', 'offence', 'crime'];

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (factKeywords.some(kw => lower.includes(kw))) {
        facts.push(sentence.trim());
      }
    }

    if (facts.length === 0) {
      // Fallback: take first 5 meaningful sentences
      return sentences.slice(0, 5).map(s => s.trim());
    }
    return facts.slice(0, 10);
  },

  /**
   * Extract legal issues
   */
  extractIssues(text) {
    const issues = [];
    const issuePatterns = [
      /whether\s+.*?[.?]/gi,
      /the\s+(?:main|primary|key|central)\s+(?:issue|question).*?[.?]/gi,
      /(?:issue|question)\s+(?:is|was|are|were)\s+.*?[.?]/gi,
    ];

    for (const pattern of issuePatterns) {
      const matches = text.match(pattern);
      if (matches) issues.push(...matches.map(m => m.trim()));
    }

    if (issues.length === 0) {
      // Generate from sections
      const sections = this.extractSections(text);
      if (sections.length > 0) {
        issues.push(`Whether the accused is guilty under ${sections.join(', ')}`);
      }
      issues.push('Determination of guilt based on available evidence');
    }
    return [...new Set(issues)].slice(0, 5);
  },

  /**
   * Extract legal sections (IPC, CrPC, CPC, NDPS, PMLA, POCSO, IT Act, etc.)
   */
  extractSections(text) {
    const sectionPatterns = [
      /(?:section|sec\.?|s\.?)\s*(\d+[A-Z]?)\s*(?:of\s+)?(?:the\s+)?(?:IPC|Indian\s+Penal\s+Code)/gi,
      /(?:IPC)\s*(?:section|sec\.?)?\s*(\d+[A-Z]?)/gi,
      /(?:section|sec\.?|s\.?)\s*(\d+[A-Z]?)\s*(?:of\s+)?(?:the\s+)?(?:CrPC|Cr\.?P\.?C\.?|Code\s+of\s+Criminal\s+Procedure)/gi,
      /(?:CrPC|Cr\.?P\.?C\.?)\s*(?:section|sec\.?)?\s*(\d+[A-Z]?)/gi,
      /(?:section|sec\.?)\s*(\d+[A-Z]?)\s*(?:of\s+)?(?:the\s+)?(?:CPC|C\.?P\.?C\.?|Code\s+of\s+Civil\s+Procedure)/gi,
      /(?:NDPS\s+Act)\s*(?:section|sec\.?)?\s*(\d+)/gi,
      /(?:section|sec\.?)\s*(\d+)\s*(?:of\s+)?(?:the\s+)?(?:NDPS\s+Act)/gi,
      /(?:PMLA)\s*(?:section|sec\.?)?\s*(\d+)/gi,
      /(?:POCSO\s+Act)\s*(?:section|sec\.?)?\s*(\d+)/gi,
      /(?:section|sec\.?)\s*(\d+)\s*(?:of\s+)?(?:the\s+)?(?:POCSO\s+Act)/gi,
      /(?:IT\s+Act)\s*(?:section|sec\.?)?\s*(\d+[A-Z]?)/gi,
      /(?:Article)\s*(\d+[A-Z]?)/gi,
      /(\d+[A-Z]?)\s+IPC/gi,
      /(\d+[A-Z]?)\s+CrPC/gi,
    ];

    const sections = new Set();
    for (const pattern of sectionPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let sectionNum = match[1];
        let prefix = '';
        const fullMatch = match[0].toLowerCase();
        if (fullMatch.includes('ipc') || fullMatch.includes('indian penal')) prefix = 'IPC ';
        else if (fullMatch.includes('crpc') || fullMatch.includes('cr.p.c') || fullMatch.includes('criminal procedure')) prefix = 'CrPC ';
        else if (fullMatch.includes('cpc') || fullMatch.includes('c.p.c') || fullMatch.includes('civil procedure')) prefix = 'CPC ';
        else if (fullMatch.includes('ndps')) prefix = 'NDPS Act ';
        else if (fullMatch.includes('pmla')) prefix = 'PMLA ';
        else if (fullMatch.includes('pocso')) prefix = 'POCSO Act ';
        else if (fullMatch.includes('it act')) prefix = 'IT Act ';
        else if (fullMatch.includes('article')) prefix = 'Article ';
        sections.add(prefix + sectionNum);
      }
    }
    return [...sections];
  },

  /**
   * Extract parties involved
   */
  extractParties(text) {
    const parties = { petitioner: [], respondent: [], accused: [], victim: [], witness: [] };
    const petitionerMatch = text.match(/(?:petitioner|plaintiff|appellant|complainant)[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s+v[s.]?\s+|\n|$)/gi);
    const respondentMatch = text.match(/(?:respondent|defendant)[:\s]+([A-Z][a-zA-Z\s]+?)(?:\n|$)/gi);
    const vsMatch = text.match(/([A-Z][a-zA-Z\s.]+?)\s+v[s.]?\s+([A-Z][a-zA-Z\s.]+?)(?:\n|,|$)/);

    if (vsMatch) {
      parties.petitioner.push(vsMatch[1].trim());
      parties.respondent.push(vsMatch[2].trim());
    }

    const accusedMatch = text.match(/(?:accused|defendant)\s+(?:is|was|named)\s+([A-Z][a-zA-Z\s]+?)(?:\.|,|\n)/gi);
    if (accusedMatch) {
      accusedMatch.forEach(m => {
        const name = m.replace(/accused|defendant|is|was|named/gi, '').trim().replace(/[.,]$/, '');
        if (name.length > 2) parties.accused.push(name);
      });
    }

    return parties;
  },

  /**
   * Extract timeline of events
   */
  extractTimeline(text) {
    const timeline = [];
    const datePatterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})[,:\s]+(.+?)(?:\.|$)/gm,
      /(?:on|dated?)\s+(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})[,:\s]+(.+?)(?:\.|$)/gi,
      /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})[,:\s]+(.+?)(?:\.|$)/gi,
      /(\d{4})[:\s]+(.+?(?:filed|registered|arrested|occurred|incident|FIR|complaint|charge|trial|hearing).*?)(?:\.|$)/gi,
    ];

    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        timeline.push({ date: match[1].trim(), event: match[2].trim() });
      }
    }

    if (timeline.length === 0) {
      // Create generic timeline from facts
      const sections = this.extractSections(text);
      timeline.push({ date: 'Date not specified', event: 'Incident reported / FIR filed' });
      if (sections.length) timeline.push({ date: 'Date not specified', event: `Charges framed under ${sections.join(', ')}` });
      timeline.push({ date: 'Present', event: 'Case under analysis' });
    }
    return timeline;
  },

  /**
   * Detect court from text
   */
  detectCourt(text) {
    const l = text.toLowerCase();
    if (l.includes('supreme court')) return 'Supreme Court of India';
    if (l.match(/(?:high court|hc)\s+(?:of\s+)?(\w+)/)) {
      const m = l.match(/(?:high court|hc)\s+(?:of\s+)?(\w+)/);
      return `${m[1].charAt(0).toUpperCase() + m[1].slice(1)} High Court`;
    }
    if (l.includes('high court')) return 'High Court';
    if (l.includes('sessions court')) return 'Sessions Court';
    if (l.includes('district court')) return 'District Court';
    if (l.includes('magistrate')) return 'Magistrate Court';
    if (l.includes('fast track')) return 'Fast Track Court';
    return 'District Court';
  },

  /**
   * Detect judge name from text
   */
  detectJudge(text) {
    const judgeMatch = text.match(/(?:justice|hon'?ble|judge)\s+([A-Z][a-zA-Z.\s]+?)(?:\s+and|\s+presiding|,|\n|$)/i);
    return judgeMatch ? judgeMatch[1].trim() : '';
  },

  /**
   * Detect case type
   */
  detectCaseType(text) {
    const l = text.toLowerCase();
    if (l.match(/murder|homicide|302\s+ipc|killed|death/)) return 'murder';
    if (l.match(/rape|sexual\s+assault|376\s+ipc|pocso/)) return 'sexual offence';
    if (l.match(/ndps|narcotic|drug|ganja|charas|heroin/)) return 'NDPS';
    if (l.match(/money\s+laundering|pmla|ed\s+/)) return 'money laundering';
    if (l.match(/498a|dowry|cruelty.*wife|matrimonial/)) return 'dowry harassment';
    if (l.match(/cheat|fraud|420|dishonest/)) return 'cheating';
    if (l.match(/theft|stolen|burglary|379/)) return 'theft';
    if (l.match(/kidnap|abduct|363|366/)) return 'kidnapping';
    if (l.match(/cyber|hacking|computer|it\s+act|online\s+fraud/)) return 'cybercrime';
    if (l.match(/bail|anticipatory/)) return 'bail application';
    if (l.match(/property|land|title|possession/)) return 'property dispute';
    if (l.match(/maintenance|alimony|125\s+crpc/)) return 'maintenance';
    if (l.match(/assault|hurt|grievous|323|325/)) return 'assault';
    if (l.match(/forgery|forged|467|468/)) return 'corporate fraud';
    if (l.match(/constitution|fundamental|article\s+\d+|pil/)) return 'constitutional';
    return 'criminal';
  },

  /**
   * Detect broad category
   */
  detectCategory(text) {
    const l = text.toLowerCase();
    if (l.match(/property|contract|civil\s+suit|maintenance|title|injunction|specific\s+performance/)) return 'civil';
    if (l.match(/constitution|fundamental|article\s+\d+|writ|pil/)) return 'constitutional';
    return 'criminal';
  }
};

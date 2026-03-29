// ============================================================
// LEX ANALYTICS — Historical Legal Statistics
// ============================================================

const STATISTICS = {
  // ── Case Duration by Court Level ──
  caseDuration: {
    "Supreme Court": { avgMonths: 36, minMonths: 6, maxMonths: 120, hearings: { avg: 15, min: 3, max: 50 }, delayProbability: 0.65 },
    "High Court": { avgMonths: 24, minMonths: 4, maxMonths: 84, hearings: { avg: 12, min: 2, max: 35 }, delayProbability: 0.60 },
    "District Court": { avgMonths: 18, minMonths: 3, maxMonths: 60, hearings: { avg: 10, min: 3, max: 30 }, delayProbability: 0.55 },
    "Sessions Court": { avgMonths: 24, minMonths: 6, maxMonths: 72, hearings: { avg: 14, min: 4, max: 35 }, delayProbability: 0.58 },
    "Fast Track Court": { avgMonths: 8, minMonths: 2, maxMonths: 24, hearings: { avg: 8, min: 3, max: 15 }, delayProbability: 0.30 },
    "Magistrate Court": { avgMonths: 12, minMonths: 2, maxMonths: 36, hearings: { avg: 8, min: 2, max: 20 }, delayProbability: 0.50 },
  },

  // ── Duration Modifiers by Case Type ──
  caseTypeModifiers: {
    "murder": { durationMultiplier: 1.8, complexityFactor: "high" },
    "sexual offence": { durationMultiplier: 1.4, complexityFactor: "high" },
    "dowry harassment": { durationMultiplier: 1.3, complexityFactor: "medium" },
    "cheating": { durationMultiplier: 1.2, complexityFactor: "medium" },
    "theft": { durationMultiplier: 0.8, complexityFactor: "low" },
    "cybercrime": { durationMultiplier: 1.5, complexityFactor: "high" },
    "NDPS": { durationMultiplier: 1.6, complexityFactor: "high" },
    "money laundering": { durationMultiplier: 2.0, complexityFactor: "very high" },
    "bail application": { durationMultiplier: 0.2, complexityFactor: "low" },
    "anticipatory bail": { durationMultiplier: 0.15, complexityFactor: "low" },
    "property dispute": { durationMultiplier: 2.5, complexityFactor: "high" },
    "matrimonial": { durationMultiplier: 1.5, complexityFactor: "medium" },
    "constitutional": { durationMultiplier: 2.2, complexityFactor: "very high" },
    "corporate fraud": { durationMultiplier: 2.0, complexityFactor: "very high" },
    "maintenance": { durationMultiplier: 1.0, complexityFactor: "medium" },
    "kidnapping": { durationMultiplier: 1.3, complexityFactor: "medium" },
    "assault": { durationMultiplier: 0.7, complexityFactor: "low" },
  },

  // ── Bail Statistics ──
  bailStats: {
    overall: { approvalRate: 48 },
    byCourt: {
      "Supreme Court": { approvalRate: 52 },
      "High Court": { approvalRate: 50 },
      "District Court": { approvalRate: 45 },
      "Sessions Court": { approvalRate: 43 },
    },
    byOffenceType: {
      "bailable": { approvalRate: 95 },
      "non-bailable minor": { approvalRate: 60 },
      "non-bailable serious": { approvalRate: 35 },
      "NDPS commercial": { approvalRate: 12 },
      "PMLA": { approvalRate: 15 },
      "murder": { approvalRate: 25 },
      "rape": { approvalRate: 20 },
      "economic offence": { approvalRate: 38 },
      "498A": { approvalRate: 65 },
    },
  },

  // ── Conviction Rates ──
  convictionRates: {
    overall: 47,
    byCategory: {
      "murder": 38,
      "sexual offence": 27,
      "theft": 48,
      "cheating": 32,
      "dowry": 34,
      "kidnapping": 40,
      "NDPS": 45,
      "cybercrime": 28,
      "assault": 55,
      "economic offence": 30,
    },
  },

  // ── Appeal Success Rates ──
  appealStats: {
    "District to High Court": { successRate: 28 },
    "High Court to Supreme Court": { successRate: 18 },
    "Review Petition": { successRate: 8 },
    "Curative Petition": { successRate: 3 },
  },

  // ── Pendency Statistics ──
  pendency: {
    "Supreme Court": { pending: 69000, avgDisposal: 45000 },
    "High Courts": { pending: 5800000, avgDisposal: 3200000 },
    "District Courts": { pending: 44000000, avgDisposal: 21000000 },
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = STATISTICS;
}

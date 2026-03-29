// ============================================================
// LEX ANALYTICS — Judge Behavioral Profiles Database
// ============================================================

const JUDGES_DB = [
  {
    id: "j001", name: "Justice D.Y. Chandrachud", court: "Supreme Court of India",
    convictionRate: 62, bailApprovalRate: 45, activeSince: 2016,
    sectionTendencies: { "IPC 302": "strict", "IPC 498A": "balanced", "Article 21": "liberal", "NDPS Act": "strict" },
    profile: "Known for progressive jurisprudence on privacy, free speech, and personal liberty. Takes a rights-based approach. Strict in serious criminal matters but emphasizes due process.",
    bias: "progressive"
  },
  {
    id: "j002", name: "Justice N.V. Ramana", court: "Supreme Court of India",
    convictionRate: 58, bailApprovalRate: 52, activeSince: 2014,
    sectionTendencies: { "IPC 302": "balanced", "CrPC 438": "liberal", "Article 21": "liberal", "IPC 498A": "balanced" },
    profile: "Champion of access to justice and bail reform. Advocates for reducing undertrial population. Known for pragmatic approach to criminal justice.",
    bias: "balanced-liberal"
  },
  {
    id: "j003", name: "Justice R.F. Nariman", court: "Supreme Court of India",
    convictionRate: 65, bailApprovalRate: 40, activeSince: 2014,
    sectionTendencies: { "IPC 302": "strict", "Article 19": "liberal", "IPC 420": "strict", "PMLA": "strict" },
    profile: "Constitutional law expert. Strict interpretation of economic offences. Known for striking down unconstitutional laws. Academic approach to judgments.",
    bias: "strict-analytical"
  },
  {
    id: "j004", name: "Justice Sanjay Kishan Kaul", court: "Supreme Court of India",
    convictionRate: 55, bailApprovalRate: 55, activeSince: 2017,
    sectionTendencies: { "IPC 302": "balanced", "CrPC 439": "liberal", "Article 21": "liberal", "IPC 498A": "liberal" },
    profile: "Known for emphasis on personal liberty and safeguards against arrest. Critical of state overreach. Encourages alternative dispute resolution.",
    bias: "liberal"
  },
  {
    id: "j005", name: "Justice Hima Kohli", court: "Supreme Court of India",
    convictionRate: 60, bailApprovalRate: 48, activeSince: 2021,
    sectionTendencies: { "IPC 376": "strict", "POCSO Act": "strict", "IPC 498A": "balanced", "Article 21": "balanced" },
    profile: "Firm stance on sexual offences and child protection. Balanced approach in matrimonial disputes. Focuses on victim rights.",
    bias: "balanced-strict"
  },
  {
    id: "j006", name: "Justice Surya Kant", court: "Supreme Court of India",
    convictionRate: 57, bailApprovalRate: 50, activeSince: 2019,
    sectionTendencies: { "IPC 302": "balanced", "CrPC 438": "liberal", "NDPS Act": "balanced", "Article 14": "liberal" },
    profile: "Balanced approach across case types. Emphases procedural fairness. Known for detailed analysis of evidence. Supportive of bail reform initiatives.",
    bias: "balanced"
  },
  {
    id: "j007", name: "Justice Manmohan", court: "Delhi High Court",
    convictionRate: 63, bailApprovalRate: 42, activeSince: 2008,
    sectionTendencies: { "IPC 420": "strict", "IPC 467": "strict", "CrPC 439": "balanced", "IT Act": "strict" },
    profile: "Known for strict approach in economic offences and fraud cases. Detailed scrutiny of financial documents. Below-average bail approval in white-collar crimes.",
    bias: "strict"
  },
  {
    id: "j008", name: "Justice Pratibha M. Singh", court: "Delhi High Court",
    convictionRate: 58, bailApprovalRate: 50, activeSince: 2017,
    sectionTendencies: { "IP laws": "strict", "IT Act": "balanced", "IPC 420": "balanced", "Article 19": "liberal" },
    profile: "Expertise in intellectual property and technology law. Balanced approach in criminal matters. Strong focus on digital evidence standards.",
    bias: "balanced"
  },
  {
    id: "j009", name: "Justice S.S. Shinde", court: "Bombay High Court",
    convictionRate: 61, bailApprovalRate: 44, activeSince: 2015,
    sectionTendencies: { "IPC 302": "strict", "NDPS Act": "strict", "PMLA": "strict", "CrPC 439": "balanced" },
    profile: "Strict in serious criminal and narcotics cases. Below-average bail rate in NDPS matters. Thorough examination of prosecution evidence.",
    bias: "strict"
  },
  {
    id: "j010", name: "Justice Siddharth Mridul", court: "Delhi High Court",
    convictionRate: 56, bailApprovalRate: 54, activeSince: 2016,
    sectionTendencies: { "CrPC 438": "liberal", "IPC 498A": "liberal", "Article 21": "liberal", "IPC 420": "balanced" },
    profile: "Known for liberal bail jurisprudence. Emphasis on personal liberty. Critical of police excesses during investigation. Favors reformative justice.",
    bias: "liberal"
  },
  {
    id: "j011", name: "Justice M.R. Shah", court: "Supreme Court of India",
    convictionRate: 64, bailApprovalRate: 38, activeSince: 2018,
    sectionTendencies: { "IPC 302": "strict", "NDPS Act": "strict", "PMLA": "strict", "IPC 376": "strict" },
    profile: "The judge demonstrates a stricter approach in financial crime cases with below-average bail approval rates. Takes a hardline stance on narcotics and sexual offences.",
    bias: "strict"
  },
  {
    id: "j012", name: "Justice B.R. Gavai", court: "Supreme Court of India",
    convictionRate: 59, bailApprovalRate: 49, activeSince: 2019,
    sectionTendencies: { "IPC 302": "balanced", "Article 14": "liberal", "CrPC 439": "balanced", "IPC 498A": "balanced" },
    profile: "Balanced judicial temperament. Focus on constitutional values and equality. Known for pragmatic approach. Careful scrutiny of evidence before conviction.",
    bias: "balanced"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JUDGES_DB;
}

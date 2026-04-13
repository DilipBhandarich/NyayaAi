// Indian law section detection -- pure regex, no external API
const LAW_PATTERNS = [
  /Section\s+\d+[A-Z]?\s+(?:of\s+)?(?:the\s+)?(?:Indian\s+Penal\s+Code|IPC|CrPC|CPC|IT\s+Act|BNS|BNSS)/gi,
  /(?:IPC|CrPC|CPC|BNS|BNSS)\s+Section\s+\d+[A-Z]?/gi,
  /Section\s+\d+[A-Z]?(?:\(\d+\))?/gi,
  /Article\s+\d+[A-Z]?\s+of\s+the\s+Constitution/gi,
];

export function extractLawReferences(text) {
  const refs = [];
  for (const pattern of LAW_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) refs.push(...matches);
  }
  return [...new Set(refs)];
}

// Legal keyword set for sentence scoring
const LEGAL_KEYWORDS = new Set([
  'court', 'judge', 'plaintiff', 'defendant', 'witness', 'evidence',
  'prosecution', 'defense', 'verdict', 'guilty', 'innocent', 'bail',
  'sentence', 'appeal', 'order', 'petition', 'act', 'section', 'law',
  'crime', 'offense', 'accused', 'complainant', 'fir', 'charge',
  'convicted', 'acquitted', 'damages', 'compensation', 'injunction',
]);

export function scoreSentenceByLegalKeywords(sentence) {
  const words = sentence.toLowerCase().split(/\s+/);
  return words.filter((w) => LEGAL_KEYWORDS.has(w)).length;
}

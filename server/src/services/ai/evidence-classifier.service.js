const STRONG_INDICATORS = [
  'dna', 'fingerprint', 'cctv', 'video', 'photograph', 'forensic',
  'confession', 'eyewitness', 'medical report', 'post-mortem',
  'scientific', 'digital evidence', 'bank statement',
];

const WEAK_INDICATORS = [
  'hearsay', 'rumor', 'allegedly', 'unverified', 'anonymous',
  'circumstantial', 'no corroboration', 'inconsistent',
];

export function classifyEvidenceStrength(description) {
  const lower = description.toLowerCase();
  const strongHits = STRONG_INDICATORS.filter((kw) => lower.includes(kw)).length;
  const weakHits = WEAK_INDICATORS.filter((kw) => lower.includes(kw)).length;

  if (strongHits >= 2) return 'strong';
  if (strongHits === 1 && weakHits === 0) return 'strong';
  if (weakHits >= 2) return 'weak';
  if (weakHits === 1 && strongHits === 0) return 'weak';
  return 'medium';
}

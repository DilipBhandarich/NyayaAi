// Quick test script to check prediction output

async function run() {
  // Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@nyaya.ai', password: 'testpass123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.access_token;

  // Run analysis
  console.log('Running analysis...');
  const analysisRes = await fetch('http://localhost:5000/api/cases/69ac3050dc9a7cc9b039b42f/analyze', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await analysisRes.json();

  console.log('Success:', data.success);
  const p = data.prediction;

  console.log('\n=== PREDICTED OUTCOME ===');
  console.log(p.predictedOutcome);
  console.log('Confidence:', p.confidenceScore);

  console.log('\n=== REASONING ===');
  console.log(p.reasoning ? p.reasoning.slice(0, 500) + '...' : 'N/A');

  if (p.judgmentRecommendation) {
    console.log('\n=== JUDGMENT RECOMMENDATION ===');
    for (const [k, v] of Object.entries(p.judgmentRecommendation)) {
      if (v && v !== 'N/A' && v !== 'N/A - Civil matter') console.log(`  ${k}: ${v}`);
    }
  }

  console.log('\n=== APPLICABLE SECTIONS ===');
  (p.applicableSections || []).forEach(s => console.log(`  ${s.section} | Max: ${s.maxPenalty}`));

  console.log('\n=== PRECEDENT ANALYSIS ===');
  (p.precedentAnalysis || []).forEach(pr => console.log(`  ${pr.caseName}: ${(pr.relevance || '').slice(0, 100)}`));

  console.log('\n=== FACTORS ===');
  console.log('Aggravating:', (p.aggravatingFactors || []).length, '|', (p.aggravatingFactors || []).slice(0, 2).join('; '));
  console.log('Mitigating:', (p.mitigatingFactors || []).length, '|', (p.mitigatingFactors || []).slice(0, 2).join('; '));

  console.log('\n=== EVIDENCE ASSESSMENT ===');
  if (p.evidenceAssessment) {
    console.log('Strength:', p.evidenceAssessment.overallStrength);
    console.log('Key Findings:', (p.evidenceAssessment.keyFindings || []).length);
    console.log('Gaps:', (p.evidenceAssessment.gaps || []).length);
  }

  console.log('\n=== BAIL ===');
  if (p.bailAnalysis) {
    console.log('Recommendation:', p.bailAnalysis.recommendation);
    console.log('Conditions:', (p.bailAnalysis.conditions || []).length);
  }

  console.log('\n=== ALTERNATIVE OUTCOMES ===');
  (p.alternativeOutcomes || []).forEach(a => console.log(`  [${((a.probability||0)*100).toFixed(0)}%] ${a.outcome}`));

  console.log('\nSimilar Cases Found:', data.similarCases?.length);
  console.log('Prosecution Points:', (p.prosecutionStrengths || []).length);
  console.log('Defense Points:', (p.defenseStrengths || []).length);
}

run().catch(e => console.error('Error:', e.message));

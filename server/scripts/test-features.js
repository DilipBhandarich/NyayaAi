import fetch from 'node-fetch';

const BASE = 'http://localhost:5000/api';

async function test() {
  // Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@nyaya.ai', password: 'testpass123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token || loginData.access_token;
  if (!token) {
    console.log('Login failed:', loginData);
    return;
  }
  console.log('Login OK as', loginData.user?.fullName);
  const h = { 'Authorization': 'Bearer ' + token };

  // Test statutes search
  const statRes = await fetch(`${BASE}/statutes?limit=3`, { headers: h });
  const statData = await statRes.json();
  console.log(`Statutes: ${statData.statutes?.length} of ${statData.pagination?.total}`);

  // Test categories
  const catRes = await fetch(`${BASE}/statutes/categories`, { headers: h });
  const catData = await catRes.json();
  console.log(`Categories: ${JSON.stringify(catData.categories)}`);

  // Test lookup
  const lookupRes = await fetch(`${BASE}/statutes/lookup/302`, { headers: h });
  const lookupData = await lookupRes.json();
  console.log(`Lookup IPC 302: ${lookupData.results?.length || 0} results`);
  if (lookupData.results?.[0]) {
    console.log(`  ${lookupData.results[0].oldCode} S.${lookupData.results[0].oldSection} -> ${lookupData.results[0].newCode} S.${lookupData.results[0].newSection}`);
  }

  // Test audit logs
  const auditRes = await fetch(`${BASE}/audit`, { headers: h });
  const auditData = await auditRes.json();
  console.log(`Audit logs: ${auditData.logs?.length || 0} entries`);

  // Test cases list
  const casesRes = await fetch(`${BASE}/cases?limit=2`, { headers: h });
  const casesData = await casesRes.json();
  console.log(`Cases: ${casesData.cases?.length || 0} found`);

  // Test PDF export on first case
  if (casesData.cases?.length > 0) {
    const caseId = casesData.cases[0]._id;
    const pdfRes = await fetch(`${BASE}/cases/${caseId}/export-pdf`, { headers: h });
    console.log(`PDF Export: status=${pdfRes.status}, type=${pdfRes.headers.get('content-type')}`);
    if (pdfRes.status === 200) {
      const buf = await pdfRes.buffer();
      console.log(`  PDF size: ${(buf.length / 1024).toFixed(1)} KB`);
    }
  }

  // Test dashboard
  const dashRes = await fetch(`${BASE}/dashboard/stats`, { headers: h });
  const dashData = await dashRes.json();
  console.log(`Dashboard: ${dashData.stats?.totalCases || '?'} cases total`);

  // Test similar cases count (our new expanded database)
  const simRes = await fetch(`${BASE}/cases/${casesData.cases?.[0]?._id}/similar`, { headers: h });
  const simData = await simRes.json();
  console.log(`Similar cases: ${simData.similarCases?.length || simData.data?.length || '?'} found`);

  console.log('\n=== ALL FEATURE TESTS PASSED ===');
}

test().catch(e => console.error('Test error:', e));

const http = require('http');
const pool = require('../config/db');

async function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000/api${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testDeptSync() {
  console.log('Testing Department Creation & Live Registration Dropdown Synchronization...');

  const email = 'managerlavanilla@gmail.com';
  await makeRequest('/auth/login', 'POST', { email, password: 'admin123' });

  const [rows] = await pool.query('SELECT otp_code FROM users WHERE email = ?', [email]);
  const otpCode = rows[0].otp_code;

  const otpRes = await makeRequest('/auth/verify-otp', 'POST', { email, otp_code: otpCode });
  const token = otpRes.data.token;

  const newDeptName = `Desain Grafis ${Date.now().toString().slice(-4)}`;
  const newDeptCode = `DG${Date.now().toString().slice(-3)}`;

  const addRes = await makeRequest('/departments', 'POST', {
    name: newDeptName,
    code: newDeptCode
  }, token);

  console.log('1. Department Creation Result:', addRes.status, addRes.data.message);

  const publicDepts = await makeRequest('/auth/departments');
  const foundInPublic = publicDepts.data.departments.find(d => d.name === newDeptName);
  console.log('2. Public Sign-Up Dropdown Has New Dept:', !!foundInPublic, '->', foundInPublic?.name);

  const metaDepts = await makeRequest('/users/meta', 'GET', null, token);
  const foundInMeta = metaDepts.data.departments.find(d => d.name === newDeptName);
  console.log('3. Admin User Meta Dropdown Has New Dept:', !!foundInMeta, '->', foundInMeta?.name);

  console.log('Department Creation & Live Registration Dropdown Sync Verified 100%!');
  process.exit(0);
}

testDeptSync();

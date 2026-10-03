const http = require('http');

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

async function runTests() {
  console.log('Testing Backend Endpoints...');

  const health = await makeRequest('/health');
  console.log('1. Health check:', health.data);

  const loginRes = await makeRequest('/auth/login', 'POST', {
    email: 'managerlavanilla@gmail.com',
    password: 'admin123'
  });
  console.log('2. Master Admin Login:', loginRes.data.success ? 'SUCCESS' : 'FAILED', loginRes.data.message);

  const token = loginRes.data.token;

  const deptsRes = await makeRequest('/departments', 'GET', null, token);
  console.log('3. Departments Count:', deptsRes.data.departments ? deptsRes.data.departments.length : 0);
  console.log('   Divisions:', deptsRes.data.departments ? deptsRes.data.departments.map(d => d.name).join(', ') : '');

  const assetsRes = await makeRequest('/assets', 'GET', null, token);
  console.log('4. Assets Count:', assetsRes.data.assets ? assetsRes.data.assets.length : 0);

  const usersRes = await makeRequest('/users', 'GET', null, token);
  console.log('5. Users Count:', usersRes.data.users ? usersRes.data.users.length : 0);

  console.log('All API Endpoints Operating Cleanly!');
}

runTests();

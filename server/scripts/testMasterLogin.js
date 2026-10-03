const http = require('http');

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000/api${path}`);
    const headers = { 'Content-Type': 'application/json' };

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

async function testMasterLogin() {
  console.log('Testing Login for managerlavanilla@gmail.com...');
  const res = await makeRequest('/auth/login', 'POST', {
    email: 'managerlavanilla@gmail.com',
    password: 'admin123'
  });

  console.log('Login Result:', res.status, res.data);
  process.exit(0);
}

testMasterLogin();

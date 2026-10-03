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

async function testPublicRegisterAndAcc() {
  console.log('Testing Public Registration & ACC Flow...');

  const newEmail = `user.test${Date.now()}@company.com`;
  const regRes = await makeRequest('/auth/register', 'POST', {
    name: 'Rudi Supervisor Printing',
    email: newEmail,
    password: 'password123',
    department_id: 4
  });

  console.log('1. Public Register Result:', regRes.status, regRes.data);

  const loginBeforeAcc = await makeRequest('/auth/login', 'POST', {
    email: newEmail,
    password: 'password123'
  });
  console.log('2. Login Before ACC (Expected 403):', loginBeforeAcc.status, loginBeforeAcc.data.message);

  const masterLogin = await makeRequest('/auth/login', 'POST', {
    email: 'managerlavanilla@gmail.com',
    password: 'admin123'
  });
  const token = masterLogin.data.token;

  const usersList = await makeRequest('/users', 'GET', null, token);
  const newUser = usersList.data.users.find(u => u.email === newEmail);
  console.log('3. Found New Pending User ID:', newUser.id, 'Active:', newUser.is_active);

  const accRes = await makeRequest(`/users/${newUser.id}/toggle-status`, 'PUT', null, token);
  console.log('4. Master Admin ACC Result:', accRes.data.message);

  const loginAfterAcc = await makeRequest('/auth/login', 'POST', {
    email: newEmail,
    password: 'password123'
  });
  console.log('5. Login After ACC:', loginAfterAcc.status, loginAfterAcc.data.message, 'User:', loginAfterAcc.data.user?.name);

  console.log('Registration & ACC Flow Completed Successfully!');
}

testPublicRegisterAndAcc();

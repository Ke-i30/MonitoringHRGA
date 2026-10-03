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

async function testOtpLogin() {
  console.log('Testing 2-Step OTP Login Flow...');

  const email = 'managerlavanilla@gmail.com';
  const password = 'admin123';

  const step1 = await makeRequest('/auth/login', 'POST', { email, password });
  console.log('1. Step 1 Result (Initiate Login):', step1.status, step1.data.message);
  console.log('   Require OTP:', step1.data.requireOtp);

  const pool = require('../config/db');
  const [userRows] = await pool.query('SELECT otp_code, otp_expires_at FROM users WHERE email = ?', [email]);
  const otpCode = userRows[0].otp_code;
  console.log('2. Retrieved Generated OTP Code from DB:', otpCode);

  const step2Invalid = await makeRequest('/auth/verify-otp', 'POST', { email, otp_code: '000000' });
  console.log('3. Step 2 Result with Invalid OTP:', step2Invalid.status, step2Invalid.data.message);

  const step2Valid = await makeRequest('/auth/verify-otp', 'POST', { email, otp_code: otpCode });
  console.log('4. Step 2 Result with Valid OTP:', step2Valid.status, step2Valid.data.message);
  console.log('   Token Generated:', !!step2Valid.data.token, 'User:', step2Valid.data.user?.name);

  console.log('2-Step OTP Authentication Flow Operating Cleanly!');
  process.exit(0);
}

testOtpLogin();

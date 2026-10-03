const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendOtpEmail, sendMutationEmail } = require('../utils/emailService');

async function testRealSmtp() {
  console.log('Testing Real Gmail SMTP Dispatch...');
  console.log('OTP Sender User:', process.env.OTP_SMTP_USER);
  console.log('HRGA Sender User:', process.env.HRGA_SMTP_USER);

  const targetTestEmail = 'anlstudioteam@gmail.com';
  console.log(`Sending Real OTP Email to ${targetTestEmail}...`);

  const otpRes = await sendOtpEmail(targetTestEmail, '789123', 'Testing User HRGA');
  console.log('OTP Dispatch Status:', otpRes);

  console.log(`Sending Real HRGA Mutation Notification to ${process.env.HRGA_ADMIN_RECIPIENT_EMAIL}...`);
  const mutRes = await sendMutationEmail({
    requisitionId: null,
    recipientEmail: process.env.HRGA_ADMIN_RECIPIENT_EMAIL,
    subject: '[TEST SINKRONISASI] Notifikasi Sistem HRGA Request',
    bodyContent: '<h3>Uji Coba Notifikasi Mutasi Sistem HRGA</h3><p>Koneksi SMTP Gmail telah terhubung dan sinkron sempurna!</p>',
    emailType: 'SYSTEM_TEST'
  });
  console.log('Mutation Dispatch Status:', mutRes);

  process.exit(0);
}

testRealSmtp();

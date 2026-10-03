const nodemailer = require('nodemailer');
const pool = require('../config/db');

const getOtpTransporter = () => {
  const host = process.env.OTP_SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.OTP_SMTP_PORT || '587');
  const user = process.env.OTP_SMTP_USER || 'anlstudioteam@gmail.com';
  const pass = (process.env.OTP_SMTP_PASS || '').replace(/\s+/g, '');

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass }
    }),
    user,
    from: process.env.OTP_SMTP_FROM || `"HRGA Security OTP" <${user}>`
  };
};

const getHrgaTransporter = () => {
  const host = process.env.HRGA_SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.HRGA_SMTP_PORT || '587');
  const user = process.env.HRGA_SMTP_USER || 'managerlavanilla@gmail.com';
  const pass = (process.env.HRGA_SMTP_PASS || '').replace(/\s+/g, '');

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass }
    }),
    user,
    from: process.env.HRGA_SMTP_FROM || `"HRGA Request System" <${user}>`
  };
};

async function sendMutationEmail({ requisitionId = null, recipientEmail, subject, bodyContent, emailType }) {
  let status = 'SENT';
  let errorMsg = null;

  const targetRecipient = recipientEmail || process.env.HRGA_ADMIN_RECIPIENT_EMAIL || 'managerlavanilla@gmail.com';

  try {
    const hrgaConfig = getHrgaTransporter();
    console.log(`Sending HRGA Mutation Email via SMTP user [${hrgaConfig.user}] to [${targetRecipient}]...`);
    
    await hrgaConfig.transporter.sendMail({
      from: hrgaConfig.from,
      to: targetRecipient,
      subject: subject,
      html: bodyContent
    });
    console.log(`SUCCESS: HRGA Mutation Email delivered to ${targetRecipient}`);
  } catch (err) {
    console.error(`ERROR sending mutation email to ${targetRecipient}:`, err.message);
    status = 'FAILED';
    errorMsg = err.message;
  }

  try {
    await pool.query(
      `INSERT INTO email_logs (requisition_id, recipient_email, subject, body_content, email_type, status, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [requisitionId, targetRecipient, subject, bodyContent, emailType, status]
    );
  } catch (dbErr) {
    console.error('Failed to save email log to DB:', dbErr.message);
  }

  return { status, error: errorMsg };
}

async function sendOtpEmail(recipientEmail, otpCode, userName) {
  const subject = `[KODE OTP LOGIN] HRGA Request Portal - ${otpCode}`;
  const bodyContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; border-radius: 10px;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">HRGA Request Portal</h2>
        <p>Halo <b>${userName}</b>,</p>
        <p>Gunakan kode OTP di bawah ini untuk menyelesaikan proses login Anda:</p>
        <div style="background: #eef2ff; border: 2px dashed #6366f1; padding: 16px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4f46e5;">${otpCode}</span>
        </div>
        <p style="font-size: 0.85rem; color: #64748b; text-align: center;">Kode OTP ini berlaku selama <b>5 menit</b>. Jaga kerahasian kode ini dan jangan berikan kepada siapa pun.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 0.75rem; color: #94a3b8; text-align: center;">Pesan ini dikirimkan secara otomatis oleh HRGA Security System.</p>
      </div>
    </div>
  `;

  console.log(`[KODE OTP GENERATED] For ${recipientEmail} => ${otpCode}`);

  let status = 'SENT';
  let errorMsg = null;

  try {
    const otpConfig = getOtpTransporter();
    console.log(`Sending OTP Email via Gmail SMTP user [${otpConfig.user}] to recipient [${recipientEmail}]...`);
    
    await otpConfig.transporter.sendMail({
      from: otpConfig.from,
      to: recipientEmail,
      subject: subject,
      html: bodyContent
    });
    console.log(`SUCCESS: OTP Email delivered to ${recipientEmail}`);
  } catch (err) {
    console.error(`ERROR sending OTP email to ${recipientEmail}:`, err.message);
    status = 'FAILED';
    errorMsg = err.message;
  }

  try {
    await pool.query(
      `INSERT INTO email_logs (requisition_id, recipient_email, subject, body_content, email_type, status, sent_at)
       VALUES (NULL, ?, ?, ?, 'LOGIN_OTP', ?, NOW())`,
      [recipientEmail, subject, bodyContent, status]
    );
  } catch (dbErr) {
    console.error('Failed to save OTP log to DB:', dbErr.message);
  }

  return { status, error: errorMsg };
}

module.exports = { sendMutationEmail, sendOtpEmail };

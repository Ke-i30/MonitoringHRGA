const pool = require('../config/db');
const { sendMutationEmail } = require('../utils/emailService');

// Generate Unique Ticket Number format: REQ-YYYYMMDD-XXXX
const generateTicketNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM requisitions WHERE ticket_number LIKE ?`,
    [`REQ-${dateStr}-%`]
  );
  const count = rows[0].count + 1;
  const seq = String(count).padStart(4, '0');
  return `REQ-${dateStr}-${seq}`;
};

// POST /api/requisitions (Create ticket)
exports.createRequisition = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const supervisor_id = req.user.id;
    const { priority_level, items: itemsJson, department_id: reqDeptId } = req.body;
    const department_id = reqDeptId ? parseInt(reqDeptId) : req.user.department_id;

    let items = [];
    if (typeof itemsJson === 'string') {
      items = JSON.parse(itemsJson);
    } else {
      items = itemsJson || [];
    }

    if (!items || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Minimal harus memasukkan 1 barang yang diminta.' });
    }

    const ticket_number = await generateTicketNumber();

    // 1. Insert header requisition
    const [reqResult] = await connection.query(
      `INSERT INTO requisitions (ticket_number, supervisor_id, department_id, priority_level, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [ticket_number, supervisor_id, department_id, priority_level || 'Medium']
    );

    const requisitionId = reqResult.insertId;

    // 2. Insert items
    for (const item of items) {
      await connection.query(
        `INSERT INTO requisition_items (requisition_id, asset_id, item_name, specification, quantity, urgency_reason)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          requisitionId,
          item.asset_id ? parseInt(item.asset_id) : null,
          item.item_name.trim(),
          item.specification || '',
          parseInt(item.quantity) || 1,
          item.urgency_reason || ''
        ]
      );
    }

    // 3. Handle file attachments (if uploaded via multer)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          `INSERT INTO requisition_attachments (requisition_id, file_path, file_type)
           VALUES (?, ?, ?)`,
          [requisitionId, `/uploads/${file.filename}`, file.mimetype]
        );
      }
    }

    await connection.commit();

    // Send Mutation Email to HRGA Admin
    const [hrgaUsers] = await pool.query(
      `SELECT email FROM users WHERE role_id IN (1, 2) AND is_active = 1`
    );

    const hrgaEmails = hrgaUsers.map(u => u.email).join(', ');
    const itemsSummaryHtml = items.map(i => `<li><b>${i.item_name}</b> (Qty: ${i.quantity}) - ${i.urgency_reason || 'Tidak ada catatan'}</li>`).join('');

    const emailSubject = `[BARU] Permintaan Barang Tiket #${ticket_number} - Urgensi: ${priority_level.toUpperCase()}`;
    const emailBody = `
      <h2>Permintaan Barang Baru Diterima</h2>
      <p><b>Nomor Tiket:</b> ${ticket_number}</p>
      <p><b>Peminta:</b> ${req.user.name} (${req.user.department_name})</p>
      <p><b>Tingkat Urgensi:</b> <span style="color: ${priority_level === 'Urgent' ? 'red' : 'orange'};">${priority_level}</span></p>
      <p><b>Waktu Permintaan:</b> ${new Date().toLocaleString('id-ID')}</p>
      <h3>Daftar Barang:</h3>
      <ul>${itemsSummaryHtml}</ul>
      <hr />
      <p>Silakan login ke Dashboard HRGA untuk memproses tiket ini.</p>
    `;

    // Trigger async email notification
    sendMutationEmail({
      requisitionId,
      recipientEmail: hrgaEmails || 'admin@hrga.com',
      subject: emailSubject,
      bodyContent: emailBody,
      emailType: 'NEW_REQUEST_NOTIFICATION'
    });

    res.status(201).json({
      success: true,
      message: 'Permintaan barang berhasil dibuat dan dikirim ke HRGA!',
      ticket_number,
      requisitionId
    });

  } catch (error) {
    await connection.rollback();
    console.error('createRequisition error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat tiket permintaan barang.' });
  } finally {
    connection.release();
  }
};

// GET /api/requisitions (List tickets with filter)
exports.getRequisitions = async (req, res) => {
  try {
    let query = `
      SELECT r.*, 
             u.name as supervisor_name, u.email as supervisor_email,
             d.name as department_name, d.code as department_code,
             app.name as approved_by_name
      FROM requisitions r
      JOIN users u ON r.supervisor_id = u.id
      JOIN departments d ON r.department_id = d.id
      LEFT JOIN users app ON r.approved_by = app.id
    `;
    const params = [];

    // If role is Supervisor, only show their own division's or user's requisitions
    if (req.user.role_name === 'Supervisor') {
      query += ` WHERE r.supervisor_id = ? `;
      params.push(req.user.id);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [requisitions] = await pool.query(query, params);
    res.json({ success: true, requisitions });
  } catch (error) {
    console.error('getRequisitions error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data permintaan.' });
  }
};

// GET /api/requisitions/:id (Detail view)
exports.getRequisitionById = async (req, res) => {
  const { id } = req.params;
  try {
    const [reqs] = await pool.query(
      `SELECT r.*, 
              u.name as supervisor_name, u.email as supervisor_email,
              d.name as department_name, d.code as department_code,
              app.name as approved_by_name
       FROM requisitions r
       JOIN users u ON r.supervisor_id = u.id
       JOIN departments d ON r.department_id = d.id
       LEFT JOIN users app ON r.approved_by = app.id
       WHERE r.id = ?`,
      [id]
    );

    if (reqs.length === 0) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
    }

    const requisition = reqs[0];

    // Fetch items
    const [items] = await pool.query(
      `SELECT ri.*, a.name as original_asset_name, a.unit
       FROM requisition_items ri
       LEFT JOIN assets a ON ri.asset_id = a.id
       WHERE ri.requisition_id = ?`,
      [id]
    );

    // Fetch attachments
    const [attachments] = await pool.query(
      `SELECT * FROM requisition_attachments WHERE requisition_id = ?`,
      [id]
    );

    res.json({
      success: true,
      requisition: {
        ...requisition,
        items,
        attachments
      }
    });
  } catch (error) {
    console.error('getRequisitionById error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail tiket.' });
  }
};

// PUT /api/requisitions/:id/status (HRGA updates status: Approved, In Process, Completed, Rejected)
exports.updateRequisitionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason, estimated_completion_at } = req.body;
  const adminId = req.user.id;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status wajib diisi.' });
  }

  try {
    const [existing] = await pool.query(
      `SELECT r.*, u.email as supervisor_email, u.name as supervisor_name
       FROM requisitions r
       JOIN users u ON r.supervisor_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });
    }

    const reqData = existing[0];
    let approved_by = reqData.approved_by || adminId;
    let approved_at = reqData.approved_at;
    let completed_at = reqData.completed_at;

    if (status === 'Approved' && !approved_at) {
      approved_at = new Date();
    }
    if (status === 'Completed') {
      completed_at = new Date();
    }

    await pool.query(
      `UPDATE requisitions 
       SET status = ?, 
           rejection_reason = ?, 
           estimated_completion_at = ?,
           approved_by = ?, 
           approved_at = ?, 
           completed_at = ?
       WHERE id = ?`,
      [
        status,
        status === 'Rejected' ? (rejection_reason || 'Tidak disetujui HRGA') : null,
        estimated_completion_at || reqData.estimated_completion_at,
        approved_by,
        approved_at,
        completed_at,
        id
      ]
    );

    // Prepare email notification mutation to requester
    const emailSubject = `[UPDATE MUTASI] Tiket #${reqData.ticket_number} - Status: ${status.toUpperCase()}`;
    const emailBody = `
      <h2>Update Status Permintaan Barang HRGA</h2>
      <p>Halo <b>${reqData.supervisor_name}</b>,</p>
      <p>Status tiket permintaan Anda <b>#${reqData.ticket_number}</b> telah diperbarui oleh Tim HRGA.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><b>Status Baru:</b> <span style="font-weight: bold; color: #2563eb;">${status}</span></p>
        ${estimated_completion_at ? `<p><b>Estimasi Selesai:</b> ${new Date(estimated_completion_at).toLocaleString('id-ID')}</p>` : ''}
        ${status === 'Rejected' ? `<p><b>Alasan Penolakan:</b> <span style="color: red;">${rejection_reason}</span></p>` : ''}
        ${completed_at ? `<p><b>Waktu Selesai:</b> ${new Date(completed_at).toLocaleString('id-ID')}</p>` : ''}
      </div>
      <p>Terima kasih,<br/>Tim HRGA Company</p>
    `;

    sendMutationEmail({
      requisitionId: id,
      recipientEmail: reqData.supervisor_email,
      subject: emailSubject,
      bodyContent: emailBody,
      emailType: `STATUS_MUTATION_${status.toUpperCase()}`
    });

    res.json({
      success: true,
      message: `Status tiket #${reqData.ticket_number} berhasil diubah menjadi ${status}!`
    });

  } catch (error) {
    console.error('updateRequisitionStatus error:', error);
    res.status(500).json({ success: false, message: 'Gagal merubah status tiket.' });
  }
};

// GET /api/requisitions/email-logs (HRGA views email logs)
exports.getEmailLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT el.*, r.ticket_number
       FROM email_logs el
       JOIN requisitions r ON el.requisition_id = r.id
       ORDER BY el.sent_at DESC`
    );
    res.json({ success: true, logs });
  } catch (error) {
    console.error('getEmailLogs error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil log email mutasi.' });
  }
};

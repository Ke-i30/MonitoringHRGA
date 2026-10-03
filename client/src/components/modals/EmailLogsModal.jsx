import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { formatDateShort } from '../../utils/formatters';
import { X, Mail } from 'lucide-react';

export const EmailLogsModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/requisitions/email-logs');
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-card" style={{ maxWidth: '850px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Log Mutasi Email Notifikasi</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Riwayat pengiriman notifikasi mutasi otomatis oleh sistem</p>
          </div>
          <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Memuat log mutasi...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Belum ada log email pengiriman mutasi.</div>
        ) : (
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>TIKET #</th>
                <th>PENERIMA</th>
                <th>SUBJEK EMAIL</th>
                <th>TIPE MUTASI</th>
                <th>STATUS</th>
                <th>WAKTU DIKIRIM</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 800 }}>#{log.ticket_number || '-'}</td>
                  <td>{log.recipient_email}</td>
                  <td>{log.subject}</td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{log.email_type}</td>
                  <td>
                    <span className={`status-tag ${log.status === 'SENT' ? 'status-completed' : 'status-rejected'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatDateShort(log.sent_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

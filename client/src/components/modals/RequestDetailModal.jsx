import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { formatDateShort, formatTicketNo } from '../../utils/formatters';
import { X, Camera, CheckCircle, RefreshCw, XCircle } from 'lucide-react';

export const RequestDetailModal = ({ requisitionId, isOpen, onClose, onStatusUpdated, isMasterAdmin }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');

  useEffect(() => {
    if (isOpen && requisitionId) {
      loadDetail();
    }
  }, [isOpen, requisitionId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/requisitions/${requisitionId}`);
      setData(res.requisition);
      if (res.requisition.estimated_completion_at) {
        const dateObj = new Date(res.requisition.estimated_completion_at);
        setEstimatedDate(dateObj.toISOString().slice(0, 16));
      }
    } catch (err) {
      console.error('Failed to load detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'Rejected' && !rejectionReason.trim()) {
      alert('Silakan masukkan alasan penolakan tiket.');
      return;
    }

    setActionLoading(true);
    try {
      await fetchApi(`/requisitions/${requisitionId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          rejection_reason: newStatus === 'Rejected' ? rejectionReason : null,
          estimated_completion_at: estimatedDate || null
        })
      });

      setShowRejectInput(false);
      await loadDetail();
      onStatusUpdated();
    } catch (err) {
      alert(err.message || 'Gagal memperbarui status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const firstAttachment = data?.attachments && data.attachments.length > 0 ? data.attachments[0] : null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-card">
        {loading || !data ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Memuat detail laporan...</div>
        ) : (
          <>
            {/* Header Line */}
            <div className="modal-header-line">
              <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
              <h2 className="modal-ticket-title">{formatTicketNo(data.ticket_number)}</h2>
            </div>

            {/* Top Grid Panel */}
            <div className="modal-grid-top">
              {/* Photo Box */}
              <div className="photo-preview-box">
                {firstAttachment ? (
                  <img src={`http://localhost:5000${firstAttachment.file_path}`} alt="Attachment Preview" />
                ) : (
                  <>
                    <Camera size={48} style={{ marginBottom: '8px', opacity: 0.6 }} />
                    <span>FOTO YANG SUDAH DITAMBAHKAN</span>
                  </>
                )}
              </div>

              {/* Details Box */}
              <div className="details-panel-box">
                <div className="detail-field-group">
                  <span className="detail-field-label">DEPARTEMENT</span>
                  <div className="detail-field-value">{data.department_name ? data.department_name.toUpperCase() : '-'}</div>
                </div>

                <div className="detail-field-group">
                  <span className="detail-field-label">PRIORTY</span>
                  <div className="detail-field-value">{data.priority_level ? data.priority_level.toUpperCase() : 'MEDIUM'}</div>
                </div>

                <div className="detail-field-group">
                  <span className="detail-field-label">LOCATION / PEMINTA</span>
                  <div className="detail-field-value">{data.supervisor_name || '-'}</div>
                </div>

                {/* 3 Date Triple Box */}
                <div className="detail-field-group">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                    <span>DATE</span>
                    <span>PROCESSING DATE</span>
                    <span>FINISH DATE</span>
                  </div>
                  <div className="modal-date-triple" style={{ marginTop: '4px' }}>
                    <div className="date-box">{formatDateShort(data.created_at)}</div>
                    <div className="date-box">{formatDateShort(data.estimated_completion_at || data.approved_at)}</div>
                    <div className="date-box">{formatDateShort(data.completed_at)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Panel */}
            <div className="detail-field-group" style={{ marginBottom: '20px' }}>
              <span className="detail-field-label">DETAIL LAPORAN & DESKRIPSI BARANG</span>
              <div className="modal-description-box">
                {data.items && data.items.length > 0 ? (
                  data.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>
                        {item.item_name} (Qty: {item.quantity})
                      </div>
                      {item.specification && <div style={{ color: '#475569', fontSize: '0.88rem' }}>Spesifikasi: {item.specification}</div>}
                      {item.urgency_reason && <div style={{ color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>Alasan: {item.urgency_reason}</div>}
                    </div>
                  ))
                ) : (
                  <div>Tidak ada rincian barang.</div>
                )}
                {data.rejection_reason && (
                  <div style={{ color: '#dc2626', fontWeight: 700, marginTop: '12px' }}>
                    ALASAN PENOLAKAN: {data.rejection_reason}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Status Action Controls */}
            {isMasterAdmin && data.status !== 'Completed' && data.status !== 'Rejected' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>PENGATURAN STATUS MASTER ADMIN</div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Estimasi Waktu Selesai (Processing Date)</label>
                  <input
                    type="datetime-local"
                    value={estimatedDate}
                    onChange={(e) => setEstimatedDate(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {data.status === 'Pending' && (
                    <button onClick={() => handleUpdateStatus('Approved')} disabled={actionLoading} className="btn-lavanila btn-lavanila-primary">
                      <CheckCircle size={16} /> Setujui (Approved)
                    </button>
                  )}
                  {['Pending', 'Approved'].includes(data.status) && (
                    <button onClick={() => handleUpdateStatus('In Process')} disabled={actionLoading} className="btn-lavanila btn-lavanila-secondary">
                      <RefreshCw size={16} /> Tandai Processing
                    </button>
                  )}
                  {['Approved', 'In Process'].includes(data.status) && (
                    <button onClick={() => handleUpdateStatus('Completed')} disabled={actionLoading} className="btn-lavanila btn-lavanila-success">
                      <CheckCircle size={16} /> Tandai Completed (Selesai)
                    </button>
                  )}
                  {!showRejectInput && (
                    <button onClick={() => setShowRejectInput(true)} disabled={actionLoading} className="btn-lavanila btn-lavanila-danger">
                      <XCircle size={16} /> Tolak (Reject)
                    </button>
                  )}
                </div>

                {showRejectInput && (
                  <div style={{ marginTop: '12px' }}>
                    <textarea
                      placeholder="Masukkan alasan penolakan..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #dc2626' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => handleUpdateStatus('Rejected')} className="btn-lavanila btn-lavanila-danger">Konfirmasi Tolak</button>
                      <button onClick={() => setShowRejectInput(false)} className="btn-lavanila btn-lavanila-secondary">Batal</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

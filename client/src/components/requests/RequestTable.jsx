import React, { useState } from 'react';
import { formatDate, formatTicketNo } from '../../utils/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const RequestTable = ({ requisitions, onSelectRequisition }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(requisitions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = requisitions.slice(startIndex, startIndex + itemsPerPage);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'status-waiting';
      case 'In Process': return 'status-processing';
      case 'Completed': return 'status-completed';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'WAITING';
      case 'In Process': return 'PROCESSING';
      case 'Completed': return 'COMPLETED';
      case 'Rejected': return 'REJECTED';
      default: return status ? status.toUpperCase() : 'WAITING';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'priority-critical';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'Urgent': return 'CRITICAL';
      case 'High': return 'HIGH';
      case 'Medium': return 'MEDIUM';
      case 'Low': return 'LOW';
      default: return priority ? priority.toUpperCase() : 'MEDIUM';
    }
  };

  return (
    <div className="table-card">
      <table className="custom-table">
        <thead>
          <tr>
            <th>NO</th>
            <th>DEPARTEMENT</th>
            <th>PRIORTY</th>
            <th>DATE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Belum ada laporan perbaikan yang sesuai.
              </td>
            </tr>
          ) : (
            currentItems.map((req) => (
              <tr key={req.id} onClick={() => onSelectRequisition(req.id)}>
                <td style={{ fontWeight: 800 }}>{formatTicketNo(req.ticket_number)}</td>
                <td style={{ fontWeight: 700, textTransform: 'uppercase' }}>{req.department_name}</td>
                <td>
                  <span className={`priority-tag ${getPriorityClass(req.priority_level)}`}>
                    {getPriorityLabel(req.priority_level)}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{formatDate(req.created_at)}</td>
                <td>
                  <span className={`status-tag ${getStatusClass(req.status)}`}>
                    {getStatusLabel(req.status)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Footer matching Mockup 1 */}
      <div className="table-pagination-footer">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          className="pagination-btn"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="pagination-number">{currentPage}</span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          className="pagination-btn"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

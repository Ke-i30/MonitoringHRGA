import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusClass = (st) => {
    switch (st) {
      case 'Pending': return 'status-waiting';
      case 'In Process': return 'status-processing';
      case 'Completed': return 'status-completed';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusLabel = (st) => {
    switch (st) {
      case 'Pending': return 'WAITING';
      case 'In Process': return 'PROCESSING';
      case 'Completed': return 'COMPLETED';
      case 'Rejected': return 'REJECTED';
      default: return st ? st.toUpperCase() : 'WAITING';
    }
  };

  return (
    <span className={`status-tag ${getStatusClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getPriorityClass = (pr) => {
    switch (pr) {
      case 'Urgent': return 'priority-critical';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getPriorityLabel = (pr) => {
    switch (pr) {
      case 'Urgent': return 'CRITICAL';
      case 'High': return 'HIGH';
      case 'Medium': return 'MEDIUM';
      case 'Low': return 'LOW';
      default: return pr ? pr.toUpperCase() : 'MEDIUM';
    }
  };

  return (
    <span className={`priority-tag ${getPriorityClass(priority)}`}>
      {getPriorityLabel(priority)}
    </span>
  );
};

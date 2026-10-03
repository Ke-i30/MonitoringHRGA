import React from 'react';
import { SlidersHorizontal, Calendar, CheckCircle2 } from 'lucide-react';

export const RequestFilters = ({ departments, deptFilter, setDeptFilter, statusFilter, setStatusFilter }) => {
  return (
    <div className="table-filter-bar">
      <div className="filter-pill">
        <SlidersHorizontal size={16} />
        <span>DIVISI:</span>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="ALL">SEMUA DIVISI</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="filter-pill">
        <CheckCircle2 size={16} />
        <span>STATUS:</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">SEMUA STATUS</option>
          <option value="Pending">WAITING (PENDING)</option>
          <option value="In Process">PROCESSING</option>
          <option value="Completed">COMPLETED</option>
          <option value="Rejected">REJECTED</option>
        </select>
      </div>
    </div>
  );
};

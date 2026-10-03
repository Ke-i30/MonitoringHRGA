import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import { RequestAnalytics } from '../components/requests/RequestAnalytics';
import { RequestFilters } from '../components/requests/RequestFilters';
import { RequestTable } from '../components/requests/RequestTable';

export const RequisitionsPage = ({ search, onSelectRequisition }) => {
  const [requisitions, setRequisitions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqsData, deptsData] = await Promise.all([
        fetchApi('/requisitions'),
        fetchApi('/departments')
      ]);
      setRequisitions(reqsData.requisitions || []);
      setDepartments(deptsData.departments || []);
    } catch (err) {
      console.error('Failed to load requisitions data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequisitions = requisitions.filter((req) => {
    const matchesSearch =
      !search ||
      req.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      req.supervisor_name.toLowerCase().includes(search.toLowerCase()) ||
      req.department_name.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || req.department_name.toUpperCase() === deptFilter.toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div>
      {/* Top KPI Analytics & Request Trend Area Chart */}
      <RequestAnalytics requisitions={requisitions} />

      {/* Pill Filter Bar */}
      <RequestFilters
        departments={departments}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Requisition Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat daftar laporan perbaikan...</div>
      ) : (
        <RequestTable
          requisitions={filteredRequisitions}
          onSelectRequisition={onSelectRequisition}
        />
      )}
    </div>
  );
};

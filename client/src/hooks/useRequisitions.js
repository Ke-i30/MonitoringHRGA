import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../api';

export const useRequisitions = (search = '', deptFilter = 'ALL', statusFilter = 'ALL') => {
  const [requisitions, setRequisitions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqsData, deptsData] = await Promise.all([
        fetchApi('/requisitions'),
        fetchApi('/departments')
      ]);
      setRequisitions(reqsData.requisitions || []);
      setDepartments(deptsData.departments || []);
    } catch (err) {
      console.error('Failed to load requisitions data:', err);
      setError(err.message || 'Gagal mengambil data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return {
    requisitions: filteredRequisitions,
    allRequisitions: requisitions,
    departments,
    loading,
    error,
    refresh: loadData
  };
};

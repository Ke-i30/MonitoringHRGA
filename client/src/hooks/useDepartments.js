import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../api';

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi('/departments');
      setDepartments(res.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setError(err.message || 'Gagal mengambil data divisi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const toggleStatus = async (id) => {
    await fetchApi(`/departments/${id}/toggle-status`, { method: 'PUT' });
    await loadDepartments();
  };

  return {
    departments,
    loading,
    error,
    refresh: loadDepartments,
    toggleStatus
  };
};

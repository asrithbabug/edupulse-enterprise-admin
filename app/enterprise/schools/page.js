'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';

export default function SchoolsPage() {
  const router = useRouter();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  async function fetchSchools() {
    setLoading(true);
    try {
      const res = await api.getSchools();
      if (res && res.data) {
        setSchools(res.data);
      } else if (Array.isArray(res)) {
        setSchools(res);
      } else {
        setSchools([]);
      }
    } catch (err) {
      setSchools([]);
    }
    setLoading(false);
  }

  async function handleResendPassword(school) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://13.126.4.16'}/api/password/resend-setup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('edupulse_token')}` },
          body: JSON.stringify({ userId: `ADM${String(school.id).padStart(3, '0')}` }),
        }
      );
      const data = await res.json();
      alert(data.message || 'Password reset link sent!');
    } catch (err) {
      alert('Failed to send reset link');
    }
  }

  async function handleLockToggle(school) {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://13.126.4.16'}/api/enterprise/schools/${school.id}/lock`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('edupulse_token')}` },
          body: JSON.stringify({ locked: !school.is_locked }),
        }
      );
      fetchSchools();
    } catch (err) {
      alert('Failed to update school');
    }
  }

  async function handleDelete(school) {
    if (!confirm(`Are you sure you want to delete "${school.name}"? This cannot be undone.`)) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://13.126.4.16'}/api/enterprise/schools/${school.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('edupulse_token')}` },
        }
      );
      fetchSchools();
    } catch (err) {
      alert('Failed to delete school');
    }
  }

  const columns = [
    { key: 'name', label: 'School Name' },
    { key: 'code', label: 'Code' },
    { key: 'city', label: 'City' },
    { key: 'student_count', label: 'Students', render: (val) => val || 0 },
    { key: 'teacher_count', label: 'Teachers', render: (val) => val || 0 },
    { key: 'is_locked', label: 'Access', render: (val) => (
      <Badge variant={val ? 'danger' : 'success'}>{val ? 'Locked' : 'Active'}</Badge>
    )},
    { key: 'actions', label: 'Actions', render: (val, row) => (
      <div className="flex gap-1">
        <button onClick={() => handleResendPassword(row)} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100" title="Resend password email">
          📧 Resend
        </button>
        <button onClick={() => handleLockToggle(row)} className={`px-2 py-1 text-xs rounded ${row.is_locked ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
          {row.is_locked ? '🔓 Unlock' : '🔒 Lock'}
        </button>
        <button onClick={() => handleDelete(row)} className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100" title="Delete school">
          🗑️
        </button>
      </div>
    )},
  ];

  const totalStudents = schools.reduce((sum, s) => sum + (parseInt(s.student_count) || 0), 0);
  const activeCount = schools.filter(s => !s.is_locked && s.is_active).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Schools</h2>
          <p className="text-text-secondary text-sm mt-1">Manage all registered schools</p>
        </div>
        <button
          onClick={() => router.push('/enterprise/schools/add')}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add School
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-text-primary">{schools.length}</p>
          <p className="text-xs text-text-muted">Total Schools</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-success">{activeCount}</p>
          <p className="text-xs text-text-muted">Active</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{totalStudents.toLocaleString()}</p>
          <p className="text-xs text-text-muted">Total Students</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-warning">{schools.filter(s => s.is_locked).length}</p>
          <p className="text-xs text-text-muted">Locked</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={schools}
        searchPlaceholder="Search schools..."
      />
    </div>
  );
}

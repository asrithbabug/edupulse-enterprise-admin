'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';


export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.getTickets();
        setTickets(res && res.data ? res.data : Array.isArray(res) ? res : []);
      } catch (err) {
        console.warn('Failed to fetch tickets:', err.message);
        setTickets([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTickets = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  const priorityVariant = (priority) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'neutral';
      default: return 'neutral';
    }
  };

  const statusVariant = (status) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in-progress': return 'info';
      case 'resolved': return 'success';
      default: return 'neutral';
    }
  };

  const columns = [
    { key: 'id', label: 'ID', render: (val) => `#${val}` },
    { key: 'school', label: 'School' },
    { key: 'subject', label: 'Subject' },
    {
      key: 'priority',
      label: 'Priority',
      render: (val) => <Badge variant={priorityVariant(val)}>{val ? val.charAt(0).toUpperCase() + val.slice(1) : 'N/A'}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={statusVariant(val)}>
          {val ? val.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'N/A'}
        </Badge>
      ),
    },
    { key: 'createdAt', label: 'Created' },
  ];

  // Stats
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in-progress').length;
  const criticalCount = tickets.filter((t) => t.priority === 'critical').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Support Tickets</h2>
        <p className="text-text-secondary text-sm mt-1">Manage school support requests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-text-primary">{tickets.length}</p>
          <p className="text-xs text-text-muted">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-warning">{openCount}</p>
          <p className="text-xs text-text-muted">Open</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary">{inProgressCount}</p>
          <p className="text-xs text-text-muted">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-danger">{criticalCount}</p>
          <p className="text-xs text-text-muted">Critical</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'in-progress', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-text-secondary hover:bg-gray-50'
            }`}
          >
            {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredTickets}
        searchPlaceholder="Search tickets..."
      />
    </div>
  );
}

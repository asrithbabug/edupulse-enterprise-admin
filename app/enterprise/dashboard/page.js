'use client';

import { useState, useEffect } from 'react';
import { BuildingOffice2Icon, CurrencyDollarIcon, CreditCardIcon, TicketIcon } from '@heroicons/react/24/outline';
import StatCard from '@/components/StatCard';
import { ChartLine, ChartBar } from '@/components/Chart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';


export default function EnterpriseDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.getEnterpriseDashboard();
        setData(res || null);
      } catch (err) {
        console.warn('Failed to fetch enterprise dashboard:', err.message);
        setData(null);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Safe access with defaults
  const d = data || {};
  const totalSchools = d.total_schools || d.totalSchools || 0;
  const totalRevenue = d.revenue?.total || d.totalRevenue || 0;
  const activeSubscriptions = d.subscriptions?.active || d.activeSubscriptions || 0;
  const openTickets = d.open_tickets || d.openTickets || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
        <p className="text-text-secondary text-sm mt-1">Overview of all managed schools and metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BuildingOffice2Icon}
          label="Total Schools"
          value={totalSchools}
          trend=""
          trendUp={true}
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Total Revenue"
          value={totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : '₹0'}
          trend=""
          trendUp={true}
        />
        <StatCard
          icon={CreditCardIcon}
          label="Active Subscriptions"
          value={activeSubscriptions}
          trend=""
          trendUp={true}
        />
        <StatCard
          icon={TicketIcon}
          label="Open Tickets"
          value={openTickets}
          trend=""
          trendUp={false}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartLine
          data={d.schoolGrowth || []}
          dataKey="schools"
          xKey="month"
          title="School Growth"
          color="primary"
          height={280}
        />
        <ChartBar
          data={d.revenueChart || []}
          dataKey="revenue"
          xKey="month"
          title="Monthly Revenue (₹)"
          color="success"
          height={280}
        />
      </div>
    </div>
  );
}

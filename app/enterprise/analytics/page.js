'use client';

import { useState, useEffect } from 'react';
import { ChartLine, ChartArea } from '@/components/Chart';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';


export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.getAnalytics();
        setData(res || null);
      } catch (err) {
        console.warn('Failed to fetch analytics:', err.message);
        setData(null);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Safe access with defaults - API returns snake_case keys
  const d = data || {};
  const schoolGrowth = d.school_growth || d.schoolGrowth || [];
  const userActivity = d.users_by_role || d.userActivity || [];
  const weeklyAttendance = d.weekly_attendance || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Analytics</h2>
        <p className="text-text-secondary text-sm mt-1">Platform usage and growth metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartLine
          data={schoolGrowth}
          dataKey="schools"
          xKey="month"
          title="School Growth Over Time"
          color="primary"
          height={300}
        />
        <ChartArea
          data={userActivity}
          dataKeys={['parents', 'teachers', 'admins']}
          xKey="month"
          title="User Activity by Role"
          colors={['primary', 'success', 'warning']}
          height={300}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Peak Month</h4>
          <p className="text-lg font-bold text-text-primary">January 2024</p>
          <p className="text-xs text-text-muted mt-1">Highest user activity recorded</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Growth Rate</h4>
          <p className="text-lg font-bold text-success">+33%</p>
          <p className="text-xs text-text-muted mt-1">School signups vs 6 months ago</p>
        </div>
        <div className="card">
          <h4 className="text-sm font-medium text-text-secondary mb-2">Active Users</h4>
          <p className="text-lg font-bold text-primary">3,501</p>
          <p className="text-xs text-text-muted mt-1">Across all schools this month</p>
        </div>
      </div>
    </div>
  );
}

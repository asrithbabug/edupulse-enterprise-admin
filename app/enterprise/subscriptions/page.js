'use client';

import { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';


export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [plansRes, schoolsRes] = await Promise.all([
          api.getPlans(),
          api.getSchools(),
        ]);
        setPlans(plansRes && plansRes.data ? plansRes.data : Array.isArray(plansRes) ? plansRes : []);
        setSchools(schoolsRes && schoolsRes.data ? schoolsRes.data : Array.isArray(schoolsRes) ? schoolsRes : []);
      } catch (err) {
        console.warn('Failed to fetch subscriptions data:', err.message);
        setPlans([]);
        setSchools([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleAssign = async (planId) => {
    if (!selectedSchool) {
      alert('Please select a school first');
      return;
    }
    setAssigning(true);
    await api.assignPlan(selectedSchool, planId);
    setAssigning(false);
    alert('Plan assigned successfully!');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Subscriptions</h2>
        <p className="text-text-secondary text-sm mt-1">Manage subscription plans and assignments</p>
      </div>

      {/* School Selector */}
      <div className="card max-w-md">
        <label className="text-sm font-medium text-text-secondary mb-2 block">Assign plan to school</label>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="input-field"
        >
          <option value="">Select a school...</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name} — Current: {school.plan || 'None'}
            </option>
          ))}
        </select>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="card relative hover:shadow-md transition-shadow">
            {plan.name === 'Premium' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">Popular</span>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-text-primary">{plan.name || 'Unnamed'}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-text-primary">₹{((plan.price || 0) / 1000).toFixed(0)}K</span>
                <span className="text-text-muted text-sm">/{plan.interval || 'month'}</span>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              {(plan.features || []).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckIcon className="w-4 h-4 text-success flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleAssign(plan.id)}
              disabled={!selectedSchool || assigning}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                plan.name === 'Premium'
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {assigning ? 'Assigning...' : 'Assign Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

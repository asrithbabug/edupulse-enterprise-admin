'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuildingOffice2Icon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { getUserRole, setAuth } from '@/lib/auth';

export default function EnterpriseLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInvalidCredentials, setIsInvalidCredentials] = useState(false);

  useEffect(() => {
    const role = getUserRole();
    if (role === 'enterprise_admin') {
      router.replace('/enterprise/dashboard');
    } else if (role === 'school_admin') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsInvalidCredentials(false);
    setLoading(true);

    try {
      const res = await api.enterpriseLogin(formData);

      if (res && res.token) {
        setAuth(res.token, res.user || { name: 'Enterprise Admin', role: 'enterprise_admin' });
        router.push('/enterprise/dashboard');
      } else {
        setError('Invalid credentials. Please check your ID and password.');
        setIsInvalidCredentials(true);
      }
    } catch (err) {
      if (err.message && err.message.includes('set your password')) {
        setError('Please set your password using the link sent to your email.');
        setIsInvalidCredentials(false);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
        setIsInvalidCredentials(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Outer container — everything constrained to max-w-md and aligned */}
      <div className="w-full max-w-md mx-auto">
        <div className="card border-2 border-primary/20 ring-1 ring-primary/15 shadow-2xl p-8 space-y-8">

          {/* Back link — left-aligned to the card edge */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </button>

          {/* Logo */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BuildingOffice2Icon className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Enterprise Admin Login</h1>
            <p className="text-text-secondary mt-1">Sign in to manage all schools</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                Enterprise ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => {
                  setFormData({ ...formData, id: e.target.value });
                  setError('');
                  setIsInvalidCredentials(false);
                }}
                placeholder="Enter enterprise ID"
                className={`input-field ${isInvalidCredentials ? 'border-danger ring-danger/10 focus:border-danger focus:ring-danger/20' : ''}`}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError('');
                  setIsInvalidCredentials(false);
                }}
                placeholder="Enter password"
                className={`input-field ${isInvalidCredentials ? 'border-danger ring-danger/10 focus:border-danger focus:ring-danger/20' : ''}`}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger/10 p-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !formData.id.trim() || !formData.password.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

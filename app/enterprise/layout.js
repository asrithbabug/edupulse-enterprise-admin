'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { isAuthenticated, getUserRole } from '@/lib/auth';

export default function EnterpriseLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // The /enterprise page is the login page — don't wrap it in the authenticated layout
  const isLoginPage = pathname === '/enterprise' || pathname === '/enterprise/';

  useEffect(() => {
    if (isLoginPage) {
      setReady(true);
      return;
    }

    if (!isAuthenticated()) {
      router.push('/enterprise');
      return;
    }
    const role = getUserRole();
    if (role !== 'enterprise_admin') {
      if (role === 'school_admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
      return;
    }
    setReady(true);
  }, [router, pathname, isLoginPage]);

  if (!ready) return null;

  // Login page — render without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authenticated enterprise panel
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="enterprise" />
      <div className="lg:ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

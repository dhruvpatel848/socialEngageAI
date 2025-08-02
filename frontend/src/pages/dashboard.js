import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../utils/AuthContext';
import { FaSpinner } from 'react-icons/fa';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status after auth context is loaded
    console.log('Dashboard: Auth state -', { isAuthenticated, authLoading });
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('Dashboard: Not authenticated, redirecting to login');
        router.push('/login').then(() => {
          console.log('Dashboard: Navigation to login completed');
        }).catch(err => {
          console.error('Dashboard: Navigation error:', err);
        });
      } else {
        console.log('Dashboard: Authenticated, loading dashboard');
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center min-h-screen">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <Dashboard />
          </div>
        </div>
      </div>
    </Layout>
  );
}
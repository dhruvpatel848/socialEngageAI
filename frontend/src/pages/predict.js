import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import PredictionForm from '../components/PredictionForm';
import { useAuth } from '../utils/AuthContext';
import { FaSpinner } from 'react-icons/fa';

export default function PredictPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status after auth context is loaded
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('Predict: Not authenticated, redirecting to login');
        router.push('/login').then(() => {
          console.log('Predict: Navigation to login completed');
        }).catch(err => {
          console.error('Predict: Navigation error:', err);
        });
      } else {
        console.log('Predict: Authenticated, loading prediction form');
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <Layout title="New Prediction">
        <div className="flex justify-center items-center min-h-screen">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="New Prediction">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Prediction</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <PredictionForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
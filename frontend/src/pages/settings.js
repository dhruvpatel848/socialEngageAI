import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaUser, FaEnvelope, FaLock, FaSave } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function SettingsPage() {
  const { user, updateProfile, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    // Check authentication status after auth context is loaded
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('Settings: Not authenticated, redirecting to login');
        router.push('/login').then(() => {
          console.log('Settings: Navigation to login completed');
        }).catch(err => {
          console.error('Settings: Navigation error:', err);
        });
      } else {
        console.log('Settings: Authenticated, loading settings page');
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, router]);

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    setUpdateError('');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${baseUrl}/api/users/profile`,
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateProfile(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update profile. Please try again.');
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (values, { setSubmitting, resetForm }) => {
    setUpdateError('');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${baseUrl}/api/users/password`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Password updated successfully!');
      resetForm();
    } catch (error) {
      console.error('Password update error:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update password. Please try again.');
      toast.error('Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout title="Settings">
        <div className="flex justify-center items-center min-h-screen">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'password' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Change Password
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {updateError && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{updateError}</p>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <Formik
                    initialValues={{
                      name: user?.name || '',
                      email: user?.email || '',
                    }}
                    validationSchema={ProfileSchema}
                    onSubmit={handleProfileUpdate}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaUser className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <Field
                              id="name"
                              name="name"
                              type="text"
                              autoComplete="name"
                              className={`block w-full pl-10 pr-3 py-2 border ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                            />
                          </div>
                          <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaEnvelope className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <Field
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              className={`block w-full pl-10 pr-3 py-2 border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                            />
                          </div>
                          <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <FaSave className="h-5 w-5 mr-2" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}

                {activeTab === 'password' && (
                  <Formik
                    initialValues={{
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    }}
                    validationSchema={PasswordSchema}
                    onSubmit={handlePasswordUpdate}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form className="space-y-6">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Current Password
                          </label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <Field
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              autoComplete="current-password"
                              className={`block w-full pl-10 pr-3 py-2 border ${errors.currentPassword && touched.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                            />
                          </div>
                          <ErrorMessage name="currentPassword" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                          </label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <Field
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              autoComplete="new-password"
                              className={`block w-full pl-10 pr-3 py-2 border ${errors.newPassword && touched.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                            />
                          </div>
                          <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                          </label>
                          <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <Field
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              autoComplete="new-password"
                              className={`block w-full pl-10 pr-3 py-2 border ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                            />
                          </div>
                          <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <>
                                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <FaSave className="h-5 w-5 mr-2" />
                                Update Password
                              </>
                            )}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
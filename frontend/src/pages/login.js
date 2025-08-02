import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaSpinner, FaEnvelope, FaLock } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useAuth } from '../utils/AuthContext';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loginError, setLoginError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Login: Auth state -', { isAuthenticated, authLoading });
    if (isAuthenticated) {
      console.log('Login: Already authenticated, redirecting to dashboard');
      router.push('/dashboard').then(() => {
        console.log('Login: Navigation to dashboard completed');
      }).catch(err => {
        console.error('Login: Navigation error:', err);
      });
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError('');
    try {
      console.log('Attempting login with:', values.email);
      const result = await login(values);
      console.log('Login result:', result);
      if (result.success) {
        console.log('Login successful, redirecting to dashboard...');
        router.push('/dashboard').then(() => {
          console.log('Navigation to dashboard completed');
        }).catch(err => {
          console.error('Navigation error:', err);
        });
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout title="Login">
        <div className="flex justify-center items-center min-h-screen">
          <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Login">
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                {loginError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <p className="text-red-700">{loginError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ${errors.email && touched.email ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                      Password
                    </label>
                    <div className="text-sm">
                      <Link href="/forgot-password" className="font-semibold text-primary-600 hover:text-primary-500">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className={`block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ${errors.password && touched.password ? 'ring-red-500' : 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6`}
                      placeholder="••••••••"
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{' '}
            <Link href="/register" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../utils/AuthContext';
import { FaChartLine, FaChartBar, FaUser, FaSignOutAlt, FaCog, FaPlus, FaHistory, FaHome, FaDatabase } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Client-side only wrapper component
const ClientSideLayout = ({ children, title }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Define toggleMobileMenu function
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <LayoutUI 
      user={user}
      logout={logout}
      isAuthenticated={isAuthenticated}
      router={router}
      isMobileMenuOpen={isMobileMenuOpen}
      toggleMobileMenu={toggleMobileMenu}
      title={title}
    >
      {children}
    </LayoutUI>
  );
};

// UI component that doesn't directly use hooks
const LayoutUI = ({ 
  children, 
  title = 'EngageAI',
  user,
  logout,
  isAuthenticated,
  router,
  isMobileMenuOpen,
  toggleMobileMenu
}) => {

  // toggleMobileMenu is passed from props

  // Define navigation items based on user role
  const navigation = [
    { name: 'Home', href: '/', icon: FaHome },
    { name: 'Dashboard', href: '/dashboard', icon: FaChartLine },
    { name: 'New Prediction', href: '/predict', icon: FaPlus },
    { name: 'History', href: '/history', icon: FaHistory },
    { name: 'Settings', href: '/settings', icon: FaCog },
    // Show Admin Panel and Data Management links only for admin users
    ...(user?.role === 'admin' ? [
      { name: 'Data Management', href: '/data-management', icon: FaDatabase },
      { name: 'Admin Panel', href: '/admin', icon: FaUser }
    ] : []),
  ];

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        {/* Use a single text node for the title to avoid hydration issues */}
        <title key="page-title">{title ? `${title} | EngageAI` : 'EngageAI'}</title>
        <meta name="description" content="EngageAI - Social Media Engagement Prediction Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="top-right" />

      {isAuthenticated ? (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar for desktop */}
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-primary-700">
                <div className="flex items-center flex-shrink-0 px-4">
                  <Link href="/" className="text-xl font-bold text-white">
                    EngageAI
                  </Link>
                </div>
                <div className="mt-5 flex-1 flex flex-col">
                  <nav className="flex-1 px-2 space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive(item.href)
                            ? 'bg-primary-800 text-white'
                            : 'text-white hover:bg-primary-600'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 flex-shrink-0 h-6 w-6 ${
                            isActive(item.href) ? 'text-white' : 'text-primary-300'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="px-3 mt-6">
                  <div className="flex items-center px-2 py-3 text-sm font-medium text-white">
                    <FaUser className="mr-3 h-6 w-6 text-primary-300" />
                    <span className="flex-1 truncate">{user?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-2 py-2 mt-1 text-sm font-medium text-white rounded-md hover:bg-primary-600"
                  >
                    <FaSignOutAlt className="mr-3 h-6 w-6 text-primary-300" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile header */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="md:hidden">
              <div className="flex items-center justify-between bg-primary-700 px-4 py-2">
                <Link href="/" className="text-xl font-bold text-white">
                  EngageAI
                </Link>
                <button
                  type="button"
                  className="-mr-3 h-12 w-12 inline-flex items-center justify-center rounded-md text-white hover:bg-primary-600 focus:outline-none"
                  onClick={toggleMobileMenu}
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile menu */}
              {isMobileMenuOpen && (
                <div className="fixed inset-0 flex z-40">
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
                  <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-700">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={toggleMobileMenu}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <svg
                          className="h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                      <div className="flex-shrink-0 flex items-center px-4">
                        <Link href="/" className="text-xl font-bold text-white">
                          EngageAI
                        </Link>
                      </div>
                      <nav className="mt-5 px-2 space-y-1">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                              isActive(item.href)
                                ? 'bg-primary-800 text-white'
                                : 'text-white hover:bg-primary-600'
                            }`}
                            onClick={toggleMobileMenu}
                          >
                            <item.icon
                              className={`mr-4 flex-shrink-0 h-6 w-6 ${
                                isActive(item.href) ? 'text-white' : 'text-primary-300'
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        ))}
                      </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-primary-800 p-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-base font-medium text-white">{user?.name || 'User'}</div>
                          <div className="text-sm font-medium text-primary-300">{user?.email}</div>
                        </div>
                        <button
                          onClick={logout}
                          className="ml-auto flex-shrink-0 bg-primary-800 p-1 rounded-full text-primary-300 hover:text-white"
                        >
                          <FaSignOutAlt className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-14"></div>
                </div>
              )}
            </div>

            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <header className="bg-primary-700 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link href="/" className="text-xl font-bold text-white">
                      EngageAI
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <Link
                    href="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium text-white ${
                      isActive('/login') ? 'bg-primary-800' : 'hover:bg-primary-600'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`ml-4 px-3 py-2 rounded-md text-sm font-medium text-white ${
                      isActive('/register') ? 'bg-primary-800' : 'hover:bg-primary-600'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-grow">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
          <footer className="bg-white">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} EngageAI. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

// Create a dynamic import wrapper for client-side only rendering
// Export the client-side only version with no SSR
const Layout = dynamic(() => Promise.resolve(ClientSideLayout), { ssr: false });

// Export the Layout component
export default Layout;
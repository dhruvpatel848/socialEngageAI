import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import { useAuth } from '../utils/AuthContext';
import { FaPlus, FaTrash, FaEye, FaSpinner, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';
import { dataService } from '../services/api';

export default function DataManagement() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    media_type: '',
    start_date: '',
    end_date: '',
  });

  // Fetch posts data
  const fetchPosts = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await dataService.getPosts(page, limit, filters);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load data: ' + (error.response?.data?.msg || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchPosts(page, pagination.limit);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchPosts(1, pagination.limit);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      media_type: '',
      start_date: '',
      end_date: '',
    });
    fetchPosts(1, pagination.limit);
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await dataService.deletePost(postId);
      toast.success('Post deleted successfully');
      fetchPosts(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.msg || 'Error deleting post');
    }
  };

  // View post details
  const handleViewPost = async (postId) => {
    try {
      // For now, just show a toast. In a real app, you might navigate to a detail page
      // const post = await dataService.getPostById(postId);
      // router.push(`/post/${postId}`);
      toast.success(`Viewing post ${postId}`);
    } catch (error) {
      console.error('Error viewing post:', error);
      toast.error('Error viewing post details');
    }
  };

  // Initialize data loading
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPosts();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading]);

  // Table columns configuration
  const columns = [
    {
      Header: 'Post ID',
      accessor: 'post_id',
    },
    {
      Header: 'Text',
      accessor: 'post_text',
      Cell: ({ value }) => (
        <div className="max-w-xs truncate">{value}</div>
      ),
    },
    {
      Header: 'Media Type',
      accessor: 'media_type',
    },
    {
      Header: 'Date',
      accessor: 'timestamp',
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: 'Likes',
      accessor: 'likes',
    },
    {
      Header: 'Shares',
      accessor: 'shares',
    },
    {
      Header: 'Comments',
      accessor: 'comments',
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewPost(row.post_id)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleDeletePost(row.post_id)}
            className="text-red-600 hover:text-red-800"
            title="Delete Post"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // Redirect to login if not authenticated or to dashboard if not admin
  if (!authLoading) {
    if (!isAuthenticated) {
      router.push('/login');
      return null;
    } else if (isAuthenticated && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      toast.error('Only administrators can access data management');
      return null;
    }
  }

  return (
    <Layout title="Data Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Data Management</h1>
            <Link href="/data-upload" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
              <FaPlus className="-ml-1 mr-2 h-4 w-4" />
              Upload Data
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Manage your social media data and analyze engagement metrics.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="media_type" className="block text-sm font-medium text-gray-700">
                      Media Type
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFilter className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="media_type"
                        name="media_type"
                        value={filters.media_type}
                        onChange={handleFilterChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                        <option value="link">Link</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex-none flex items-end space-x-2">
                    <button
                      type="button"
                      onClick={applyFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Apply Filters
                    </button>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="p-4">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <FaSpinner className="animate-spin h-8 w-8 text-primary-500" />
                  </div>
                ) : (
                  <DataTable
                    data={posts}
                    columns={columns}
                    loading={loading}
                    paginate={false} // We're handling pagination manually
                    emptyState={() => (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No data available</p>
                        <p className="text-gray-400 text-sm mt-1">Upload some data to get started</p>
                        <Link href="/data-upload" className="inline-flex items-center px-4 py-2 mt-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                          <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                          Upload Data
                        </Link>
                      </div>
                    )}
                  />
                )}

                {/* Custom Pagination */}
                {!loading && pagination.total > 0 && (
                  <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                          <span className="font-medium">{pagination.total}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {/* Page numbers */}
                          {[...Array(pagination.pages).keys()].map((page) => {
                            const pageNumber = page + 1;
                            // Only show a few pages around the current page
                            if (
                              pageNumber === 1 ||
                              pageNumber === pagination.pages ||
                              (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                            ) {
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => handlePageChange(pageNumber)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pagination.page === pageNumber ? 'bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            } else if (
                              (pageNumber === 2 && pagination.page > 3) ||
                              (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                            ) {
                              return (
                                <span
                                  key={pageNumber}
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}

                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
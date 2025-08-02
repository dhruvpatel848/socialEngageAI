import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import DataTable from '../components/DataTable';
import Card from '../components/Card';
import { useAuth } from '../utils/AuthContext';
import { FaUserPlus, FaUserEdit, FaTrash, FaUpload, FaSync, FaUsers } from 'react-icons/fa';
import { authService } from '../services/api';

// Admin page component
export default function AdminPanel() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modelUploadStatus, setModelUploadStatus] = useState('idle');

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.role !== 'admin') {
        toast.error('You do not have permission to access this page');
        router.push('/dashboard');
      }
    } else if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [user, isAuthenticated, authLoading, router]);

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // This endpoint would need to be implemented in the backend
      const response = await authService.getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users: ' + (error.response?.data?.msg || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  // Initialize data loading
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // This endpoint would need to be implemented in the backend
      await authService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.msg || 'Error deleting user');
    }
  };

  // Handle user edit
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Handle user creation
  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  // Handle model upload
  const handleModelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('model', file);

    setModelUploadStatus('uploading');
    try {
      // This endpoint would need to be implemented in the backend
      await fetch('/api/admin/upload-model', {
        method: 'POST',
        body: formData,
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      toast.success('Model uploaded successfully');
      setModelUploadStatus('success');
    } catch (error) {
      console.error('Error uploading model:', error);
      toast.error('Error uploading model');
      setModelUploadStatus('error');
    }
  };

  // Handle model training
  const handleTrainModel = async () => {
    try {
      // This endpoint would need to be implemented in the backend
      await fetch('/api/admin/train-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      });
      toast.success('Model training initiated');
    } catch (error) {
      console.error('Error training model:', error);
      toast.error('Error initiating model training');
    }
  };

  // Define columns for the users table
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (value) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditUser(row)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit User"
          >
            <FaUserEdit />
          </button>
          <button
            onClick={() => handleDeleteUser(value)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete User"
            disabled={row.role === 'admin'}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // If loading auth, show loading state
  if (authLoading) {
    return (
      <Layout title="Admin Panel">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  // If not authenticated or not admin, don't render content
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <Layout title="Admin Panel">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* User Management Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaUsers className="mr-2" /> User Management
                </h2>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                >
                  <FaUserPlus className="mr-2" /> Add User
                </button>
              </div>
              
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <DataTable
                  data={users}
                  columns={columns}
                  loading={loading}
                  paginate={true}
                  pageSize={10}
                  emptyState={() => (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No users found</p>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* ML Model Management Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Upload ML Model">
                <div className="p-4">
                  <p className="text-gray-600 mb-4">
                    Upload a new machine learning model to replace the current one.
                  </p>
                  <div className="flex items-center space-x-4">
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer flex items-center">
                      <FaUpload className="mr-2" />
                      Select Model File
                      <input
                        type="file"
                        className="hidden"
                        accept=".joblib,.pkl,.h5,.model"
                        onChange={handleModelUpload}
                        disabled={modelUploadStatus === 'uploading'}
                      />
                    </label>
                    {modelUploadStatus === 'uploading' && (
                      <span className="text-blue-600 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                        Uploading...
                      </span>
                    )}
                    {modelUploadStatus === 'success' && (
                      <span className="text-green-600">Upload successful!</span>
                    )}
                    {modelUploadStatus === 'error' && (
                      <span className="text-red-600">Upload failed</span>
                    )}
                  </div>
                </div>
              </Card>

              <Card title="Train ML Model">
                <div className="p-4">
                  <p className="text-gray-600 mb-4">
                    Initiate training of a new machine learning model using the current dataset.
                  </p>
                  <button
                    onClick={handleTrainModel}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FaSync className="mr-2" /> Start Training
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* User Modal - This would be implemented as a separate component in a real app */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedUser ? 'Edit User' : 'Create User'}
            </h2>
            <form className="space-y-4">
              {/* Form fields would go here */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="User name"
                  defaultValue={selectedUser?.name || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="user@example.com"
                  defaultValue={selectedUser?.email || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  defaultValue={selectedUser?.role || 'user'}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {!selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Password"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {selectedUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
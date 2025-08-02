import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import FileUpload from '../components/FileUpload';
import { useAuth } from '../utils/AuthContext';
import { FaUpload, FaSpinner, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

export default function DataUpload() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    // Check if file is CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Only CSV files are allowed');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/data/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.msg || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

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
    <Layout title="Data Upload">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Data Upload</h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload your social media data in CSV format to analyze and predict engagement.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Upload CSV File</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload your social media data in CSV format. The file should contain columns for post_id, post_text, media_type, hashtags, timestamp, user_id, followers_count, following_count, account_age, likes, shares, and comments.
                  </p>
                </div>

                <div className="mb-6">
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    accept=".csv,text/csv"
                    multiple={false}
                    maxSize={10 * 1024 * 1024} // 10MB
                    label="Upload CSV File"
                    hint="Drag and drop a CSV file here, or click to select a file"
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <div className="flex items-center justify-center py-4">
                    <FaSpinner className="animate-spin h-8 w-8 text-primary-500 mr-2" />
                    <span className="text-gray-700">Uploading and processing data...</span>
                  </div>
                )}

                {uploadResult && (
                  <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaInfoCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Upload Successful
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>{uploadResult.msg}</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Total records: {uploadResult.total}</li>
                            <li>Processed successfully: {uploadResult.processed}</li>
                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                              <li>
                                Errors: {uploadResult.errors.length}
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                  {uploadResult.errors.slice(0, 5).map((error, index) => (
                                    <li key={index} className="text-red-600">{error}</li>
                                  ))}
                                  {uploadResult.errors.length > 5 && (
                                    <li>...and {uploadResult.errors.length - 5} more errors</li>
                                  )}
                                </ul>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaFileAlt className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">CSV Format Requirements</h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <p className="mb-2">Your CSV file should include the following columns:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><strong>post_id</strong>: Unique identifier for the post</li>
                          <li><strong>post_text</strong>: The text content of the post</li>
                          <li><strong>media_type</strong>: Type of media (image, video, text, etc.)</li>
                          <li><strong>hashtags</strong>: Comma-separated list of hashtags</li>
                          <li><strong>timestamp</strong>: Date and time of the post (YYYY-MM-DD HH:MM:SS)</li>
                          <li><strong>user_id</strong>: ID of the user who created the post</li>
                          <li><strong>followers_count</strong>: Number of followers at time of post</li>
                          <li><strong>following_count</strong>: Number of accounts following at time of post</li>
                          <li><strong>account_age</strong>: Age of the account in days</li>
                          <li><strong>likes</strong>: Number of likes received</li>
                          <li><strong>shares</strong>: Number of shares/retweets received</li>
                          <li><strong>comments</strong>: Number of comments received</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import React, { useRef, useState, useCallback } from 'react';
import { FaUpload, FaFile, FaFileImage, FaFileAlt, FaFilePdf, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * FileUpload Component
 * 
 * A reusable file upload component with drag and drop support.
 * 
 * @param {Object} props - Component props
 * @param {function} props.onFileSelect - Function to call when files are selected
 * @param {string} props.accept - File types to accept (e.g., 'image/*,.pdf')
 * @param {boolean} props.multiple - Whether to allow multiple file selection
 * @param {number} props.maxSize - Maximum file size in bytes
 * @param {number} props.maxFiles - Maximum number of files allowed
 * @param {string} props.label - Label for the upload area
 * @param {string} props.hint - Hint text for the upload area
 * @param {boolean} props.showPreview - Whether to show file previews
 * @param {boolean} props.showFileList - Whether to show the file list
 * @param {string} props.className - Additional CSS classes for the component
 * @param {boolean} props.disabled - Whether the upload is disabled
 */
const FileUpload = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  maxFiles = 5,
  label = 'Upload Files',
  hint = 'Drag and drop files here, or click to select files',
  showPreview = true,
  showFileList = true,
  className = '',
  disabled = false,
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    if (disabled) return;
    
    const newErrors = [];
    const newFiles = [];
    
    // Check if adding these files would exceed maxFiles
    if (multiple && maxFiles && files.length + selectedFiles.length > maxFiles) {
      newErrors.push(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    // Process each file
    Array.from(selectedFiles).forEach((file) => {
      // Check file size
      if (maxSize && file.size > maxSize) {
        newErrors.push(`File "${file.name}" exceeds the maximum size of ${formatFileSize(maxSize)}.`);
        return;
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            // Check file extension
            return fileExtension === type.toLowerCase();
          } else if (type.endsWith('/*')) {
            // Check file type category (e.g., 'image/*')
            const category = type.split('/')[0];
            return fileType.startsWith(`${category}/`);
          } else {
            // Check exact file type
            return fileType === type;
          }
        });

        if (!isAccepted) {
          newErrors.push(`File "${file.name}" is not an accepted file type.`);
          return;
        }
      }

      // Add file with preview URL
      newFiles.push({
        file,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      });
    });

    // Update state
    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onFileSelect && onFileSelect(multiple ? updatedFiles.map(f => f.file) : updatedFiles[0].file);
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
    }
  }, [files, multiple, maxSize, maxFiles, accept, onFileSelect, disabled]);

  // Handle click on upload area
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Handle file removal
  const handleRemoveFile = (id) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(updatedFiles);
    onFileSelect && onFileSelect(multiple ? updatedFiles.map(f => f.file) : updatedFiles.length > 0 ? updatedFiles[0].file : null);
  };

  // Handle error dismissal
  const handleDismissError = (index) => {
    setErrors(errors.filter((_, i) => i !== index));
  };

  // Get file icon based on file type
  const getFileIcon = (file) => {
    const fileType = file.type;
    if (fileType.startsWith('image/')) return <FaFileImage className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <FaFileVideo className="text-purple-500" />;
    if (fileType.startsWith('audio/')) return <FaFileAudio className="text-green-500" />;
    if (fileType === 'application/pdf') return <FaFilePdf className="text-red-500" />;
    if (fileType.includes('compressed') || fileType.includes('zip') || fileType.includes('archive')) {
      return <FaFileArchive className="text-yellow-500" />;
    }
    if (fileType.includes('text/') || fileType.includes('code') || fileType.includes('javascript') || fileType.includes('json')) {
      return <FaFileCode className="text-gray-500" />;
    }
    return <FaFileAlt className="text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
        />
        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">{label}</p>
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
        {maxSize && (
          <p className="mt-1 text-xs text-gray-500">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
        )}
        {multiple && maxFiles && (
          <p className="mt-1 text-xs text-gray-500">
            Maximum files: {maxFiles}
          </p>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center bg-red-50 text-red-700 p-3 rounded-md mb-2">
              <FaTimes className="flex-shrink-0 mr-2" />
              <span className="text-sm">{error}</span>
              <button
                type="button"
                className="ml-auto text-red-500 hover:text-red-700"
                onClick={() => handleDismissError(index)}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Previews */}
      {showPreview && files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map(({ id, file, preview }) => (
            file.type.startsWith('image/') && preview ? (
              <div key={id} className="relative group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                  <img
                    src={preview}
                    alt={file.name}
                    className="object-cover"
                    onLoad={() => URL.revokeObjectURL(preview)}
                  />
                </div>
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(id);
                  }}
                >
                  <FaTrash className="h-3 w-3" />
                </button>
                <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
              </div>
            ) : null
          ))}
        </div>
      )}

      {/* File List */}
      {showFileList && files.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-200 border border-gray-200 rounded-md">
          {files.map(({ id, file }) => (
            <li key={id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
              <div className="flex items-center flex-1 min-w-0">
                <span className="flex-shrink-0 mr-2">
                  {getFileIcon(file)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-gray-500 truncate">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className="font-medium text-red-600 hover:text-red-500"
                  onClick={() => handleRemoveFile(id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Upload Status */}
      {files.length > 0 && (
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <FaCheck className="mr-2 text-green-500" />
          <span>
            {files.length} {files.length === 1 ? 'file' : 'files'} selected
          </span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
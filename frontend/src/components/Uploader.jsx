import React, { useState, useRef, useCallback } from 'react';
import api from '../api.jsx';

// Helper function to format file size
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


function Uploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // This is the new, dedicated error state
  const [uploadError, setUploadError] = useState(null);

  const pollingIntervalRef = useRef(null);
  const fileInputRef = useRef(null); // Ref to access the hidden file input

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };
  
  // --- Click to Upload Handler ---
  const handleContainerClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setJobStatus(null);
    setUploadError(null);
  };

  const clearFile = () => {
    setFile(null);
    setJobStatus(null);
    setUploadError(null);
  };
  
  // --- Polling Logic ---
  const pollJobStatus = (jobId) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/job/${jobId}/status/`);
        const statusData = response.data;
        setJobStatus(statusData);

        if (statusData.status === 'COMPLETED' || statusData.status === 'FAILED') {
          clearInterval(pollingIntervalRef.current);
          setIsUploading(false);
          
          if (statusData.status === 'COMPLETED') {
            onUploadComplete(); // Tell App.jsx to refresh
          }
          if (statusData.status === 'FAILED') {
            // --- THIS IS THE FIX ---
            // Set the dedicated error state with the message from the backend
            setUploadError(statusData.error_message);
          }
        }
      } catch (err) {
        setUploadError('Failed to poll job status. Check the server.');
        clearInterval(pollingIntervalRef.current);
        setIsUploading(false);
      }
    }, 2000);
  };

  // --- Upload Logic ---
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setJobStatus(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/products/upload/', formData);
      const jobId = response.data.job_id;

      setJobStatus({ status: 'PENDING', progress_message: 'Starting job...' });
      pollJobStatus(jobId);

    } catch (err) {
      // Handle initial upload error (e.g., server is down)
      const errorMsg = err.response?.data?.error || 'Upload failed. Please try again.';
      setUploadError(errorMsg);
      setIsUploading(false);
    }
  };
  
  // --- UI Rendering ---
  const getProgressPercent = () => {
    if (!jobStatus) return 0;
    if (jobStatus.status === 'PENDING') return 25;
    if (jobStatus.status === 'PROCESSING') return 50;
    if (jobStatus.status === 'COMPLETED') return 100;
    return 0; // FAILED
  };

  return (
    <>
      {/* --- Section 1: The Uploader / Dropzone --- */}
      {!file && (
        <div 
          className={`uploader-container ${isDragging ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleContainerClick}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInputChange} 
            accept=".csv"
          />
          <p className="prompt">Drag & Drop your .csv file here</p>
          <p>or click to select file</p>
        </div>
      )}

      {/* --- Section 2: File Selected, Ready to Upload --- */}
      {file && (
        <div className="file-info">
          <p>
            Selected file: <strong>{file.name}</strong> ({formatBytes(file.size)})
          </p>
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Products'}
          </button>
          <button onClick={clearFile} disabled={isUploading} className="clear-btn">
            Clear
          </button>
        </div>
      )}

      {/* --- Section 3: Status / Progress / Error Box --- */}
      {uploadError && (
        <div className="status-box error">
          <p><strong>Upload Failed</strong></p>
          {/* This is the new part: it displays the full backend error */}
          <pre>{uploadError}</pre>
        </div>
      )}
      
      {jobStatus && !uploadError && (
         <div className={`status-box ${jobStatus.status === 'COMPLETED' ? 'success' : ''}`}>
          <p>Status: {jobStatus.status}</p>
          
          {(isUploading || jobStatus.status === 'COMPLETED') && (
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar" 
                style={{ width: `${getProgressPercent()}%` }}
              >
                {getProgressPercent()}%
              </div>
            </div>
          )}
          
          {jobStatus.status === 'COMPLETED' && (
            <p>{jobStatus.progress_message}</p>
          )}
        </div>
      )}
    </>
  );
}

export default Uploader;
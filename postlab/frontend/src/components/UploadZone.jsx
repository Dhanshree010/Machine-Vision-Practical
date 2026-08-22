import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function UploadZone({ onScanComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG).');
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  const handleScan = async () => {
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onScanComplete(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to process the document. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div 
        className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out ${
          dragActive ? 'border-brand-500 bg-brand-50 shadow-inner' : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
        
        {!file ? (
          <>
            <div className="p-4 bg-brand-100 rounded-full text-brand-600 mb-4 animate-bounce">
              <UploadCloud size={40} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Drag & Drop your document here</h3>
            <p className="text-slate-500 mb-6 text-sm">Supports JPG, PNG, and HEIC files</p>
            <button 
              onClick={() => inputRef.current.click()}
              className="btn-primary"
            >
              Browse Files
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center w-full max-w-md p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm mb-6 relative group">
              <div className="bg-brand-500 text-white p-2 rounded-lg mr-4">
                <File size={24} />
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={removeFile}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <button 
              onClick={handleScan}
              disabled={loading}
              className="btn-primary w-full max-w-md flex items-center justify-center py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Scanning & Extracting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={24} />
                  Scan Document
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm font-medium animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
}

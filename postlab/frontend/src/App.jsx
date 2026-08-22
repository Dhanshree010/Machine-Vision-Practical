import React, { useState } from 'react';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import { ScanText, Download, RotateCcw, Copy } from 'lucide-react';

function App() {
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleScanComplete = (data) => {
    setResult(data);
  };

  const handleReset = () => {
    setResult(null);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (result?.extracted_text) {
      navigator.clipboard.writeText(result.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-200 selection:text-brand-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white p-2 rounded-xl shadow-md">
                <ScanText size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">SmartScanner</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Digitize documents with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Machine Vision</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Upload an image of a receipt, invoice, or contract. Our computer vision pipeline will automatically correct the perspective and extract the text.
          </p>
        </div>

        {!result ? (
          <UploadZone onScanComplete={handleScanComplete} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 glass-card p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Preview Side */}
              <div className="w-full md:w-1/2 flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Processed Image</h3>
                <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-1 min-h-[300px] relative shadow-inner flex items-center justify-center p-4">
                  {result.processed_image_url ? (
                     <img 
                       src={`http://127.0.0.1:5000${result.processed_image_url}`} 
                       alt="Processed Document" 
                       className="max-h-full object-contain rounded drop-shadow-md"
                     />
                  ) : (
                    <p className="text-slate-400">Image preview not available</p>
                  )}
                </div>
              </div>

              {/* Extracted Text Side */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Extracted Text</h3>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-1 rounded transition-colors"
                  >
                    {copied ? <span className="text-green-600">Copied!</span> : <><Copy size={14}/> Copy</>}
                  </button>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex-1 font-mono text-sm text-slate-700 shadow-inner overflow-y-auto max-h-[400px] whitespace-pre-wrap">
                  {result.extracted_text || <span className="italic text-slate-400">No text could be extracted.</span>}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4 border-t border-slate-100 pt-6">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw size={18} />
                Scan Another
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Analytics Section */}
        <Dashboard />
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>Built for the Computer Vision Post-Lab Project &bull; React &bull; Flask &bull; OpenCV</p>
      </footer>
    </div>
  );
}

export default App;

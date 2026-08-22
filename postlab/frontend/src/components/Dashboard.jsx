import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FileText, Clock, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/documents');
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Prepare chart data (scans per day)
  const scansPerDay = documents.reduce((acc, doc) => {
    const date = new Date(doc.upload_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(scansPerDay).reverse(), // Oldest first for chart
    datasets: [
      {
        label: 'Documents Scanned',
        data: Object.values(scansPerDay).reverse(),
        borderColor: 'rgb(59, 130, 246)', // brand-500
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-brand-50 text-brand-600 p-2 rounded-lg">
          <BarChart3 size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Scan Analytics & History</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Chart */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Documents</p>
              <h3 className="text-4xl font-bold text-slate-900">{documents.length}</h3>
            </div>
            <div className="bg-brand-100 text-brand-600 p-3 rounded-full">
              <FileText size={24} />
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex-1">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Activity Trend</h4>
            {documents.length > 0 ? (
              <Line options={chartOptions} data={chartData} />
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                No activity yet
              </div>
            )}
          </div>
        </div>

        {/* Right Column: History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Recent Scans</h4>
              <Clock size={16} className="text-slate-400" />
            </div>
            
            <div className="overflow-x-auto flex-1 max-h-[400px] overflow-y-auto">
              {documents.length > 0 ? (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Document</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Extracted Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`http://127.0.0.1:5000${doc.processed_image_url}`} 
                              alt="thumb" 
                              className="w-10 h-10 object-cover rounded bg-slate-100 border border-slate-200"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <span className="truncate max-w-[120px]" title={doc.filename}>{doc.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(doc.upload_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="truncate max-w-xs text-xs font-mono text-slate-500">
                            {doc.extracted_text.substring(0, 50)}...
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <p>Your scan history will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

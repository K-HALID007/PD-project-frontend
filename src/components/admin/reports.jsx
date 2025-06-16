"use client";
import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Package,
  Users,
  Clock,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState('performance');
  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'Overall business performance metrics' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Revenue, costs, and profit analysis' },
    { id: 'operational', name: 'Operational Report', icon: Package, description: 'Delivery times, success rates, efficiency' },
    { id: 'customer', name: 'Customer Report', icon: Users, description: 'User activity and satisfaction metrics' },
    { id: 'audit', name: 'Audit Report', icon: FileText, description: 'System logs and compliance data' }
  ];

  const dateRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    generateReport();
  }, [selectedReport, dateRange]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(
        `http://localhost:5000/api/admin/reports?reportType=${selectedReport}&dateRange=${dateRange}`, 
        { headers }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setReportData(data);
        console.log('Generated real-time report:', data);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback to empty data on error
      setReportData({
        summary: {},
        chartData: null,
        recentEvents: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    // Simulate export functionality
    const fileName = `${selectedReport}_report_${dateRange}.${format}`;
    console.log(`Exporting ${fileName}`);
    // In real implementation, this would generate and download the file
    alert(`Report exported as ${fileName}`);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-gray-600">Generating report...</p>
          </div>
        </div>
      );
    }

    if (!reportData) return null;

    const currentReport = reportTypes.find(r => r.id === selectedReport);

    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <currentReport.icon className="w-6 h-6 text-amber-500 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-black">{currentReport.name}</h3>
                <p className="text-gray-600">{currentReport.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportReport('pdf')}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button
                onClick={() => exportReport('xlsx')}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(reportData.summary).map(([key, value], index) => (
            <div key={key} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}
                  {key.includes('Rate') || key.includes('Margin') || key.includes('Efficiency') || key.includes('Uptime') ? '%' : ''}
                  {key.includes('Revenue') || key.includes('Costs') || key.includes('Profit') || key.includes('Value') ? '' : ''}
                  {key.includes('Time') ? ' days' : ''}
                </div>
                <div className="text-sm text-gray-600 mt-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Visualization */}
        {reportData.chartData && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-black mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-amber-500" />
              Data Visualization
            </h4>
            <div className="h-80">
              {selectedReport === 'performance' && (
                <Bar 
                  data={reportData.chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#000' } } },
                    scales: {
                      x: { ticks: { color: '#000' } },
                      y: { ticks: { color: '#000' } }
                    }
                  }} 
                />
              )}
              {(selectedReport === 'financial' || selectedReport === 'operational' || selectedReport === 'customer') && (
                <Doughnut 
                  data={reportData.chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { 
                        labels: { color: '#000' },
                        position: 'bottom'
                      } 
                    }
                  }} 
                />
              )}
            </div>
          </div>
        )}

        {/* Audit Events Table */}
        {selectedReport === 'audit' && reportData.recentEvents && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-black mb-4">Recent System Events</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.recentEvents.map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.event}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive business reports and insights</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedReport === report.id
                  ? 'border-amber-500 bg-amber-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 ${
                selectedReport === report.id ? 'text-amber-600' : 'text-gray-600'
              }`} />
              <h3 className={`font-semibold text-sm ${
                selectedReport === report.id ? 'text-amber-800' : 'text-gray-800'
              }`}>
                {report.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiBook, FiDollarSign } from 'react-icons/fi';
import api from '../services/api';
import MainLayout from '../components/Layout/MainLayout';
import './ReportsDashboard.css';

function ReportsDashboard() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const response = await api.get('/manager/dashboard/sales');
      const usageResponse = await api.get('/reports/usage');
      
      setReportData({
        sales: response.data,
        usage: usageResponse.data,
        monthlyData: [
          { month: 'Jan', views: 1200, downloads: 850, revenue: 1250 },
          { month: 'Feb', views: 1350, downloads: 920, revenue: 1480 },
          { month: 'Mar', views: 1500, downloads: 1100, revenue: 1620 },
          { month: 'Apr', views: 1680, downloads: 1250, revenue: 1890 },
          { month: 'May', views: 1900, downloads: 1420, revenue: 2150 },
          { month: 'Jun', views: 2100, downloads: 1580, revenue: 2420 },
        ],
        categoryData: [
          { name: 'History', value: 35, color: '#667eea' },
          { name: 'Language', value: 25, color: '#48bb78' },
          { name: 'Culture', value: 20, color: '#ed8936' },
          { name: 'Research', value: 20, color: '#9f7aea' },
        ]
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    }
  };

  const exportReport = () => {
    alert('Export functionality will be implemented');
  };

  if (!reportData) return <div>Loading...</div>;

  return (
    <MainLayout title="Reports & Analytics Dashboard">
      <div className="reports-dashboard">
        {/* Date Range Selector */}
        <div className="report-header">
          <div className="date-range">
            <button className={dateRange === 'week' ? 'active' : ''} onClick={() => setDateRange('week')}>
              This Week
            </button>
            <button className={dateRange === 'month' ? 'active' : ''} onClick={() => setDateRange('month')}>
              This Month
            </button>
            <button className={dateRange === 'year' ? 'active' : ''} onClick={() => setDateRange('year')}>
              This Year
            </button>
          </div>
          <button className="export-btn" onClick={exportReport}>
            <FiDownload /> Export Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue"><FiTrendingUp /></div>
            <div className="stat-info">
              <h3>Total Views</h3>
              <p className="stat-value">{reportData.usage.total_views || 12450}</p>
              <span className="stat-change positive">+12.5%</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FiDownload /></div>
            <div className="stat-info">
              <h3>Total Downloads</h3>
              <p className="stat-value">{reportData.usage.total_downloads || 8923}</p>
              <span className="stat-change positive">+8.2%</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><FiUsers /></div>
            <div className="stat-info">
              <h3>Active Users</h3>
              <p className="stat-value">342</p>
              <span className="stat-change positive">+5.3%</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><FiDollarSign /></div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-value">${reportData.sales.total_revenue?.toFixed(2) || '0'}</p>
              <span className="stat-change positive">+18.7%</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#667eea" strokeWidth={2} />
                <Line type="monotone" dataKey="downloads" stroke="#48bb78" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Content by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card full-width">
            <h3>Top Performing Content</h3>
            <div className="top-content-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Views</th>
                    <th>Downloads</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.sales.top_content?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.title}</td>
                      <td>{item.views || 0}</td>
                      <td>{item.sales_count || 0}</td>
                      <td>${item.revenue?.toFixed(2) || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ReportsDashboard;
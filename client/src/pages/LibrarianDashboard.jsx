import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { 
  FiUpload, FiList, FiBarChart2, FiFile, FiUser, 
  FiCalendar, FiEye, FiDownload, FiCheckCircle, 
  FiClock, FiTrendingUp, FiBookOpen, FiImage, FiX
} from 'react-icons/fi';
import './LibrarianDashboard.css';

function LibrarianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadData, setUploadData] = useState({
    title: '',
    author: '',
    subject: '',
    year: '',
    keywords: '',
    access_level: 'all'
  });
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [myUploads, setMyUploads] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyUploads();
    fetchUsageStats();
  }, []);

  const fetchMyUploads = async () => {
    try {
      const response = await api.get('/contents/my-uploads');
      setMyUploads(response.data);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }
  };

  const fetchUsageStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/usage');
      setUsageStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
    setLoading(false);
  };

  const handleCoverChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        setMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WEBP)' });
        e.target.value = '';
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Cover image must be less than 5MB' });
        e.target.value = '';
        return;
      }
      
      setCoverFile(selectedFile);
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setCoverPreview(previewUrl);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    setUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);
    if (coverFile) {
      formData.append('cover', coverFile);
    }
    formData.append('title', uploadData.title);
    formData.append('author', uploadData.author);
    formData.append('subject', uploadData.subject);
    formData.append('year', uploadData.year);
    formData.append('keywords', uploadData.keywords);
    formData.append('access_level', uploadData.access_level);

    try {
      const response = await api.post('/contents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        await api.put(`/contents/${response.data.content.id}/submit`);
        
        setMessage({ type: 'success', text: '✅ Content uploaded and submitted for approval successfully!' });
        
        setUploadData({
          title: '',
          author: '',
          subject: '',
          year: '',
          keywords: '',
          access_level: 'all'
        });
        setFile(null);
        setCoverFile(null);
        setCoverPreview(null);
        fetchMyUploads();
        
        // Clear file inputs
        const fileInput = document.getElementById('file-upload');
        const coverInput = document.getElementById('cover-upload');
        if (fileInput) fileInput.value = '';
        if (coverInput) coverInput.value = '';
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Upload failed' });
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Upload failed. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    setUploadData({
      ...uploadData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <span className="status-badge published"><FiCheckCircle size={12} /> Published</span>;
      case 'approved':
        return <span className="status-badge approved"><FiCheckCircle size={12} /> Approved</span>;
      case 'pending_review':
        return <span className="status-badge pending"><FiClock size={12} /> Pending Review</span>;
      default:
        return <span className="status-badge draft"><FiFile size={12} /> Draft</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="librarian-dashboard">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Librarian Dashboard</h1>
          <p className="page-subtitle">Manage digital content and monitor library activity</p>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-icon">📚</div>
          <div className="welcome-text">
            <h2>Welcome, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}!</h2>
            <p>You have <strong>{myUploads.length}</strong> content items in your library</p>
          </div>
          <div className="welcome-stats">
            <div className="welcome-stat">
              <FiTrendingUp size={18} />
              <span>{usageStats?.total_views || 0} Total Views</span>
            </div>
            <div className="welcome-stat">
              <FiDownload size={18} />
              <span>{usageStats?.total_downloads || 0} Downloads</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <FiUpload size={16} />
            Upload Content
          </button>
          <button
            className={`tab-btn ${activeTab === 'my-uploads' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-uploads')}
          >
            <FiList size={16} />
            My Uploads
            {myUploads.length > 0 && <span className="tab-badge">{myUploads.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <FiBarChart2 size={16} />
            Usage Statistics
          </button>
        </div>

        {/* Tab Content: Upload */}
        {activeTab === 'upload' && (
          <div className="upload-section">
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={uploadData.title}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Author <span className="required">*</span></label>
                  <input
                    type="text"
                    name="author"
                    value={uploadData.author}
                    onChange={handleInputChange}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={uploadData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., History, Language, Culture"
                  />
                </div>

                <div className="form-group">
                  <label>Publication Year</label>
                  <input
                    type="number"
                    name="year"
                    value={uploadData.year}
                    onChange={handleInputChange}
                    placeholder="e.g., 2024"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Keywords (comma separated)</label>
                  <input
                    type="text"
                    name="keywords"
                    value={uploadData.keywords}
                    onChange={handleInputChange}
                    placeholder="e.g., Oromo history, culture, language"
                  />
                </div>

                <div className="form-group">
                  <label>Access Level</label>
                  <select
                    name="access_level"
                    value={uploadData.access_level}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="researchers">Researchers Only</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>File <span className="required">*</span></label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={(e) => setFile(e.target.files[0])}
                      accept=".pdf,.epub,.jpg,.jpeg,.png"
                      required
                    />
                    <label htmlFor="file-upload" className="file-label">
                      {file ? file.name : 'Choose a file...'}
                    </label>
                  </div>
                  <small>Supported formats: PDF, EPUB, JPG, PNG (Max 50MB)</small>
                </div>

                <div className="form-group">
                  <label>Cover Image (optional)</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="cover-upload"
                      onChange={handleCoverChange}
                      accept=".jpg,.jpeg,.png,.webp"
                    />
                    <label htmlFor="cover-upload" className="file-label">
                      {coverFile ? coverFile.name : 'Choose cover image...'}
                    </label>
                  </div>
                  {coverPreview && (
                    <div className="cover-preview">
                      <img src={coverPreview} alt="Cover preview" />
                      <button 
                        type="button" 
                        className="remove-cover"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                          document.getElementById('cover-upload').value = '';
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                  <small>Supported formats: JPG, PNG, WEBP. Max 5MB. Recommended size: 500x700px</small>
                </div>
              </div>

              <button type="submit" disabled={uploading} className="submit-btn">
                {uploading ? (
                  <>⏳ Uploading...</>
                ) : (
                  <>📤 Upload & Submit for Approval</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab Content: My Uploads */}
        {activeTab === 'my-uploads' && (
          <div className="my-uploads-section">
            {myUploads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📤</div>
                <h3>No uploads yet</h3>
                <p>Start by uploading your first digital content</p>
              </div>
            ) : (
              <div className="uploads-table-container">
                <table className="uploads-table">
                  <thead>
                    <tr>
                      <th>Cover</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Status</th>
                      <th>Uploaded Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myUploads.map((content) => (
                      <tr key={content.id}>
                        <td className="cover-cell">
                          {content.cover_image_url ? (
                            <img 
                              src={`http://localhost:5000${content.cover_image_url}`} 
                              alt={content.title}
                              className="table-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="table-cover-placeholder">📚</div>';
                              }}
                            />
                          ) : (
                            <div className="table-cover-placeholder">📚</div>
                          )}
                        </td>
                        <td className="title-cell">
                          <FiBookOpen size={16} />
                          {content.title}
                        </td>
                        <td>{content.author}</td>
                        <td>{getStatusBadge(content.status)}</td>
                        <td>{new Date(content.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => navigate(`/catalog`)}
                            className="view-btn"
                          >
                            <FiEye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Statistics */}
        {activeTab === 'statistics' && (
          <div className="statistics-section">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading statistics...</p>
              </div>
            ) : (
              <>
                <div className="stats-overview">
                  <div className="stat-card">
                    <div className="stat-icon blue">
                      <FiEye size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Total Views</h3>
                      <p className="stat-number">{usageStats?.total_views || 0}</p>
                      <span className="stat-trend">+12% this month</span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon green">
                      <FiDownload size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Total Downloads</h3>
                      <p className="stat-number">{usageStats?.total_downloads || 0}</p>
                      <span className="stat-trend">+8% this month</span>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon orange">
                      <FiBookOpen size={24} />
                    </div>
                    <div className="stat-info">
                      <h3>Active Borrows</h3>
                      <p className="stat-number">{usageStats?.active_borrows || 0}</p>
                      <span className="stat-trend">Currently borrowed</span>
                    </div>
                  </div>
                </div>

                <div className="popular-content">
                  <h3>
                    <FiTrendingUp size={18} />
                    Top 5 Most Viewed Content
                  </h3>
                  {usageStats?.top_content?.length > 0 ? (
                    <div className="content-list">
                      {usageStats.top_content.map((item, index) => (
                        <div key={index} className="content-item">
                          <div className="content-rank">{index + 1}</div>
                          <div className="content-details">
                            <h4>{item.title}</h4>
                            <div className="content-stats">
                              <span><FiEye size={12} /> {item.views} views</span>
                              <span><FiDownload size={12} /> {item.downloads} downloads</span>
                            </div>
                          </div>
                          <div className="content-progress">
                            <div 
                              className="progress-bar"
                              style={{ width: `${(item.views / usageStats.top_content[0].views) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state small">
                      <p>No data available yet</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default LibrarianDashboard;
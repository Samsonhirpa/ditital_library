import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { 
  FiDownload, FiCalendar, FiDollarSign, FiBook, FiRefreshCw, 
  FiSearch, FiFilter, FiX, FiUser, FiFileText
} from 'react-icons/fi';
import './MyPurchases.css';

function MyPurchases() {
  const { user } = useAuth();
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [filterAmount, setFilterAmount] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchPurchasedBooks = useCallback(async () => {
    try {
      console.log('🔄 Fetching purchased books...');
      const response = await api.get('/purchases/my/history/purchases');
      console.log('📚 Purchased books:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setPurchasedBooks(response.data);
        setFilteredBooks(response.data);
      } else {
        setPurchasedBooks([]);
        setFilteredBooks([]);
      }
    } catch (error) {
      console.error('Failed to fetch purchased books:', error);
      setPurchasedBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchasedBooks();
  }, [fetchPurchasedBooks]);

  // Apply filters whenever search term or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDate, filterAmount, purchasedBooks]);

  const applyFilters = () => {
    let filtered = [...purchasedBooks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(book => {
        const purchaseDate = new Date(book.purchased_at);
        const daysDiff = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
        
        switch(filterDate) {
          case '7days': return daysDiff <= 7;
          case '30days': return daysDiff <= 30;
          case '90days': return daysDiff <= 90;
          default: return true;
        }
      });
    }

    // Amount filter
    if (filterAmount !== 'all') {
      filtered = filtered.filter(book => {
        const amount = parseFloat(book.amount);
        switch(filterAmount) {
          case 'under50': return amount < 50;
          case '50to100': return amount >= 50 && amount <= 100;
          case 'over100': return amount > 100;
          default: return true;
        }
      });
    }

    setFilteredBooks(filtered);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchPurchasedBooks();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('all');
    setFilterAmount('all');
  };

  const handleDownload = async (contentId) => {
    try {
      console.log('⬇️ Downloading book with ID:', contentId);
      const response = await api.get(`/contents/download/${contentId}`);
      
      if (response.data.downloadUrl) {
        const downloadUrl = `http://localhost:5000${response.data.downloadUrl}`;
        window.open(downloadUrl, '_blank');
      } else {
        alert('Download URL not available');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterDate !== 'all') count++;
    if (filterAmount !== 'all') count++;
    return count;
  };

  return (
    <DashboardLayout>
      <div className="my-purchases-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-title">
            <h1 className="page-title">My Purchases</h1>
            <p className="page-subtitle">
              View and download all books you have purchased
            </p>
          </div>
          <button className="refresh-btn" onClick={refreshData} disabled={refreshing}>
            <FiRefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon blue">
              <FiBook size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Purchases</h3>
              <p className="stat-number">{purchasedBooks.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <FiDollarSign size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Spent</h3>
              <p className="stat-number">
                ${purchasedBooks.reduce((sum, book) => sum + parseFloat(book.amount || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">
              <FiDownload size={24} />
            </div>
            <div className="stat-info">
              <h3>Available Downloads</h3>
              <p className="stat-number">{filteredBooks.length}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FiX size={16} />
              </button>
            )}
          </div>
          
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={16} />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="filter-badge">{getActiveFiltersCount()}</span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Purchase Date</label>
              <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                <option value="all">All time</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Price Range</label>
              <select value={filterAmount} onChange={(e) => setFilterAmount(e.target.value)}>
                <option value="all">All prices</option>
                <option value="under50">Under $50</option>
                <option value="50to100">$50 - $100</option>
                <option value="over100">Over $100</option>
              </select>
            </div>
            {(getActiveFiltersCount() > 0) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="results-count">
          Showing <strong>{filteredBooks.length}</strong> of <strong>{purchasedBooks.length}</strong> purchases
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your purchases...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No purchases found</h3>
            <p>
              {purchasedBooks.length > 0 
                ? 'No purchases match your filters. Try adjusting your search criteria.'
                : 'You haven\'t purchased any books yet. Browse the catalog to get started!'}
            </p>
            {purchasedBooks.length === 0 && (
              <button className="browse-btn" onClick={() => window.location.href = '/catalog'}>
                Browse Catalog
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Purchase Date</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book, index) => (
                  <tr key={book.id}>
                    <td className="serial-cell">{index + 1}</td>
                    <td className="title-cell">
                      <div className="book-info">
                        <span className="book-icon">📚</span>
                        <span className="book-title">{book.title}</span>
                      </div>
                    </td>
                    <td className="author-cell">
                      <div className="author-info">
                        <FiUser size={12} />
                        <span>{book.author}</span>
                      </div>
                    </td>
                    <td className="date-cell">
                      <div className="date-info">
                        <FiCalendar size={12} />
                        <span>{formatDate(book.purchased_at)}</span>
                      </div>
                    </td>
                    <td className="amount-cell">
                      <div className="amount-info">
                        <FiDollarSign size={12} />
                        <span className="amount-value">{formatAmount(book.amount)}</span>
                      </div>
                    </td>
                    <td className="action-cell">
                      <button 
                        className="download-btn-table"
                        onClick={() => handleDownload(book.content_id)}
                      >
                        <FiDownload size={14} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyPurchases;
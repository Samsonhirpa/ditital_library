import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TopNavbar from '../components/Layout/TopNavbar';
import Footer from '../components/Layout/Footer';
import './Catalog.css';

function Catalog() {
  const { isAuthenticated, user } = useAuth();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const [purchasedStatus, setPurchasedStatus] = useState({});
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    transaction_id: '',
    notes: '',
    receipt: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  // Check purchase status for all books when user is authenticated
  useEffect(() => {
    if (isAuthenticated && contents.length > 0) {
      checkPurchaseStatus();
    }
  }, [isAuthenticated, contents]);

  const checkPurchaseStatus = async () => {
    const statusMap = {};
    for (const book of contents) {
      try {
        const response = await api.get(`/contents/check-purchase/${book.id}`);
        statusMap[book.id] = response.data.purchased;
      } catch (error) {
        console.error(`Failed to check purchase for book ${book.id}:`, error);
        statusMap[book.id] = false;
      }
    }
    setPurchasedStatus(statusMap);
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contents/search');
      setContents(response.data);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTitle) params.title = searchTitle;
      if (searchAuthor) params.author = searchAuthor;
      if (searchSubject) params.subject = searchSubject;
      
      const response = await api.get('/contents/search', { params });
      setContents(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setSearchSubject('');
    fetchContents();
  };

  const handleBorrow = async (contentId) => {
    if (!isAuthenticated) {
      alert('Please login first to borrow books');
      return;
    }
    try {
      await api.post(`/borrow/${contentId}`);
      alert('Book borrowed successfully! You can now download it from My Account.');
    } catch (error) {
      alert(error.response?.data?.message || 'Borrow failed. You may have already borrowed this book.');
    }
  };
const handleDownload = async (contentId) => {
    try {
        console.log('Downloading purchased book:', contentId);
        const response = await api.get(`/contents/download/${contentId}`);
        
        if (response.data.downloadUrl) {
            const downloadUrl = `http://localhost:5000${response.data.downloadUrl}`;
            window.open(downloadUrl, '_blank');
        } else {
            alert('Download URL not available');
        }
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed: ' + (error.response?.data?.message || 'You may not have purchased this book'));
    }
};

  const handlePurchaseWithReceipt = (book) => {
    setSelectedBook(book);
    setPaymentDetails({
      amount: book.price,
      transaction_id: '',
      notes: '',
      receipt: null
    });
    setShowPaymentModal(true);
  };

  const handleReceiptUpload = async (e) => {
    e.preventDefault();
    if (!paymentDetails.receipt) {
      alert('Please select a receipt file');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', paymentDetails.receipt);
    formData.append('content_id', selectedBook.id);
    formData.append('amount', paymentDetails.amount);
    formData.append('transaction_id', paymentDetails.transaction_id);
    formData.append('notes', paymentDetails.notes);
    
    try {
      await api.post('/payments/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Receipt uploaded successfully! Waiting for manager approval.');
      setShowPaymentModal(false);
      setPaymentDetails({ amount: '', transaction_id: '', notes: '', receipt: null });
    } catch (error) {
      alert('Failed to upload receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };
// Add this function to check purchase status on page load
const checkAllPurchaseStatus = async () => {
  if (!isAuthenticated) return;
  
  const statusMap = {};
  for (const book of contents) {
    try {
      const response = await api.get(`/payments/can-download/${book.id}`);
      statusMap[book.id] = response.data.isPurchased;
    } catch (error) {
      statusMap[book.id] = false;
    }
  }
  setPurchasedStatus(statusMap);
};

// Call this after fetching contents
useEffect(() => {
  if (contents.length > 0 && isAuthenticated) {
    checkAllPurchaseStatus();
  }
}, [contents, isAuthenticated]);

  // Determine what button to show for a book
  const getActionButton = (book) => {
    if (!isAuthenticated) {
      return (
        <button 
          onClick={() => alert('Please login first')}
          className="borrow-btn disabled"
        >
          Login to Access
        </button>
      );
    }

    // If user has purchased this book, show Download button
    if (purchasedStatus[book.id]) {
      return (
        <button
          onClick={() => handleDownload(book.id)}
          className="borrow-btn download"
        >
          ⬇️ Download
        </button>
      );
    }

    // If book is paid, show Purchase button
    if (book.price > 0) {
      return (
        <button
          onClick={() => handlePurchaseWithReceipt(book)}
          className="borrow-btn purchase"
        >
          💰 Purchase
        </button>
      );
    }

    // Free book - show Borrow button
    return (
      <button
        onClick={() => handleBorrow(book.id)}
        className="borrow-btn borrow"
      >
        📖 Borrow Now
      </button>
    );
  };

  return (
    <>
      <TopNavbar />
      <div className="catalog-page">
        <div className="catalog-container">
          <div className="catalog-header">
            <h1 className="catalog-title">Library Catalog</h1>
            <p className="catalog-subtitle">
              Browse our collection of Oromo research materials and digital resources
            </p>
          </div>

          {/* Search Filters */}
          <div className="search-section">
            <div className="search-grid">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <input
                type="text"
                placeholder="Search by author..."
                value={searchAuthor}
                onChange={(e) => setSearchAuthor(e.target.value)}
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <input
                type="text"
                placeholder="Search by subject..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="search-actions">
              <button onClick={handleSearch} className="search-btn">
                🔍 Search
              </button>
              <button onClick={handleReset} className="reset-btn">
                Reset
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="results-count">
            Found <strong>{contents.length}</strong> resource(s)
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading books...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && contents.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No books found</h3>
              <p>Check back later for new additions!</p>
            </div>
          )}

          {/* Books Grid */}
          {!loading && contents.length > 0 && (
            <div className="books-grid">
              {contents.map((book) => (
                <div key={book.id} className="book-card">
                  <div className="book-cover">
                    {purchasedStatus[book.id] ? '✅' : '📚'}
                  </div>
                  <div className="book-details">
                    <h3 className="book-title">
                      {book.title}
                      {purchasedStatus[book.id] && <span className="owned-badge">Owned</span>}
                    </h3>
                    <p className="book-author">
                      <strong>Author:</strong> {book.author}
                    </p>
                    {book.subject && (
                      <p className="book-subject">
                        <strong>Subject:</strong> {book.subject}
                      </p>
                    )}
                    {book.publication_year && (
                      <p className="book-year">
                        Year: {book.publication_year}
                      </p>
                    )}
                    <div className="book-footer">
                      <span className={`book-price ${book.price > 0 ? 'paid' : 'free'}`}>
                        {book.price > 0 ? `$${book.price}` : 'FREE'}
                      </span>
                      {getActionButton(book)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Payment Receipt</h2>
              <button className="close-modal" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <form onSubmit={handleReceiptUpload}>
              <div className="payment-form-group">
                <label>Book</label>
                <input type="text" value={selectedBook?.title} disabled />
              </div>
              <div className="payment-form-group">
                <label>Amount (USD)</label>
                <input 
                  type="number" 
                  value={paymentDetails.amount} 
                  disabled 
                />
              </div>
              <div className="payment-form-group">
                <label>Transaction ID / Reference Number</label>
                <input 
                  type="text" 
                  placeholder="Enter transaction ID"
                  value={paymentDetails.transaction_id}
                  onChange={(e) => setPaymentDetails({...paymentDetails, transaction_id: e.target.value})}
                  required
                />
              </div>
              <div className="payment-form-group">
                <label>Upload Receipt (Image or PDF)</label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setPaymentDetails({...paymentDetails, receipt: e.target.files[0]})}
                  required
                />
              </div>
              <div className="payment-form-group">
                <label>Notes (Optional)</label>
                <textarea 
                  rows="3"
                  placeholder="Any additional information..."
                  value={paymentDetails.notes}
                  onChange={(e) => setPaymentDetails({...paymentDetails, notes: e.target.value})}
                />
              </div>
              <button type="submit" className="submit-payment-btn" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit Receipt'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Catalog;
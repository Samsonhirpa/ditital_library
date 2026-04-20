import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { FiBookOpen, FiEye, FiDownload, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi';
import './PublishedContent.css';

function PublishedContent() {
  const [publishedBooks, setPublishedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedBooks();
  }, []);

  const fetchPublishedBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contents/search');
      setPublishedBooks(response.data);
    } catch (error) {
      console.error('Failed to fetch published books:', error);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <span className="status-badge published">✅ Published</span>;
      default:
        return <span className="status-badge draft">📝 Draft</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="published-content-page">
        <div className="page-header">
          <h1 className="page-title">Published Content</h1>
          <p className="page-subtitle">View all books currently available in the library catalog</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading published books...</p>
          </div>
        ) : publishedBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No published books</h3>
            <p>Go to "Ready to Publish" tab to publish books</p>
          </div>
        ) : (
          <div className="published-books-grid">
            {publishedBooks.map((book) => (
              <div key={book.id} className="published-book-card">
                <div className="book-header">
                  <div className="book-icon">📖</div>
                  <div className="book-title-section">
                    <h3>{book.title}</h3>
                    <p>by {book.author}</p>
                  </div>
                  {getStatusBadge(book.status)}
                </div>
                
                <div className="book-details">
                  <div className="detail-row">
                    <FiUser size={14} />
                    <span><strong>Author:</strong> {book.author}</span>
                  </div>
                  {book.subject && (
                    <div className="detail-row">
                      <FiBookOpen size={14} />
                      <span><strong>Subject:</strong> {book.subject}</span>
                    </div>
                  )}
                  {book.publication_year && (
                    <div className="detail-row">
                      <FiCalendar size={14} />
                      <span><strong>Year:</strong> {book.publication_year}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <FiDollarSign size={14} />
                    <span><strong>Price:</strong> {book.price > 0 ? `$${book.price}` : 'Free'}</span>
                  </div>
                  {book.published_at && (
                    <div className="detail-row">
                      <FiCalendar size={14} />
                      <span><strong>Published:</strong> {new Date(book.published_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="book-stats">
                  <div className="stat">
                    <FiEye size={16} />
                    <span>0 views</span>
                  </div>
                  <div className="stat">
                    <FiDownload size={16} />
                    <span>0 downloads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default PublishedContent;
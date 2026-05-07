import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TopNavbar from '../components/Layout/TopNavbar';
import Footer from '../components/Layout/Footer';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  FiSearch, FiX, FiBookOpen, FiDownload, 
  FiShoppingCart, FiEye, FiChevronLeft, FiChevronRight,
  FiMaximize, FiMinimize, FiUser, FiBook, FiFilter
} from 'react-icons/fi';
import './Catalog.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function Catalog() {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReader, setShowReader] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [purchasedStatus, setPurchasedStatus] = useState({});
  
  // Filter states
  const [titleFilter, setTitleFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (isAuthenticated && books.length > 0) {
      checkPurchaseStatus();
    }
  }, [isAuthenticated, books]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contents/search');
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
    setLoading(false);
  };

  const checkPurchaseStatus = async () => {
    const statusMap = {};
    for (const book of books) {
      try {
        const response = await api.get(`/payments/can-download/${book.id}`);
        statusMap[book.id] = response.data.isPurchased;
      } catch (error) {
        statusMap[book.id] = false;
      }
    }
    setPurchasedStatus(statusMap);
  };

  const handleDownload = async (contentId) => {
    try {
      const response = await api.get(`/contents/download/${contentId}`);
      if (response.data.downloadUrl) {
        window.open(`${BACKEND_URL}${response.data.downloadUrl}`, '_blank');
      }
    } catch (error) {
      alert('Download failed: ' + (error.response?.data?.message || 'You may not have purchased this book'));
    }
  };

  const handlePurchase = (bookId) => {
    window.location.href = `/checkout/${bookId}`;
  };

  const handleReadOnline = (book) => {
    setSelectedBook(book);
    setShowReader(true);
    setPageNumber(1);
    setNumPages(null);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    setPageNumber(prev => prev + offset);
  };

  const zoomIn = () => setPdfScale(prev => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setPdfScale(prev => Math.max(prev - 0.2, 0.5));

  const uniqueAuthors = useMemo(() => {
    const authors = books.map(b => b.author).filter(Boolean);
    return [...new Set(authors)];
  }, [books]);

  const uniqueCategories = useMemo(() => {
    const cats = books.map(b => b.subject).filter(Boolean);
    return [...new Set(cats)];
  }, [books]);

  useEffect(() => {
    let result = [...books];

    if (titleFilter) {
      result = result.filter(book =>
        book.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (authorFilter) {
      result = result.filter(book =>
        book.author.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    if (categoryFilter) {
      result = result.filter(book =>
        book.subject?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFilteredBooks(result);
  }, [titleFilter, authorFilter, categoryFilter, books]);

  const getButtonAction = (book) => {
    if (!isAuthenticated) {
      return { text: 'Sign in', action: () => window.location.href = '/login', icon: <FiEye size={14} />, class: 'login-btn' };
    }
    
    if (purchasedStatus[book.id]) {
      return { text: 'Download', action: () => handleDownload(book.id), icon: <FiDownload size={14} />, class: 'download-btn' };
    }
    
    if (Number(book.price) > 0) {
      return { text: `Buy $${book.price}`, action: () => handlePurchase(book.id), icon: <FiShoppingCart size={14} />, class: 'purchase-btn' };
    }
    
    return { text: 'Read Free', action: () => handleReadOnline(book), icon: <FiBookOpen size={14} />, class: 'free-btn' };
  };

  const clearFilters = () => {
    setTitleFilter('');
    setAuthorFilter('');
    setCategoryFilter('');
  };

  const hasActiveFilters = titleFilter || authorFilter || categoryFilter;

  return (
    <>
      <TopNavbar />
      <div className="catalog-page">
        <div className="catalog-container">
          <div className="catalog-header">
            <h1>Digital Library</h1>
            <p>Discover thousands of books from Oromo studies, history, culture, and academic research</p>
          </div>

          <div className="catalog-layout">
            {/* Sidebar Filters */}
            <aside className="catalog-sidebar">
              <div className="sidebar-header">
                <h3><FiFilter size={16} /> Filters</h3>
                {hasActiveFilters && (
                  <button className="clear-filters" onClick={clearFilters}>
                    Clear all
                  </button>
                )}
              </div>

              <div className="filter-group">
                <label><FiSearch size={14} /> Search by Title</label>
                <input
                  type="text"
                  placeholder="Enter book title..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label><FiUser size={14} /> Filter by Author</label>
                <div className="filter-tags">
                  {uniqueAuthors.map(author => (
                    <button
                      key={author}
                      className={`filter-tag ${authorFilter === author ? 'active' : ''}`}
                      onClick={() => setAuthorFilter(authorFilter === author ? '' : author)}
                    >
                      {author}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label><FiBook size={14} /> Filter by Category</label>
                <div className="filter-tags">
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-tag ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-results">
                <span className="results-badge">{filteredBooks.length} books found</span>
              </div>
            </aside>

            {/* Main Content */}
            <main className="catalog-main">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading books...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📖</div>
                  <h3>No books found</h3>
                  <p>Try adjusting your filters</p>
                </div>
              ) : (
                <div className="books-grid">
                  {filteredBooks.map((book) => {
                    const coverUrl = book.cover_image_url ? `${BACKEND_URL}${book.cover_image_url}` : null;
                    const button = getButtonAction(book);
                    
                    return (
                      <div key={book.id} className="book-card">
                        <div className="book-cover">
                          {coverUrl ? (
                            <img src={coverUrl} alt={book.title} />
                          ) : (
                            <div className="cover-placeholder">📚</div>
                          )}
                          {Number(book.price) === 0 && <span className="free-badge">FREE</span>}
                        </div>
                        <div className="book-button">
                          <button className={`action-btn ${button.class}`} onClick={button.action}>
                            {button.icon}
                            {button.text}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* PDF Reader Modal */}
      {showReader && selectedBook && (
        <div className="reader-modal-overlay" onClick={() => setShowReader(false)}>
          <div className="reader-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reader-header">
              <div className="reader-title">
                <h3>{selectedBook.title}</h3>
                <p>by {selectedBook.author}</p>
              </div>
              <div className="reader-controls">
                <button onClick={zoomOut} className="reader-control-btn"><FiMinimize size={18} /></button>
                <span className="zoom-level">{Math.round(pdfScale * 100)}%</span>
                <button onClick={zoomIn} className="reader-control-btn"><FiMaximize size={18} /></button>
                <div className="page-nav">
                  <button onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="nav-btn">
                    <FiChevronLeft size={18} />
                  </button>
                  <span className="page-info">Page {pageNumber} of {numPages || '?'}</span>
                  <button onClick={() => changePage(1)} disabled={pageNumber >= numPages} className="nav-btn">
                    <FiChevronRight size={18} />
                  </button>
                </div>
                <button onClick={() => handleDownload(selectedBook.id)} className="reader-download-btn">
                  <FiDownload size={18} />
                </button>
                <button onClick={() => setShowReader(false)} className="reader-close-btn">
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="reader-content">
              <Document
                file={`${BACKEND_URL}${selectedBook.file_url}`}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="pdf-loading">Loading PDF...</div>}
                error={<div className="pdf-error">Failed to load PDF</div>}
              >
                <Page pageNumber={pageNumber} scale={pdfScale} renderTextLayer renderAnnotationLayer />
              </Document>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Catalog;
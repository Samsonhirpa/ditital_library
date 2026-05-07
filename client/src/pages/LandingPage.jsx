import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TopNavbar from '../components/Layout/TopNavbar';
import LPFooter from '../components/Layout/LPFooter';

function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contents/search');
      setFeaturedBooks(response.data.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
    setLoading(false);
  };

  const filteredBooks = featuredBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (book.subject && book.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <TopNavbar />
      
      {/* Hero Section */}
      <div className="landing-hero">
        <div className="hero-content">
          <h1>Oromo Research Association</h1>
          <p>Digital Library • Preserving Heritage • Advancing Knowledge</p>
          <div className="hero-buttons">
            <Link to="/catalog" className="hero-btn primary">Browse Library</Link>
            {!isAuthenticated && <Link to="/register" className="hero-btn secondary">Get Started</Link>}
          </div>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search books by title, author, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Link to={`/catalog?search=${searchTerm}`} className="search-btn">Search</Link>
          </div>
          <div className="hero-stats">
            <div><span>{featuredBooks.length}+</span> Books</div>
            <div><span>500+</span> Members</div>
            <div><span>10K+</span> Downloads</div>
          </div>
        </div>
      </div>

      {/* Featured Books Section - FULL WIDTH WHITE BACKGROUND */}
      <div className="featured-books-fullwidth">
        <div className="featured-container">
          <div className="section-header">
            <h2>Featured Books</h2>
            <Link to="/catalog" className="view-all">View All →</Link>
          </div>

          {loading ? (
            <div className="loading-spinner"></div>
          ) : filteredBooks.length === 0 ? (
            <div className="empty-state">No books found</div>
          ) : (
            <div className="featured-grid">
              {filteredBooks.map((book) => {
                const coverUrl = book.cover_image_url ? `${BACKEND_URL}${book.cover_image_url}` : null;
                return (
                  <div key={book.id} className="featured-card">
                    <div className="featured-cover">
                      {coverUrl ? (
                        <img src={coverUrl} alt={book.title} />
                      ) : (
                        <div className="cover-placeholder">📚</div>
                      )}
                      {Number(book.price) === 0 && <span className="free-tag">FREE</span>}
                    </div>
                    <div className="featured-button">
                      <Link to="/catalog" className="action-link">View Book →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <LPFooter />

      <style>{`
        .landing-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
          margin-top: 70px;
        }
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-content h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .hero-content p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }
        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        .hero-btn {
          padding: 12px 28px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }
        .hero-btn.primary {
          background: white;
          color: #667eea;
        }
        .hero-btn.secondary {
          background: transparent;
          color: white;
          border: 1px solid white;
        }
        .hero-btn:hover {
          transform: translateY(-2px);
        }
        .hero-search {
          display: flex;
          max-width: 500px;
          margin: 0 auto;
          background: white;
          border-radius: 50px;
          overflow: hidden;
        }
        .hero-search input {
          flex: 1;
          padding: 14px 20px;
          border: none;
          outline: none;
          font-size: 1rem;
        }
        .search-btn {
          padding: 14px 28px;
          background: #e67e22;
          color: white;
          text-decoration: none;
          font-weight: bold;
        }
        .search-btn:hover {
          background: #d35400;
        }
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 2rem;
        }
        .hero-stats div span {
          font-size: 1.5rem;
          font-weight: bold;
          display: block;
        }

        /* Featured Books - FULL WIDTH WHITE BACKGROUND */
        .featured-books-fullwidth {
          width: 100%;
          background: white;
          padding: 3rem 0;
        }
        .featured-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }
        .view-all {
          color: #0096FF;
          text-decoration: none;
        }
        .view-all:hover {
          text-decoration: underline;
        }
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }
        .featured-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #eef2f6;
        }
        .featured-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .featured-cover {
          position: relative;
          aspect-ratio: 2 / 3;
          background: linear-gradient(135deg, #f5f7fa 0%, #eef2f6 100%);
        }
        .featured-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }
        .free-tag {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: bold;
        }
        .featured-button {
          padding: 0.75rem;
          text-align: center;
          background: white;
        }
        .action-link {
          display: block;
          padding: 8px;
          background: #0096FF;
          color: white;
          text-decoration: none;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-align: center;
        }
        .action-link:hover {
          background: #0077cc;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0096FF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 2rem auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }
        @media (max-width: 768px) {
          .hero-content h1 { font-size: 1.8rem; }
          .hero-buttons { flex-direction: column; align-items: center; }
          .hero-stats { gap: 1.5rem; }
          .featured-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
          .featured-container { padding: 0 1rem; }
        }
      `}</style>
    </>
  );
}

export default LandingPage;
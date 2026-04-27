import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopNavbar from '../components/Layout/TopNavbar';
import api from '../services/api';
import './PhysicalLibraryLanding.css';

function normalizeBook(book, index) {
  const createdAt = book.created_at || book.createdAt || null;
  const derivedYear = createdAt ? new Date(createdAt).getFullYear() : null;

  return {
    id: book.id ?? index,
    title: book.title || 'Untitled Book',
    author: book.author || 'Unknown Author',
    category: book.subject || book.category || 'General',
    library: book.library_name || book.library || 'ORA Main Physical Library',
    year: Number(book.year || book.publication_year || derivedYear) || null,
    price: Number(book.price || 0)
  };
}

function PhysicalLibraryLanding() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLibrary, setSelectedLibrary] = useState('All Libraries');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [authorFilter, setAuthorFilter] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/contents/search');
        const normalized = (response.data || []).map(normalizeBook);
        setBooks(normalized);
      } catch (err) {
        console.error('Failed to load uploaded books:', err);
        setError('Unable to load uploaded books right now. Please try again soon.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(new Set(books.map((book) => book.category).filter(Boolean)));
    return ['All', ...values];
  }, [books]);

  const libraries = useMemo(() => {
    const values = Array.from(new Set(books.map((book) => book.library).filter(Boolean)));
    return ['All Libraries', ...values];
  }, [books]);

  const years = useMemo(() => {
    const values = Array.from(new Set(books.map((book) => book.year).filter(Boolean))).sort((a, b) => b - a);
    return ['All Years', ...values];
  }, [books]);

  const filteredBooks = books.filter((book) => {
    const categoryMatch = selectedCategory === 'All' || book.category === selectedCategory;
    const libraryMatch = selectedLibrary === 'All Libraries' || book.library === selectedLibrary;
    const yearMatch = selectedYear === 'All Years' || book.year === Number(selectedYear);
    const authorMatch = !authorFilter || book.author.toLowerCase().includes(authorFilter.toLowerCase());

    return categoryMatch && libraryMatch && yearMatch && authorMatch;
  });

  return (
    <>
      <TopNavbar />

      <main className="physical-page">
        <section className="physical-hero-simple">
          <p className="hero-badge">Physical Libraries</p>
          <h1>Welcome to Oromo Research Association</h1>
          <p>
            Discover uploaded books and find them across multiple physical library branches.
            Search by category, author, library branch, and year.
          </p>
          <div className="hero-links">
            <Link to="/catalog" className="hero-btn primary">Digital Library</Link>
            <Link to="/register" className="hero-btn outline">Become a Member</Link>
          </div>
        </section>

        <section className="physical-filter-box">
          <h2>Browse uploaded books</h2>

          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'chip active' : 'chip'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="filters-grid">
            <select value={selectedLibrary} onChange={(e) => setSelectedLibrary(e.target.value)}>
              {libraries.map((library) => (
                <option key={library} value={library}>{library}</option>
              ))}
            </select>

            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by author"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
            />
          </div>
        </section>

        <section className="books-section">
          <div className="books-header">
            <h3>Physical library collection</h3>
            <span>{filteredBooks.length} books</span>
          </div>

          {loading && <div className="status-card">Loading uploaded books...</div>}
          {!loading && error && <div className="status-card error">{error}</div>}

          {!loading && !error && filteredBooks.length === 0 && (
            <div className="status-card">No uploaded books found for these filters.</div>
          )}

          {!loading && !error && filteredBooks.length > 0 && (
            <div className="books-grid">
              {filteredBooks.map((book) => (
                <article key={book.id} className="book-card">
                  <span className="tag">{book.category}</span>
                  <h4>{book.title}</h4>
                  <p>Author: {book.author}</p>
                  <p>Library: {book.library}</p>
                  <div className="book-meta">
                    <span>{book.year || 'Year N/A'}</span>
                    <span>{book.price > 0 ? `$${book.price}` : 'Free Access'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="physical-landing-footer">
          <div>
            <h4>Oromo Research Association • Physical Library Network</h4>
            <p>
              Supporting readers, students, and researchers with accessible physical collections.
            </p>
          </div>
          <div className="footer-actions">
            <Link to="/catalog">Open Digital Catalog</Link>
            <Link to="/login">Staff Sign In</Link>
          </div>
        </footer>
      </main>
    </>
  );
}

export default PhysicalLibraryLanding;

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopNavbar from '../components/Layout/TopNavbar';
import Footer from '../components/Layout/Footer';
import './PhysicalLibraryLanding.css';

const PHYSICAL_ITEMS = [
  {
    id: 1,
    title: 'Seenaa Oromoo: A Historical Reader',
    author: 'Dr. Birhanu Dinka',
    year: 2018,
    library: 'Finfinne Central Library',
    category: 'History',
    shelf: 'A-12'
  },
  {
    id: 2,
    title: 'Afaan Oromoo Grammar Essentials',
    author: 'Prof. Lensa Tufa',
    year: 2021,
    library: 'Adama Community Library',
    category: 'Language',
    shelf: 'B-07'
  },
  {
    id: 3,
    title: 'Oromo Indigenous Governance',
    author: 'Aster Gemechu',
    year: 2016,
    library: 'Jimma Heritage Library',
    category: 'Governance',
    shelf: 'C-04'
  },
  {
    id: 4,
    title: 'Women in Oromo Oral Traditions',
    author: 'Hana Fekadu',
    year: 2023,
    library: 'Finfinne Central Library',
    category: 'Culture',
    shelf: 'D-18'
  },
  {
    id: 5,
    title: 'Contemporary Oromo Literature',
    author: 'Kedir Mohammed',
    year: 2020,
    library: 'Bishoftu Public Library',
    category: 'Literature',
    shelf: 'E-03'
  },
  {
    id: 6,
    title: 'Research Methods for African Studies',
    author: 'Tigist Bekele',
    year: 2019,
    library: 'Jimma Heritage Library',
    category: 'Research',
    shelf: 'R-11'
  }
];

const CATEGORIES = ['All', 'History', 'Language', 'Culture', 'Governance', 'Literature', 'Research'];

function PhysicalLibraryLanding() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLibrary, setSelectedLibrary] = useState('All Libraries');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [authorQuery, setAuthorQuery] = useState('');

  const libraryOptions = useMemo(
    () => ['All Libraries', ...new Set(PHYSICAL_ITEMS.map((item) => item.library))],
    []
  );

  const yearOptions = useMemo(
    () => ['All Years', ...new Set(PHYSICAL_ITEMS.map((item) => item.year)).sort((a, b) => b - a)],
    []
  );

  const filteredItems = PHYSICAL_ITEMS.filter((item) => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const libraryMatch = selectedLibrary === 'All Libraries' || item.library === selectedLibrary;
    const yearMatch = selectedYear === 'All Years' || item.year === Number(selectedYear);
    const authorMatch = !authorQuery || item.author.toLowerCase().includes(authorQuery.toLowerCase());
    return categoryMatch && libraryMatch && yearMatch && authorMatch;
  });

  return (
    <>
      <TopNavbar />
      <main className="physical-landing">
        <section className="physical-hero">
          <p className="physical-eyebrow">Physical Library Network</p>
          <h1>Welcome to Oromo Research Association</h1>
          <p>
            Discover beautiful, community-powered physical libraries across multiple locations with curated Oromo
            resources for students, researchers, and families.
          </p>
          <div className="physical-hero-actions">
            <Link to="/catalog" className="btn-primary">Explore Digital Library</Link>
            <Link to="/register" className="btn-outline">Join as Member</Link>
          </div>
        </section>

        <section className="physical-filters">
          <h2>Find resources across multiple physical libraries</h2>

          <div className="category-buttons">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'category-btn active' : 'category-btn'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="filter-row">
            <select value={selectedLibrary} onChange={(e) => setSelectedLibrary(e.target.value)}>
              {libraryOptions.map((library) => (
                <option key={library} value={library}>{library}</option>
              ))}
            </select>

            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <input
              type="text"
              value={authorQuery}
              placeholder="Filter by author name"
              onChange={(e) => setAuthorQuery(e.target.value)}
            />
          </div>
        </section>

        <section className="library-grid-section">
          <div className="result-title-row">
            <h3>Available Physical Collection</h3>
            <span>{filteredItems.length} item(s)</span>
          </div>

          <div className="library-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="library-card">
                <div className="card-chip">{item.category}</div>
                <h4>{item.title}</h4>
                <p className="meta">Author: {item.author}</p>
                <p className="meta">Library: {item.library}</p>
                <div className="card-footer">
                  <span>Year: {item.year}</span>
                  <span>Shelf: {item.shelf}</span>
                </div>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-state">No physical resources matched your current filters.</div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default PhysicalLibraryLanding;

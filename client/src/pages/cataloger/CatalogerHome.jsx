import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { fetchBooks, fetchCategories } from './catalogerApi';
import './CatalogerPages.css';

function CatalogerHome() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookRows, categoryRows] = await Promise.all([fetchBooks(), fetchCategories()]);
        setBooks(bookRows);
        setCategories(categoryRows);
      } catch (error) {
        console.error('Failed to load cataloger dashboard:', error);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const lowStock = books.filter((book) => Number(book.copies_available || 0) <= 3).length;
    const withCategory = books.filter((book) => !!book.category_id).length;
    return {
      totalBooks: books.length,
      totalCategories: categories.length,
      lowStock,
      categorizedPercent: books.length ? Math.round((withCategory / books.length) * 100) : 0
    };
  }, [books, categories]);

  return (
    <DashboardLayout>
      <div className="cataloger-shell">
        <div className="cataloger-hero">
          <h1>Cataloger Dashboard</h1>
          <p>Track catalog health and jump directly to books and categories management.</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card"><h3>Total Books</h3><p>{stats.totalBooks}</p></div>
          <div className="kpi-card"><h3>Total Categories</h3><p>{stats.totalCategories}</p></div>
          <div className="kpi-card"><h3>Low Stock (≤3)</h3><p>{stats.lowStock}</p></div>
          <div className="kpi-card"><h3>Categorized</h3><p>{stats.categorizedPercent}%</p></div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions">
            <Link to="/cataloger/books" className="btn-primary" style={{ textDecoration: 'none' }}>Manage Books</Link>
            <Link to="/cataloger/categories" className="btn-primary" style={{ textDecoration: 'none' }}>Manage Categories</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CatalogerHome;

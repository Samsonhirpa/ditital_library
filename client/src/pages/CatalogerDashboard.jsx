import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const defaultCategories = [
  { id: 'cat-1', name: 'Fiction', description: 'Fictional books including novels and stories' },
  { id: 'cat-2', name: 'Science', description: 'Science and technology books' }
];

const defaultBooks = [
  {
    id: 'book-1',
    title: 'Introduction to Physics',
    author: 'A. Einstein',
    isbn: '978-0-123456-47-2',
    categoryId: 'cat-2',
    totalCopies: 4,
    availableCopies: 3,
    shelfLocation: 'B-201',
    description: 'Foundational science concepts',
    status: 'available',
    borrowCount: 18
  },
  {
    id: 'book-2',
    title: 'Classic Stories',
    author: 'M. Writer',
    isbn: '978-0-987654-32-1',
    categoryId: 'cat-1',
    totalCopies: 2,
    availableCopies: 1,
    shelfLocation: 'A-101',
    description: 'Collection of short stories',
    status: 'available',
    borrowCount: 25
  }
];

const emptyCategory = { name: '', description: '' };
const emptyBook = {
  title: '',
  author: '',
  isbn: '',
  categoryId: '',
  totalCopies: 1,
  availableCopies: 1,
  shelfLocation: '',
  description: '',
  status: 'available',
  borrowCount: 0
};

function CatalogerDashboard() {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState(defaultCategories);
  const [books, setBooks] = useState(defaultBooks);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [bookForm, setBookForm] = useState(emptyBook);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingBookId, setEditingBookId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


  const libraryDisplayName = user?.library_name
    || (user?.library_id ? `Library #${user.library_id}` : 'Unassigned Library');


  useEffect(() => {
    if (location.pathname.includes('/cataloger/books')) {
      setActiveTab('books');
      return;
    }
    if (location.pathname.includes('/cataloger/categories')) {
      setActiveTab('categories');
      return;
    }
    setActiveTab('dashboard');
  }, [location.pathname]);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return books.filter((book) => {
      const categoryName = categories.find((c) => c.id === book.categoryId)?.name || 'Uncategorized';
      const matchesSearch = !term || [book.title, book.author, book.isbn, categoryName].some((value) => (value || '').toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, categories, search, statusFilter]);

  const analytics = useMemo(() => {
    const lowStock = books.filter((b) => b.availableCopies <= 2).length;
    const damagedOrLost = books.filter((b) => b.status === 'damaged' || b.status === 'lost').length;
    const topBorrowed = [...books].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 5);
    return {
      totalBooks: books.length,
      totalCategories: categories.length,
      lowStock,
      damagedOrLost,
      topBorrowed
    };
  }, [books, categories]);

  const upsertCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    if (editingCategoryId) {
      setCategories((prev) => prev.map((c) => (c.id === editingCategoryId ? { ...c, ...categoryForm } : c)));
    } else {
      setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, ...categoryForm }]);
    }

    setCategoryForm(emptyCategory);
    setEditingCategoryId(null);
  };

  const editCategory = (category) => {
    setCategoryForm({ name: category.name, description: category.description || '' });
    setEditingCategoryId(category.id);
    setActiveTab('categories');
  };

  const removeCategory = (id) => {
    if (!window.confirm('Delete this category? Books will be set to Uncategorized.')) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBooks((prev) => prev.map((book) => (book.categoryId === id ? { ...book, categoryId: '' } : book)));
  };

  const upsertBook = (e) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.author.trim()) return;

    const normalized = {
      ...bookForm,
      totalCopies: Number(bookForm.totalCopies) || 1,
      availableCopies: Math.min(Number(bookForm.availableCopies) || 0, Number(bookForm.totalCopies) || 1),
      borrowCount: Number(bookForm.borrowCount) || 0
    };

    if (editingBookId) {
      setBooks((prev) => prev.map((b) => (b.id === editingBookId ? { ...b, ...normalized } : b)));
    } else {
      setBooks((prev) => [...prev, { id: `book-${Date.now()}`, ...normalized }]);
    }

    setBookForm(emptyBook);
    setEditingBookId(null);
  };

  const editBook = (book) => {
    setBookForm({ ...book });
    setEditingBookId(book.id);
    setActiveTab('books');
  };

  const removeBook = (id) => {
    if (!window.confirm('Delete this book?')) return;
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>📚 Cataloger Dashboard</h1>
        <h2 style={{ marginTop: 0, marginBottom: '0.6rem', color: '#1d4ed8', fontSize: '1.1rem' }}>
          Welcome to {libraryDisplayName}
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Manage books and categories with full create, edit, and delete permissions. Monitor stock reports and analytics in one place.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[
            ['dashboard', '📊 Dashboard'],
            ['books', '📖 Book Management'],
            ['categories', '📁 Category Management']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '999px',
                padding: '0.45rem 0.9rem',
                background: activeTab === key ? '#2563eb' : '#fff',
                color: activeTab === key ? '#fff' : '#1e293b'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                ['Total Books', analytics.totalBooks],
                ['Categories', analytics.totalCategories],
                ['Low Stock (≤2)', analytics.lowStock],
                ['Damaged/Lost', analytics.damagedOrLost]
              ].map(([label, value]) => (
                <div key={label} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '0.85rem' }}>
                  <p style={{ margin: 0, color: '#64748b' }}>{label}</p>
                  <h2 style={{ margin: '0.3rem 0 0' }}>{value}</h2>
                </div>
              ))}
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>📈 Reports & Analytics</h3>
              <p style={{ color: '#64748b' }}>Most borrowed books (Top 5)</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: '0.4rem' }}>Title</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: '0.4rem' }}>Author</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: '0.4rem' }}>Borrows</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topBorrowed.map((book) => (
                    <tr key={book.id}>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '0.4rem' }}>{book.title}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '0.4rem' }}>{book.author}</td>
                      <td style={{ borderBottom: '1px solid #f1f5f9', padding: '0.4rem' }}>{book.borrowCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'books' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '0.9rem' }}>
            <form onSubmit={upsertBook} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '1rem', display: 'grid', gap: '0.5rem' }}>
              <h3 style={{ marginTop: 0 }}>{editingBookId ? 'Edit Book' : 'Add Book'}</h3>
              <input placeholder="Title *" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required />
              <input placeholder="Author *" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} required />
              <input placeholder="ISBN" value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
              <select value={bookForm.categoryId} onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}>
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" min="1" placeholder="Total Copies" value={bookForm.totalCopies} onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })} />
              <input type="number" min="0" placeholder="Available Copies" value={bookForm.availableCopies} onChange={(e) => setBookForm({ ...bookForm, availableCopies: e.target.value })} />
              <input placeholder="Shelf Location" value={bookForm.shelfLocation} onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })} />
              <select value={bookForm.status} onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}>
                {['available', 'damaged', 'lost', 'under_repair'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <input type="number" min="0" placeholder="Borrow Count" value={bookForm.borrowCount} onChange={(e) => setBookForm({ ...bookForm, borrowCount: e.target.value })} />
              <textarea placeholder="Description" value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} />
              <button type="submit">{editingBookId ? 'Update Book' : 'Add Book'}</button>
            </form>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Book Inventory</h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input placeholder="Search by title, author, ISBN, category" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                  <option value="under_repair">Under Repair</option>
                </select>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Book</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Copies</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                        <strong>{book.title}</strong><br />
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{book.author}</span>
                      </td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>{book.availableCopies}/{book.totalCopies}</td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>{book.status}</td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editBook(book)} style={{ marginRight: '0.35rem' }}>Edit</button>
                        <button type="button" onClick={() => removeBook(book.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.9rem' }}>
            <form onSubmit={upsertCategory} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '1rem', display: 'grid', gap: '0.5rem' }}>
              <h3 style={{ marginTop: 0 }}>{editingCategoryId ? 'Edit Category' : 'Add Category'}</h3>
              <input placeholder="Category Name *" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
              <textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
              <button type="submit">{editingCategoryId ? 'Update Category' : 'Add Category'}</button>
            </form>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Category List</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>{category.name}</td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>{category.description || '-'}</td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                        <button type="button" onClick={() => editCategory(category)} style={{ marginRight: '0.35rem' }}>Edit</button>
                        <button type="button" onClick={() => removeCategory(category.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CatalogerDashboard;

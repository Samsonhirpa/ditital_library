import React, { useMemo, useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import './CatalogerDashboard.css';

const UNCATEGORIZED_ID = 'uncategorized';

const initialCategories = [
  { id: UNCATEGORIZED_ID, name: 'Uncategorized', description: 'Books without an assigned category.' },
  { id: 'fiction', name: 'Fiction', description: 'Stories, novels, and literary works.' },
  { id: 'science', name: 'Science', description: 'Physics, biology, and technology topics.' },
  { id: 'history', name: 'History', description: 'Historical books, archives, and records.' }
];

const initialBooks = [
  { id: 'book-1', title: 'The Silent Shore', author: 'Elena Moss', isbn: '978-1-9487-1500-2', totalCopies: 8, shelfLocation: 'A-12', categoryId: 'fiction' },
  { id: 'book-2', title: 'Quantum Made Simple', author: 'Dr. A. Rivera', isbn: '978-0-1555-4021-7', totalCopies: 4, shelfLocation: 'C-02', categoryId: 'science' },
  { id: 'book-3', title: 'Voices of Empire', author: 'M. Okafor', isbn: '978-1-7200-8803-3', totalCopies: 2, shelfLocation: 'B-19', categoryId: 'history' },
  { id: 'book-4', title: 'Library Orientation Handbook', author: 'Admin Office', isbn: '978-1-0088-7001-5', totalCopies: 11, shelfLocation: 'R-01', categoryId: UNCATEGORIZED_ID }
];

const emptyBookForm = {
  title: '',
  author: '',
  isbn: '',
  totalCopies: 1,
  shelfLocation: '',
  categoryId: UNCATEGORIZED_ID
};

const emptyCategoryForm = {
  name: '',
  description: ''
};

function CatalogerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [books, setBooks] = useState(initialBooks);
  const [categories, setCategories] = useState(initialCategories);

  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookMessage, setBookMessage] = useState('');

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryMessage, setCategoryMessage] = useState('');

  const analytics = useMemo(() => {
    const lowStockBooks = books.filter((book) => Number(book.totalCopies) <= 3).length;
    const uncategorizedBooks = books.filter((book) => book.categoryId === UNCATEGORIZED_ID).length;

    const totalsByCategory = categories
      .filter((category) => category.id !== UNCATEGORIZED_ID)
      .map((category) => ({
        ...category,
        total: books.filter((book) => book.categoryId === category.id).length
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalBooks: books.length,
      totalCategories: categories.filter((category) => category.id !== UNCATEGORIZED_ID).length,
      lowStockBooks,
      uncategorizedBooks,
      totalsByCategory
    };
  }, [books, categories]);

  const getCategoryName = (categoryId) => {
    return categories.find((category) => category.id === categoryId)?.name || 'Unknown';
  };

  const resetBookForm = () => {
    setBookForm(emptyBookForm);
    setEditingBookId(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const handleBookSubmit = (event) => {
    event.preventDefault();

    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      setBookMessage('Title and author are required.');
      return;
    }

    if (editingBookId) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingBookId
            ? {
                ...book,
                ...bookForm,
                totalCopies: Number(bookForm.totalCopies) || 1,
                title: bookForm.title.trim(),
                author: bookForm.author.trim(),
                isbn: bookForm.isbn.trim(),
                shelfLocation: bookForm.shelfLocation.trim()
              }
            : book
        )
      );
      setBookMessage('Book updated successfully.');
    } else {
      const newBook = {
        id: `book-${Date.now()}`,
        ...bookForm,
        totalCopies: Number(bookForm.totalCopies) || 1,
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        isbn: bookForm.isbn.trim(),
        shelfLocation: bookForm.shelfLocation.trim()
      };
      setBooks((prev) => [newBook, ...prev]);
      setBookMessage('Book added successfully.');
    }

    resetBookForm();
  };

  const handleBookEdit = (book) => {
    setEditingBookId(book.id);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation,
      categoryId: book.categoryId
    });
    setBookMessage('');
  };

  const handleBookDelete = (bookId) => {
    setBooks((prev) => prev.filter((book) => book.id !== bookId));
    if (editingBookId === bookId) {
      resetBookForm();
    }
    setBookMessage('Book deleted.');
  };

  const handleCategorySubmit = (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      setCategoryMessage('Category name is required.');
      return;
    }

    const duplicate = categories.find(
      (category) => category.name.toLowerCase() === categoryForm.name.trim().toLowerCase() && category.id !== editingCategoryId
    );

    if (duplicate) {
      setCategoryMessage('Category name already exists.');
      return;
    }

    if (editingCategoryId) {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategoryId
            ? {
                ...category,
                name: categoryForm.name.trim(),
                description: categoryForm.description.trim()
              }
            : category
        )
      );
      setCategoryMessage('Category updated successfully.');
    } else {
      const newCategory = {
        id: `category-${Date.now()}`,
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim()
      };
      setCategories((prev) => [...prev, newCategory]);
      setCategoryMessage('Category created successfully.');
    }

    resetCategoryForm();
  };

  const handleCategoryEdit = (category) => {
    if (category.id === UNCATEGORIZED_ID) return;

    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name, description: category.description });
    setCategoryMessage('');
  };

  const handleCategoryDelete = (categoryId) => {
    if (categoryId === UNCATEGORIZED_ID) return;

    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
    setBooks((prev) =>
      prev.map((book) =>
        book.categoryId === categoryId
          ? {
              ...book,
              categoryId: UNCATEGORIZED_ID
            }
          : book
      )
    );

    if (editingCategoryId === categoryId) {
      resetCategoryForm();
    }

    setCategoryMessage('Category deleted. Books were reassigned to Uncategorized.');
  };

  return (
    <DashboardLayout>
      <div className="cataloger-page">
        <div className="cataloger-header">
          <h1>Cataloger Dashboard</h1>
          <p>Manage books and categories with live operations and inventory analytics.</p>
        </div>

        <div className="cataloger-tabs">
          {[
            ['dashboard', 'Dashboard'],
            ['books', 'Book Management'],
            ['categories', 'Category Management']
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`cataloger-tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <section className="cataloger-panel">
            <div className="stats-grid">
              <div className="stat-card">
                <p>Total Books</p>
                <h2>{analytics.totalBooks}</h2>
              </div>
              <div className="stat-card">
                <p>Active Categories</p>
                <h2>{analytics.totalCategories}</h2>
              </div>
              <div className="stat-card warn">
                <p>Low Stock (≤3)</p>
                <h2>{analytics.lowStockBooks}</h2>
              </div>
              <div className="stat-card accent">
                <p>Uncategorized Books</p>
                <h2>{analytics.uncategorizedBooks}</h2>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="card">
                <h3>Category Analytics</h3>
                <p className="muted">Books currently assigned by category.</p>
                <ul className="analytics-list">
                  {analytics.totalsByCategory.length === 0 && <li>No categories yet.</li>}
                  {analytics.totalsByCategory.map((category) => (
                    <li key={category.id}>
                      <span>{category.name}</span>
                      <strong>{category.total}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3>Recent Collection Snapshot</h3>
                <p className="muted">Latest records in your catalog.</p>
                <ul className="book-snippet-list">
                  {books.slice(0, 6).map((book) => (
                    <li key={book.id}>
                      <div>
                        <strong>{book.title}</strong>
                        <p>{book.author}</p>
                      </div>
                      <span className="tag">{getCategoryName(book.categoryId)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'books' && (
          <section className="cataloger-panel">
            <div className="card">
              <h3>{editingBookId ? 'Edit Book' : 'Add New Book'}</h3>
              <form className="cataloger-form" onSubmit={handleBookSubmit}>
                <input
                  type="text"
                  placeholder="Book title"
                  value={bookForm.title}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Author"
                  value={bookForm.author}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, author: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="ISBN"
                  value={bookForm.isbn}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, isbn: event.target.value }))}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Total copies"
                  value={bookForm.totalCopies}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, totalCopies: event.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Shelf location"
                  value={bookForm.shelfLocation}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, shelfLocation: event.target.value }))}
                />
                <select
                  value={bookForm.categoryId}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="form-actions">
                  <button type="submit" className="primary-btn">
                    {editingBookId ? 'Update Book' : 'Create Book'}
                  </button>
                  {editingBookId && (
                    <button type="button" className="ghost-btn" onClick={resetBookForm}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
              {bookMessage && <p className="form-message">{bookMessage}</p>}
            </div>

            <div className="card">
              <h3>Book Inventory</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Copies</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{getCategoryName(book.categoryId)}</td>
                        <td>{book.totalCopies}</td>
                        <td>
                          <div className="row-actions">
                            <button type="button" onClick={() => handleBookEdit(book)}>Edit</button>
                            <button type="button" className="danger" onClick={() => handleBookDelete(book.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'categories' && (
          <section className="cataloger-panel">
            <div className="card">
              <h3>{editingCategoryId ? 'Edit Category' : 'Create Category'}</h3>
              <form className="cataloger-form" onSubmit={handleCategorySubmit}>
                <input
                  type="text"
                  placeholder="Category name"
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <textarea
                  placeholder="Category description"
                  rows="3"
                  value={categoryForm.description}
                  onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))}
                />
                <div className="form-actions">
                  <button type="submit" className="primary-btn">
                    {editingCategoryId ? 'Update Category' : 'Create Category'}
                  </button>
                  {editingCategoryId && (
                    <button type="button" className="ghost-btn" onClick={resetCategoryForm}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
              {categoryMessage && <p className="form-message">{categoryMessage}</p>}
            </div>

            <div className="card">
              <h3>Category List</h3>
              <ul className="category-list">
                {categories.map((category) => {
                  const usage = books.filter((book) => book.categoryId === category.id).length;
                  const locked = category.id === UNCATEGORIZED_ID;

                  return (
                    <li key={category.id}>
                      <div>
                        <h4>{category.name}</h4>
                        <p>{category.description || 'No description provided.'}</p>
                        <small>{usage} book(s) assigned</small>
                      </div>
                      <div className="row-actions">
                        {!locked && (
                          <>
                            <button type="button" onClick={() => handleCategoryEdit(category)}>
                              Edit
                            </button>
                            <button type="button" className="danger" onClick={() => handleCategoryDelete(category.id)}>
                              Delete
                            </button>
                          </>
                        )}
                        {locked && <span className="locked-pill">System category</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CatalogerDashboard;

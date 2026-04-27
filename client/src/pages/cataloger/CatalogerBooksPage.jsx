import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { createBook, deleteBook, fetchBooks, fetchCategories, updateBook } from './catalogerApi';
import './CatalogerPages.css';

const emptyBookForm = { title: '', author: '', isbn: '', copies_total: 1, shelf_location: '', category_id: '' };

function CatalogerBooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(emptyBookForm);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    const [bookRows, categoryRows] = await Promise.all([fetchBooks(), fetchCategories()]);
    setBooks(bookRows);
    setCategories(categoryRows);
  };

  useEffect(() => {
    loadData().catch((error) => setErrorMessage(error.response?.data?.message || 'Failed to load books'));
  }, []);

  const openCreate = () => {
    setEditingBook(null);
    setForm(emptyBookForm);
    setShowModal(true);
    setMessage('');
    setErrorMessage('');
  };

  const openEdit = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      copies_total: Number(book.copies_total || 1),
      shelf_location: book.shelf_location || '',
      category_id: book.category_id || ''
    });
    setShowModal(true);
    setMessage('');
    setErrorMessage('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        copies_total: Number(form.copies_total || 1),
        category_id: form.category_id || null
      };

      if (editingBook) {
        await updateBook(editingBook.id, payload);
        setMessage('Book updated successfully.');
      } else {
        await createBook(payload);
        setMessage('Book registered successfully.');
      }

      setShowModal(false);
      setForm(emptyBookForm);
      await loadData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to save book');
    }
  };

  const onDelete = async (bookId) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await deleteBook(bookId);
      setMessage('Book deleted successfully.');
      await loadData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const totalCopies = useMemo(
    () => books.reduce((sum, item) => sum + Number(item.copies_total || 0), 0),
    [books]
  );

  return (
    <DashboardLayout>
      <div className="cataloger-shell">
        <div className="cataloger-hero">
          <h1>Books Management</h1>
          <p>Register, edit, and delete books with data persisted to the database.</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card"><h3>Books</h3><p>{books.length}</p></div>
          <div className="kpi-card"><h3>Total Copies</h3><p>{totalCopies}</p></div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Book List</h3>
            <button type="button" className="btn-primary" onClick={openCreate}>+ Register Book</button>
          </div>
          {message && <p className="status-message">{message}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Copies</th>
                  <th>Shelf</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 && (
                  <tr><td colSpan="7">No books yet.</td></tr>
                )}
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author || '—'}</td>
                    <td>{book.isbn || '—'}</td>
                    <td>{book.category_name || 'Uncategorized'}</td>
                    <td>{book.copies_available}/{book.copies_total}</td>
                    <td>{book.shelf_location || '—'}</td>
                    <td>
                      <div className="actions">
                        <button type="button" className="btn-secondary" onClick={() => openEdit(book)}>Edit</button>
                        <button type="button" className="btn-danger" onClick={() => onDelete(book.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editingBook ? 'Edit Book' : 'Register Book'}</h3>
            <form onSubmit={onSubmit}>
              <input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
              <input placeholder="Author" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} />
              <input placeholder="ISBN" value={form.isbn} onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))} />
              <input type="number" min="1" placeholder="Copies" value={form.copies_total} onChange={(e) => setForm((p) => ({ ...p, copies_total: e.target.value }))} required />
              <input placeholder="Shelf location" value={form.shelf_location} onChange={(e) => setForm((p) => ({ ...p, shelf_location: e.target.value }))} />
              <select value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}>
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingBook ? 'Save Changes' : 'Register Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CatalogerBooksPage;

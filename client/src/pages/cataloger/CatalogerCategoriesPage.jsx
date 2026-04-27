import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from './catalogerApi';
import './CatalogerPages.css';

const emptyCategoryForm = { name: '', description: '' };

function CatalogerCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(emptyCategoryForm);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    const rows = await fetchCategories();
    setCategories(rows);
  };

  useEffect(() => {
    loadData().catch((error) => setErrorMessage(error.response?.data?.message || 'Failed to load categories'));
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyCategoryForm);
    setShowModal(true);
    setMessage('');
    setErrorMessage('');
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name || '', description: category.description || '' });
    setShowModal(true);
    setMessage('');
    setErrorMessage('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, form);
        setMessage('Category updated successfully.');
      } else {
        await createCategory(form);
        setMessage('Category registered successfully.');
      }

      setShowModal(false);
      setForm(emptyCategoryForm);
      await loadData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to save category');
    }
  };

  const onDelete = async (categoryId) => {
    if (!window.confirm('Delete this category? Books under it become uncategorized.')) return;

    try {
      await deleteCategory(categoryId);
      setMessage('Category deleted successfully.');
      await loadData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <DashboardLayout>
      <div className="cataloger-shell">
        <div className="cataloger-hero">
          <h1>Category Management</h1>
          <p>Create, edit, and delete categories with data saved to the database.</p>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Categories</h3>
            <button type="button" className="btn-primary" onClick={openCreate}>+ Register Category</button>
          </div>

          {message && <p className="status-message">{message}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr><td colSpan="3">No categories yet.</td></tr>
                )}
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.description || '—'}</td>
                    <td>
                      <div className="actions">
                        <button type="button" className="btn-secondary" onClick={() => openEdit(category)}>Edit</button>
                        <button type="button" className="btn-danger" onClick={() => onDelete(category.id)}>Delete</button>
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
            <h3>{editingCategory ? 'Edit Category' : 'Register Category'}</h3>
            <form onSubmit={onSubmit}>
              <input placeholder="Category name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              <textarea rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingCategory ? 'Save Changes' : 'Register Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CatalogerCategoriesPage;

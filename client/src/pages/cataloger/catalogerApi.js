import api from '../../services/api';

export const fetchBooks = async () => {
  const response = await api.get('/physical/books');
  return response.data;
};

export const createBook = async (payload) => {
  const response = await api.post('/physical/books', payload);
  return response.data;
};

export const updateBook = async (bookId, payload) => {
  const response = await api.put(`/physical/books/${bookId}`, payload);
  return response.data;
};

export const deleteBook = async (bookId) => {
  const response = await api.delete(`/physical/books/${bookId}`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/physical/categories');
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await api.post('/physical/categories', payload);
  return response.data;
};

export const updateCategory = async (categoryId, payload) => {
  const response = await api.put(`/physical/categories/${categoryId}`, payload);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/physical/categories/${categoryId}`);
  return response.data;
};

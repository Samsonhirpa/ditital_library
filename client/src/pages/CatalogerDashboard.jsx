import React from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';

const statsCards = [
  { label: 'Total Books', value: '1,248' },
  { label: 'Categories', value: '18' },
  { label: 'Low Stock', value: '27' }
];

const sampleCategories = [
  ['Fiction', 'Fictional books including novels and stories'],
  ['Non-Fiction', 'Educational and informational books'],
  ['Science', 'Science and technology books'],
  ['History', 'Historical books and documents'],
  ['Children', 'Books for children and young readers'],
  ['Biography', 'Biographies and autobiographies'],
  ['Technology', 'Technology and computing books']
];

const permissions = [
  ['Add Book', '✅', '❌', '❌', '✅'],
  ['Edit Book', '✅', '❌', '❌', '✅'],
  ['Delete Book', '✅', '❌', '❌', '✅'],
  ['Add Category', '✅', '❌', '❌', '✅'],
  ['Edit Category', '✅', '❌', '❌', '✅'],
  ['Delete Category', '✅', '❌', '❌', '✅'],
  ['View Books', '✅', '✅', '✅', '✅'],
  ['Issue Books', '❌', '✅', '❌', '✅'],
  ['Return Books', '❌', '✅', '❌', '✅'],
  ['View Reports', '❌', '❌', '✅', '✅']
];

function CatalogerDashboard() {
  return (
    <DashboardLayout>
      <div style={{ padding: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>📚 Cataloger Role - Complete Guide</h1>
        <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
          Catalogers manage inventory and categories to keep the physical library collection accurate, searchable, and well organized.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {statsCards.map((card) => (
            <div key={card.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem' }}>
              <p style={{ color: '#64748b', marginBottom: '0.35rem' }}>{card.label}</p>
              <h2 style={{ margin: 0 }}>{card.value}</h2>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <h3>🎯 Primary Responsibilities</h3>
          <ol style={{ marginTop: '0.75rem', color: '#334155' }}>
            <li><strong>Book Management:</strong> add, edit, delete books, update quantities, and maintain statuses.</li>
            <li><strong>Category Management:</strong> create, edit, and remove categories while keeping books organized.</li>
            <li><strong>Search & Filter:</strong> find books by title/author/ISBN/category and monitor low stock.</li>
            <li><strong>Inventory Oversight:</strong> track stock levels, damaged items, and borrowing trends.</li>
          </ol>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <h3>📋 Book Management Form Fields</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: '0.5rem' }}>Field</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: '0.5rem' }}>Required</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: '0.5rem' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Title', '✅', 'Full title of the book'],
                ['Author', '✅', 'Name of the author(s)'],
                ['ISBN', '❌', 'International Standard Book Number'],
                ['Category', '❌', 'Select from existing categories'],
                ['Total Copies', '❌', 'Number of physical copies (default: 1)'],
                ['Shelf Location', '❌', 'Physical location (e.g., A-101)'],
                ['Description', '❌', 'Brief summary of the book']
              ].map(([field, required, description]) => (
                <tr key={field}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>{field}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>{required}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <h3>📊 Sample Categories</h3>
          <ul style={{ marginTop: '0.75rem', color: '#334155' }}>
            {sampleCategories.map(([name, description]) => (
              <li key={name} style={{ marginBottom: '0.35rem' }}>
                <strong>{name}:</strong> {description}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
          <h3>✅ Permissions Matrix</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Action', 'Cataloger', 'Librarian', 'Manager', 'Library Admin'].map((header) => (
                  <th key={header} style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', padding: '0.5rem' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => (
                    <td key={`${row[0]}-${cell}`} style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CatalogerDashboard;

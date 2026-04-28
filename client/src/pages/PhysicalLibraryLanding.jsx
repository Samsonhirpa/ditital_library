import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/Layout/TopNavbar';
import LPFooter from '../components/Layout/LPFooter';

const PHYSICAL_ITEMS = [
  {
    id: 1,
    title: 'Seenaa Oromoo: A Historical Reader',
    author: 'Dr. Birhanu Dinka',
    subject: 'History',
    library: 'Finfinne Central Library',
    shelf: 'A-12',
    status: 'Available'
  },
  {
    id: 2,
    title: 'Afaan Oromoo Grammar Essentials',
    author: 'Prof. Lensa Tufa',
    subject: 'Language',
    library: 'Adama Community Library',
    shelf: 'B-07',
    status: 'Reference Only'
  },
  {
    id: 3,
    title: 'Oromo Indigenous Governance',
    author: 'Aster Gemechu',
    subject: 'Governance',
    library: 'Jimma Heritage Library',
    shelf: 'C-04',
    status: 'Available'
  },
  {
    id: 4,
    title: 'Women in Oromo Oral Traditions',
    author: 'Hana Fekadu',
    subject: 'Culture',
    library: 'Finfinne Central Library',
    shelf: 'D-18',
    status: 'Checked Out'
  },
  {
    id: 5,
    title: 'Contemporary Oromo Literature',
    author: 'Kedir Mohammed',
    subject: 'Literature',
    library: 'Bishoftu Public Library',
    shelf: 'E-03',
    status: 'Available'
  },
  {
    id: 6,
    title: 'Research Methods for African Studies',
    author: 'Tigist Bekele',
    subject: 'Research',
    library: 'Jimma Heritage Library',
    shelf: 'R-11',
    status: 'Available'
  }
];

function PhysicalLibraryLanding() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(
    () =>
      PHYSICAL_ITEMS.filter((item) => {
        const query = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query) ||
          item.subject.toLowerCase().includes(query) ||
          item.library.toLowerCase().includes(query)
        );
      }),
    [searchTerm]
  );

  return (
    <>
      <TopNavbar />

      <div
        style={{
          background: 'linear-gradient(135deg, #0f4c81 0%, #1f6fa8 100%)',
          color: 'white',
          padding: '120px 2rem 80px',
          textAlign: 'center',
          marginTop: '70px'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>
            Oromo Research Association
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.95 }}>
            Physical Library • Community Spaces • On-Site Collections
          </p>
          <p style={{ fontSize: '0.95rem', marginBottom: '2rem', opacity: 0.85, lineHeight: '1.6' }}>
            Explore physical collections across our partner libraries with shelf details, availability status,
            and location information for each title.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '1.4rem'
            }}
          >
            <Link
              to="/catalog"
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.16)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.35)',
                padding: '10px 24px',
                borderRadius: '28px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}
            >
              Digital Library
            </Link>
            <Link
              to="/physical-library"
              style={{
                display: 'inline-block',
                background: '#ffffff',
                color: '#0f4c81',
                padding: '10px 24px',
                borderRadius: '28px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}
            >
              Physical Library
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              maxWidth: '500px',
              margin: '0 auto',
              background: 'white',
              borderRadius: '50px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          >
            <input
              type="text"
              placeholder="Search title, author, subject, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: 'none',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              style={{
                padding: '14px 28px',
                background: '#e67e22',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}
            >
              Search
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginTop: '3rem'
            }}
          >
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{PHYSICAL_ITEMS.length}+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Physical Titles</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>4</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Library Branches</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>6 Days</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Service Weekly</div>
            </div>
          </div>

          {!isAuthenticated && (
            <Link
              to="/register"
              style={{
                display: 'inline-block',
                marginTop: '2rem',
                background: '#e67e22',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Become a Library Member
            </Link>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '5rem 2rem',
          background: '#f8f9fa'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: '2rem',
              color: '#2c5f8a',
              marginBottom: '0.5rem'
            }}
          >
            Available Physical Resources
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#666',
              marginBottom: '3rem',
              fontSize: '0.9rem'
            }}
          >
            Browse holdings from our physical library network
          </p>

          {filteredItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <p>No matching physical resources found. Try another search term.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem'
              }}
            >
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    transition: 'transform 0.3s, box-shadow 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                  }}
                >
                  <div
                    style={{
                      height: '180px',
                      background: 'linear-gradient(135deg, #0f4c81 0%, #1f6fa8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3.5rem'
                    }}
                  >
                    <span>🏛️</span>
                  </div>

                  <div style={{ padding: '1.4rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: '#0f4c81',
                        background: '#e6f0f9',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        marginBottom: '0.8rem'
                      }}
                    >
                      {item.subject}
                    </span>
                    <h3 style={{ margin: '0 0 0.6rem', color: '#1f3b56', fontSize: '1.05rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ margin: '0 0 0.4rem', color: '#5b6b7a', fontSize: '0.85rem' }}>
                      <strong>Author:</strong> {item.author}
                    </p>
                    <p style={{ margin: '0 0 0.4rem', color: '#5b6b7a', fontSize: '0.85rem' }}>
                      <strong>Library:</strong> {item.library}
                    </p>
                    <p style={{ margin: '0 0 0.8rem', color: '#5b6b7a', fontSize: '0.85rem' }}>
                      <strong>Shelf:</strong> {item.shelf}
                    </p>

                    <div
                      style={{
                        paddingTop: '0.8rem',
                        borderTop: '1px solid #e9eef2',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#637381' }}>On-Site Access</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: item.status === 'Available' ? '#1d7f43' : '#946200',
                          background: item.status === 'Available' ? '#e6f7ed' : '#fff6de',
                          padding: '4px 10px',
                          borderRadius: '999px'
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LPFooter />
    </>
  );
}

export default PhysicalLibraryLanding;

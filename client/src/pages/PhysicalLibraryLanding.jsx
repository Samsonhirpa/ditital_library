import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TopNavbar from '../components/Layout/TopNavbar';
import LPFooter from '../components/Layout/LPFooter';

function PhysicalLibraryLanding() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [libraries, setLibraries] = useState([]);
  const [loadingLibraries, setLoadingLibraries] = useState(true);
  const [libraryError, setLibraryError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchLibraries = async () => {
      try {
        setLoadingLibraries(true);
        const response = await api.get('/public/libraries');
        if (isMounted) {
          setLibraries(response.data || []);
          setLibraryError('');
        }
      } catch {
        if (isMounted) {
          setLibraryError('Unable to load libraries right now. Please try again later.');
          setLibraries([]);
        }
      } finally {
        if (isMounted) {
          setLoadingLibraries(false);
        }
      }
    };

    fetchLibraries();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLibraries = useMemo(
    () =>
      libraries.filter((library) => {
        const query = searchTerm.toLowerCase();
        return (
          (library.name || '').toLowerCase().includes(query) ||
          (library.code || '').toLowerCase().includes(query) ||
          (library.address || '').toLowerCase().includes(query) ||
          (library.contact_email || '').toLowerCase().includes(query) ||
          (library.contact_phone || '').toLowerCase().includes(query)
        );
      }),
    [libraries, searchTerm]
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
              placeholder="Search library name, code, address, phone, or email..."
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
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{filteredLibraries.length}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Visible Libraries</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{libraries.length}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Total Libraries</div>
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
              color: '#2c3e50',
              marginBottom: '0.6rem',
              fontWeight: '700'
            }}
          >
            Library List
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#666',
              marginBottom: '2.5rem',
              fontSize: '1rem'
            }}
          >
            Showing active libraries from the database.
          </p>

          {loadingLibraries ? (
            <div style={{ textAlign: 'center', color: '#1f6fa8', fontWeight: '600' }}>Loading libraries...</div>
          ) : libraryError ? (
            <div style={{ textAlign: 'center', color: '#b42318', fontWeight: '600' }}>{libraryError}</div>
          ) : filteredLibraries.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}
              >
                <thead>
                  <tr style={{ background: '#0f4c81', color: 'white' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.9rem' }}>Library Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.9rem' }}>Code</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.9rem' }}>Address</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.9rem' }}>Contact Email</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.9rem' }}>Contact Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLibraries.map((library) => (
                    <tr key={library.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#2c3e50' }}>{library.name || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#555' }}>{library.code || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#555' }}>{library.address || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#555' }}>{library.contact_email || '-'}</td>
                      <td style={{ padding: '14px 16px', color: '#555' }}>{library.contact_phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>No libraries matched your search.</div>
          )}
        </div>
      </div>

      <LPFooter />
    </>
  );
}

export default PhysicalLibraryLanding;

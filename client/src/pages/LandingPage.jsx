import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TopNavbar from '../components/Layout/TopNavbar';
import LPFooter from '../components/Layout/LPFooter';

function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [publishedBooks, setPublishedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const backendBaseUrl = api.defaults.baseURL.replace(/\/api$/, '');

  useEffect(() => {
    fetchPublishedBooks();
  }, []);

  const fetchPublishedBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contents/search');
      console.log('Published books:', response.data);
      setPublishedBooks(response.data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
    setLoading(false);
  };

  const filteredBooks = publishedBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.subject && book.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <TopNavbar />
      
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '120px 2rem 80px',
        textAlign: 'center',
        marginTop: '70px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>
            Oromo Research Association
          </h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.95 }}>
            Digital Library • Preserving Heritage • Advancing Knowledge
          </p>
          <p style={{ fontSize: '0.95rem', marginBottom: '2rem', opacity: 0.85, lineHeight: '1.6' }}>
            Access thousands of physical and digital resources on Oromo history, 
            culture, language, and academic research
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '1.4rem'
          }}>
            <Link to="/catalog" style={{
              display: 'inline-block',
              background: '#ffffff',
              color: '#2c5f8a',
              padding: '10px 24px',
              borderRadius: '28px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              Digital Library
            </Link>
            <Link to="/physical-library" style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.16)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.35)',
              padding: '10px 24px',
              borderRadius: '28px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              Physical Library
            </Link>
          </div>
          
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            maxWidth: '500px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '50px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <input
              type="text"
              placeholder="Search resources..."
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
            <button style={{
              padding: '14px 28px',
              background: '#e67e22',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}>
              Search
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            marginTop: '3rem'
          }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{publishedBooks.length}+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Resources</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>500+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Members</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>10K+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Downloads</div>
            </div>
          </div>

          {!isAuthenticated && (
            <Link to="/register" style={{
              display: 'inline-block',
              marginTop: '2rem',
              background: '#e67e22',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}>
              Get Started Free
            </Link>
          )}
        </div>
      </div>

      {/* Published Books Section */}
      <div style={{
        padding: '5rem 2rem',
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2rem',
            color: '#2c5f8a',
            marginBottom: '0.5rem'
          }}>
            Available Resources
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '3rem',
            fontSize: '0.9rem'
          }}>
            Browse our collection of digital resources
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              Loading resources...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              background: 'white', 
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <p>No resources found. Check back soon for new additions!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '2rem'
            }}>
              {filteredBooks.map((book) => (
                <div key={book.id} style={{
                  background: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                }}>
                  <div style={{
                    height: '260px',
                    background: '#f3f3f3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderBottom: '1px solid #eee'
                  }}>
                    {book.cover_image_url ? (
                      <img
                        src={`${backendBaseUrl}${book.cover_image_url}`}
                        alt={`${book.title} cover`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '3.2rem' }}>📘</span>
                    )}
                    {book.price > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: '#e67e22',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        ${book.price}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      color: '#2c5f8a',
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      {book.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                      by {book.author}
                    </p>
                    {book.subject && (
                      <div style={{
                        display: 'inline-block',
                        background: '#e8f0f8',
                        padding: '3px 10px',
                        borderRadius: '15px',
                        fontSize: '0.7rem',
                        color: '#2c5f8a',
                        marginTop: '0.5rem'
                      }}>
                        {book.subject}
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '1.2rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #eee'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: book.price > 0 ? '#e67e22' : '#27ae60',
                        fontWeight: 'bold'
                      }}>
                        {book.price > 0 ? `$${book.price}` : 'FREE ACCESS'}
                      </span>
                      {isAuthenticated ? (
                        <button style={{
                          padding: '6px 18px',
                          background: '#2c5f8a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '25px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          Read Now
                        </button>
                      ) : (
                        <Link to="/login" style={{
                          padding: '6px 18px',
                          background: '#2c5f8a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '25px',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          Login to Access
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        padding: '5rem 2rem',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2rem',
            color: '#2c5f8a',
            marginBottom: '3rem'
          }}>
            Why Choose ORA Digital Library?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#2c5f8a', fontSize: '1.1rem' }}>Extensive Collection</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Thousands of books, journals, and research papers
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⬇️</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#2c5f8a', fontSize: '1.1rem' }}>Easy Access</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Download and read offline anytime, anywhere
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#2c5f8a', fontSize: '1.1rem' }}>Community Driven</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Collaborative platform for researchers
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#2c5f8a', fontSize: '1.1rem' }}>Quality Content</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Curated academic resources
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: '#2c5f8a',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
            Ready to Explore?
          </h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9, fontSize: '0.95rem' }}>
            Join thousands of researchers and students using ORA Digital Library
          </p>
          {!isAuthenticated ? (
            <Link to="/register" style={{
              display: 'inline-block',
              background: '#e67e22',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              Create Free Account
            </Link>
          ) : (
            <Link to="/catalog" style={{
              display: 'inline-block',
              background: '#e67e22',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}>
              Browse Library
            </Link>
          )}
        </div>
      </div>

      <LPFooter />
    </>
  );
}

export default LandingPage;

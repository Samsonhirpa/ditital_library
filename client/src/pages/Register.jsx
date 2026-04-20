import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/Layout/TopNavbar';
import Footer from '../components/Layout/Footer';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

// Only change the handleSubmit function - keep everything else the same

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }

  setLoading(true);
  const result = await register(formData.email, formData.password, formData.full_name);
  
  if (result.success) {
    // New users are always 'member' role, so redirect to home/landing page
    navigate('/');
  } else {
    setError(result.error || 'Registration failed');
  }
  setLoading(false);
};

  return (
    <>
      <TopNavbar />
      <div style={{
        minHeight: 'calc(100vh - 64px - 200px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        marginTop: '64px'
      }}>
        <div style={{
          maxWidth: '1000px',
          width: '100%',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}>
          {/* Left Side - Information Section */}
          <div style={{
            flex: '1',
            minWidth: '280px',
            background: 'linear-gradient(135deg, #2c5f8a 0%, #1e3a5f 100%)',
            padding: '3rem 2rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2.5rem'
              }}>
                📖
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Join ORA Community</h2>
              <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Start your research journey</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Members Get:</h3>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Unlimited access to digital resources</span>
              </div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Download books and research papers</span>
              </div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Save favorites to your library</span>
              </div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Get updates on new resources</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Already a member?</p>
              <Link to="/login" style={{
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}>
                Sign In Here
              </Link>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div style={{
            flex: '1',
            minWidth: '280px',
            padding: '3rem 2rem',
            background: 'white'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#2c5f8a', marginBottom: '0.5rem' }}>
                Create Account
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                Join the ORA Digital Library
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.4rem'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f8a'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.4rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f8a'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.4rem'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f8a'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.4rem'
                }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2c5f8a'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#2c5f8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#1e3a5f'}
                onMouseLeave={(e) => e.target.style.background = '#2c5f8a'}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2c5f8a', textDecoration: 'none', fontWeight: '500' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;
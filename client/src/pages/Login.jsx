import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/Layout/TopNavbar';
import Footer from '../components/Layout/Footer';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      // Get the user role from the result
      const userRole = result.user?.role;
      
      // Redirect based on role
      switch(userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'librarian':
          navigate('/librarian');
          break;
        case 'manager':
          navigate('/manager');
          break;

         case 'member':
      navigate('/member'); 
      break;
        default:
          navigate('/');
      }
    } else {
      setError(result.error || 'Invalid email or password');
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
                📚
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>ORA Digital Library</h2>
              <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Preserving Oromo Heritage</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Why Join Us?</h3>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Access 2,000+ digital resources</span>
              </div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Download and read offline</span>
              </div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Connect with researchers worldwide</span>
              </div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span>
                <span style={{ fontSize: '0.85rem' }}>Free access to academic resources</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '1rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>New to ORA Library?</p>
              <Link to="/register" style={{
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}>
                Create an Account
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
                Welcome Back
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                Sign in to continue
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <div style={{ marginBottom: '1.5rem' }}>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#666'
            }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#2c5f8a', textDecoration: 'none', fontWeight: '500' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
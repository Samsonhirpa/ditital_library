import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function LPFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="lp-footer">
      <div className="lp-footer-content">
        <div className="lp-footer-brand">
          <h3>Oromo Research Association</h3>
          <p>Digital Library • Preserving Heritage • Advancing Knowledge</p>
        </div>

        <div className="lp-footer-links">
          <Link to="/catalog">Catalog</Link>
          <Link to="/physical-library">Physical Library</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>

      <div className="lp-footer-bottom">
        © {currentYear} Oromo Research Association Digital Library. All rights reserved.
      </div>
    </footer>
  );
}

export default LPFooter;

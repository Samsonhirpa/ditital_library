import React from 'react';

function Footer({ sidebarOpen }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`main-footer ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <div className="footer-content">
        © {currentYear} Oromo Research Association Digital Library. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
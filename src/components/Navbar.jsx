import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">Ticketmaster</a>
        </div>
        
        <div className="navbar-search">
          <div className="search-input-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" placeholder="Search by team, artist, event, or venue" />
          </div>
        </div>

        <div className="navbar-links">
          <a href="#" className="nav-link">Help</a>
          <a href="#" className="nav-link">Sell</a>
          <a href="#" className="nav-link">Sign In</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

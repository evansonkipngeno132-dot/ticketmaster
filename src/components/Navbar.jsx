import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ authUser, setAuthUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('tm_token');
    setAuthUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">Ticketmaster</Link>
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
          <Link to="#" className="nav-link">Help</Link>
          <Link to="#" className="nav-link">Sell</Link>
          {authUser ? (
            <>
              {authUser.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{color: '#026cdf', fontWeight: 'bold'}}>Admin Panel</Link>
              )}
              <Link to="/my-tickets" className="nav-link">My Tickets</Link>
              <Link to="/add-event" className="nav-link nav-link-highlight">+ Add Event</Link>
              <div className="user-menu">
                <span className="nav-link user-greeting">Hi, {authUser.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="nav-link logout-btn">Log Out</button>
              </div>
            </>
          ) : (
            <Link to="/login" className="nav-link">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

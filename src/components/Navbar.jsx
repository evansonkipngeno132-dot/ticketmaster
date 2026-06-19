import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ authUser, setAuthUser }) => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS devices where beforeinstallprompt doesn't fire
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIos && isSafari && !window.navigator.standalone) {
      setShowInstallBtn(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // If it's iOS Safari, show the manual installation instructions modal
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos && !deferredPrompt) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('tm_token');
    setAuthUser(null);
    navigate('/');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/" className="navbar-logo-link">
              <img src="/logo.svg" alt="Ticketmaster Logo" className="navbar-logo-img" />
              <span>Ticketmaster</span>
            </Link>
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
            {showInstallBtn && (
              <button onClick={handleInstallClick} className="nav-link install-app-btn">
                📥 Install App
              </button>
            )}
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

      {/* iOS PWA Installation Guide Modal */}
      {showIosModal && (
        <div className="ios-modal-overlay" onClick={() => setShowIosModal(false)}>
          <div className="ios-modal-box" onClick={e => e.stopPropagation()}>
            <div className="ios-modal-header">
              <h3>Download Ticketmaster App</h3>
              <button className="ios-modal-close" onClick={() => setShowIosModal(false)}>&times;</button>
            </div>
            <div className="ios-modal-body">
              <p>Install this app on your iPhone for quick, full-screen offline access!</p>
              <ol className="ios-steps">
                <li>
                  Tap the <strong>Share</strong> button <span className="ios-share-icon">⎋</span> at the bottom of your screen.
                </li>
                <li>
                  Scroll down the share list and tap <strong>Add to Home Screen</strong> <span className="ios-add-icon">⊞</span>.
                </li>
                <li>
                  Tap <strong>Add</strong> in the top-right corner to complete installation.
                </li>
              </ol>
            </div>
            <button className="btn-primary ios-modal-btn" onClick={() => setShowIosModal(false)}>Got It</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Our Network</h4>
            <ul>
              <li><a href="#">Live Nation</a></li>
              <li><a href="#">House of Blues</a></li>
              <li><a href="#">Front Gate Tickets</a></li>
              <li><a href="#">TicketWeb</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>About Us</h4>
            <ul>
              <li><a href="#">Who We Are</a></li>
              <li><a href="#">Ticketing Truths</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Refunds and Exchanges</a></li>
              <li><a href="#">Do Not Sell My Info</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Ticketmaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-background" style={{ backgroundImage: 'url(/hero-bg.png)' }}>
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <h1>Let's Make Live Happen</h1>
        <p>Shop millions of live events and discover can't-miss concerts, games, theater and more.</p>
        
        <div className="hero-search-filters">
          <div className="filter-input">
            <label>Search by City or Zip</label>
            <input type="text" placeholder="Enter location..." />
          </div>
          <div className="filter-input">
            <label>Date Range</label>
            <input type="text" placeholder="All Dates" />
          </div>
          <button className="search-btn">Search</button>
        </div>
      </div>
    </div>
  );
};

export default Hero;

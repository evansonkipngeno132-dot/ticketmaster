import React from 'react';
import './Hero.css';

const Hero = ({ 
  searchQuery, 
  setSearchQuery, 
  locationQuery, 
  setLocationQuery, 
  dateQuery, 
  setDateQuery 
}) => {
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
            <label>Search</label>
            <input 
              type="text" 
              placeholder="Artist, event or venue..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-input">
            <label>Location</label>
            <input 
              type="text" 
              placeholder="City or Zip code..." 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <div className="filter-input">
            <label>Dates</label>
            <input 
              type="text" 
              placeholder="All Dates" 
              value={dateQuery}
              onChange={(e) => setDateQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

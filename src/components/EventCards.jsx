import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './EventCards.css';

const EventCards = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Error fetching events", err));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <section className="events-section">
      <div className="container">
        <h2 className="section-title">Trending Events</h2>
        <motion.div 
          className="events-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {events.map((event) => (
            <motion.div 
              className="event-card" 
              key={event.id} 
              onClick={() => navigate(`/events/${event.id}`)}
              variants={itemVariants}
            >
              <div className="event-image-wrapper">
                <img src={event.image} alt={event.title} className="event-image" />
                <span className="event-badge">{event.category}</span>
              </div>
              <div className="event-details">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-date">{event.date}</p>
                <p className="event-venue">{event.venue}</p>
                <button 
                  className="btn-tickets" 
                  onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
                >
                  See Tickets
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EventCards;

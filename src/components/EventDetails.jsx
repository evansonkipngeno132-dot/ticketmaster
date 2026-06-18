import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not Found');
        return res.json();
      })
      .then(data => setEvent(data))
      .catch(err => {
        console.error("Event not found", err);
        navigate('/'); // Redirect to home on error
      });
  }, [id, navigate]);

  if (!event) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Loading...</div>;

  return (
    <motion.div 
      className="event-details-page"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="event-header" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="event-header-overlay"></div>
        <div className="container event-header-content">
          <button className="back-btn" onClick={() => navigate('/')}>
            &larr; Back to Events
          </button>
          <h1>{event.title}</h1>
          <p className="event-meta">{event.date} | {event.venue}</p>
        </div>
      </div>

      <div className="container event-body">
        <div className="event-info-col">
          <section className="about-event">
            <h2>About This Event</h2>
            <p>Join us for an unforgettable night of music and entertainment. Experience the magic live with stunning visuals, incredible sound, and a crowd that brings the energy. Don't miss your chance to be part of history.</p>
          </section>
          
          <section className="venue-info">
            <h2>Venue Information</h2>
            <p><strong>{event.venue.split(',')[0]}</strong><br/>{event.venue.split(',').slice(1).join(',').trim() || "Event Location"}</p>
            <div className="venue-map-placeholder">
               Interactive Map Loading...
            </div>
          </section>
        </div>

        <div className="ticket-selection-col">
          <div className="ticket-box">
            <h2>Select Tickets</h2>
            <div className="ticket-tier">
              <div className="tier-info">
                <h3>General Admission</h3>
                <p>Standing Room Only</p>
              </div>
              <div className="tier-price">
                <span className="price">$150.00</span>
                <button className="btn-select" onClick={() => navigate('/checkout', { state: { event } })}>Select</button>
              </div>
            </div>
            
            <div className="ticket-tier">
              <div className="tier-info">
                <h3>VIP Package</h3>
                <p>Early Entry, Exclusive Merch</p>
              </div>
              <div className="tier-price">
                <span className="price">$450.00</span>
                <button className="btn-select" onClick={() => navigate('/checkout', { state: { event, isVip: true } })}>Select</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetails;

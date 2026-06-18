import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AddEvent.css';

const CATEGORIES = ['Concerts', 'Sports', 'Arts & Theater', 'Comedy', 'Family', 'Other'];

const AddEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', date: '', venue: '', category: 'Concerts', image: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tm_token')}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/');
      } else {
        setError(data.message || 'Failed to create event');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="add-event-page container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="add-event-card">
        <h1>Add New Event</h1>
        <p className="add-event-subtitle">Fill in the details to publish your event on Ticketmaster</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="add-event-form">
          <div className="input-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Rock Night Live 2025"
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Date & Time *</label>
              <input
                type="text"
                name="date"
                value={form.date}
                onChange={handleChange}
                placeholder="e.g. Sat, Dec 14 • 8:00 PM"
                required
              />
            </div>
            <div className="input-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Venue *</label>
            <input
              type="text"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="e.g. Madison Square Garden, New York, NY"
              required
            />
          </div>

          <div className="input-group">
            <label>Event Image URL <span className="optional">(optional)</span></label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="input-hint">Leave blank to use the default event image.</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : '🚀 Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddEvent;

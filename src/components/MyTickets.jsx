import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferTicket, setTransferTicket] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [transferStatus, setTransferStatus] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('tm_token');
    if (!token) { navigate('/login'); return; }

    fetch('/api/my-tickets', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setTickets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [navigate]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setIsTransferring(true);
    setTransferStatus('');
    try {
      const res = await fetch('/api/tickets/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tm_token')}`
        },
        body: JSON.stringify({ ticketId: transferTicket.id, recipientEmail, recipientName })
      });
      const data = await res.json();
      if (data.success) {
        setTransferStatus('success');
        setTickets(prev => prev.filter(t => t.id !== transferTicket.id));
        setTimeout(() => { setTransferTicket(null); setTransferStatus(''); }, 2500);
      } else {
        setTransferStatus(`error:${data.message}`);
      }
    } catch {
      setTransferStatus('error:Something went wrong. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <motion.div
      className="my-tickets-page container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="page-header">
        <h1>My Tickets</h1>
        <p>View and manage all your tickets</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading your tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h2>No tickets yet</h2>
          <p>Browse events and purchase your first ticket!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Browse Events</button>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <motion.div
              className="ticket-card"
              key={ticket.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ticket-perforated-left"></div>
              <div className="ticket-main">
                <div className="ticket-event">{ticket.eventTitle}</div>
                <div className="ticket-meta">
                  <span>📅 {ticket.eventDate}</span>
                  <span>📍 {ticket.eventVenue}</span>
                </div>
                <div className="ticket-row">
                  <div>
                    <div className="ticket-label">Tier</div>
                    <div className="ticket-value">{ticket.tier}</div>
                  </div>
                  <div>
                    <div className="ticket-label">Price</div>
                    <div className="ticket-value">{ticket.price}</div>
                  </div>
                  <div>
                    <div className="ticket-label">Ticket ID</div>
                    <div className="ticket-value ticket-id">{ticket.id}</div>
                  </div>
                </div>
              </div>
              <div className="ticket-perforated-right">
                <button className="btn-transfer" onClick={() => { setTransferTicket(ticket); setRecipientEmail(''); setRecipientName(''); setTransferStatus(''); }}>
                  Transfer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Transfer Modal */}
      <AnimatePresence>
        {transferTicket && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTransferTicket(null)}
          >
            <motion.div
              className="modal-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {transferStatus === 'success' ? (
                <div className="transfer-success">
                  <div className="success-icon">✅</div>
                  <h3>Transfer Successful!</h3>
                  <p>A confirmation email has been sent to both you and the recipient.</p>
                </div>
              ) : (
                <>
                  <h2>Transfer Ticket</h2>
                  <p className="modal-subtitle">
                    Transferring: <strong>{transferTicket.eventTitle}</strong> — {transferTicket.tier}
                  </p>
                  {transferStatus.startsWith('error:') && (
                    <div className="transfer-error">{transferStatus.replace('error:', '')}</div>
                  )}
                  <form onSubmit={handleTransfer}>
                    <div className="input-group">
                      <label>Recipient Name</label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={e => setRecipientName(e.target.value)}
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="input-group">
                      <label>Recipient Email *</label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={e => setRecipientEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        required
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn-cancel" onClick={() => setTransferTicket(null)}>Cancel</button>
                      <button type="submit" className="btn-primary" disabled={isTransferring}>
                        {isTransferring ? 'Transferring...' : 'Confirm Transfer'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MyTickets;

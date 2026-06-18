const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

app.use(cors());
app.use(express.json());

// ─── Email Transporter ───────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [EMAIL LOG - no credentials set]\nTo: ${to}\nSubject: ${subject}\nBody: ${html}\n`);
    return;
  }
  try {
    await transporter.sendMail({ from: `"Ticketmaster" <${process.env.EMAIL_USER}>`, to, subject, html });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

// ─── In-Memory Stores ────────────────────────────────────────────────────────
const users = [
  { id: 1, name: 'John Doe', email: 'user@example.com', password: 'password123' }
];

let events = [
  {
    id: 1,
    title: 'The Eras Tour - Live in Concert',
    date: 'Fri, Nov 15 • 7:00 PM',
    venue: 'MetLife Stadium, East Rutherford, NJ',
    image: '/hero-bg.png',
    category: 'Concerts',
    createdBy: 1
  },
  {
    id: 2,
    title: 'NBA Finals: Game 7',
    date: 'Sun, Jun 20 • 8:30 PM',
    venue: 'Madison Square Garden, New York, NY',
    image: '/event-sports.png',
    category: 'Sports',
    createdBy: 1
  },
  {
    id: 3,
    title: 'Hamilton - The Musical',
    date: 'Wed, Aug 5 • 2:00 PM',
    venue: 'Richard Rodgers Theatre, New York, NY',
    image: '/event-theater.png',
    category: 'Arts & Theater',
    createdBy: 1
  },
  {
    id: 4,
    title: 'BTS: Yet To Come - Live Concert',
    date: 'Sat, Dec 14 • 8:00 PM',
    venue: 'SoFi Stadium, Los Angeles, CA',
    image: '/hero-bg.png',
    category: 'Concerts',
    createdBy: 1
  }
];

let tickets = []; // { id, eventId, eventTitle, ownerEmail, ownerName, tier, price, purchasedAt }

// ─── JWT Middleware ───────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(403).json({ message: 'No token provided' });
  const token = auth.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.user = decoded.user;
    next();
  });
};

// ─── Auth Endpoints ───────────────────────────────────────────────────────────
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please fill all fields' });
  if (users.find(u => u.email === email))
    return res.status(400).json({ success: false, message: 'Email already in use' });

  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);
  const token = jwt.sign({ user: { id: newUser.id, name, email } }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token, user: { id: newUser.id, name, email } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const safeUser = { id: user.id, name: user.name, email: user.email };
  const token = jwt.sign({ user: safeUser }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token, user: safeUser });
});

// ─── Events Endpoints ─────────────────────────────────────────────────────────
app.get('/api/events', (req, res) => res.json(events));

app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  event ? res.json(event) : res.status(404).json({ message: 'Event not found' });
});

app.post('/api/events', verifyToken, (req, res) => {
  const { title, date, venue, category, image } = req.body;
  if (!title || !date || !venue || !category)
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });

  const newEvent = {
    id: events.length + 1,
    title, date, venue, category,
    image: image || '/hero-bg.png',
    createdBy: req.user.id
  };
  events.push(newEvent);
  res.json({ success: true, event: newEvent });
});

// ─── Checkout & Tickets Endpoints ────────────────────────────────────────────
app.post('/api/checkout', verifyToken, (req, res) => {
  const { eventId, tier, isVip } = req.body;
  const event = events.find(e => e.id === parseInt(eventId));
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const ticketId = crypto.randomBytes(6).toString('hex').toUpperCase();
  const price = isVip ? '$450.00' : '$150.00';
  const tierName = isVip ? 'VIP Package' : 'General Admission';

  const newTicket = {
    id: ticketId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    eventVenue: event.venue,
    ownerEmail: req.user.email,
    ownerName: req.user.name,
    tier: tierName,
    price,
    purchasedAt: new Date().toISOString()
  };
  tickets.push(newTicket);

  // Send confirmation email
  sendEmail(
    req.user.email,
    `🎟️ Your ticket for ${event.title}`,
    `<h2>Booking Confirmed!</h2>
     <p>Hi ${req.user.name},</p>
     <p>Your ticket has been confirmed. Here are your details:</p>
     <table style="border-collapse:collapse;width:100%">
       <tr><td><strong>Event</strong></td><td>${event.title}</td></tr>
       <tr><td><strong>Date</strong></td><td>${event.date}</td></tr>
       <tr><td><strong>Venue</strong></td><td>${event.venue}</td></tr>
       <tr><td><strong>Tier</strong></td><td>${tierName}</td></tr>
       <tr><td><strong>Price</strong></td><td>${price}</td></tr>
       <tr><td><strong>Ticket ID</strong></td><td><strong>${ticketId}</strong></td></tr>
     </table>
     <p>Enjoy the show! 🎉</p>`
  );

  setTimeout(() => {
    res.json({ success: true, message: 'Order Confirmed', orderId: ticketId });
  }, 1500);
});

app.get('/api/my-tickets', verifyToken, (req, res) => {
  const myTickets = tickets.filter(t => t.ownerEmail === req.user.email);
  res.json(myTickets);
});

app.post('/api/tickets/transfer', verifyToken, (req, res) => {
  const { ticketId, recipientEmail, recipientName } = req.body;
  if (!ticketId || !recipientEmail)
    return res.status(400).json({ success: false, message: 'Ticket ID and recipient email are required' });

  const ticket = tickets.find(t => t.id === ticketId && t.ownerEmail === req.user.email);
  if (!ticket)
    return res.status(404).json({ success: false, message: 'Ticket not found or you do not own it' });

  if (recipientEmail === req.user.email)
    return res.status(400).json({ success: false, message: 'You cannot transfer a ticket to yourself' });

  const previousOwner = { name: ticket.ownerName, email: ticket.ownerEmail };
  ticket.ownerEmail = recipientEmail;
  ticket.ownerName = recipientName || recipientEmail;

  // Email to sender
  sendEmail(
    previousOwner.email,
    `✅ Ticket Transfer Confirmed — ${ticket.eventTitle}`,
    `<h2>Ticket Transfer Successful</h2>
     <p>Hi ${previousOwner.name},</p>
     <p>Your ticket (<strong>${ticketId}</strong>) for <strong>${ticket.eventTitle}</strong> has been successfully transferred to <strong>${recipientEmail}</strong>.</p>
     <p>If you did not initiate this transfer, please contact support immediately.</p>`
  );

  // Email to recipient
  sendEmail(
    recipientEmail,
    `🎟️ You've received a ticket for ${ticket.eventTitle}!`,
    `<h2>Ticket Received!</h2>
     <p>Hi ${ticket.ownerName},</p>
     <p><strong>${previousOwner.name}</strong> (${previousOwner.email}) has transferred a ticket to you!</p>
     <table style="border-collapse:collapse;width:100%">
       <tr><td><strong>Event</strong></td><td>${ticket.eventTitle}</td></tr>
       <tr><td><strong>Date</strong></td><td>${ticket.eventDate}</td></tr>
       <tr><td><strong>Venue</strong></td><td>${ticket.eventVenue}</td></tr>
       <tr><td><strong>Tier</strong></td><td>${ticket.tier}</td></tr>
       <tr><td><strong>Ticket ID</strong></td><td><strong>${ticketId}</strong></td></tr>
     </table>
     <p>Enjoy the show! 🎉</p>`
  );

  res.json({ success: true, message: `Ticket successfully transferred to ${recipientEmail}` });
});

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

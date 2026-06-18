const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

app.use(cors());
app.use(express.json());

// ─── SendGrid Email Setup ────────────────────────────────────────────────────
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📧 SendGrid API key configured');
} else {
  console.warn('📧 SENDGRID_API_KEY not set — emails will be logged only');
}

const sendEmail = async (to, subject, html) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`\n📧 [EMAIL LOG - no API key set]\nTo: ${to}\nSubject: ${subject}\nBody: ${html}\n`);
    return;
  }
  try {
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@ticketmaster.com';
    await sgMail.send({
      to,
      from: {
        email: fromEmail,
        name: 'Ticketmaster'
      },
      subject,
      html,
    });
    console.log(`Email successfully sent to ${to} from ${fromEmail}`);
  } catch (err) {
    console.error('Email send error:', err.message);
    if (err.response && err.response.body && err.response.body.errors) {
      console.error('SendGrid Details:', JSON.stringify(err.response.body.errors, null, 2));
    }
  }
};

// ─── Database Persistence ───────────────────────────────────────────────────
const fs = require('fs');
const DB_FILE = path.join(__dirname, 'db.json');

const defaultDb = {
  users: [
    { id: 1, name: 'Admin', email: 'evansonkipngeno8009@gmail.com', password: 'Evanson9#', role: 'admin', approved: true },
    { id: 2, name: 'John Doe', email: 'user@example.com', password: 'password123', role: 'user', approved: true }
  ],
  events: [
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
  ],
  tickets: []
};

let db = { ...defaultDb };

const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database file:', err.message);
  }
};

const loadDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
      db.users = db.users || defaultDb.users;
      db.events = db.events || defaultDb.events;
      db.tickets = db.tickets || defaultDb.tickets;
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Error loading database file:', err.message);
  }
};

loadDb();

const users = db.users;
const events = db.events;
const tickets = db.tickets;

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

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

// ─── Auth Endpoints ───────────────────────────────────────────────────────────
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please fill all fields' });
  if (users.find(u => u.email === email))
    return res.status(400).json({ success: false, message: 'Email already in use' });

  const newUser = { id: users.length + 1, name, email, password, role: 'user', approved: false };
  users.push(newUser);
  saveDb();
  res.json({ success: true, pendingApproval: true, message: 'Registration successful! Your account is pending admin approval.' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (!user.approved) return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved };
  const token = jwt.sign({ user: safeUser }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token, user: safeUser });
});

// ─── Admin Endpoints ─────────────────────────────────────────────────────────
app.get('/api/admin/users', verifyToken, verifyAdmin, (req, res) => {
  const safeUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, approved: u.approved }));
  res.json(safeUsers);
});

app.post('/api/admin/users/toggle-access', verifyToken, verifyAdmin, (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot modify admin access' });
  user.approved = !user.approved;
  saveDb();
  res.json({ success: true, message: `Access ${user.approved ? 'allowed' : 'revoked'} for ${user.email}`, user: { id: user.id, name: user.name, email: user.email, role: user.role, approved: user.approved } });
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
  saveDb();
  res.json({ success: true, event: newEvent });
});

// ─── Checkout & Tickets Endpoints ────────────────────────────────────────────
app.post('/api/checkout', verifyToken, async (req, res) => {
  const { eventId, tier, isVip } = req.body;
  const event = events.find(e => e.id === parseInt(eventId));
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const ticketId = crypto.randomBytes(6).toString('hex').toUpperCase();
  const price = isVip ? '$450.00' : '$150.00';
  const tierName = isVip ? 'VIP Package' : 'General Admission';

  // Generate section, row, and seat
  const sectionNames = isVip ? ['VIP-A', 'VIP-B', 'VIP-C'] : ['GA-1', 'GA-2', 'GA-3', 'GA-4'];
  const section = sectionNames[Math.floor(Math.random() * sectionNames.length)];
  const row = String.fromCharCode(65 + Math.floor(Math.random() * 20)); // A-T
  const seat = Math.floor(Math.random() * 30) + 1;

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
    section,
    row,
    seat,
    purchasedAt: new Date().toISOString()
  };
  tickets.push(newTicket);
  saveDb();

  // Send confirmation email
  await sendEmail(
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
       <tr><td><strong>Section</strong></td><td>${section}</td></tr>
       <tr><td><strong>Row</strong></td><td>${row}</td></tr>
       <tr><td><strong>Seat</strong></td><td>${seat}</td></tr>
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

app.post('/api/tickets/transfer', verifyToken, async (req, res) => {
  const { ticketId, recipientEmail, recipientFirstName, recipientLastName, note } = req.body;
  if (!ticketId || !recipientEmail)
    return res.status(400).json({ success: false, message: 'Ticket ID and recipient email are required' });

  const ticket = tickets.find(t => t.id === ticketId && t.ownerEmail === req.user.email);
  if (!ticket)
    return res.status(404).json({ success: false, message: 'Ticket not found or you do not own it' });

  if (recipientEmail === req.user.email)
    return res.status(400).json({ success: false, message: 'You cannot transfer a ticket to yourself' });

  const recipientFullName = (recipientFirstName && recipientLastName)
    ? `${recipientFirstName} ${recipientLastName}`
    : recipientEmail;

  const previousOwner = { name: ticket.ownerName, email: ticket.ownerEmail };
  ticket.ownerEmail = recipientEmail;
  ticket.ownerName = recipientFullName;
  saveDb();

  // Email to sender
  await sendEmail(
    previousOwner.email,
    `✅ Ticket Transfer Confirmed — ${ticket.eventTitle}`,
    `<h2>Ticket Transfer Successful</h2>
     <p>Hi ${previousOwner.name},</p>
     <p>Your ticket (<strong>${ticketId}</strong>) for <strong>${ticket.eventTitle}</strong> has been successfully transferred to <strong>${recipientFullName}</strong> (${recipientEmail}).</p>
     ${note ? `<p><strong>Your note:</strong> ${note}</p>` : ''}
     <p>If you did not initiate this transfer, please contact support immediately.</p>`
  );

  // Email to recipient
  await sendEmail(
    recipientEmail,
    `🎟️ You've received a ticket for ${ticket.eventTitle}!`,
    `<h2>Ticket Received!</h2>
     <p>Hi ${recipientFullName},</p>
     <p><strong>${previousOwner.name}</strong> (${previousOwner.email}) has transferred a ticket to you!</p>
     ${note ? `<p><strong>Message from ${previousOwner.name}:</strong> ${note}</p>` : ''}
     <table style="border-collapse:collapse;width:100%">
       <tr><td><strong>Event</strong></td><td>${ticket.eventTitle}</td></tr>
       <tr><td><strong>Date</strong></td><td>${ticket.eventDate}</td></tr>
       <tr><td><strong>Venue</strong></td><td>${ticket.eventVenue}</td></tr>
       <tr><td><strong>Tier</strong></td><td>${ticket.tier}</td></tr>
       <tr><td><strong>Section</strong></td><td>${ticket.section || 'N/A'}</td></tr>
       <tr><td><strong>Row</strong></td><td>${ticket.row || 'N/A'}</td></tr>
       <tr><td><strong>Seat</strong></td><td>${ticket.seat || 'N/A'}</td></tr>
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

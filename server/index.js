const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'super_secret_key_123'; // In a real app, use environment variables

app.use(cors());
app.use(express.json());

// Mock Database
const events = [
  {
    id: 1,
    title: 'The Eras Tour - Live in Concert',
    date: 'Fri, Nov 15 • 7:00 PM',
    venue: 'MetLife Stadium, East Rutherford, NJ',
    image: '/hero-bg.png',
    category: 'Concerts'
  },
  {
    id: 2,
    title: 'NBA Finals: Game 7',
    date: 'Sun, Jun 20 • 8:30 PM',
    venue: 'Madison Square Garden, New York, NY',
    image: '/event-sports.png',
    category: 'Sports'
  },
  {
    id: 3,
    title: 'Hamilton - The Musical',
    date: 'Wed, Aug 5 • 2:00 PM',
    venue: 'Richard Rodgers Theatre, New York, NY',
    image: '/event-theater.png',
    category: 'Arts & Theater'
  }
];

// Auth Endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'user@example.com' && password === 'password123') {
    const user = { id: 1, name: 'John Doe', email: 'user@example.com' };
    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Middleware to verify JWT token (optional usage for protected routes)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });
  
  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.user = decoded.user;
    next();
  });
};

// Routes
app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const event = events.find((e) => e.id === parseInt(req.params.id));
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ message: 'Event not found' });
  }
});

// Protected Checkout Route
app.post('/api/checkout', verifyToken, (req, res) => {
  const { eventId, paymentDetails } = req.body;
  // Mock processing delay
  setTimeout(() => {
    res.json({ success: true, message: 'Order Confirmed', orderId: Math.floor(Math.random() * 1000000) });
  }, 1500);
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../dist')));

// ANY route that doesn't match an API route will be handled by React Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

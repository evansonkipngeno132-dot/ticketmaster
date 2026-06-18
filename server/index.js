const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

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

app.post('/api/checkout', (req, res) => {
  const { eventId, paymentDetails } = req.body;
  // Mock processing delay
  setTimeout(() => {
    res.json({ success: true, message: 'Order Confirmed', orderId: Math.floor(Math.random() * 1000000) });
  }, 1500);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import EventDetails from './components/EventDetails';
import Checkout from './components/Checkout';
import Login from './components/Login';
import MyTickets from './components/MyTickets';
import AddEvent from './components/AddEvent';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import './App.css';

const AnimatedRoutes = ({ authUser, setAuthUser }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetails authUser={authUser} />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/add-event" element={<AddEvent />} />
        <Route path="/admin" element={authUser && authUser.role === 'admin' ? <AdminPanel /> : <Login setAuthUser={setAuthUser} />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [authUser, setAuthUser] = useState(() => {
    const token = localStorage.getItem('tm_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('tm_token');
        return null;
      }
      return payload.user || null;
    } catch {
      return null;
    }
  });

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar authUser={authUser} setAuthUser={setAuthUser} />
        <main>
          <AnimatedRoutes authUser={authUser} setAuthUser={setAuthUser} />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

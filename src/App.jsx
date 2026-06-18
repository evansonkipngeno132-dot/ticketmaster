import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import EventDetails from './components/EventDetails';
import Checkout from './components/Checkout';
import Login from './components/Login';
import Footer from './components/Footer';
import './App.css';

const AnimatedRoutes = ({ setAuthUser }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [authUser, setAuthUser] = useState(null);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar authUser={authUser} setAuthUser={setAuthUser} />
        <main>
          <AnimatedRoutes setAuthUser={setAuthUser} />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

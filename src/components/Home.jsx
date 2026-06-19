import React, { useState } from 'react';
import Hero from './Hero';
import EventCards from './EventCards';
import { motion } from 'framer-motion';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        locationQuery={locationQuery} 
        setLocationQuery={setLocationQuery} 
        dateQuery={dateQuery} 
        setDateQuery={setDateQuery} 
      />
      <EventCards 
        searchQuery={searchQuery}
        locationQuery={locationQuery}
        dateQuery={dateQuery}
      />
    </motion.div>
  );
};

export default Home;

import React from 'react';
import Hero from './Hero';
import EventCards from './EventCards';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero />
      <EventCards />
    </motion.div>
  );
};

export default Home;

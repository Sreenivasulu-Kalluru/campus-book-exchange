// src/components/common/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // For animations!
import Navbar from '../Navbar';
import Footer from '../Footer';
import ListBookModal from './ListBookModal';

const Layout = () => {
  const location = useLocation();

  return (
    // This div ensures the footer is pushed to the bottom
    <div className="flex flex-col min-h-screen bg-light-bg text-dark-text">
      <Navbar />

      {/* This is the animated page content area */}
      <motion.main
        // We use the pathname as a 'key'.
        // This tells Framer Motion to re-animate when the page changes.
        key={location.pathname}
        className="container flex px-4 py-8 mx-auto grow"
        // Animation properties
        initial={{ opacity: 0, y: 15 }} // Start state
        animate={{ opacity: 1, y: 0 }} // End state
        exit={{ opacity: 0, y: -15 }} // Exit state (optional)
        transition={{ duration: 0.3 }} // Speed
      >
        <Outlet />
        {/* ^ This is the "slot" where React Router will place our pages */}
      </motion.main>
      <Footer />
      <ListBookModal />
    </div>
  );
};

export default Layout;

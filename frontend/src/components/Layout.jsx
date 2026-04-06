import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header />
      <Box 
        component={motion.main} 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        key={location.pathname}
        sx={{ flexGrow: 1 }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;

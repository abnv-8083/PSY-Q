import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const Preloader = () => {
  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ca0056',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.25, 1] }}
        transition={{
          duration: 1,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ marginBottom: '1.5rem' }}
      >
        <Heart size={72} fill="white" color="white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, letterSpacing: '4px' }}>PSY-Q</h1>
        <p style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '1.5px', fontStyle: 'italic', margin: 0, opacity: 0.9 }}>
          No Mind Left Behind
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;

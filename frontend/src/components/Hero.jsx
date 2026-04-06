import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const images = [
    '/images/carousel2.webp',
    '/images/crousel1.webp',
    '/images/hero-2.webp',
  ];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 0,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]); // Restart timer on index change

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + images.length) % images.length);
  };

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', sm: '600px', md: '700px', lg: '85vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: '#f8f4f0', // Fallback background
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: {
            xs: 'linear-gradient(to bottom, rgba(240, 230, 220, 0.8) 0%, rgba(240, 230, 220, 0.75) 30%, transparent 80%)',
            sm: 'linear-gradient(to bottom, rgba(240, 230, 220, 0.85) 0%, rgba(240, 230, 220, 0.7) 40%, transparent 100%)',
            md: 'linear-gradient(to right, rgba(240, 230, 220, 0.95) 0%, rgba(240, 230, 220, 0.85) 20%, rgba(240, 230, 220, 0.3) 50%, transparent 60%)'
          },
          pointerEvents: 'none',
        }
      }}
    >
      {/* Background Carousel */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", stiffness: 300, damping: 30, duration: 0.8 },
            opacity: { duration: 0.8 }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${images[currentIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }}
        />
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'space-between',
        px: { xs: 1, md: 3 },
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <IconButton
          onClick={() => paginate(-1)}
          sx={{
            pointerEvents: 'auto',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: '#ca0056',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.4)' },
            backdropFilter: 'blur(4px)',
            width: { xs: 40, md: 50 },
            height: { xs: 40, md: 50 }
          }}
        >
          <ChevronLeft size={30} />
        </IconButton>
        <IconButton
          onClick={() => paginate(1)}
          sx={{
            pointerEvents: 'auto',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: '#ca0056',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.4)' },
            backdropFilter: 'blur(4px)',
            width: { xs: 40, md: 50 },
            height: { xs: 40, md: 50 }
          }}
        >
          <ChevronRight size={30} />
        </IconButton>
      </Box>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Box sx={{
          maxWidth: { xs: '100%', sm: '100%', md: '600px', lg: '650px' },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 6, sm: 8, md: 10, lg: 12 },
          px: { xs: 2, sm: 0 }
        }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.75rem', md: '3.25rem', lg: '3.75rem' },
              fontWeight: 700,
              color: '#ca0056',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              wordWrap: 'break-word'
            }}
          >
            No Mind Left Behind
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '14px', sm: '14px', md: '14px' },
              color: '#000',
              lineHeight: 1.6,
              maxWidth: '540px'
            }}
          >
            Life can be overwhelming sometimes and it is okay to ask for help. We are here to support your mental and emotional well-being
          </Typography>
          <Box sx={{ pt: { xs: 1, md: 2 } }}>
            <Button
              component={RouterLink}
              to="/about"
              variant="contained"
              sx={{
                bgcolor: '#ca0056',
                color: '#ffffff',
                fontSize: { xs: '14px', sm: '14px' },
                fontWeight: 600,
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: '50px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(202, 0, 86, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#b8003f',
                  boxShadow: '0 6px 20px rgba(202, 0, 86, 0.4)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;

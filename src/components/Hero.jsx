import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const Hero = () => {

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', sm: '600px', md: '700px', lg: '85vh' },
        backgroundImage: `url('/images/hero-2.webp')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: { xs: 'center center', sm: 'center right', md: 'center right' },
        backgroundSize: 'cover',
        backgroundAttachment: { xs: 'scroll', md: 'scroll' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        willChange: 'background-image',
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

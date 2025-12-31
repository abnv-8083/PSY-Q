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
        minHeight: { xs: '600px', md: '700px', lg: '85vh' },
        backgroundImage: `url('/images/hero-2.jpg')`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center right',
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: {
            xs: 'linear-gradient(to bottom, rgba(240, 230, 220, 0.75) 0%, rgba(240, 230, 220, 0.75) 30%, transparent 100%)',
            md: 'linear-gradient(to right, rgba(240, 230, 220, 0.95) 0%, rgba(240, 230, 220, 0.85) 20%, rgba(240, 230, 220, 0.3) 50%, transparent 60%)'
          },
          pointerEvents: 'none',
        }
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          maxWidth: { xs: '100%', md: '600px', lg: '650px' },
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          py: { xs: 8, md: 10 }
        }}>
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: 36, sm: 44, md: 52, lg: 60 }, 
              fontWeight: 700, 
              color: '#ca0056',
              lineHeight: 1.2,
              letterSpacing: '-0.02em'
            }}
          >
            No Mind Left Behind
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontSize: { xs: 16, md: 18 },
              color: '#000',
              lineHeight: 1.6,
              maxWidth: '540px'
            }}
          >
            Life can be overwhelming sometimes and it is okay to ask for help. We are here to support your mental and emotional well-being
          </Typography>
          <Box sx={{ pt: 2 }}>
            <Button 
              component={RouterLink} 
              to="/about" 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: '#ca0056',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(202, 0, 86, 0.3)',
                '&:hover': { 
                  bgcolor: '#ca0056',
                  boxShadow: '0 6px 20px rgba(251, 146, 60, 0.3)',
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

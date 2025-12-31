import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const Hero = () => {

  return (
    <Box component="section" sx={{ py: { xs: 6, sm: 8, lg: 10 }, bgcolor: '#ffffff' }}>
      <Container>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', minHeight: '70vh' }}>
          {/* Left Content */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3, 
            pr: { lg: 4 },
            mb: { xs: 4, lg: 0 }
          }}>
            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: 32, sm: 40, md: 48, lg: 56 }, fontWeight: 800, color: 'black' }}>
              No Mind Left Behind, PSYQ Leads the Way
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 560, color: 'rgba(0, 0, 0, 0.85)' }}>
              A dynamic e-learning platform designed to support learners with focused, flexible, and expertly guided sessions. We tailor our content to your goals and help you achieve success.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, pt: 1 }}>
              <Button component={RouterLink} to="/about" variant="outlined" size="large" sx={{ borderColor: 'black', color: 'black', '&:hover': { borderColor: 'black', bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
                Learn More
              </Button>
            </Box>
          </Box>
          
          {/* Right Image */}
          <Box sx={{ 
            flex: 1,
            height: { xs: 400, sm: 500, lg: '60vh' },
            width: '100%',
            borderRadius: 2, 
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box
              component="img"
              src="/images/hero-1.jpg"
              alt="Psy-Q Education Platform"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;

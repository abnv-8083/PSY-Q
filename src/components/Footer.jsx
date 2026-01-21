import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, IconButton, Grid } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  const footerLinks = {
    services: [
      { label: 'Counselling & Psychotherapy'},
      { label: 'Psychological Assessments'},
      { label: 'Learning Support'},
      { label: 'Referral & Support'},
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Story', href: '/about' },
      { label: 'Contact Us', href: '/contact' },
    ],
    support: [
      { label: 'FAQs', href: '/policies#faqs' },
      { label: 'Privacy Policy', href: '/policies#privacy' },
      { label: 'Terms & Conditions', href: '/policies#terms' },
      { label: 'Refund Policy', href: '/policies#refunds' },
      { label: 'Information & Security Policy', href: '/policies#information-security' },
    ],
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#00388C',
        color: 'white',
        py: 6
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Services Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h8" sx={{ fontWeight: 600, mb: 2 }}>
              Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.services.map((link, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={link.href}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Company Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h8" sx={{ fontWeight: 600, mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.company.map((link, index) => (
                <Link
                  key={index}
                  component={link.href.startsWith('http') || link.href.startsWith('tel:') ? 'a' : RouterLink}
                  to={link.href.startsWith('http') || link.href.startsWith('tel:') ? undefined : link.href}
                  href={link.href.startsWith('http') || link.href.startsWith('tel:') ? link.href : undefined}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Support Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h8" sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.support.map((link, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  to={link.href}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    '&:hover': {
                      color: 'white',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Stay Connected Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h8" sx={{ fontWeight: 600, mb: 2 }}>
              Stay connected
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                href="https://www.linkedin.com/company/psy-q-learning/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                href="https://www.instagram.com/psyq_learning?igsh=N2NpdjViOGZhZ2Rj"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                href="https://youtube.com/@psyqlearning?si=4XGXIRXu2tyZnWSa"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;

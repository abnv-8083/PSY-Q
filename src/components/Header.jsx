import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [headerBgColor, setHeaderBgColor] = useState('rgba(255, 255, 255, 0.1)');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section, main, [component="section"]');
      const header = document.querySelector('header');
      
      if (!header) return;
      
      const headerBottom = header.getBoundingClientRect().bottom;
      
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        
        // Check if section is overlapping with header
        if (rect.top <= headerBottom && rect.bottom >= 0) {
          const bgColor = window.getComputedStyle(section).backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            // Add transparency to the color for glass effect
            const colorWithAlpha = bgColor.replace('rgb', 'rgba').replace(')', ', 0.1)');
            setHeaderBgColor(colorWithAlpha);
            return;
          }
        }
      }
      
      setHeaderBgColor('rgba(255, 255, 255, 0.1)');
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Determine if text should be light based on background
  const isLightText = headerBgColor.includes('#E91E63') || headerBgColor.includes('233, 30, 99');

  return (
    <>
    <Box 
      component="header"
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        pt: { xs: 2, sm: 2.5, md: 3 },
        px: { xs: 1, sm: 2, md: 2 },
        pointerEvents: 'none'
      }}
    >
      <Container maxWidth="lg" sx={{ pointerEvents: 'auto', px: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            bgcolor: headerBgColor,
            // backdropFilter: 'blur(20px)',
            borderRadius: { xs: '16px', sm: '20px' },
            px: { xs: 1.5, sm: 3, md: 4 },
            py: { xs: 0.25, sm: 0.5 },
            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: { xs: 48, sm: 56, md: 64 }, gap: { xs: 1, sm: 2 } }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              '&:hover': {
                opacity: 0.8,
                transition: 'opacity 0.2s ease'
              }
            }}
          >
            <Box
              component="img"
              src="/logos/new-logo.jpeg"
              alt="Psy-Q Logo"
              sx={{
                height: { xs: '50px', sm: '60px', md: '70px' },
                width: 'auto',
                display: 'block'
              }}
            />
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 1.5, lg: 3 }, ml: 'auto', mr: 1 }}>          
            <Button component={RouterLink} to="/" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' } }}>Home</Button>
            <Button component={RouterLink} to="/therapists" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' } }}>Therapists</Button>
            {/* <Button component={RouterLink} to="/services" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' } }}>Services</Button> */}
            <Button component={RouterLink} to="/about" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' } }}>About Us</Button>
            <Button component={RouterLink} to="/contact" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' } }}>Contact Us</Button>
          </Box>

          {/* Desktop CTAs */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {/* <Button 
              component={RouterLink} 
              to="/signin" 
              variant="outlined"
              sx={isLightText ? { borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' } } : {}}
            >
              Sign In
            </Button> */}
            <Button 
              component={RouterLink} 
              to="/therapists" 
              variant="contained"
              sx={isLightText ? { bgcolor: 'white', color: '#E91E63', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } } : {}}
            >
              Book a Therapy
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
            <IconButton onClick={handleOpenMenu} sx={{ color: isLightText ? 'white' : 'inherit', p: { xs: 0.5, sm: 1 } }}>
              <MenuIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} keepMounted>
            <MenuItem component={RouterLink} to="/" onClick={handleCloseMenu}>Home</MenuItem>
            <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu}>Therapists</MenuItem>
            {/* <MenuItem component={RouterLink} to="/services" onClick={handleCloseMenu}>Services</MenuItem> */}
            <MenuItem component={RouterLink} to="/about" onClick={handleCloseMenu}>About Us</MenuItem>
            <MenuItem component={RouterLink} to="/contact" onClick={handleCloseMenu}>Contact Us</MenuItem>
            <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu}>Book a Therapy</MenuItem>
            {/* {/* <MenuItem component={RouterLink} to="/signin" onClick={handleCloseMenu}>Sign In</MenuItem> */}
          </Menu>
        </Box>
        </Box>
      </Container>
    </Box>

    {/* Spacer to offset the fixed header so page content isn't hidden underneath it */}
    <Box sx={{ height: { xs: '80px', sm: '92px', md: '104px' }, width: '100%', display: 'block' }} aria-hidden="true" />
    </>
  );
};

export default Header;

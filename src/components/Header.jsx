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
        pt: 3,
        px: 2,
        pointerEvents: 'none'
      }}
    >
      <Container maxWidth="lg" sx={{ pointerEvents: 'auto' }}>
        <Box
          sx={{
            bgcolor: headerBgColor,
            // backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            px: { xs: 2, sm: 4 },
            py: 0.5,
            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: { xs: 50, sm: 55 } }}>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'block',
              mr: 2,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
                transition: 'opacity 0.2s ease'
              }
            }}
          >
            <Box
              component="img"
              src="/logos/psyg-logo-footer.png"
              alt="Psy-Q Logo"
              sx={{
                height: { xs: 60, sm: 80 },
                width: 'auto',
                display: 'block'
              }}
            />
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, ml: 'auto', mr: 2 }}>
            <Button component={RouterLink} to="/about" sx={{ color: isLightText ? 'white' : 'inherit' }}>About Us</Button>
            {/* <Button component={RouterLink} to="/services" sx={{ color: isLightText ? 'white' : 'inherit' }}>Services</Button> */}
            <Button component={RouterLink} to="/therapists" sx={{ color: isLightText ? 'white' : 'inherit' }}>Therapists</Button>
            <Button component={RouterLink} to="/contact" sx={{ color: isLightText ? 'white' : 'inherit' }}>Contact Us</Button>
          </Box>

          {/* Desktop CTAs */}
          {/* <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button 
              component={RouterLink} 
              to="/signin" 
              variant="outlined"
              sx={isLightText ? { borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' } } : {}}
            >
              Sign In
            </Button>
            <Button 
              component={RouterLink} 
              to="/signup" 
              variant="contained"
              sx={isLightText ? { bgcolor: 'white', color: '#E91E63', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } } : {}}
            >
              Sign Up
            </Button>
          </Box> */}

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
            <IconButton onClick={handleOpenMenu} sx={{ color: isLightText ? 'white' : 'inherit' }}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} keepMounted>
            <MenuItem component={RouterLink} to="/about" onClick={handleCloseMenu}>About Us</MenuItem>
            {/* <MenuItem component={RouterLink} to="/services" onClick={handleCloseMenu}>Services</MenuItem> */}
            <MenuItem component={RouterLink} to="/contact" onClick={handleCloseMenu}>Contact Us</MenuItem>
            {/* <MenuItem component={RouterLink} to="/signin" onClick={handleCloseMenu}>Sign In</MenuItem>
            <MenuItem component={RouterLink} to="/signup" onClick={handleCloseMenu}>Sign Up</MenuItem> */}
          </Menu>
        </Box>
        </Box>
      </Container>
    </Box>

    {/* Spacer to offset the fixed header so page content isn't hidden underneath it */}
    <Box sx={{ height: { xs: '80px', sm: '96px' }, width: '100%', display: 'block' }} aria-hidden="true" />
    </>
  );
};

export default Header;

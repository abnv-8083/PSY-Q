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
  const [headerBgColor, setHeaderBgColor] = useState('#ffffff');

  useEffect(() => {
    // Keep header background solid white
    setHeaderBgColor('#ffffff');
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
        bgcolor: '#ffffff', // Full-width solid white background
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: { xs: 64, sm: 76, md: 84 }, gap: { xs: 1, sm: 2 } }}>
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
                height: { xs: '40px', sm: '50px', md: '60px' },
                width: 'auto',
                display: 'block'
              }}
            />
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 1.5, lg: 3 }, ml: 'auto', mr: 1 }}>          
            <Button component={RouterLink} to="/" sx={{ color: 'inherit', fontSize: '14px' }}>Home</Button>
            <Button component={RouterLink} to="/therapists" sx={{ color: 'inherit', fontSize: '14px' }}>Therapists</Button>
            <Button component={RouterLink} to="/academic/mocktest" sx={{ color: 'inherit', fontSize: '14px' }}>Mock Test</Button>
            <Button component={RouterLink} to="/about" sx={{ color: 'inherit', fontSize: '14px' }}>About Us</Button>
            <Button component={RouterLink} to="/contact" sx={{ color: 'inherit', fontSize: '14px' }}>Contact Us</Button>
          </Box>

          {/* Desktop CTAs */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button 
              component={RouterLink} 
              to="/therapists" 
              variant="contained"
              sx={{ bgcolor: '#E91E63', color: 'white', '&:hover': { bgcolor: '#c2185b' } }}
            >
              Book a Therapy
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
            <IconButton onClick={handleOpenMenu} sx={{ color: 'inherit', p: 0.5 }}>
              <MenuIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} keepMounted>
            <MenuItem component={RouterLink} to="/" onClick={handleCloseMenu}>Home</MenuItem>
            <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu}>Therapists</MenuItem>
            <MenuItem component={RouterLink} to="/academic/mocktest" onClick={handleCloseMenu}>Mock Test</MenuItem>
            <MenuItem component={RouterLink} to="/about" onClick={handleCloseMenu}>About Us</MenuItem>
            <MenuItem component={RouterLink} to="/contact" onClick={handleCloseMenu}>Contact Us</MenuItem>
            <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu}>Book a Therapy</MenuItem>
          </Menu>
        </Box>
      </Container>
    </Box>

    {/* Spacer to offset the fixed header */}
    <Box sx={{ height: { xs: '64px', sm: '76px', md: '84px' }, width: '100%', display: 'block' }} aria-hidden="true" />

    </>
  );
};

export default Header;

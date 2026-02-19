import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { useSession } from '../contexts/SessionContext';
import { User, LogOut, LayoutDashboard, Settings, ChevronLeft } from 'lucide-react';
import { Avatar, Typography, Divider, alpha } from '@mui/material';

const Header = () => {
  const { user, logout, isAdmin } = useSession();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
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

  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/');
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
              {/* Mobile Back Button */}
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  color: isLightText ? 'white' : 'inherit',
                  mr: 0.5,
                  p: 0.5
                }}
              >
                <ChevronLeft size={24} />
              </IconButton>

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
                <Button component={RouterLink} to="/academic/mocktest" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' }, fontWeight: 700 }}>Mock Test</Button>
                <Button component={RouterLink} to="/about" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' } }}>About Us</Button>
                <Button component={RouterLink} to="/contact" sx={{ color: isLightText ? 'white' : 'inherit', fontSize: { md: '14px', lg: '14px' } }}>Contact Us</Button>
              </Box>

              {/* Desktop CTAs / User Menu */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
                {!user ? (
                  <>
                    <Button
                      component={RouterLink}
                      to="/student/signin"
                      variant="outlined"
                      sx={isLightText ? { borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' } } : { borderColor: '#E91E63', color: '#E91E63' }}
                    >
                      Sign In
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/therapists"
                      variant="contained"
                      sx={isLightText ? { bgcolor: 'white', color: '#E91E63', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } } : { bgcolor: '#E91E63' }}
                    >
                      Book a Therapy
                    </Button>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                      onClick={handleOpenUserMenu}
                      sx={{
                        p: 0,
                        border: '2px solid',
                        borderColor: isLightText ? 'white' : '#E91E63',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isLightText ? 'white' : '#E91E63',
                          color: isLightText ? '#E91E63' : 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>

                    <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={handleCloseUserMenu}
                      onClick={handleCloseUserMenu}
                      PaperProps={{
                        sx: {
                          mt: 1.5,
                          width: 220,
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>
                          {user.full_name || 'User'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.75rem', mt: 0.5 }}>
                          {user.email}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 0.5 }} />
                      {isAdmin && (
                        <MenuItem onClick={() => navigate('/admin/dashboard')}>
                          <LayoutDashboard size={18} style={{ marginRight: 12 }} />
                          Admin Panel
                        </MenuItem>
                      )}
                      <MenuItem onClick={() => navigate('/student/dashboard')}>
                        <User size={18} style={{ marginRight: 12 }} />
                        My Dashboard
                      </MenuItem>
                      <MenuItem onClick={() => navigate('/student/profile')}>
                        <Settings size={18} style={{ marginRight: 12 }} />
                        Account Settings
                      </MenuItem>
                      <Divider sx={{ my: 0.5 }} />
                      <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                        <LogOut size={18} style={{ marginRight: 12 }} />
                        Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                )}
              </Box>

              {/* Mobile Menu Button */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
                <IconButton onClick={handleOpenMenu} sx={{ color: isLightText ? 'white' : 'inherit', p: { xs: 0.5, sm: 1 } }}>
                  <MenuIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
                </IconButton>
              </Box>

              {/* Mobile Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                keepMounted
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    width: 240,
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <MenuItem component={RouterLink} to="/" onClick={handleCloseMenu}>Home</MenuItem>
                <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu}>Therapists</MenuItem>
                <MenuItem component={RouterLink} to="/academic/mocktest" onClick={handleCloseMenu} sx={{ fontWeight: 700, color: '#db2777' }}>Mock Test</MenuItem>
                <MenuItem component={RouterLink} to="/about" onClick={handleCloseMenu}>About Us</MenuItem>
                <MenuItem component={RouterLink} to="/contact" onClick={handleCloseMenu}>Contact Us</MenuItem>

                <Divider sx={{ my: 1 }} />

                {!user ? (
                  <>
                    <MenuItem component={RouterLink} to="/student/signin" onClick={handleCloseMenu}>Sign In</MenuItem>
                    <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu} sx={{ color: '#E91E63', fontWeight: 600 }}>Book a Therapy</MenuItem>
                  </>
                ) : (
                  <>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.full_name || 'User'}</Typography>
                    </Box>
                    {isAdmin && (
                      <MenuItem onClick={() => { handleCloseMenu(); navigate('/admin/dashboard'); }}>
                        <LayoutDashboard size={16} style={{ marginRight: 10 }} /> Admin Panel
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => { handleCloseMenu(); navigate('/student/dashboard'); }}>
                      <User size={16} style={{ marginRight: 10 }} /> My Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => { handleCloseMenu(); navigate('/student/profile'); }}>
                      <Settings size={16} style={{ marginRight: 10 }} /> Account
                    </MenuItem>
                    <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                      <LogOut size={16} style={{ marginRight: 10 }} /> Logout
                    </MenuItem>
                  </>
                )}
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

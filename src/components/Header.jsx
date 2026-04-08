import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import { User, LogOut, CreditCard, LayoutDashboard } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileEl, setProfileEl] = useState(null);
  const [headerBgColor, setHeaderBgColor] = useState('#ffffff');

  useEffect(() => {
    setHeaderBgColor('#ffffff');
  }, []);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenProfile = (event) => setProfileEl(event.currentTarget);
  const handleCloseProfile = () => setProfileEl(null);

  const handleLogout = async () => {
    await logout();
    handleCloseProfile();
    navigate('/');
  };

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
        bgcolor: '#ffffff',
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
              '&:hover': { opacity: 0.8, transition: 'opacity 0.2s ease' }
            }}
          >
            <Box
              component="img"
              src="/logos/new-logo.jpeg"
              alt="Psy-Q Logo"
              sx={{ height: { xs: '40px', sm: '50px', md: '60px' }, width: 'auto', display: 'block' }}
            />
          </Box>

          {/* Desktop Nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 1.5, lg: 3 }, ml: 'auto', mr: 2 }}>          
            <Button component={RouterLink} to="/" sx={{ color: 'inherit', fontSize: '14px', textTransform: 'none', fontWeight: 600 }}>Home</Button>
            <Button component={RouterLink} to="/therapists" sx={{ color: 'inherit', fontSize: '14px', textTransform: 'none', fontWeight: 600 }}>Therapists</Button>
            <Button component={RouterLink} to="/academic/mocktest" sx={{ color: 'inherit', fontSize: '14px', textTransform: 'none', fontWeight: 600 }}>Mock Test</Button>
            <Button component={RouterLink} to="/about" sx={{ color: 'inherit', fontSize: '14px', textTransform: 'none', fontWeight: 600 }}>About Us</Button>
            <Button component={RouterLink} to="/contact" sx={{ color: 'inherit', fontSize: '14px', textTransform: 'none', fontWeight: 600 }}>Contact Us</Button>
          </Box>

          {/* Desktop Auth/CTAs */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {user ? (
              <Box 
                onClick={handleOpenProfile}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  cursor: 'pointer',
                  p: 0.5,
                  pr: 1.5,
                  borderRadius: '30px',
                  border: '1px solid #e2e8f0',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#E91E63', fontSize: '14px', fontWeight: 700 }}>
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {user.full_name?.split(' ')[0] || 'Account'}
                </Typography>
              </Box>
            ) : (
              <Button 
                component={RouterLink} 
                to="/therapists" 
                variant="contained"
                sx={{ bgcolor: '#E91E63', color: 'white', '&:hover': { bgcolor: '#c2185b' }, textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3 }}
              >
                Book a Therapy
              </Button>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, itemsAlign: 'center', gap: 1 }}>
            {user && (
              <Avatar 
                onClick={handleOpenProfile}
                sx={{ width: 32, height: 32, bgcolor: '#E91E63', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              >
                {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </Avatar>
            )}
            <IconButton onClick={handleOpenMenu} sx={{ color: 'inherit', p: 0.5 }}>
              <MenuIcon sx={{ fontSize: '1.8rem' }} />
            </IconButton>
          </Box>

          {/* Main Mobile Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} keepMounted>
            <MenuItem component={RouterLink} to="/" onClick={handleCloseMenu}>Home</MenuItem>
            <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu}>Therapists</MenuItem>
            <MenuItem component={RouterLink} to="/academic/mocktest" onClick={handleCloseMenu}>Mock Test</MenuItem>
            <MenuItem component={RouterLink} to="/about" onClick={handleCloseMenu}>About Us</MenuItem>
            <MenuItem component={RouterLink} to="/contact" onClick={handleCloseMenu}>Contact Us</MenuItem>
            {!user && <MenuItem component={RouterLink} to="/therapists" onClick={handleCloseMenu}>Book a Therapy</MenuItem>}
          </Menu>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={profileEl}
            open={Boolean(profileEl)}
            onClose={handleCloseProfile}
            PaperProps={{
              sx: { width: 220, mt: 1.5, borderRadius: 3, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{user?.full_name || 'User'}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate('/student/profile'); handleCloseProfile(); }}>
              <User size={18} style={{ marginRight: 12 }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => { navigate('/academic/mocktest/dashboard'); handleCloseProfile(); }}>
              <LayoutDashboard size={18} style={{ marginRight: 12 }} /> Dashboard
            </MenuItem>
            <MenuItem onClick={() => { navigate('/student/payment'); handleCloseProfile(); }}>
              <CreditCard size={18} style={{ marginRight: 12 }} /> Payments
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogOut size={18} style={{ marginRight: 12 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Container>
    </Box>

    <Box sx={{ height: { xs: '64px', sm: '76px', md: '84px' }, width: '100%', display: 'block' }} aria-hidden="true" />

    </>
  );
};

export default Header;

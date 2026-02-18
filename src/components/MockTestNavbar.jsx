import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container,
    IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    User, LogOut, Settings, CreditCard as PaymentIcon,
    LogIn, UserPlus
} from 'lucide-react';
import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react';
import { Avatar, Menu, MenuItem, Divider, alpha } from '@mui/material';
import { useSession } from '../contexts/SessionContext';


const COLORS = {
    primary: '#1e293b', // Slate Dark for text/logo
    accent: '#ca0056',  // Deep Pink from home page
    text: '#4b5563'    // Gray 600 for nav items
};

const MockTestNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout: sessionLogout } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);

    const handleLogout = async () => {
        try {
            await sessionLogout();
            handleProfileMenuClose();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    const navItems = [
        { label: 'Home', path: '/academic/mocktest' },
        { label: 'Tests', path: '/academic/mocktest/tests' },
        { label: 'Features', path: '/academic/mocktest/features' },
        { label: 'Contact', path: '/academic/mocktest/contact' }
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const isActive = (path) => {
        if (path === '/academic/mocktest' && location.pathname === '/academic/mocktest') return true;
        if (path !== '/academic/mocktest' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: `1px solid ${COLORS.primary}20` }}>
            <Container maxWidth={false}>
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            color: COLORS.primary,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                        onClick={() => navigate('/academic/mocktest')}
                    >
                        <img src="/logos/psyg-logo-footer.png" alt="Logo" style={{ height: 40, marginRight: '1px' }} />
                        PSY-Q <Box component="span" sx={{ color: COLORS.accent }}>MOCK TEST</Box>
                    </Typography>

                    {/* Desktop Actions */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {navItems.map((item) => (
                                    <Button
                                        key={item.label}
                                        onClick={() => handleNavigate(item.path)}
                                        sx={{
                                            color: isActive(item.path) ? COLORS.accent : COLORS.text,
                                            fontWeight: isActive(item.path) ? 700 : 500,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            '&:hover': {
                                                bgcolor: `${COLORS.accent}10`,
                                                color: COLORS.accent
                                            }
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Box>

                            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 1 }} />

                            {user ? (
                                <>
                                    <Button
                                        onClick={handleProfileMenuOpen}
                                        sx={{
                                            textTransform: 'none',
                                            color: COLORS.primary,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            borderRadius: '50px',
                                            pl: 0.5,
                                            pr: 1.5,
                                            py: 0.5,
                                            '&:hover': { bgcolor: alpha(COLORS.accent, 0.05) }
                                        }}
                                    >
                                        <Avatar
                                            src={user.photoURL}
                                            sx={{ width: 32, height: 32, bgcolor: COLORS.accent, fontSize: '0.9rem' }}
                                        >
                                            {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {user.full_name?.split(' ')[0] || 'Member'}
                                        </Typography>

                                        <ChevronDown size={16} />
                                    </Button>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleProfileMenuClose}
                                        PaperProps={{
                                            sx: {
                                                mt: 1.5,
                                                minWidth: 200,
                                                borderRadius: 3,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                                border: '1px solid #eee'
                                            }
                                        }}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <Box sx={{ px: 2, py: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.full_name || 'User'}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                                        </Box>

                                        <Divider />
                                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/student/profile'); }} sx={{ py: 1.2, gap: 1.5 }}>
                                            <User size={18} /> Profile
                                        </MenuItem>
                                        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/student/payment'); }} sx={{ py: 1.2, gap: 1.5 }}>
                                            <PaymentIcon size={18} /> Payments
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={handleLogout} sx={{ py: 1.2, gap: 1.5, color: '#e11d48' }}>
                                            <LogOut size={18} /> Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button
                                        onClick={() => navigate('/student/signin')}
                                        sx={{
                                            color: COLORS.primary,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: alpha(COLORS.primary, 0.05) }
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/student/signup')}
                                        sx={{
                                            bgcolor: COLORS.accent,
                                            color: 'white',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            borderRadius: '50px',
                                            px: 3,
                                            boxShadow: `0 4px 14px ${alpha(COLORS.accent, 0.3)}`,
                                            '&:hover': {
                                                bgcolor: '#b8003f',
                                                boxShadow: `0 6px 20px ${alpha(COLORS.accent, 0.4)}`
                                            }
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton onClick={() => setMobileOpen(true)} sx={{ color: COLORS.primary }}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Mobile Drawer */}
                    <Drawer
                        anchor="right"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        PaperProps={{ sx: { width: 250 } }}
                    >
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton onClick={() => setMobileOpen(false)}>
                                <X />
                            </IconButton>
                        </Box>
                        <List>
                            {navItems.map((item) => (
                                <ListItem
                                    button
                                    key={item.label}
                                    onClick={() => handleNavigate(item.path)}
                                    sx={{
                                        bgcolor: isActive(item.path) ? `${COLORS.accent}10` : 'transparent',
                                        color: isActive(item.path) ? COLORS.accent : COLORS.text
                                    }}
                                >
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500 }}
                                    />
                                </ListItem>
                            ))}
                            <Divider sx={{ my: 1 }} />
                            {!user ? (
                                <>
                                    <ListItem button onClick={() => handleNavigate('/student/signin')}>
                                        <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 600 }} />
                                    </ListItem>
                                    <ListItem button onClick={() => handleNavigate('/student/signup')}>
                                        <ListItemText
                                            primary="Sign Up"
                                            primaryTypographyProps={{
                                                fontWeight: 800,
                                                color: COLORS.accent
                                            }}
                                        />
                                    </ListItem>
                                </>
                            ) : (
                                <>
                                    <ListItem button onClick={() => handleNavigate('/student/profile')}>
                                        <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 600 }} />
                                    </ListItem>
                                    <ListItem button onClick={() => handleNavigate('/student/payment')}>
                                        <ListItemText primary="Payments" primaryTypographyProps={{ fontWeight: 600 }} />
                                    </ListItem>
                                    <ListItem button onClick={handleLogout} sx={{ color: '#e11d48' }}>
                                        <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                                    </ListItem>
                                </>
                            )}
                        </List>
                    </Drawer>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default MockTestNavbar;

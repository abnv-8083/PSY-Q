import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container,
    IconButton, useMediaQuery, useTheme, Avatar, Menu, MenuItem,
    ListItemIcon, Divider, Tooltip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    User, LogOut,
    LogIn, UserPlus, CreditCard, ChevronDown,
    Settings, HelpCircle, LayoutDashboard
} from 'lucide-react';
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
    const { user, logout } = useSession();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
            navigate('/academic/mocktest');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    const navItems = [
        { label: 'Home', path: '/academic/mocktest' },
        { label: 'Practice Tests', path: '/academic/mocktest/dashboard' },
        { label: 'Bundles', path: '/academic/mocktest/bundles' }
    ];

    const handleNavigate = (path) => {
        navigate(path);
    };

    const isActive = (path) => {
        if (path === '/academic/mocktest' && location.pathname === '/academic/mocktest') return true;
        if (path !== '/academic/mocktest' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <AppBar 
            position="fixed" 
            elevation={0} 
            sx={{ 
                bgcolor: 'white', 
                borderBottom: `1px solid ${COLORS.primary}20`,
                top: 0,
                zIndex: 1100
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 70, md: 76 }, justifyContent: 'space-between' }}>
                    {/* Logo Section */}
                    <Box
                        onClick={() => navigate('/')}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 }
                        }}
                    >
                        <Box
                            component="img"
                            src="/logos/new-logo.jpeg"
                            alt="Psy-Q Logo"
                            sx={{
                                height: { xs: '35px', sm: '40px', md: '45px' },
                                width: 'auto'
                            }}
                        />
                    </Box>

                    {/* Nav Items - Desktop Only */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    onClick={() => handleNavigate(item.path)}
                                    sx={{
                                        color: isActive(item.path) ? COLORS.accent : COLORS.text,
                                        fontWeight: isActive(item.path) ? 700 : 500,
                                        textTransform: 'none',
                                        fontSize: '0.9rem',
                                        px: 1.5,
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
                    )}

                    {/* Auth Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                        {user ? (
                            <>
                                <Tooltip title="Account settings">
                                    <Box
                                        onClick={handleClick}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            cursor: 'pointer',
                                            p: 0.5,
                                            borderRadius: '20px',
                                            border: `1px solid ${theme.palette.divider}`,
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                        }}
                                    >
                                        <Avatar 
                                            sx={{ 
                                                width: 32, 
                                                height: 32, 
                                                bgcolor: COLORS.accent,
                                                fontSize: '0.875rem',
                                                fontWeight: 700
                                            }}
                                        >
                                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </Avatar>
                                        {!isMobile && (
                                            <>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary, maxWidth: 100, noWrap: true }}>
                                                    {user.full_name?.split(' ')[0] || 'User'}
                                                </Typography>
                                                <ChevronDown size={14} color={COLORS.text} />
                                            </>
                                        )}
                                    </Box>
                                </Tooltip>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleClose}
                                    onClick={handleClose}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    PaperProps={{
                                        elevation: 0,
                                        sx: {
                                            overflow: 'visible',
                                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                            mt: 1.5,
                                            borderRadius: 3,
                                            width: 220,
                                            '&:before': {
                                                content: '""',
                                                display: 'block',
                                                position: 'absolute',
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: 'background.paper',
                                                transform: 'translateY(-50%) rotate(45deg)',
                                                zIndex: 0,
                                            },
                                        },
                                    }}
                                >
                                    <Box sx={{ px: 2, py: 1.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.primary }}>
                                            {user.full_name || 'User'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: COLORS.text }}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <MenuItem onClick={() => navigate('/student/profile')} sx={{ py: 1.2 }}>
                                        <ListItemIcon><User size={18} /></ListItemIcon>
                                        My Profile
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/academic/mocktest/dashboard')} sx={{ py: 1.2 }}>
                                        <ListItemIcon><LayoutDashboard size={18} /></ListItemIcon>
                                        Dashboard
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/student/payment')} sx={{ py: 1.2 }}>
                                        <ListItemIcon><CreditCard size={18} /></ListItemIcon>
                                        Payment History
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={() => navigate('/soon')} sx={{ py: 1.2 }}>
                                        <ListItemIcon><Settings size={18} /></ListItemIcon>
                                        Settings
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/contact')} sx={{ py: 1.2 }}>
                                        <ListItemIcon><HelpCircle size={18} /></ListItemIcon>
                                        Help & Support
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
                                        <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    onClick={() => navigate('/student/signin')}
                                    sx={{
                                        color: COLORS.primary,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/student/signup')}
                                    sx={{
                                        bgcolor: COLORS.accent,
                                        color: 'white',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        borderRadius: '10px',
                                        px: 3,
                                        '&:hover': { bgcolor: '#9d174d' }
                                    }}
                                >
                                    Join Now
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>

            {/* Mobile Nav - Displayed below logo row on mobile */}
            {isMobile && (
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    overflowX: 'auto', 
                    px: 2,
                    pb: 1.5,
                    '&::-webkit-scrollbar': { display: 'none' } 
                }}>
                    {navItems.map((item) => (
                        <Button
                            key={item.label}
                            onClick={() => handleNavigate(item.path)}
                            size="small"
                            sx={{
                                color: isActive(item.path) ? COLORS.accent : COLORS.text,
                                fontWeight: isActive(item.path) ? 700 : 600,
                                textTransform: 'none',
                                minWidth: 'max-content',
                                fontSize: '0.8rem',
                                opacity: isActive(item.path) ? 1 : 0.7
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>
            )}
        </AppBar>
    );
};

export default MockTestNavbar;

import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container,
    IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    User, LogOut,
    LogIn, UserPlus, Menu as MenuIcon, X
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
        { label: 'Practice Tests', path: '/academic/mocktest/tests' },
        { label: 'Bundles', path: '/academic/mocktest/bundles' },
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
                <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 70, md: 76 } }}>
                    {/* Logo for Mock Test Section */}
                    <Box
                        onClick={() => navigate('/')}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            mr: 'auto',
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

                    {/* Desktop Actions */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, ml: 'auto' }}>
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
                        </Box>
                    )}

                    {/* Mobile Menu Button centered */}
                    {isMobile && (
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                             {navItems.map((item) => (
                                <Button
                                    key={item.label}
                                    onClick={() => handleNavigate(item.path)}
                                    size="small"
                                    sx={{
                                        color: isActive(item.path) ? COLORS.accent : COLORS.text,
                                        fontWeight: isActive(item.path) ? 700 : 500,
                                        textTransform: 'none',
                                        minWidth: 'max-content',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default MockTestNavbar;

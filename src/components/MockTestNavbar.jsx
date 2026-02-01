import React, { useState } from 'react';
import { 
    AppBar, Toolbar, Typography, Button, Box, Container, 
    IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme 
} from '@mui/material';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const COLORS = {
    primary: '#2C3E50',
    accent: '#3498DB',
    text: '#34495E'
};

const MockTestNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { label: 'Home', path: '/academic/mocktest' },
        { label: 'Tests', path: '/academic/mocktest/tests' },
        { label: 'Features', path: '/academic/mocktest/features' }
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
            <Container maxWidth="lg">
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
                        PSY-Q <Box component="span" sx={{ color: COLORS.accent }}>MOCK</Box>
                    </Typography>

                    {/* Desktop Nav */}
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
                        </List>
                    </Drawer>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default MockTestNavbar;

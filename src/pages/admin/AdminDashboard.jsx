import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Avatar,
    Divider,
    alpha,
    Paper
} from '@mui/material';
import {
    LayoutDashboard,
    Package,
    FileText,
    HelpCircle,
    ClipboardList,
    Mail,
    LogOut,
    Menu,
    User,
    ChevronRight,
    Bell,
    BarChart2,
    Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import BundleManagement from './BundleManagement';
import ContactSubmissions from './ContactSubmissions';
import ContentManagement from './ContentManagement';
import QuestionBank from './QuestionBank';
import NotificationManagement from './NotificationManagement';
import Analytics from './Analytics';
import AdminManagement from './AdminManagement';
import StudentManagement from './StudentManagement';
import { useSession } from '../../contexts/SessionContext';

// Premium Color Theme
const COLORS = {
    primary: '#1e293b',
    secondary: '#4b5563',
    accent: '#ca0056',
    accentHover: '#b8003f',
    background: '#fdf2f8',
    cardBg: '#FFFFFF',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, logout } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
    };

    const menuItems = [
        {
            path: '/admin',
            label: 'Dashboard',
            icon: LayoutDashboard,
            exact: true,
            permission: null // Always visible
        },
        {
            path: '/admin/bundles',
            label: 'Bundle Management',
            icon: Package,
            permission: 'manageBundles'
        },
        {
            path: '/admin/content',
            label: 'Content Management',
            icon: FileText,
            permission: 'manageContent'
        },
        {
            path: '/admin/notifications',
            label: 'Notification Management',
            icon: Bell,
            permission: 'manageContent' // Grouped with content for now
        },
        {
            path: '/admin/contacts',
            label: 'Contact Submissions',
            icon: Mail,
            permission: 'manageContent'
        },
        {
            path: '/admin/analytics',
            label: 'Analytics',
            icon: BarChart2,
            permission: 'viewAnalytics'
        },
        {
            path: '/admin/management',
            label: 'Admin Management',
            icon: Users,
            permission: 'manageUsers',
            superOnly: true
        },
        {
            path: '/admin/students',
            label: 'Student Management',
            icon: User,
            permission: 'manageUsers'
        }
    ].filter(item => {
        // Super admin sees everything
        if (user?.role === 'super_admin' || user?.role === 'superadmin') return true;

        // Hide if super only
        if (item.superOnly) return false;

        // Check granular permissions
        if (item.permission && user?.permissions) {
            return user.permissions[item.permission] === true;
        }

        return true; // Default visible if no permission defined
    });

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.background} 0%, #FFFFFF 100%)`, fontFamily: FONTS.primary }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: sidebarOpen ? 280 : 80,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: sidebarOpen ? 280 : 80,
                        boxSizing: 'border-box',
                        background: `linear-gradient(180deg, ${COLORS.primary} 0%, #0f172a 100%)`,
                        borderRight: 'none',
                        transition: 'width 0.3s',
                        boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
                    },
                }}
            >
                {/* Header */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {sidebarOpen && (
                        <Typography variant="h5" sx={{
                            fontWeight: 900,
                            background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ec4899 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Admin Panel
                        </Typography>
                    )}
                    <IconButton
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)',
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        <Menu size={20} />
                    </IconButton>
                </Box>

                {/* Navigation */}
                <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path, item.exact);

                        return (
                            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        px: 2,
                                        background: active ? `linear-gradient(135deg, ${COLORS.accent} 0%, #ec4899 100%)` : 'transparent',
                                        color: active ? '#fff' : '#cbd5e1',
                                        fontWeight: active ? 700 : 500,
                                        boxShadow: active ? `0 8px 16px ${alpha(COLORS.accent, 0.3)}` : 'none',
                                        '&:hover': {
                                            bgcolor: active ? undefined : 'rgba(255,255,255,0.05)',
                                            color: '#fff'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                        <Icon size={22} />
                                    </ListItemIcon>
                                    {sidebarOpen && (
                                        <>
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontWeight: active ? 700 : 600,
                                                    fontSize: '0.95rem'
                                                }}
                                            />
                                            {active && <ChevronRight size={18} />}
                                        </>
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* User Section */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {sidebarOpen && user && (
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 2,
                                p: 2,
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ec4899 100%)`
                                    }}
                                >
                                    <User size={20} />
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.email}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                        {user.role?.replace('_', ' ') || 'Administrator'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    )}
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 3,
                            py: 1.5,
                            px: 2,
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            fontWeight: 700,
                            '&:hover': {
                                bgcolor: '#ef4444',
                                color: '#fff'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                            <LogOut size={20} />
                        </ListItemIcon>
                        {sidebarOpen && <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }} />}
                    </ListItemButton>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Container maxWidth="xl" sx={{ py: 6 }}>
                                {/* Header */}
                                <Box sx={{ mb: 6 }}>
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1.5, fontSize: '2.5rem' }}>
                                        Welcome to Admin Dashboard
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: COLORS.textLight, fontWeight: 500, fontSize: '1.1rem' }}>
                                        Manage your mock test platform from here
                                    </Typography>
                                </Box>

                                {/* Dashboard Cards */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
                                    {menuItems.slice(1).map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={item.path}
                                                whileHover={{ y: -8 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Card
                                                    onClick={() => handleNavigation(item.path)}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        borderRadius: 2, // LOWER RADIUS
                                                        border: `2px solid ${COLORS.border}`,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                        transition: 'all 0.3s',
                                                        '&:hover': {
                                                            borderColor: COLORS.accent,
                                                            boxShadow: `0 20px 40px ${alpha(COLORS.accent, 0.15)}`
                                                        }
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 4 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                                                            <Box
                                                                sx={{
                                                                    p: 2.5,
                                                                    borderRadius: 2,
                                                                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ec4899 100%)`,
                                                                    boxShadow: `0 8px 20px ${alpha(COLORS.accent, 0.3)}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <Icon size={32} color="#fff" strokeWidth={2.5} />
                                                            </Box>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary, mb: 1, fontSize: '1.25rem' }}>
                                                                    {item.label}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 500, fontSize: '0.95rem' }}>
                                                                    Manage {item.label.toLowerCase()}
                                                                </Typography>
                                                            </Box>
                                                            <ChevronRight size={24} style={{ color: COLORS.textLight }} />
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </Box>
                            </Container>
                        }
                    />
                    <Route path="/bundles" element={<BundleManagement />} />
                    <Route path="/content" element={<ContentManagement />} />
                    <Route path="/questions" element={<QuestionBank />} />
                    <Route path="/notifications" element={<NotificationManagement />} />
                    <Route path="/contacts" element={<ContactSubmissions />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/students" element={<StudentManagement />} />
                    <Route path="/management" element={<AdminManagement />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default AdminDashboard;

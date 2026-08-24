import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
    Paper,
    useTheme,
    useMediaQuery
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
import PurchaseRequests from './PurchaseRequests';
import { useSession } from '../../contexts/SessionContext';
import { COLORS, FONTS } from '../../theme/adminTheme';

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { adminUser: user, logoutAdmin } = useSession();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    const handleLogout = async () => {
        await logoutAdmin();
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
            path: '/admin/requests',
            label: 'Purchase Requests',
            icon: ClipboardList,
            permission: 'manageBundles'
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
                variant={isMobile ? "temporary" : "permanent"}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                sx={{
                    width: sidebarOpen ? 272 : 72,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: sidebarOpen ? 272 : 72,
                        boxSizing: 'border-box',
                        background: `linear-gradient(180deg, #0f172a 0%, #1e293b 100%)`,
                        borderRight: 'none',
                        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: 0 },
                        scrollbarWidth: 'none',
                    },
                }}
            >
                {/* Header + Toggle */}
                <Box sx={{
                    px: sidebarOpen ? 2.5 : 0,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarOpen ? 'space-between' : 'center',
                    minHeight: 64,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    {sidebarOpen ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 36, height: 36, borderRadius: '12px',
                                background: `linear-gradient(135deg, ${COLORS.accent}, #ec4899)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <LayoutDashboard size={18} color="#fff" />
                            </Box>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 900, color: '#fff', fontSize: '1.05rem', letterSpacing: -0.3
                            }}>
                                Admin Panel
                            </Typography>
                        </Box>
                    ) : null}
                    <IconButton
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        size="small"
                        sx={{
                            width: 36, height: 36,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            color: '#94a3b8',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
                            transition: 'all 0.2s',
                        }}
                    >
                        <Menu size={18} />
                    </IconButton>
                </Box>

                {/* Navigation */}
                <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path, item.exact);

                        return (
                            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path)}
                                    title={!sidebarOpen ? item.label : undefined}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.2,
                                        px: sidebarOpen ? 2 : 0,
                                        justifyContent: sidebarOpen ? 'initial' : 'center',
                                        minHeight: 44,
                                        background: active
                                            ? `linear-gradient(135deg, ${COLORS.accent} 0%, #ec4899 100%)`
                                            : 'transparent',
                                        color: active ? '#fff' : '#94a3b8',
                                        boxShadow: active ? `0 4px 12px ${alpha(COLORS.accent, 0.35)}` : 'none',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: active ? undefined : 'rgba(255,255,255,0.06)',
                                            color: '#fff',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: 0,
                                        mr: sidebarOpen ? 1.5 : 0,
                                        justifyContent: 'center',
                                        color: 'inherit',
                                    }}>
                                        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                                    </ListItemIcon>
                                    {sidebarOpen && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontWeight: active ? 700 : 500,
                                                fontSize: '0.875rem',
                                                noWrap: true,
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                {/* User + Logout */}
                <Box sx={{ px: 1.5, pb: 2, borderTop: '1px solid rgba(255,255,255,0.06)', pt: 2 }}>
                    {sidebarOpen && user && (
                        <Box sx={{
                            mb: 1.5, mx: 0.5, p: 1.5, borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.04)',
                            display: 'flex', alignItems: 'center', gap: 1.2,
                        }}>
                            <Avatar
                                sx={{
                                    width: 34, height: 34, flexShrink: 0,
                                    background: `linear-gradient(135deg, ${COLORS.accent}, #ec4899)`,
                                    fontSize: '0.8rem', fontWeight: 700,
                                }}
                            >
                                {user.email?.charAt(0)?.toUpperCase() || 'A'}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.email}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', textTransform: 'capitalize' }}>
                                    {user.role?.replace('_', ' ') || 'Admin'}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    <ListItemButton
                        onClick={handleLogout}
                        title={!sidebarOpen ? 'Logout' : undefined}
                        sx={{
                            borderRadius: 2,
                            py: 1.2,
                            px: sidebarOpen ? 2 : 0,
                            justifyContent: sidebarOpen ? 'initial' : 'center',
                            minHeight: 44,
                            color: '#f87171',
                            '&:hover': { bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
                            transition: 'all 0.2s',
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 1.5 : 0, justifyContent: 'center', color: 'inherit' }}>
                            <LogOut size={18} />
                        </ListItemIcon>
                        {sidebarOpen && (
                            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }} />
                        )}
                    </ListItemButton>
                </Box>
            </Drawer>

            {/* Mobile Header (Hamburger Menu) */}
            {isMobile && !sidebarOpen && (
                <Box sx={{
                    position: 'fixed',
                    top: 12,
                    left: 12,
                    zIndex: 1300,
                }}>
                    <IconButton
                        onClick={() => setSidebarOpen(true)}
                        size="small"
                        sx={{
                            bgcolor: COLORS.primary,
                            color: '#fff',
                            width: 40, height: 40,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                            '&:hover': { bgcolor: COLORS.accent },
                        }}
                    >
                        <Menu size={20} />
                    </IconButton>
                </Box>
            )}

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', width: isMobile ? '100%' : 'auto' }}>
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
                    <Route path="/requests" element={<PurchaseRequests />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/students" element={<StudentManagement />} />
                    <Route path="/management" element={<AdminManagement />} />
                </Routes>
            </Box>
        </Box>
    );
};

export default AdminDashboard;

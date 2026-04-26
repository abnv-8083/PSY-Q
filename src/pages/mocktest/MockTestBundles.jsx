import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha, IconButton, Avatar, Menu, MenuItem, Divider,
    Breadcrumbs, Link as MuiLink
} from '@mui/material';
import {
    Package, ShoppingBag, CheckCircle, Zap, ShieldCheck,
    ArrowRight, Star, Layers, Sparkles, BookOpen, Clock, Play,
    Crown, Brain, Activity, Heart, Library
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserAccess } from '../../api/testsApi';
import { fetchUserPurchaseRequests } from '../../api/purchaseRequestsApi';
import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';
import { useSession } from '../../contexts/SessionContext';
import { fetchBundles } from '../../api/bundlesApi';

// --- Constants (Inherited from Dashboard) ---
const COLORS = {
    primary: '#1e293b',
    secondary: '#4b5563',
    accent: '#ca0056',
    accentHover: '#b8003f',
    background: '#fdf2f8',
    cardBg: '#FFFFFF',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#6366f1'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const getBundleIcon = (bundleName) => {
    const name = bundleName?.toLowerCase() || '';
    if (name.includes('premium') || name.includes('pro') || name.includes('elite')) return Crown;
    if (name.includes('advanced') || name.includes('inter')) return Zap;
    if (name.includes('psych')) return Brain;
    if (name.includes('clinical')) return Activity;
    if (name.includes('counsel')) return Heart;
    return Package;
};

const MockTestBundles = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, loading: sessionLoading } = useSession();

    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasedBundleIds, setPurchasedBundleIds] = useState(new Set());
    const [pendingBundleIds, setPendingBundleIds] = useState(new Set());

    useEffect(() => {
        const loadBundles = async () => {
            try {
                setLoading(true);
                const bundlesData = await fetchBundles();
                setBundles(bundlesData || []);

                if (user) {
                    const userId = user._id || user.id;

                    // Fetch access (combines bundles and tests)
                    const accessIds = await fetchUserAccess(userId);
                    if (accessIds) setPurchasedBundleIds(new Set(accessIds));

                    // Fetch pending purchase requests
                    const requests = await fetchUserPurchaseRequests(userId);
                    if (requests) {
                        const pendingIds = requests
                            .filter(r => r.status === 'pending' && r.item_type === 'bundle')
                            .map(r => r.item_id);
                        setPendingBundleIds(new Set(pendingIds));
                        
                        // Also add approved requests to purchased if not already handled by accessIds
                        const approvedIds = requests.filter(r => r.status === 'approved' && r.item_type === 'bundle').map(r => r.item_id);
                        if (approvedIds.length > 0) {
                            setPurchasedBundleIds(prev => new Set([...prev, ...approvedIds]));
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading bundles:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!sessionLoading) {
            loadBundles();
        }
    }, [user, sessionLoading]); // Added dependencies to re-run when user loads

    const handleBuyBundle = (bundle) => {
        if (!user) {
            navigate('/student/signin', { state: { from: location.pathname } });
            return;
        }

        // Use standard checkout flow
        navigate('/academic/mocktest/checkout', {
            state: {
                type: 'bundle',
                bundleId: bundle.id,
                name: bundle.name,
                price: bundle.offer_price || bundle.regular_price
            }
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Hero Section */}
            <Box sx={{
                bgcolor: COLORS.primary,
                pt: { xs: 4, md: 6 }, // Adjusted for single navbar
                pb: { xs: 12, md: 16 },
                position: 'relative',
                overflow: 'hidden',
                color: 'white'
            }}>
                {/* Decorative background elements */}
                <Box sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.2)} 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                    zIndex: 0
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Stack spacing={2} alignItems="center" textAlign="center">
                            <Chip
                                label="Premium Packages"
                                sx={{
                                    bgcolor: alpha(COLORS.accent, 0.2),
                                    color: COLORS.accent,
                                    fontWeight: 800,
                                    border: `1px solid ${alpha(COLORS.accent, 0.3)}`,
                                    backdropFilter: 'blur(10px)',
                                    px: 1
                                }}
                            />
                            <Typography variant="h2" sx={{
                                fontWeight: 900,
                                fontSize: { xs: '2.5rem', md: '4rem' },
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1
                            }}>
                                Master Your Exams with <Box component="span" sx={{ color: COLORS.accent }}>Bundles</Box>
                            </Typography>
                            <Typography variant="h6" sx={{
                                opacity: 0.8,
                                fontWeight: 500,
                                maxWidth: '700px',
                                mx: 'auto',
                                fontSize: { xs: '1rem', md: '1.25rem' },
                                lineHeight: 1.6
                            }}>
                                Save more and learn better with our curated test packages.
                                Get instant access to multiple subjects and comprehensive practice material.
                            </Typography>
                        </Stack>
                    </motion.div>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ mt: -6, pb: 12, position: 'relative', zIndex: 2, px: { xs: 2, md: 4 } }}>
                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 6 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid container spacing={3} alignItems="stretch" justifyContent="center">
                        {bundles.map((bundle, index) => (
                            <Grid item xs={12} md={4} key={bundle.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', minWidth: 0 }}
                                >
                                    <Card sx={{
                                        width: '100%',
                                        maxWidth: '400px',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: '48px',
                                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                        boxShadow: `0 20px 50px ${alpha(COLORS.accent, 0.25)}`,
                                        transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: `1px solid ${alpha('#ffffff', 0.2)}`,
                                        '&:hover': {
                                            transform: 'translateY(-16px)',
                                            boxShadow: `0 35px 80px ${alpha(COLORS.accent, 0.4)}`,
                                            '& .card-icon-bg': { transform: 'scale(1.2) rotate(-10deg)', opacity: 0.1 }
                                        }
                                    }}>
                                        {/* Dynamic Background Icon */}
                                        <Box className="card-icon-bg" sx={{
                                            position: 'absolute',
                                            right: -40,
                                            top: 20,
                                            opacity: 0.05,
                                            transition: 'all 0.6s ease',
                                            pointerEvents: 'none',
                                            zIndex: 0
                                        }}>
                                            {React.createElement(getBundleIcon(bundle.name), {
                                                size: 240,
                                                color: 'white',
                                                strokeWidth: 1
                                            })}
                                        </Box>

                                        <CardContent sx={{ p: { xs: 4, md: 5 }, flexGrow: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                                            {/* Badge Section */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    width: 60, 
                                                    height: 60, 
                                                    borderRadius: '20px', 
                                                    background: alpha('#ffffff', 0.15),
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                                                    color: 'white'
                                                }}>
                                                    {React.createElement(getBundleIcon(bundle.name), { size: 32, strokeWidth: 2 })}
                                                </Box>

                                                {bundle.is_best_seller && (
                                                    <Box
                                                        sx={{
                                                            bgcolor: 'white',
                                                            color: COLORS.accent,
                                                            px: 2.5,
                                                            py: 1,
                                                            borderRadius: '14px',
                                                            fontWeight: 900,
                                                            fontSize: '0.7rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '1.5px',
                                                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1.2,
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        <Star size={14} fill={COLORS.accent} color={COLORS.accent} />
                                                        <span>MOST POPULAR</span>
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="h4" sx={{
                                                    fontWeight: 900,
                                                    color: 'white',
                                                    letterSpacing: -1,
                                                    fontSize: '2.2rem',
                                                    lineHeight: 1.1,
                                                    mb: 1,
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'break-word'
                                                }}>
                                                    {bundle.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: alpha('#ffffff', 0.8),
                                                    lineHeight: 1.6,
                                                    fontWeight: 500,
                                                    fontSize: '0.95rem',
                                                    opacity: 0.9,
                                                    minHeight: 40,
                                                    wordBreak: 'break-word',
                                                    overflowWrap: 'break-word'
                                                }}>
                                                    {bundle.description || 'Full access to premium test materials and expert insights.'}
                                                </Typography>
                                            </Box>

                                            <Stack spacing={1.5} sx={{ mb: 4 }}>
                                                {(bundle.features?.length > 0 ? bundle.features : ['Professional Mock Tests', 'Expert Explanations', 'Performance Analytics']).slice(0, 4).map((feature, i) => (
                                                    <Box key={i} sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: 1.8,
                                                        p: 1.5,
                                                        borderRadius: 3.5,
                                                        bgcolor: alpha('#000000', 0.12),
                                                        backdropFilter: 'blur(10px)',
                                                        border: `1px solid ${alpha('#ffffff', 0.1)}`
                                                    }}>
                                                        <CheckCircle size={18} color="white" strokeWidth={3} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>
                                                            {feature}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 1.8,
                                                    p: 1.5,
                                                    borderRadius: 3.5,
                                                    bgcolor: alpha('#ffffff', 0.15),
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${alpha('#ffffff', 0.15)}`
                                                }}>
                                                    <Library size={18} color="white" strokeWidth={3} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>
                                                        {bundle.tests?.length || 0} Standard Mock Tests
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {/* White Price Section */}
                                            <Box sx={{ 
                                                mt: 'auto', 
                                                p: 3, 
                                                borderRadius: '35px', 
                                                background: 'white',
                                                boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                                    <Box>
                                                        {bundle.offer_price && bundle.offer_price < bundle.regular_price && (
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', textDecoration: 'line-through', fontWeight: 800, display: 'block' }}>
                                                                ₹{bundle.regular_price}
                                                            </Typography>
                                                        )}
                                                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                                            <Typography variant="h3" sx={{ fontWeight: 950, color: COLORS.primary, letterSpacing: -2, fontSize: '2.8rem' }}>
                                                                ₹{bundle.offer_price || bundle.regular_price}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', ml: 0.5, textTransform: 'uppercase' }}>
                                                                / Access
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                    {bundle.offer_price && bundle.offer_price < bundle.regular_price && (
                                                        <Box sx={{ 
                                                            background: alpha(COLORS.accent, 0.1),
                                                            color: COLORS.accent, 
                                                            px: 1.5, 
                                                            py: 1, 
                                                            borderRadius: '12px', 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 900
                                                        }}>
                                                            -{bundle.discount_percentage}%
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Button
                                                    link-type="access"
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => purchasedBundleIds.has(bundle.id) ? navigate(`/academic/mocktest/bundles/${bundle.id}`) : handleBuyBundle(bundle)}
                                                    disabled={pendingBundleIds.has(bundle.id)}
                                                    sx={{
                                                        background: purchasedBundleIds.has(bundle.id) 
                                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                            : `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                                        color: 'white',
                                                        fontWeight: 900,
                                                        borderRadius: '20px',
                                                        textTransform: 'none',
                                                        py: 2.2,
                                                        fontSize: '1.1rem',
                                                        boxShadow: `0 10px 25px ${alpha(COLORS.accent, 0.3)}`,
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: `0 15px 35px ${alpha(COLORS.accent, 0.4)}`,
                                                        },
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <span>
                                                            {purchasedBundleIds.has(bundle.id) 
                                                                ? 'Access Granted' 
                                                                : pendingBundleIds.has(bundle.id) 
                                                                    ? 'Verification Pending' 
                                                                    : 'Enroll Now'}
                                                        </span>
                                                        {!pendingBundleIds.has(bundle.id) && <ArrowRight size={20} />}
                                                    </Stack>
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Features Bar */}
            <Box sx={{ bgcolor: alpha(COLORS.primary, 0.02), py: 8, borderTop: `1px solid ${COLORS.border}` }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} justifyContent="center">
                        {[
                            { icon: <ShieldCheck size={32} />, title: "Secure Checkout", desc: "Encrypted payments" },
                            { icon: <Zap size={32} />, title: "Instant Access", desc: "Start practicing immediately" },
                            { icon: <Sparkles size={32} />, title: "Lifetime Validity", desc: "No recurring fees" }
                        ].map((item, i) => (
                            <Grid item xs={12} sm={4} key={i}>
                                <Stack alignItems="center" textAlign="center" spacing={1}>
                                    <Box sx={{ color: COLORS.accent, mb: 1 }}>{item.icon}</Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.primary }}>{item.title}</Typography>
                                    <Typography variant="body2" sx={{ color: COLORS.secondary }}>{item.desc}</Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default MockTestBundles;

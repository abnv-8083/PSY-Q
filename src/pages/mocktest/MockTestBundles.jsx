import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha, IconButton, Avatar, Menu, MenuItem, Divider,
    Breadcrumbs, Link as MuiLink
} from '@mui/material';
import {
    Package, ShoppingBag, CheckCircle, Zap, ShieldCheck,
    ArrowRight, Star, Layers, Sparkles, BookOpen, Clock, Play,
    Crown, Brain, Activity, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
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
                    // Check user_bundles for approved access
                    const { data: userBundles } = await supabase
                        .from('user_bundles')
                        .select('bundle_id')
                        .eq('user_id', user.id);

                    if (userBundles) {
                        setPurchasedBundleIds(new Set(userBundles.map(ub => ub.bundle_id)));
                    }

                    // Check requests (pending and approved)
                    const { data: requests } = await supabase
                        .from('purchase_requests')
                        .select('item_id, status')
                        .eq('user_id', user.id)
                        .eq('item_type', 'bundle');

                    if (requests) {
                        setPendingBundleIds(new Set(requests.filter(r => r.status === 'pending').map(r => r.item_id)));
                        const approvedIds = requests.filter(r => r.status === 'approved').map(r => r.item_id);
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
                price: bundle.price
            }
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Hero Section */}
            <Box sx={{
                bgcolor: COLORS.primary,
                pt: { xs: 8, sm: 10, md: 12 }, // Adjusted for single navbar
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
                            <Grid item xs={12} md={4} key={bundle.id} sx={{ display: 'flex', flexDirection: 'column' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    style={{ display: 'flex', flex: 1, flexDirection: 'column', width: '100%', minWidth: 0 }}
                                >
                                    <Card sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 8,
                                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, #a2124a 100%)`,
                                        boxShadow: `0 20px 50px ${alpha(COLORS.accent, 0.25)}`,
                                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        color: 'white',
                                        border: `1px solid ${alpha('#ffffff', 0.2)}`,
                                        '&:hover': {
                                            transform: 'translateY(-12px)',
                                            boxShadow: `0 40px 80px ${alpha(COLORS.accent, 0.4)}`,
                                            '& .card-icon-bg': {
                                                transform: 'scale(1.4) rotate(-15deg)',
                                                opacity: 0.15
                                            }
                                        }
                                    }}>
                                        {/* Dynamic Background Icon */}
                                        <Box className="card-icon-bg" sx={{
                                            position: 'absolute',
                                            right: -20,
                                            top: 40,
                                            opacity: 0.06,
                                            transform: 'rotate(-15deg)',
                                            pointerEvents: 'none',
                                            zIndex: 0,
                                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}>
                                            {React.createElement(getBundleIcon(bundle.name), {
                                                size: 200,
                                                color: 'white',
                                                strokeWidth: 1
                                            })}
                                        </Box>

                                        {/* Bundle Badge */}
                                        {bundle.is_popular && (
                                            <motion.div
                                                animate={{ 
                                                    scale: [1, 1.05, 1],
                                                    filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 24,
                                                    right: -38,
                                                    background: `white`,
                                                    color: COLORS.accent,
                                                    padding: '6px 45px',
                                                    transform: 'rotate(45deg)',
                                                    fontWeight: 900,
                                                    fontSize: '0.7rem',
                                                    zIndex: 20,
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                                    letterSpacing: '1px',
                                                }}
                                            >
                                                BEST VALUE
                                            </motion.div>
                                        )}

                                        <CardContent sx={{ p: { xs: 3.5, md: 4.5 }, flexGrow: 1, position: 'relative', zIndex: 1 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                mb: 3,
                                                bgcolor: alpha('#ffffff', 0.15),
                                                backdropFilter: 'blur(10px)',
                                                p: 2,
                                                borderRadius: 4,
                                                width: 'fit-content',
                                                border: `1px solid ${alpha('#ffffff', 0.2)}`
                                            }}>
                                                <Package color="white" size={28} />
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 2 }}>
                                                <Typography variant="h4" sx={{
                                                    fontWeight: 950,
                                                    color: 'white',
                                                    letterSpacing: -1,
                                                    fontSize: '1.75rem',
                                                    lineHeight: 1.1,
                                                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                }}>
                                                    {bundle.name}
                                                </Typography>
                                                {purchasedBundleIds.has(bundle.id) && (
                                                    <Chip 
                                                        label="ENROLLED" 
                                                        size="small" 
                                                        sx={{ 
                                                            bgcolor: '#10b981', 
                                                            color: 'white', 
                                                            fontWeight: 900, 
                                                            fontSize: '0.65rem',
                                                            borderRadius: 2,
                                                            height: 24,
                                                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                                        }} 
                                                    />
                                                )}
                                            </Box>

                                            <Typography variant="body1" sx={{
                                                color: alpha('#ffffff', 0.9),
                                                mb: 4,
                                                lineHeight: 1.6,
                                                fontWeight: 500,
                                                fontSize: '0.95rem'
                                            }}>
                                                {bundle.description}
                                            </Typography>

                                            <Stack spacing={2} sx={{ mb: 4 }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 2.5,
                                                    p: 2,
                                                    borderRadius: 4,
                                                    bgcolor: alpha('#000000', 0.15),
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${alpha('#ffffff', 0.1)}`
                                                }}>
                                                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: alpha('#ffffff', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <CheckCircle size={24} color="white" strokeWidth={2.5} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                                                            {bundle.bundle_tests?.length || 0} Mock Tests
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), fontWeight: 700 }}>
                                                            Full length practice sessions
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 2.5,
                                                    p: 2,
                                                    borderRadius: 4,
                                                    bgcolor: alpha('#000000', 0.15),
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${alpha('#ffffff', 0.1)}`
                                                }}>
                                                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: alpha('#ffffff', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Layers size={24} color="white" strokeWidth={2.5} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                                                            {new Set(bundle.bundle_tests?.map(bt => bt.tests?.subjects?.id || bt.tests?.subject_id)).size || 0} Core Subjects
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), fontWeight: 700 }}>
                                                            Comprehensive coverage
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>

                                            {/* Features List with enhanced look */}
                                            {bundle.features && bundle.features.length > 0 && (
                                                <Box sx={{ mb: 4 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'white', letterSpacing: 2, mb: 2, display: 'block', opacity: 0.8 }}>
                                                        BUNDLE PRIVILEGES
                                                    </Typography>
                                                    <Stack spacing={1.5}>
                                                        {bundle.features.map((feature, i) => (
                                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Star size={14} color="white" fill="white" />
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>
                                                                    {feature}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 'auto' }}>
                                                {bundle.offer_price && bundle.offer_price < bundle.regular_price && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography variant="body1" sx={{ color: alpha('#ffffff', 0.5), textDecoration: 'line-through', fontWeight: 800 }}>
                                                            ₹{bundle.regular_price}
                                                        </Typography>
                                                        <Box sx={{ bgcolor: '#10b981', color: 'white', px: 1, py: 0.5, borderRadius: 1.5, fontSize: '0.7rem', fontWeight: 900 }}>
                                                            {bundle.discount_percentage}% SAVING
                                                        </Box>
                                                    </Box>
                                                )}
                                                <Stack direction="row" alignItems="baseline" spacing={1}>
                                                    <Typography variant="h2" sx={{ fontWeight: 950, color: 'white', letterSpacing: -2 }}>
                                                        ₹{bundle.offer_price || bundle.regular_price}
                                                    </Typography>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: alpha('#ffffff', 0.7) }}>
                                                        / lifetime
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </CardContent>

                                        <Box sx={{ p: 4.5, pt: 0, position: 'relative', zIndex: 1 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => purchasedBundleIds.has(bundle.id) ? navigate('/academic/mocktest/tests', { state: { bundleId: bundle.id } }) : handleBuyBundle(bundle)}
                                                disabled={pendingBundleIds.has(bundle.id)}
                                                startIcon={purchasedBundleIds.has(bundle.id) ? <Play size={24} fill="currentColor" /> : pendingBundleIds.has(bundle.id) ? <Clock size={24} /> : <ShoppingBag size={24} />}
                                                sx={{
                                                    bgcolor: 'white',
                                                    color: COLORS.accent,
                                                    fontWeight: 950,
                                                    borderRadius: 5,
                                                    textTransform: 'none',
                                                    py: 2.2,
                                                    fontSize: '1.1rem',
                                                    letterSpacing: '0.5px',
                                                    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                                                    '&:hover': {
                                                        bgcolor: alpha('#ffffff', 0.9),
                                                        transform: 'translateY(-5px)',
                                                        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                                                    },
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    {purchasedBundleIds.has(bundle.id) ? 'Open Library' : pendingBundleIds.has(bundle.id) ? 'Verifying...' : 'Unlock Now'}
                                                    {!purchasedBundleIds.has(bundle.id) && !pendingBundleIds.has(bundle.id) && (
                                                        <ArrowRight size={22} className="btn-arrow" style={{ transition: 'transform 0.4s' }} />
                                                    )}
                                                </Box>
                                            </Button>
                                        </Box>
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

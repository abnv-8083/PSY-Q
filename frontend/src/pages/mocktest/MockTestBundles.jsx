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
                pt: { xs: 6, md: 10 },
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
                                        border: `1px solid ${alpha('#ffffff', 0.2)}`,
                                        background: `linear-gradient(135deg, ${alpha('#ffffff', 0.8)} 0%, ${alpha('#ffffff', 0.4)} 100%)`,
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        '&:hover': {
                                            boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                                            borderColor: alpha(COLORS.accent, 0.4),
                                            transform: 'translateY(-12px)',
                                            '& .card-gradient-bg': {
                                                opacity: 1,
                                                transform: 'scale(1.1)'
                                            }
                                        },
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Animated Background Decor */}
                                        <Box className="card-gradient-bg" sx={{
                                            position: 'absolute',
                                            top: -50,
                                            right: -50,
                                            width: 150,
                                            height: 150,
                                            background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.15)} 0%, transparent 70%)`,
                                            zIndex: 0,
                                            transition: 'all 0.6s ease',
                                            opacity: 0.5,
                                            pointerEvents: 'none'
                                        }} />

                                        {/* Dynamic Background Icon */}
                                        <Box sx={{
                                            position: 'absolute',
                                            right: -20,
                                            top: 60,
                                            opacity: 0.04,
                                            transform: 'rotate(-15deg)',
                                            pointerEvents: 'none',
                                            zIndex: 0
                                        }}>
                                            {React.createElement(getBundleIcon(bundle.name), {
                                                size: 180,
                                                color: COLORS.primary,
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
                                                    background: `linear-gradient(90deg, ${COLORS.accent} 0%, ${COLORS.accentHover} 100%)`,
                                                    color: 'white',
                                                    padding: '6px 45px',
                                                    transform: 'rotate(45deg)',
                                                    fontWeight: 900,
                                                    fontSize: '0.7rem',
                                                    zIndex: 20,
                                                    boxShadow: '0 4px 15px rgba(202, 0, 86, 0.3)',
                                                    letterSpacing: '1px',
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                BEST VALUE
                                            </motion.div>
                                        )}

                                        <CardContent sx={{ p: { xs: 3, md: 4 }, flexGrow: 1, position: 'relative', zIndex: 1 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                mb: 3,
                                                bgcolor: alpha(COLORS.accent, 0.08),
                                                p: 2,
                                                borderRadius: 4,
                                                width: 'fit-content',
                                                boxShadow: `inset 0 0 0 1px ${alpha(COLORS.accent, 0.1)}`
                                            }}>
                                                <Package color={COLORS.accent} size={28} />
                                            </Box>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 2 }}>
                                                <Typography variant="h5" sx={{
                                                    fontWeight: 900,
                                                    color: COLORS.primary,
                                                    letterSpacing: -0.5,
                                                    fontSize: '1.4rem',
                                                    lineHeight: 1.2
                                                }}>
                                                    {bundle.name}
                                                </Typography>
                                                {purchasedBundleIds.has(bundle.id) && (
                                                    <Chip 
                                                        label="ENROLLED" 
                                                        size="small" 
                                                        sx={{ 
                                                            bgcolor: alpha('#10b981', 0.1), 
                                                            color: '#059669', 
                                                            fontWeight: 900, 
                                                            fontSize: '0.65rem',
                                                            borderRadius: 2,
                                                            border: '1px solid currentColor',
                                                            px: 0.5,
                                                            height: 24
                                                        }} 
                                                    />
                                                )}
                                            </Box>

                                            <Typography variant="body2" sx={{
                                                color: COLORS.secondary,
                                                mb: 3,
                                                lineHeight: 1.6,
                                                fontWeight: 500,
                                                opacity: 0.9,
                                                fontSize: '0.9rem'
                                            }}>
                                                {bundle.description}
                                            </Typography>

                                            <Stack spacing={2} sx={{ mb: 4 }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 2,
                                                    p: 1.5,
                                                    borderRadius: 3,
                                                    bgcolor: alpha('#6366f1', 0.05),
                                                    border: `1px solid ${alpha('#6366f1', 0.1)}`
                                                }}>
                                                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <CheckCircle size={20} color="#6366f1" />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary, fontSize: '0.9rem' }}>
                                                            {bundle.bundle_tests?.length || 0} Mock Tests
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: alpha(COLORS.primary, 0.6), fontWeight: 600 }}>
                                                            Full length practice sessions
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 2,
                                                    p: 1.5,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(COLORS.accent, 0.05),
                                                    border: `1px solid ${alpha(COLORS.accent, 0.1)}`
                                                }}>
                                                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Layers size={20} color={COLORS.accent} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary, fontSize: '0.9rem' }}>
                                                            {new Set(bundle.bundle_tests?.map(bt => bt.tests?.subjects?.id || bt.tests?.subject_id)).size || 0} Core Subjects
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: alpha(COLORS.primary, 0.6), fontWeight: 600 }}>
                                                            Comprehensive coverage
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>

                                            {/* Features List with enhanced look */}
                                            {bundle.features && bundle.features.length > 0 && (
                                                <Box sx={{ mb: 4 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.accent, letterSpacing: 1.5, mb: 2, display: 'block', opacity: 0.8 }}>
                                                        BUNDLE PRIVILEGES
                                                    </Typography>
                                                    <Stack spacing={1.2}>
                                                        {bundle.features.map((feature, i) => (
                                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent, flexShrink: 0 }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary, fontSize: '0.85rem' }}>
                                                                    {feature}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 'auto' }}>
                                                {bundle.offer_price && bundle.offer_price < bundle.regular_price && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Typography variant="body2" sx={{ color: alpha(COLORS.primary, 0.4), textDecoration: 'line-through', fontWeight: 700 }}>
                                                            ₹{bundle.regular_price}
                                                        </Typography>
                                                        <Chip
                                                            label={`${bundle.discount_percentage}% OFF`}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 900,
                                                                bgcolor: alpha('#10b981', 0.1),
                                                                color: '#059669',
                                                                border: '1px solid currentColor',
                                                                borderRadius: 1
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                                    <Typography variant="h3" sx={{ fontWeight: 950, color: COLORS.primary, letterSpacing: -1 }}>
                                                        ₹{bundle.offer_price || bundle.regular_price}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: alpha(COLORS.primary, 0.5) }}>
                                                        / lifetime access
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </CardContent>

                                        <Box sx={{ p: { xs: 3, md: 4 }, pt: 0 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => purchasedBundleIds.has(bundle.id) ? navigate('/academic/mocktest/tests', { state: { bundleId: bundle.id } }) : handleBuyBundle(bundle)}
                                                disabled={pendingBundleIds.has(bundle.id)}
                                                startIcon={purchasedBundleIds.has(bundle.id) ? <Play size={20} fill="currentColor" /> : pendingBundleIds.has(bundle.id) ? <Clock size={20} /> : <ShoppingBag size={20} />}
                                                sx={{
                                                    bgcolor: purchasedBundleIds.has(bundle.id) ? '#10b981' : pendingBundleIds.has(bundle.id) ? '#f59e0b' : COLORS.accent,
                                                    color: 'white',
                                                    fontWeight: 900,
                                                    borderRadius: 4,
                                                    textTransform: 'none',
                                                    py: 2,
                                                    fontSize: '1rem',
                                                    letterSpacing: '0.3px',
                                                    boxShadow: `0 8px 25px -5px ${alpha(purchasedBundleIds.has(bundle.id) ? '#10b981' : pendingBundleIds.has(bundle.id) ? '#f59e0b' : COLORS.accent, 0.4)}`,
                                                    '&:hover': {
                                                        bgcolor: purchasedBundleIds.has(bundle.id) ? '#059669' : pendingBundleIds.has(bundle.id) ? '#d97706' : COLORS.accentHover,
                                                        transform: 'translateY(-3px)',
                                                        boxShadow: `0 15px 35px -5px ${alpha(purchasedBundleIds.has(bundle.id) ? '#10b981' : pendingBundleIds.has(bundle.id) ? '#f59e0b' : COLORS.accent, 0.5)}`,
                                                        '& .btn-arrow': { transform: 'translateX(4px)' }
                                                    },
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {purchasedBundleIds.has(bundle.id) ? 'Access Library' : pendingBundleIds.has(bundle.id) ? 'Pending Verification' : 'Get Full Access'}
                                                    {!purchasedBundleIds.has(bundle.id) && !pendingBundleIds.has(bundle.id) && (
                                                        <ArrowRight size={18} className="btn-arrow" style={{ transition: 'transform 0.3s' }} />
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

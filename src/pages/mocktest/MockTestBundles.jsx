import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha, IconButton, Avatar, Menu, MenuItem, Divider,
    Breadcrumbs, Link as MuiLink
} from '@mui/material';
import {
    Package, ShoppingBag, CheckCircle, Zap, ShieldCheck,
    ArrowRight, Star, Layers, Sparkles, BookOpen, Clock, Play
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
    success: '#10b981'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const MockTestBundles = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, loading: sessionLoading } = useSession();

    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasedBundleIds, setPurchasedBundleIds] = useState(new Set());

    useEffect(() => {
        const loadBundles = async () => {
            try {
                setLoading(true);
                const bundlesData = await fetchBundles();
                setBundles(bundlesData || []);

                if (user) {
                    const { data: orders } = await supabase
                        .from('orders')
                        .select('item_id')
                        .eq('user_id', user.id)
                        .eq('status', 'success')
                        .eq('item_type', 'bundle');

                    if (orders) {
                        setPurchasedBundleIds(new Set(orders.map(o => o.item_id)));
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
    }, [user, sessionLoading]);

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
                                        borderRadius: 6,
                                        border: `1px solid ${COLORS.border}`,
                                        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                            borderColor: COLORS.accent,
                                            transform: 'translateY(-8px)'
                                        },
                                        position: 'relative',
                                        overflow: 'hidden',
                                        bgcolor: COLORS.cardBg
                                    }}>
                                        {/* Bundle Badge */}
                                        {bundle.is_popular && (
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 20,
                                                right: -35,
                                                bgcolor: COLORS.accent,
                                                color: 'white',
                                                py: 0.5,
                                                px: 5,
                                                transform: 'rotate(45deg)',
                                                fontWeight: 800,
                                                fontSize: '0.75rem',
                                                zIndex: 10,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}>
                                                BEST VALUE
                                            </Box>
                                        )}

                                        <CardContent sx={{ p: { xs: 2.5, md: 3 }, flexGrow: 1 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                mb: 2,
                                                bgcolor: alpha(COLORS.accent, 0.05),
                                                p: 1.5,
                                                borderRadius: 3,
                                                width: 'fit-content'
                                            }}>
                                                <Package color={COLORS.accent} size={24} />
                                            </Box>

                                            <Typography variant="h5" sx={{
                                                fontWeight: 900,
                                                color: COLORS.primary,
                                                mb: 1,
                                                letterSpacing: -0.5,
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-word'
                                            }}>
                                                {bundle.name}
                                            </Typography>

                                            <Typography variant="body2" sx={{
                                                color: COLORS.secondary,
                                                mb: 2,
                                                lineHeight: 1.5,
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-word'
                                            }}>
                                                {bundle.description}
                                            </Typography>

                                            <Stack spacing={1} sx={{ mb: 2.5 }}>
                                                {/* Dynamic Counts */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(COLORS.success, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <CheckCircle size={18} color={COLORS.success} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary, lineHeight: 1, fontSize: '0.85rem' }}>
                                                            {bundle.bundle_tests?.length || 0} Mock Tests
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(COLORS.accent, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Layers size={18} color={COLORS.accent} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary, lineHeight: 1, fontSize: '0.85rem' }}>
                                                            {new Set(bundle.bundle_tests?.map(bt => bt.tests?.subjects?.id || bt.tests?.subject_id)).size || 0} Subjects
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>

                                            <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                                            {/* Features List from Database */}
                                            {bundle.features && bundle.features.length > 0 && (
                                                <Box sx={{ mb: 2.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.accent, letterSpacing: 1, mb: 1, display: 'block' }}>
                                                        WHAT'S INCLUDED:
                                                    </Typography>
                                                    <Stack spacing={1}>
                                                        {bundle.features.map((feature, i) => (
                                                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                                <Star size={12} color={COLORS.accent} style={{ marginTop: 3, flexShrink: 0 }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary, fontSize: '0.8rem' }}>
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
                                                        <Typography variant="body2" sx={{ color: COLORS.textLight, textDecoration: 'line-through', fontWeight: 600 }}>
                                                            ₹{bundle.regular_price}
                                                        </Typography>
                                                        <Chip
                                                            label={`${bundle.discount_percentage}% SAVE`}
                                                            size="small"
                                                            sx={{
                                                                height: 18,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 900,
                                                                bgcolor: '#dcfce7',
                                                                color: '#15803d'
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary }}>
                                                    ₹{bundle.offer_price || bundle.regular_price}
                                                </Typography>
                                            </Box>
                                        </CardContent>

                                        <Box sx={{ p: 3, pt: 0 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => handleBuyBundle(bundle)}
                                                disabled={purchasedBundleIds.has(bundle.id)}
                                                startIcon={purchasedBundleIds.has(bundle.id) ? <CheckCircle size={18} /> : <ShoppingBag size={18} />}
                                                sx={{
                                                    bgcolor: purchasedBundleIds.has(bundle.id) ? COLORS.success : COLORS.accent,
                                                    color: 'white',
                                                    fontWeight: 800,
                                                    borderRadius: 2.5,
                                                    textTransform: 'none',
                                                    py: 1.5,
                                                    fontSize: '0.95rem',
                                                    boxShadow: `0 8px 20px -6px ${alpha(purchasedBundleIds.has(bundle.id) ? COLORS.success : COLORS.accent, 0.4)}`,
                                                    '&:hover': {
                                                        bgcolor: purchasedBundleIds.has(bundle.id) ? COLORS.success : COLORS.accentHover,
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: `0 12px 28px -6px ${alpha(purchasedBundleIds.has(bundle.id) ? COLORS.success : COLORS.accent, 0.5)}`
                                                    },
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                {purchasedBundleIds.has(bundle.id) ? 'Purchased' : 'Get Access'}
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

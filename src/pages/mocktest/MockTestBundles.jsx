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
                                        borderRadius: '24px',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)',
                                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: `1px solid ${alpha(COLORS.border, 0.5)}`,
                                        '&:hover': {
                                            transform: 'translateY(-12px)',
                                            boxShadow: '0 25px 60px rgba(202, 0, 86, 0.12)',
                                            borderColor: alpha(COLORS.accent, 0.3),
                                            '& .card-icon-bg': {
                                                transform: 'scale(1.2) rotate(-15deg)',
                                                opacity: 0.08
                                            }
                                        }
                                    }}>
                                        {/* Dynamic Background Icon */}
                                        <Box className="card-icon-bg" sx={{
                                            position: 'absolute',
                                            right: -20,
                                            top: 40,
                                            opacity: 0.03,
                                            transform: 'rotate(-15deg)',
                                            pointerEvents: 'none',
                                            zIndex: 0,
                                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}>
                                            {React.createElement(getBundleIcon(bundle.name), {
                                                size: 160,
                                                color: COLORS.accent,
                                                strokeWidth: 1
                                            })}
                                        </Box>

                                        {/* Top Color Accent Bar */}
                                        <Box sx={{ 
                                            height: 6, 
                                            background: `linear-gradient(90deg, ${COLORS.accent}, #ff4081)`,
                                            width: '100%' 
                                        }} />

                                        {/* Bundle Badge */}
                                        {bundle.is_popular && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 24,
                                                    right: 24,
                                                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff4081 100%)`,
                                                    color: 'white',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    zIndex: 20,
                                                    boxShadow: `0 4px 15px ${alpha(COLORS.accent, 0.3)}`,
                                                    letterSpacing: '1px',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Sparkles size={12} />
                                                    <span>Most Popular</span>
                                                </Stack>
                                            </Box>
                                        )}

                                        <CardContent sx={{ p: { xs: 4, md: 5 }, flexGrow: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 900,
                                                    color: COLORS.primary,
                                                    letterSpacing: -0.5,
                                                    fontSize: '1.6rem',
                                                    lineHeight: 1.2,
                                                    mb: 1
                                                }}>
                                                    {bundle.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    color: COLORS.secondary,
                                                    lineHeight: 1.6,
                                                    fontWeight: 500,
                                                    fontSize: '0.9rem',
                                                    opacity: 0.8
                                                }}>
                                                    {bundle.description}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ mb: 4, borderColor: alpha(COLORS.border, 0.6) }} />

                                            <Stack spacing={2.5} sx={{ mb: 5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ 
                                                        width: 42, 
                                                        height: 42, 
                                                        borderRadius: '12px', 
                                                        bgcolor: alpha(COLORS.accent, 0.08),
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        color: COLORS.accent
                                                    }}>
                                                        <CheckCircle size={20} strokeWidth={2.5} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary, lineHeight: 1.1 }}>
                                                            {bundle.bundle_tests?.length || 0} Mock Tests
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 600, fontSize: '0.75rem' }}>
                                                            Full-length practice sessions
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ 
                                                        width: 42, 
                                                        height: 42, 
                                                        borderRadius: '12px', 
                                                        bgcolor: alpha('#6366f1', 0.08),
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        color: '#6366f1'
                                                    }}>
                                                        <Layers size={20} strokeWidth={2.5} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary, lineHeight: 1.1 }}>
                                                            Standardized Analytics
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 600, fontSize: '0.75rem' }}>
                                                            Track your performance
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>

                                            {/* Features List with refined checkmarks */}
                                            {bundle.features && bundle.features.length > 0 && (
                                                <Box sx={{ mb: 5 }}>
                                                    <Stack spacing={1.5}>
                                                        {bundle.features.slice(0, 4).map((feature, i) => (
                                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <Box sx={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    justifyContent: 'center',
                                                                    p: 0.5,
                                                                    borderRadius: '50%',
                                                                    bgcolor: alpha(COLORS.accent, 0.1),
                                                                    color: COLORS.accent
                                                                }}>
                                                                    <CheckCircle size={12} strokeWidth={3} />
                                                                </Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary, fontSize: '0.85rem' }}>
                                                                    {feature}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            )}

                                            <Box sx={{ mt: 'auto' }}>
                                                <Divider sx={{ mb: 3, borderColor: alpha(COLORS.border, 0.6) }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <Box>
                                                        {bundle.offer_price && bundle.offer_price < bundle.regular_price && (
                                                            <Typography variant="caption" sx={{ color: COLORS.textLight, textDecoration: 'line-through', fontWeight: 700, mb: 0.5, display: 'block' }}>
                                                                ₹{bundle.regular_price}
                                                            </Typography>
                                                        )}
                                                        <Stack direction="row" alignItems="baseline" spacing={0.5}>
                                                            <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1.5, fontSize: '2.5rem' }}>
                                                                ₹{bundle.offer_price || bundle.regular_price}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textLight, ml: 1 }}>
                                                                / Lifetime
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                    {bundle.offer_price && bundle.offer_price < bundle.regular_price && (
                                                        <Box sx={{ 
                                                            bgcolor: alpha('#10b981', 0.1), 
                                                            color: '#10b981', 
                                                            px: 1.5, 
                                                            py: 0.5, 
                                                            borderRadius: '8px', 
                                                            fontSize: '0.75rem', 
                                                            fontWeight: 800,
                                                            border: '1px solid rgba(16, 185, 129, 0.2)'
                                                        }}>
                                                            {bundle.discount_percentage}% OFF
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </CardContent>

                                        <Box sx={{ p: 4, pt: 0, position: 'relative', zIndex: 1 }}>
                                            <Button
                                                link-type="access"
                                                fullWidth
                                                variant="contained"
                                                onClick={() => purchasedBundleIds.has(bundle.id) ? navigate('/academic/mocktest/tests', { state: { bundleId: bundle.id } }) : handleBuyBundle(bundle)}
                                                disabled={pendingBundleIds.has(bundle.id)}
                                                sx={{
                                                    background: purchasedBundleIds.has(bundle.id) 
                                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                        : `linear-gradient(135deg, ${COLORS.accent} 0%, #ff4081 100%)`,
                                                    color: 'white',
                                                    fontWeight: 800,
                                                    borderRadius: '16px',
                                                    textTransform: 'none',
                                                    py: 2,
                                                    fontSize: '1rem',
                                                    boxShadow: `0 10px 20px ${alpha(COLORS.accent, 0.2)}`,
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: `0 15px 30px ${alpha(COLORS.accent, 0.3)}`,
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
                                                                : 'Get Full Access'}
                                                    </span>
                                                    {!pendingBundleIds.has(bundle.id) && <ArrowRight size={18} />}
                                                </Stack>
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

import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Card, CardContent, Button,
    Stack, Skeleton, alpha, Grid, Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchBundles } from '../../api/bundlesApi';
import { fetchUserPurchaseRequests } from '../../api/purchaseRequestsApi';
import { fetchUserAccess } from '../../api/testsApi';
import {
    Library, ChevronRight, ShoppingBag, Lock, Package, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';
import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';

const COLORS = {
    primary: '#1e293b',
    secondary: '#4b5563',
    accent: '#ca0056',
    accentHover: '#b8003f',
    background: '#fdf2f8',
    cardBg: '#FFFFFF',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const MyBundles = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: sessionLoading } = useSession();

    const [purchasedBundles, setPurchasedBundles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        if (!sessionLoading && !user) {
            navigate('/student/signin', { state: { from: location } });
        }
    }, [user, sessionLoading, navigate, location]);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const userId = user._id || user.id;

                const [allBundles, purchaseReqs, accessIds] = await Promise.all([
                    fetchBundles(),
                    fetchUserPurchaseRequests(userId),
                    fetchUserAccess(userId)
                ]);

                // Get approved bundle IDs
                const approvedBundleIds = new Set([
                    ...(purchaseReqs || [])
                        .filter(r => r.status === 'approved' && r.item_type === 'bundle')
                        .map(r => r.item_id),
                    ...(accessIds || [])
                ]);

                // Filter bundles user has purchased
                const owned = (allBundles || []).filter(b =>
                    approvedBundleIds.has(b._id || b.id)
                );

                setPurchasedBundles(owned);
            } catch (err) {
                console.error('Error loading my bundles:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!sessionLoading) loadData();
    }, [user, sessionLoading]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Hero */}
            <Box sx={{
                bgcolor: COLORS.primary,
                color: 'white',
                pt: { xs: 4, md: 6 },
                pb: { xs: 10, md: 12 },
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                    <Box sx={{ p: 1, bgcolor: alpha(COLORS.accent, 0.2), borderRadius: 2, border: `1px solid ${alpha(COLORS.accent, 0.5)}` }}>
                                        <Package size={24} color={COLORS.accent} />
                                    </Box>
                                    <Typography variant="subtitle1" sx={{ color: COLORS.accent, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                                        My Bundles
                                    </Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>
                                    Your <Box component="span" sx={{ color: COLORS.accent }}>Purchased</Box> Bundles
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                    Access all the test bundles you've unlocked. Click any bundle to start practicing.
                                </Typography>
                            </Box>
                            {!loading && (
                                <Box sx={{
                                    p: 2.5,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    textAlign: 'center',
                                    minWidth: 120
                                }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.accent }}>{purchasedBundles.length}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>BUNDLES OWNED</Typography>
                                </Box>
                            )}
                        </Stack>
                    </motion.div>
                </Container>

                {/* Decorative */}
                <Box sx={{ position: 'absolute', right: '-5%', top: '20%', opacity: 0.05, display: { xs: 'none', md: 'block' } }}>
                    <Library size={300} strokeWidth={1} color="white" />
                </Box>
            </Box>

            {/* Content */}
            <Container maxWidth="lg" sx={{ mt: -6, pb: 10, position: 'relative', zIndex: 1 }}>
                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map(i => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Skeleton variant="rounded" sx={{ borderRadius: 4, height: 220 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : purchasedBundles.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Box sx={{
                            textAlign: 'center',
                            py: 10,
                            bgcolor: 'white',
                            borderRadius: 4,
                            border: `1px dashed ${COLORS.border}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                        }}>
                            <Box sx={{ mb: 3, display: 'inline-flex', p: 3, bgcolor: alpha(COLORS.accent, 0.08), borderRadius: '50%' }}>
                                <Lock size={48} color={COLORS.accent} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary, mb: 1 }}>
                                No Bundles Yet
                            </Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight, mb: 4, maxWidth: 420, mx: 'auto' }}>
                                You haven't purchased any bundles yet. Browse our available bundles and unlock premium mock tests.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/academic/mocktest/bundles')}
                                endIcon={<ArrowRight size={18} />}
                                sx={{
                                    bgcolor: COLORS.accent,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: COLORS.accentHover }
                                }}
                            >
                                Browse Bundles
                            </Button>
                        </Box>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        <Grid container spacing={3}>
                            {purchasedBundles.map((bundle, index) => (
                                <Grid item xs={12} sm={6} md={4} key={bundle.id || bundle._id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.07 }}
                                        whileHover={{ y: -6, scale: 1.01 }}
                                        style={{ height: '100%' }}
                                    >
                                        <Card sx={{
                                            height: '100%',
                                            borderRadius: 4,
                                            background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                            boxShadow: `0 15px 35px ${alpha(COLORS.accent, 0.2)}`,
                                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            color: 'white',
                                            border: `1px solid ${alpha('#ffffff', 0.2)}`,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                boxShadow: `0 25px 50px ${alpha(COLORS.accent, 0.4)}`,
                                            }
                                        }}
                                            onClick={() => navigate(`/academic/mocktest/bundles/${bundle.id || bundle._id}`)}
                                        >
                                            {/* Decorative bg icon */}
                                            <Box sx={{
                                                position: 'absolute', right: -15, top: 10, opacity: 0.07,
                                                pointerEvents: 'none'
                                            }}>
                                                <Library size={140} color="white" strokeWidth={1} />
                                            </Box>

                                            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                                                <Stack spacing={2}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            px: 1.5, py: 0.5,
                                                            bgcolor: alpha('#ffffff', 0.15),
                                                            backdropFilter: 'blur(4px)',
                                                            borderRadius: 1.5,
                                                            border: `1px solid ${alpha('#ffffff', 0.2)}`
                                                        }}>
                                                            <Typography variant="overline" sx={{ color: 'white', fontWeight: 900, letterSpacing: 1.5, fontSize: '0.6rem' }}>
                                                                BUNDLE
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label="OWNED"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: COLORS.success,
                                                                color: 'white',
                                                                fontWeight: 900,
                                                                fontSize: '0.55rem',
                                                                height: 20,
                                                                borderRadius: 1.5
                                                            }}
                                                        />
                                                    </Box>

                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 900,
                                                        color: 'white',
                                                        lineHeight: 1.3,
                                                        textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {bundle.name}
                                                    </Typography>

                                                    {bundle.description && (
                                                        <Typography variant="caption" sx={{
                                                            color: alpha('#ffffff', 0.75),
                                                            fontWeight: 500,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {bundle.description}
                                                        </Typography>
                                                    )}

                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        p: 1.5,
                                                        bgcolor: alpha('#000', 0.12),
                                                        borderRadius: 2,
                                                        border: `1px solid ${alpha('#fff', 0.1)}`
                                                    }}>
                                                        <ShoppingBag size={14} color="white" />
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', fontSize: '0.75rem' }}>
                                                            {(bundle.tests || []).length} Tests Included
                                                        </Typography>
                                                    </Box>

                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        endIcon={<ChevronRight size={18} />}
                                                        sx={{
                                                            bgcolor: 'white',
                                                            color: COLORS.accent,
                                                            fontWeight: 900,
                                                            borderRadius: 2.5,
                                                            textTransform: 'none',
                                                            py: 1.2,
                                                            fontSize: '0.9rem',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            '&:hover': {
                                                                bgcolor: alpha('#ffffff', 0.9),
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                                            },
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        Start Practicing
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </AnimatePresence>
                )}
            </Container>

            <Footer />
        </Box>
    );
};

export default MyBundles;

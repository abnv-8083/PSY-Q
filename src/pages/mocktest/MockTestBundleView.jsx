import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Skeleton, alpha
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchTests, fetchUserAttempts, fetchUserAccess } from '../../api/testsApi';
import { fetchBundleById } from '../../api/bundlesApi';
import { fetchUserPurchaseRequests } from '../../api/purchaseRequestsApi';
import {
    Clock, ChevronRight, Target,
    ArrowLeft, CheckCircle, Library
} from 'lucide-react';
import { motion } from 'framer-motion';
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
    success: '#6366f1'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const MockTestBundleView = () => {
    const { bundleId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, loading: sessionLoading } = useSession();

    const [bundle, setBundle] = useState(null);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState({});
    const [accessedTestIds, setAccessedTestIds] = useState(new Set());
    const [pendingTestIds, setPendingTestIds] = useState(new Set());

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        const loadBundleData = async () => {
            try {
                setLoading(true);
                
                // Fetch bundle details
                const bundleData = await fetchBundleById(bundleId);
                if (!bundleData) {
                    navigate('/academic/mocktest/bundles');
                    return;
                }
                setBundle(bundleData);

                // Fetch all tests and filter by bundle's test IDs
                const allTestsData = await fetchTests();
                const bundleTestIds = new Set((bundleData.tests || []).map(t => typeof t === 'object' ? (t.id || t._id) : t));
                const filteredTests = (allTestsData || [])
                    .filter(test => bundleTestIds.has(test._id || test.id))
                    .map(test => ({ ...test, id: test._id || test.id }))
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                
                setTests(filteredTests);

                // Fetch user access data if logged in
                const userId = user?._id || user?.id;
                if (userId) {
                    const [attemptData, accessIdsArr, pendingReqs] = await Promise.all([
                        fetchUserAttempts(userId),
                        fetchUserAccess(userId),
                        fetchUserPurchaseRequests(userId)
                    ]);

                    const attemptMap = {};
                    attemptData?.forEach(attempt => {
                        const tId = attempt.test_id;
                        attemptMap[tId] = (attemptMap[tId] || 0) + 1;
                    });
                    setAttempts(attemptMap);

                    setAccessedTestIds(new Set(accessIdsArr || []));
                    
                    if (pendingReqs) {
                        const pendingIds = pendingReqs
                            .filter(r => r.status === 'pending')
                            .map(r => r.item_id);
                        setPendingTestIds(new Set(pendingIds));
                    }
                }
            } catch (err) {
                console.error("Error loading bundle view:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!sessionLoading) {
            loadBundleData();
        }
    }, [bundleId, user, sessionLoading, navigate]);

    const handleStartTest = (subjectId, testId, price) => {
        if (!user) {
            navigate('/student/signin', { state: { from: location } });
            return;
        }

        const isFirstAttempt = !attempts[testId] || attempts[testId] === 0;
        const hasAccess = isFirstAttempt || accessedTestIds.has(testId) || price === 0;

        if (hasAccess) {
            // For bundle view, we might not have a reliable subjectId if test belongs to a deleted subject.
            // But tests usually have subject_id. Let's pass the first part as subjectId if available, or 'bundle'
            const sId = subjectId || 'bundle';
            navigate(`/academic/mocktest/${sId}/${testId}/rules`);
        } else if (pendingTestIds.has(testId)) {
            return;
        } else {
            navigate('/academic/mocktest/checkout', {
                state: {
                    type: 'test',
                    testId: testId,
                    name: tests.find(t => t.id === testId)?.name || 'Mock Test',
                    price: price
                }
            });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Hero Section */}
            <Box sx={{
                bgcolor: COLORS.primary,
                color: 'white',
                pt: { xs: 8, sm: 10, md: 12 },
                pb: { xs: 8, md: 10 },
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg">
                    <Button 
                        startIcon={<ArrowLeft size={18} />} 
                        onClick={() => navigate('/academic/mocktest/bundles')}
                        sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, '&:hover': { color: 'white' }, textTransform: 'none' }}
                    >
                        Back to Bundles
                    </Button>
                    
                    {loading ? (
                        <Box>
                            <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Skeleton variant="text" width="60%" height={80} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mt: 1 }} />
                        </Box>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box sx={{ p: 1, bgcolor: alpha(COLORS.accent, 0.2), borderRadius: 2, display: 'flex', border: `1px solid ${alpha(COLORS.accent, 0.5)}` }}>
                                    <Library size={24} color={COLORS.accent} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ color: COLORS.accent, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                                    Bundle View
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1, maxWidth: 800 }}>
                                {bundle?.name}
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                {bundle?.description || 'Access all premium mock tests included in this package.'}
                            </Typography>
                        </motion.div>
                    )}
                </Container>
                
                {/* Decorative Elements */}
                <Box sx={{ position: 'absolute', right: '-5%', top: '20%', opacity: 0.05, color: 'white', display: { xs: 'none', md: 'block' } }}>
                    <Library size={300} strokeWidth={1} />
                </Box>
            </Box>

            {/* Test Grid */}
            <Container maxWidth="xl" sx={{ mt: 6, pb: 10 }}>
                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4].map(i => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Skeleton variant="rounded" sx={{ borderRadius: 3, width: '100%', height: 320 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : tests.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, border: `1px dashed ${COLORS.border}` }}>
                        <Library size={48} color={COLORS.secondary} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700 }}>No tests in this bundle.</Typography>
                        <Typography variant="body2" sx={{ color: COLORS.secondary }}>This package currently has no assigned tests.</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {tests.map((test, index) => {
                            const attemptCount = attempts[test.id] || 0;
                            const isFirstAttempt = attemptCount === 0;
                            const hasAccess = isFirstAttempt || accessedTestIds.has(test.id) || test.price === 0;
                            const isPending = pendingTestIds.has(test.id);

                            return (
                                <Grid item xs={12} sm={6} md={3} key={test.id} sx={{ display: 'flex' }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{ width: '100%', display: 'flex' }}
                                    >
                                        <Card sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 4,
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                                            border: `1px solid ${COLORS.border}`,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-6px)',
                                                boxShadow: '0 15px 30px rgba(0,0,0,0.08)',
                                                borderColor: alpha(COLORS.accent, 0.3)
                                            }
                                        }}>
                                            <Box sx={{ p: 3, pb: 2, borderBottom: `1px dashed ${COLORS.border}`, position: 'relative' }}>
                                                {attemptCount > 0 && (
                                                    <Chip
                                                        label={`Attempted: ${attemptCount}`}
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute', top: 16, right: 16,
                                                            bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success,
                                                            fontWeight: 800, fontSize: '0.7rem'
                                                        }}
                                                        icon={<CheckCircle size={14} />}
                                                    />
                                                )}
                                                <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 800, letterSpacing: 0.5, mb: 1, display: 'block' }}>
                                                    {test.subject || 'Mock Test'}
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary, lineHeight: 1.3, mb: 1 }}>
                                                    {test.name}
                                                </Typography>
                                                
                                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.secondary }}>
                                                        <Clock size={14} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{test.duration} min</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: COLORS.secondary }}>
                                                        <Target size={14} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{test.questions?.length || 0} Qs</Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                            
                                            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1, bgcolor: '#fafafa' }}>
                                                <Typography variant="body2" sx={{ color: COLORS.secondary, mb: 3, flexGrow: 1, fontSize: '0.85rem' }}>
                                                    {test.description || 'Test your knowledge with this comprehensive mock exam.'}
                                                </Typography>
                                                
                                                <Button
                                                    fullWidth
                                                    variant={hasAccess ? "contained" : "outlined"}
                                                    onClick={() => handleStartTest(test.subject_id, test.id, test.price)}
                                                    disabled={isPending}
                                                    endIcon={!hasAccess && !isPending && <ChevronRight size={18} />}
                                                    sx={{
                                                        borderRadius: 2.5,
                                                        py: 1.2,
                                                        fontWeight: 800,
                                                        textTransform: 'none',
                                                        boxShadow: hasAccess ? `0 8px 16px ${alpha(COLORS.accent, 0.2)}` : 'none',
                                                        bgcolor: hasAccess ? COLORS.accent : 'transparent',
                                                        color: hasAccess ? 'white' : COLORS.primary,
                                                        borderColor: hasAccess ? 'transparent' : COLORS.border,
                                                        '&:hover': {
                                                            bgcolor: hasAccess ? COLORS.accentHover : alpha(COLORS.accent, 0.05),
                                                            borderColor: hasAccess ? 'transparent' : COLORS.accent,
                                                            color: hasAccess ? 'white' : COLORS.accent
                                                        }
                                                    }}
                                                >
                                                    {hasAccess
                                                        ? (attemptCount > 0 ? 'Retake Test' : 'Start Test')
                                                        : isPending
                                                            ? 'Access Pending'
                                                            : `Unlock (₹${test.price || 0})`}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>

            <Footer />
        </Box>
    );
};

export default MockTestBundleView;

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
    Clock, Target, Award, Play, Zap,
    ArrowLeft, CheckCircle, Library, Brain, Users, FlaskConical,
    BarChart3, Activity, Heart, BookOpen, Sparkles
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

const getSubjectIcon = (subjectName) => {
    const name = subjectName?.toLowerCase() || '';
    if (name.includes('psych')) return Brain;
    if (name.includes('socio')) return Users;
    if (name.includes('scien')) return FlaskConical;
    if (name.includes('math') || name.includes('stat')) return BarChart3;
    if (name.includes('hist') || name.includes('cultur')) return Library;
    if (name.includes('clini')) return Activity;
    if (name.includes('counsel')) return Heart;
    return BookOpen;
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
                pt: { xs: 4, md: 6 },
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
                            const SubjectIcon = getSubjectIcon(test.subject || test.name);

                            return (
                                <Grid item xs={12} sm={6} md={3} key={test.id} sx={{ display: 'flex', height: 380 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8, scale: 1.01 }}
                                        style={{ width: '100%', display: 'flex' }}
                                    >
                                        <Card sx={{
                                            width: '100%',
                                            height: 380,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 6,
                                            background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                            boxShadow: `0 15px 35px ${alpha(COLORS.accent, 0.2)}`,
                                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            color: 'white',
                                            border: `1px solid ${alpha('#ffffff', 0.2)}`,
                                            '&:hover': {
                                                boxShadow: `0 25px 50px ${alpha(COLORS.accent, 0.4)}`,
                                                '& .card-icon-bg': {
                                                    transform: 'scale(1.2) rotate(-15deg)',
                                                    opacity: 0.12
                                                }
                                            }
                                        }}>
                                            <CardContent sx={{ p: 2.5, flexGrow: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                                                {/* Decorative Icon */}
                                                <Box className="card-icon-bg" sx={{
                                                    position: 'absolute',
                                                    right: -10,
                                                    top: 15,
                                                    opacity: 0.08,
                                                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    pointerEvents: 'none',
                                                    zIndex: 0
                                                }}>
                                                    {React.createElement(SubjectIcon, { size: 130, color: 'white', strokeWidth: 1 })}
                                                </Box>

                                                <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
                                                    {/* Header Info */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            px: 1.2,
                                                            py: 0.4,
                                                            bgcolor: alpha('#ffffff', 0.15),
                                                            backdropFilter: 'blur(4px)',
                                                            borderRadius: 1.5,
                                                            border: `1px solid ${alpha('#ffffff', 0.2)}`
                                                        }}>
                                                            <Typography variant="overline" sx={{
                                                                color: 'white',
                                                                fontWeight: 900,
                                                                letterSpacing: 1.5,
                                                                fontSize: '0.6rem'
                                                            }}>
                                                                {(test.subject || 'Psychology').toUpperCase()}
                                                            </Typography>
                                                        </Box>

                                                        {attemptCount > 0 && (
                                                            <Chip
                                                                icon={<CheckCircle size={12} color="white" />}
                                                                label="SOLVED"
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: '#10b981',
                                                                    color: 'white',
                                                                    fontWeight: 900,
                                                                    fontSize: '0.55rem',
                                                                    height: 20,
                                                                    borderRadius: 1.5,
                                                                    '& .MuiChip-icon': { color: 'white' }
                                                                }}
                                                            />
                                                        )}
                                                    </Box>

                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 900,
                                                        lineHeight: 1.25,
                                                        minHeight: 44,
                                                        color: 'white',
                                                        fontSize: '1.05rem',
                                                        letterSpacing: '-0.01em',
                                                        textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'break-word',
                                                    }}>
                                                        {test.name}
                                                    </Typography>

                                                    {/* Compact Glass Stats Grid */}
                                                    <Box sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                                        gap: 1,
                                                        bgcolor: alpha('#000000', 0.1),
                                                        p: 1.5,
                                                        borderRadius: 3.5,
                                                        border: `1px solid ${alpha('#ffffff', 0.1)}`,
                                                    }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Target size={14} color="white" strokeWidth={2.5} />
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', fontSize: '0.75rem' }}>
                                                                {test.total_questions || test.questions?.length || 0} Qs
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Clock size={14} color="white" strokeWidth={2.5} />
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', fontSize: '0.75rem' }}>
                                                                {test.duration}m
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Award size={14} color="white" strokeWidth={2.5} />
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', fontSize: '0.75rem' }}>
                                                                {test.total_questions || test.questions?.length || 0} Mks
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Typography variant="caption" sx={{
                                                                fontWeight: 900,
                                                                fontSize: '0.75rem',
                                                                bgcolor: 'white',
                                                                color: COLORS.accent,
                                                                px: 0.8,
                                                                borderRadius: 1
                                                            }}>
                                                                {test.price === 0 ? 'FREE' : `₹${test.price}`}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
                                                        <Sparkles size={12} color="white" />
                                                        <Typography variant="caption" sx={{
                                                            fontWeight: 700,
                                                            color: 'white',
                                                            fontSize: '0.7rem',
                                                        }}>
                                                            Video Solutions Included
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>

                                            <Box sx={{ p: 2.5, pt: 0, position: 'relative', zIndex: 1 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleStartTest(test.subject_id, test.id, test.price)}
                                                    disabled={isPending}
                                                    startIcon={hasAccess ? <Play size={18} fill="currentColor" /> : isPending ? <Clock size={18} /> : <Zap size={18} />}
                                                    sx={{
                                                        bgcolor: 'white',
                                                        color: COLORS.accent,
                                                        fontWeight: 900,
                                                        borderRadius: 3.5,
                                                        textTransform: 'none',
                                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                                        py: 1.5,
                                                        fontSize: '0.9rem',
                                                        '&:hover': {
                                                            bgcolor: alpha('#ffffff', 0.9),
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                                                        },
                                                        '&:disabled': {
                                                            bgcolor: alpha('#ffffff', 0.4),
                                                            color: alpha(COLORS.accent, 0.4)
                                                        },
                                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                >
                                                    {hasAccess
                                                        ? (attemptCount > 0 ? 'Re-Attempt' : 'Start Preparation')
                                                        : isPending
                                                            ? 'Processing...'
                                                            : (isFirstAttempt ? 'Try Free' : `Unlock - ₹${test.price || 0}`)}
                                                </Button>
                                            </Box>
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

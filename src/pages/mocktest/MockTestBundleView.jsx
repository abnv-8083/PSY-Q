import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Skeleton, alpha, Grid
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
import Loader from '../../components/Loader';

import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';
import { COLORS, FONTS, getSubjectIcon } from '../../theme/mocktestTheme';

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

                const bundleData = await fetchBundleById(bundleId);
                if (!bundleData) {
                    navigate('/academic/mocktest/bundles');
                    return;
                }
                setBundle(bundleData);

                const testsResult = await fetchTests();
                const allTestsData = testsResult.data || testsResult;
                const bundleTestIds = new Set((bundleData.tests || []).map(t => typeof t === 'object' ? (t.id || t._id) : t));
                const filteredTests = (allTestsData || [])
                    .filter(test => bundleTestIds.has(test._id || test.id))
                    .map(test => ({ ...test, id: test._id || test.id }))
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

                setTests(filteredTests);

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
            navigate('/student/signin', { state: { from: `/academic/mocktest/bundles/${bundleId}` } });
            return;
        }

        const test = tests.find(t => t.id === testId);
        const userAttempts = attempts[testId] || 0;
        const hasFreeTrialAccess = test?.is_free_trial && userAttempts < (test?.free_trial_limit || 1);
        const hasBundleAccess = bundle && (accessedTestIds.has(bundle._id) || accessedTestIds.has(bundle.id));
        const isBundlePending = bundle && (pendingTestIds.has(bundle._id) || pendingTestIds.has(bundle.id));
        const hasAccess = hasFreeTrialAccess || accessedTestIds.has(testId) || hasBundleAccess || price === 0;

        if (hasAccess) {
            const sId = subjectId || 'bundle';
            navigate(`/academic/mocktest/${sId}/${testId}/rules`);
        } else if (pendingTestIds.has(testId) || isBundlePending) {
            return;
        } else {
            navigate('/academic/mocktest/checkout', {
                state: {
                    type: 'bundle',
                    bundleId: bundle._id || bundle.id,
                    name: bundle.name || 'Mock Test Bundle',
                    price: bundle.price
                }
            });
        }
    };

    if (loading || sessionLoading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
                <MockTestNavbar />
                <Loader fullScreen text="Loading Bundle..." />
            </Box>
        );
    }

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
                </Container>

                {/* Decorative Elements */}
                <Box sx={{ position: 'absolute', right: '-5%', top: '20%', opacity: 0.05, color: 'white', display: { xs: 'none', md: 'block' } }}>
                    <Library size={300} strokeWidth={1} />
                </Box>
            </Box>

            {/* Test Cards */}
            <Container maxWidth="xl" sx={{ mt: 6, pb: 10 }}>
                {tests.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, border: `1px dashed ${COLORS.border}` }}>
                        <Library size={48} color={COLORS.secondary} style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700 }}>No tests in this bundle.</Typography>
                        <Typography variant="body2" sx={{ color: COLORS.secondary }}>This package currently has no assigned tests.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                        {tests.map((test, index) => {
                            const attemptCount = attempts[test.id] || 0;
                            const hasFreeTrialAccess = test.is_free_trial && attemptCount < (test.free_trial_limit || 1);
                            const hasBundleAccess = bundle && (accessedTestIds.has(bundle._id) || accessedTestIds.has(bundle.id));
                            const hasAccess = hasFreeTrialAccess || accessedTestIds.has(test.id) || hasBundleAccess || test.price === 0;
                            const isBundlePending = bundle && (pendingTestIds.has(bundle._id) || pendingTestIds.has(bundle.id));
                            const isPending = pendingTestIds.has(test.id) || isBundlePending;
                            const SubjectIcon = getSubjectIcon(test.subject || test.name);

                            return (
                                <Box key={test.id} sx={{
                                    width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
                                    minWidth: 240,
                                    maxWidth: { xs: '100%', sm: 'none' }
                                }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8, scale: 1.01 }}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <Card sx={{
                                            height: '100%', minHeight: 320, display: 'flex', flexDirection: 'column',
                                            borderRadius: 5,
                                            background: `linear-gradient(160deg, ${COLORS.accent} 0%, #a8174e 50%, #7c1242 100%)`,
                                            boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.25)}`,
                                            position: 'relative', overflow: 'hidden', color: 'white', border: 'none',
                                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                            '&:hover': {
                                                boxShadow: `0 20px 50px ${alpha(COLORS.accent, 0.45)}`,
                                                '& .card-deco': { transform: 'scale(1.15) rotate(-10deg)', opacity: 0.1 }
                                            }
                                        }}>
                                            <Box className="card-deco" sx={{
                                                position: 'absolute', right: -30, top: -30, width: 140, height: 140,
                                                borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)',
                                                transition: 'all 0.6s ease', pointerEvents: 'none'
                                            }} />
                                            <Box className="card-deco" sx={{
                                                position: 'absolute', right: 20, bottom: -20, width: 80, height: 80,
                                                borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)',
                                                transition: 'all 0.6s ease', pointerEvents: 'none'
                                            }} />

                                            <CardContent sx={{ p: 2.5, pb: 1.5, flexGrow: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box sx={{
                                                        width: 44, height: 44, borderRadius: '14px',
                                                        bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: '1px solid rgba(255,255,255,0.15)'
                                                    }}>
                                                        {React.createElement(SubjectIcon, { size: 22, color: 'white', strokeWidth: 2 })}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                                                        {test.year && (
                                                            <Box sx={{
                                                                px: 1.5, py: 0.5, borderRadius: '10px',
                                                                bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                                                border: '1px solid rgba(255,255,255,0.2)'
                                                            }}>
                                                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1 }}>{test.year}</Typography>
                                                            </Box>
                                                        )}
                                                        {attemptCount > 0 && (
                                                            <Box sx={{
                                                                px: 1.2, py: 0.5, borderRadius: '10px',
                                                                bgcolor: '#10b981', display: 'flex', alignItems: 'center', gap: 0.4
                                                            }}>
                                                                <CheckCircle size={11} color="white" />
                                                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.5 }}>DONE</Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>

                                                <Typography variant="h6" sx={{
                                                    fontWeight: 800, lineHeight: 1.2, fontSize: '1.15rem',
                                                    mb: 0.5, letterSpacing: '-0.01em'
                                                }}>
                                                    {test.name}
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                                                    mb: 2.5, textTransform: 'uppercase', letterSpacing: 0.5
                                                }}>
                                                    {test.subject || 'Psychology'} · Paper 2
                                                </Typography>

                                                <Box sx={{ flexGrow: 1 }} />

                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    {[
                                                        { icon: <Target size={13} />, label: 'Qs', value: test.total_questions || test.questions?.length || 0 },
                                                        { icon: <Clock size={13} />, label: 'Min', value: test.duration || 0 },
                                                        { icon: <Award size={13} />, label: 'Mks', value: (test.total_questions || test.questions?.length || 0) * 2 },
                                                    ].map((stat, i) => (
                                                        <Box key={i} sx={{
                                                            flex: 1, py: 1, px: 0.8, borderRadius: 2,
                                                            bgcolor: 'rgba(255,255,255,0.08)', textAlign: 'center',
                                                            border: '1px solid rgba(255,255,255,0.06)'
                                                        }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mb: 0.3 }}>
                                                                <Box sx={{ color: 'rgba(255,255,255,0.6)' }}>{stat.icon}</Box>
                                                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                                                                    {stat.label}
                                                                </Typography>
                                                            </Box>
                                                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </CardContent>

                                            <Box sx={{ p: 2.5, pt: 0, position: 'relative', zIndex: 1 }}>
                                                <Button
                                                    fullWidth variant="contained"
                                                    onClick={() => handleStartTest(test.subject_id, test.id, test.price)}
                                                    disabled={isPending}
                                                    startIcon={hasAccess ? <Play size={16} fill="currentColor" /> : isPending ? <Clock size={16} /> : <Zap size={16} />}
                                                    sx={{
                                                        bgcolor: 'white', color: COLORS.accent, fontWeight: 800,
                                                        borderRadius: 2.5, textTransform: 'none', py: 1.3,
                                                        fontSize: '0.85rem', boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', transform: 'translateY(-1px)' },
                                                        '&:disabled': { bgcolor: 'rgba(255,255,255,0.4)', color: alpha(COLORS.accent, 0.4) },
                                                        transition: 'all 0.25s'
                                                    }}
                                                >
                                                    {hasAccess
                                                        ? (attemptCount > 0 ? 'Re-Attempt' : 'Start Preparation')
                                                        : isPending ? 'Processing...' : (hasFreeTrialAccess ? 'Try Free' : 'Unlock Access')}
                                                </Button>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Container>

            <Footer />
        </Box>
    );
};

export default MockTestBundleView;

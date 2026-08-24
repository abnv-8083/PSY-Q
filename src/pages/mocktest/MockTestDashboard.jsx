// v1.0.1 - Triggering fresh deployment to sync with deduplicated database
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha, IconButton, Avatar, Menu, MenuItem, Divider,
    TextField, InputAdornment
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchSubjects } from '../../api/subjectsApi';
import { fetchTests, fetchUserAttempts, fetchUserAccess } from '../../api/testsApi';
import { fetchBundles } from '../../api/bundlesApi';
import { fetchUserPurchaseRequests } from '../../api/purchaseRequestsApi';
import {
    BookOpen, Clock, ChevronRight, Target, Play, Calendar,
    User, LogOut, CheckCircle, ArrowRight, Award, Zap, Search, X, Sparkles,
    Brain, Users, FlaskConical, BarChart3, Library, Activity, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';
import Loader from '../../components/Loader';

import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';
import { COLORS, FONTS, getSubjectIcon } from '../../theme/mocktestTheme';

const MockTestDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [attempts, setAttempts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedYear, setSelectedYear] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { user, loading: sessionLoading } = useSession();
    const [accessedTestIds, setAccessedTestIds] = useState(new Set());
    const [pendingTestIds, setPendingTestIds] = useState(new Set());
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchData = async (userId) => {
            try {
                // Fetch Subjects and Tests via API
                const [subjectsData, allTestsData, bundlesData] = await Promise.all([
                    fetchSubjects(),
                    fetchTests(),
                    fetchBundles()
                ]);

                // Map tests to subjects
                const subjectsWithTests = subjectsData.map(subject => ({
                    ...subject,
                    id: subject._id || subject.id,
                    tests: (allTestsData || [])
                        .filter(test => {
                            const subjectName = subject.name?.toLowerCase().trim();
                            const testSubject = test.subject?.toLowerCase().trim();
                            const matchesSubject = testSubject === subjectName ||
                                test.subject_id === (subject._id || subject.id);
                            const isPublished = test.is_published !== false && test.is_active !== false;
                            return matchesSubject && isPublished;
                        })
                        .map(test => ({ ...test, id: test._id || test.id }))
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                }));

                setSubjects(subjectsWithTests);

                // Set first subject as default
                if (subjectsWithTests.length > 0 && !selectedSubject) {
                    setSelectedSubject(subjectsWithTests[0].id);
                }

                // Fetch User Attempts & Access
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

                    const baseAccessIds = new Set(accessIdsArr || []);
                    const allAccessIds = new Set(baseAccessIds);
                    
                    const basePendingIds = new Set();
                    if (pendingReqs) {
                        pendingReqs.forEach(r => {
                            if (r.status === 'pending') basePendingIds.add(r.item_id);
                        });
                    }
                    const allPendingIds = new Set(basePendingIds);

                    // Add tests from owned/pending bundles
                    bundlesData?.forEach(bundle => {
                        const bId = bundle._id || bundle.id;
                        if (baseAccessIds.has(bId)) {
                            bundle.tests?.forEach(t => allAccessIds.add(t._id || t.id));
                        }
                        if (basePendingIds.has(bId)) {
                            bundle.tests?.forEach(t => allPendingIds.add(t._id || t.id));
                        }
                    });

                    setAccessedTestIds(allAccessIds);
                    setPendingTestIds(allPendingIds);
                }

                // Remove bundle fetching since we have a dedicated page now
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!sessionLoading) {
            fetchData(user?._id || user?.id);
        }
    }, [user, sessionLoading, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);



    const handleStartTest = (subjectId, testId, price) => {
        if (!user) {
            // Unauthenticated: redirect to login with return URL
            navigate('/student/signin', { state: { from: '/academic/mocktest/dashboard' } });
            return;
        }

        // --- FREE TRIAL POLICY ---
        const test = currentSubject?.tests?.find(t => t.id === testId);
        const userAttempts = attempts[testId] || 0;
        const hasFreeTrialAccess = test?.is_free_trial && userAttempts < (test?.free_trial_limit || 1);

        // Check if user has access
        const hasAccess = hasFreeTrialAccess || accessedTestIds.has(testId) || price === 0;

        if (hasAccess) {
            navigate(`/academic/mocktest/${subjectId}/${testId}/rules`);
        } else if (pendingTestIds.has(testId)) {
            // Already pending, do nothing or show a small toast, but button is disabled anyway
            return;
        } else {
            navigate('/academic/mocktest/bundles');
        }
    };

    const currentSubject = subjects.find(s => s.id === selectedSubject);

    // Extract unique years from tests
    const years = ['All', ...new Set(currentSubject?.tests?.map(t => t.year).filter(Boolean).sort((a, b) => b - a))];

    // Filter tests by year and search query
    const displayTests = (currentSubject?.tests || []).filter(t => {
        const matchesYear = selectedYear === 'All' || t.year === selectedYear;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesYear && matchesSearch;
    });

    if (loading || sessionLoading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
                <MockTestNavbar />

                {/* Hero skeleton */}
                <Box sx={{ bgcolor: COLORS.primary, color: 'white', pt: { xs: 4, md: 6 }, pb: { xs: 10, md: 12 }, position: 'relative', overflow: 'hidden' }}>
                    <Container maxWidth="lg">
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Skeleton variant="text" width={280} height={52} sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, mb: 1 }} />
                                <Skeleton variant="text" width={400} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 1 }} />
                            </Box>
                            <Skeleton variant="rounded" width={180} height={80} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
                        </Stack>
                    </Container>
                </Box>

                {/* Filter bar + cards skeleton */}
                <Container maxWidth="xl" sx={{ mt: -6, pb: 10, position: 'relative', zIndex: 1 }}>
                    {/* Search + subject filter skeleton */}
                    <Paper sx={{ mb: 5, borderRadius: 4, p: 2, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Skeleton variant="rounded" width={300} height={40} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.primary, 0.05) }} />
                            <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.08) }} />
                            <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.05) }} />
                            <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.05) }} />
                        </Box>
                    </Paper>

                    {/* Test card skeletons */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', px: { xs: 2, md: 4, lg: 8 } }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Box key={i} sx={{ width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.333% - 24px)' }, minWidth: 280 }}>
                                <Card sx={{
                                    height: '100%', minHeight: 320, borderRadius: 6,
                                    border: `1px solid ${COLORS.border}`, background: 'white',
                                    overflow: 'hidden', position: 'relative',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                                }}>
                                    {/* Shimmer */}
                                    <Box sx={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                                        animation: 'shimmer 1.8s ease-in-out infinite',
                                        '@keyframes shimmer': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
                                        zIndex: 1
                                    }} />
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: 1.5, bgcolor: alpha(COLORS.accent, 0.08) }} />
                                                <Skeleton variant="rounded" width={55} height={20} sx={{ borderRadius: 1.5, bgcolor: alpha(COLORS.success, 0.1) }} />
                                            </Box>
                                            <Skeleton variant="text" width="80%" height={26} sx={{ borderRadius: 1, bgcolor: alpha(COLORS.primary, 0.08) }} />
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                                                {[1, 2, 3].map(j => (
                                                    <Skeleton key={j} variant="rounded" width="100%" height={32} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.05) }} />
                                                ))}
                                            </Box>
                                            <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.accent, 0.08) }} />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Container>

                <Footer />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Sub-Header / Hero area for Dashboard */}
            <Box sx={{
                bgcolor: COLORS.primary,
                color: 'white',
                pt: { xs: 4, md: 6 }, // Adjusted for single navbar
                pb: { xs: 10, md: 12 },
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>
                                    Practice <Box component="span" sx={{ color: COLORS.accent }}>Tests</Box>
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, maxWidth: 600 }}>
                                    Boost your preparation with our curated test series. Select a subject below to view available mock exams.
                                </Typography>
                            </Box>
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                <Paper className="glass-card" sx={{
                                    p: 2.5,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.accent }}>{subjects.length}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>SUBJECTS</Typography>
                                    </Box>
                                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>{Object.keys(attempts).length}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>COMPLETED</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Stack>
                    </motion.div>
                </Container>

                {/* Decorative elements */}
                <Box sx={{
                    position: 'absolute', right: '-5%', top: '20%', opacity: 0.1, color: COLORS.accent,
                    display: { xs: 'none', md: 'block' }
                }}>
                    <Target size={300} strokeWidth={1} />
                </Box>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ mt: -6, pb: 10, position: 'relative', zIndex: 1 }}>
                {/* Unified Filter Navbar */}
                <Paper sx={{
                    mb: 5,
                    borderRadius: 4,
                    p: 2,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        alignItems: { xs: 'stretch', md: 'center' }
                    }}>
                        {/* Search Bar */}
                        <TextField
                            placeholder="Search tests..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} color={COLORS.secondary} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <X size={16} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 3,
                                    bgcolor: '#f8fafc',
                                    '& fieldset': { borderColor: COLORS.border },
                                    '&:hover fieldset': { borderColor: COLORS.accent },
                                    '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: 2 }
                                }
                            }}
                            sx={{ flexGrow: 1, maxWidth: { md: 300 } }}
                        />

                        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 1 }} />

                        {/* Subject Selector */}
                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            overflowX: 'auto',
                            pb: { xs: 1, md: 0 },
                            '&::-webkit-scrollbar': { display: 'none' },
                            flexGrow: 1
                        }}>
                            {subjects.map((subject) => (
                                <Button
                                    key={subject.id}
                                        onClick={() => {
                                            setSelectedSubject(subject.id);
                                            setSelectedYear('All'); // Reset year when subject changes
                                        }}
                                        variant={selectedSubject === subject.id ? "contained" : "text"}
                                        sx={{
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                            bgcolor: selectedSubject === subject.id ? COLORS.accent : 'transparent',
                                            color: selectedSubject === subject.id ? 'white' : COLORS.secondary,
                                            '&:hover': {
                                                bgcolor: selectedSubject === subject.id ? COLORS.accentHover : alpha(COLORS.accent, 0.05),
                                                color: selectedSubject === subject.id ? 'white' : COLORS.accent
                                            }
                                        }}
                                    >
                                        {subject.name}
                                    </Button>
                                ))
                            }
                        </Box>
                    </Box>

                    {/* Year Filter Chips */}
                    {years.length > 1 && (
                        <>
                            <Divider sx={{ my: 0.5 }} />
                            <Box sx={{
                                display: 'flex',
                                gap: 1,
                                overflowX: 'auto',
                                pb: 1,
                                '&::-webkit-scrollbar': { display: 'none' }
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.secondary, mr: 1, alignSelf: 'center' }}>
                                    Years:
                                </Typography>
                                {years.map((year) => (
                                    <Chip
                                        key={year}
                                        label={year === 'All' ? 'All Years' : year}
                                        onClick={() => setSelectedYear(year)}
                                        sx={{
                                            px: 1,
                                            fontWeight: 700,
                                            bgcolor: selectedYear === year ? COLORS.accent : 'white',
                                            color: selectedYear === year ? 'white' : COLORS.secondary,
                                            border: `1px solid ${selectedYear === year ? COLORS.accent : COLORS.border}`,
                                            borderRadius: 2,
                                            height: 32,
                                            '&:hover': {
                                                bgcolor: selectedYear === year ? COLORS.accentHover : alpha(COLORS.accent, 0.05),
                                            },
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </Paper>

                {!currentSubject ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h6" sx={{ color: COLORS.textLight }}>No tests available.</Typography>
                    </Box>
                ) : displayTests.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        py: 8,
                        bgcolor: 'white',
                        borderRadius: 4,
                        border: `1px dashed ${COLORS.border}`
                    }}>
                        <Box sx={{ mb: 2, opacity: 0.5 }}>
                            <Search size={48} color={COLORS.secondary} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                            {searchQuery ? `No tests found matching "${searchQuery}"` : "No tests found for this selection"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.secondary, mb: 3 }}>
                            Try adjusting your search or filters to find what you're looking for.
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedYear('All');
                            }}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 700,
                                borderColor: COLORS.accent,
                                color: COLORS.accent,
                                '&:hover': { borderColor: COLORS.accentHover, bgcolor: alpha(COLORS.accent, 0.05) }
                            }}
                        >
                            Clear all filters
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', px: { xs: 2, md: 4, lg: 8 } }}>
                        <AnimatePresence>
                            {displayTests.map((test, index) => (
                                <Box key={test.id} sx={{
                                    width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.333% - 24px)' },
                                    minWidth: 280,
                                    maxWidth: { xs: '100%', sm: 'none' }
                                }}>
                                    <motion.div
                                        initial={{ opacity: 0, s: 0.9, y: 20 }}
                                        animate={{ opacity: 1, s: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8, scale: 1.01 }}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <Card sx={{
                                            height: '100%', minHeight: 320, borderRadius: 5,
                                            background: `linear-gradient(160deg, ${COLORS.accent} 0%, #a8174e 50%, #7c1242 100%)`,
                                            boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.25)}`,
                                            display: 'flex', flexDirection: 'column', position: 'relative',
                                            overflow: 'hidden', color: 'white', border: 'none',
                                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                            '&:hover': {
                                                boxShadow: `0 20px 50px ${alpha(COLORS.accent, 0.45)}`,
                                                '& .card-deco': { transform: 'scale(1.15) rotate(-10deg)', opacity: 0.1 }
                                            }
                                        }}>
                                            {/* Decorative circles */}
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
                                                {/* Top row: icon + badges */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box sx={{
                                                        width: 44, height: 44, borderRadius: '14px',
                                                        bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: '1px solid rgba(255,255,255,0.15)'
                                                    }}>
                                                        {React.createElement(getSubjectIcon(currentSubject.name), { size: 22, color: 'white', strokeWidth: 2 })}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.8 }}>
                                                        {test.year && (
                                                            <Box sx={{
                                                                px: 1.5, py: 0.5, borderRadius: '10px',
                                                                bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                                                border: '1px solid rgba(255,255,255,0.2)'
                                                            }}>
                                                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 1 }}>
                                                                    {test.year}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {attempts[test.id] > 0 && (
                                                            <Box sx={{
                                                                px: 1.2, py: 0.5, borderRadius: '10px',
                                                                bgcolor: '#10b981',
                                                                display: 'flex', alignItems: 'center', gap: 0.4
                                                            }}>
                                                                <CheckCircle size={11} color="white" />
                                                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.5 }}>
                                                                    DONE
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Test name */}
                                                <Typography variant="h6" sx={{
                                                    fontWeight: 800, lineHeight: 1.2, fontSize: '1.15rem',
                                                    mb: 0.5, letterSpacing: '-0.01em'
                                                }}>
                                                    {test.name}
                                                </Typography>

                                                <Typography sx={{
                                                    fontSize: '0.72rem', fontWeight: 600,
                                                    color: 'rgba(255,255,255,0.6)', mb: 2.5,
                                                    textTransform: 'uppercase', letterSpacing: 0.5
                                                }}>
                                                    {currentSubject.name} · Paper 2
                                                </Typography>

                                                <Box sx={{ flexGrow: 1 }} />

                                                {/* Stats row */}
                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    {[
                                                        { icon: <Target size={13} />, label: 'Qs', value: test.total_questions || 0 },
                                                        { icon: <Clock size={13} />, label: 'Min', value: test.duration || 0 },
                                                        { icon: <Award size={13} />, label: 'Mks', value: (test.total_questions || 0) * 2 },
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
                                                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1 }}>
                                                                {stat.value}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </CardContent>

                                            <Box sx={{ p: 2.5, pt: 0, position: 'relative', zIndex: 1 }}>
                                                <Button
                                                    fullWidth variant="contained"
                                                    onClick={() => handleStartTest(test.subject_id || currentSubject?.id, test.id, test.price)}
                                                    disabled={pendingTestIds.has(test.id)}
                                                    startIcon={accessedTestIds.has(test.id) ? <Play size={16} fill="currentColor" /> : pendingTestIds.has(test.id) ? <Clock size={16} /> : <Zap size={16} />}
                                                    sx={{
                                                        bgcolor: 'white', color: COLORS.accent, fontWeight: 800,
                                                        borderRadius: 2.5, textTransform: 'none', py: 1.3,
                                                        fontSize: '0.85rem', boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', transform: 'translateY(-1px)' },
                                                        '&:disabled': { bgcolor: 'rgba(255,255,255,0.4)', color: alpha(COLORS.accent, 0.4) },
                                                        transition: 'all 0.25s'
                                                    }}
                                                >
                                                    {accessedTestIds.has(test.id)
                                                        ? (attempts[test.id] > 0 ? 'Re-Attempt' : 'Start Preparation')
                                                        : (pendingTestIds.has(test.id)
                                                            ? 'Processing...'
                                                            : (test.is_free_trial ? 'Try Free' : (test.price > 0 ? 'Unlock Access' : 'Access Now')))}
                                                </Button>
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Box>
                            ))}
                        </AnimatePresence>
                    </Box>
                )
                }
            </Container >

            <Footer />
        </Box >
    );
};

export default MockTestDashboard;

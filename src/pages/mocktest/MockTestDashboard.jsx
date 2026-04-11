import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha, IconButton, Avatar, Menu, MenuItem, Divider,
    TextField, InputAdornment
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchSubjects } from '../../api/subjectsApi';
import { fetchTests, fetchUserAttempts, fetchUserAccess } from '../../api/testsApi';
import { fetchBundleById } from '../../api/bundlesApi';
import { fetchUserPurchaseRequests } from '../../api/purchaseRequestsApi';
import {
    BookOpen, Clock, ChevronRight, Target, Play, Calendar,
    User, LogOut, CheckCircle, ArrowRight, Award, Zap, Search, X, Sparkles,
    Brain, Users, FlaskConical, BarChart3, Library, Activity, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';

import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';

// --- Constants (Shared with MockTestHome) ---
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

const MockTestDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [attempts, setAttempts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedYear, setSelectedYear] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { user, loading: sessionLoading } = useSession();
    const [activeBundle, setActiveBundle] = useState(null);
    const [bundleTests, setBundleTests] = useState(new Set());
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
                const [subjectsData, allTestsData] = await Promise.all([
                    fetchSubjects(),
                    fetchTests()
                ]);

                // Map tests to subjects
                const subjectsWithTests = subjectsData.map(subject => ({
                    ...subject,
                    id: subject._id || subject.id,
                    tests: (allTestsData || [])
                        .filter(test => (test.subject_id === (subject._id || subject.id)) && test.is_published !== false)
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

                    setAccessedTestIds(new Set(accessIdsArr || []));
                    
                    if (pendingReqs) {
                        const pendingIds = pendingReqs
                            .filter(r => r.status === 'pending')
                            .map(r => r.item_id);
                        setPendingTestIds(new Set(pendingIds));
                    }
                }

                // --- Fetch Bundle Specific Data if applicable ---
                const bundleId = location.state?.bundleId;
                if (bundleId) {
                    const bundleData = await fetchBundleById(bundleId);
                    if (bundleData) {
                        setActiveBundle(bundleData);
                        setBundleTests(new Set(bundleData.tests || []));
                    }
                }

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
    }, [user, sessionLoading, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);



    const handleStartTest = (subjectId, testId, price) => {
        if (!user) {
            // Unauthenticated: redirect to login
            navigate('/student/signin', { state: { from: location } });
            return;
        }

        // --- FREE TRIAL POLICY ---
        // First attempt of any test is free.
        const isFirstAttempt = !attempts[testId] || attempts[testId] === 0;

        // Check if user has access
        const hasAccess = isFirstAttempt || accessedTestIds.has(testId) || price === 0;


        if (hasAccess) {
            navigate(`/academic/mocktest/${subjectId}/${testId}/rules`);
        } else if (pendingTestIds.has(testId)) {
            // Already pending, do nothing or show a small toast, but button is disabled anyway
            return;
        } else {
            navigate('/academic/mocktest/checkout', {
                state: {
                    type: 'test',
                    testId: testId,
                    name: currentSubject?.tests?.find(t => t.id === testId)?.name || 'Mock Test',
                    price: price
                }
            });
        }
    };

    const currentSubject = subjects.find(s => s.id === selectedSubject);

    // Extract unique years from tests
    const years = ['All', ...new Set(currentSubject?.tests?.map(t => t.year).filter(Boolean).sort((a, b) => b - a))];

    // Filter tests by year and search query
    const displayTests = (activeBundle
        ? subjects.flatMap(s => s.tests).filter(t => bundleTests.has(t.id))
        : currentSubject?.tests || []
    ).filter(t => {
        const matchesYear = selectedYear === 'All' || t.year === selectedYear;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesYear && matchesSearch;
    });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Sub-Header / Hero area for Dashboard */}
            <Box sx={{
                bgcolor: COLORS.primary,
                color: 'white',
                pt: { xs: 8, sm: 10, md: 12 }, // Adjusted for single navbar
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
                    {activeBundle && (
                        <Box sx={{
                            mb: 2,
                            p: 2,
                            bgcolor: alpha(COLORS.accent, 0.05),
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: `1px solid ${alpha(COLORS.accent, 0.1)}`
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, bgcolor: COLORS.accent, borderRadius: 1.5, display: 'flex' }}>
                                    <Zap size={20} color="white" />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: COLORS.accent, fontWeight: 800, fontSize: '0.75rem', letterSpacing: 1 }}>
                                        ACTIVE BUNDLE VIEW
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 900, lineHeight: 1.2 }}>
                                        {activeBundle.name}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                size="small"
                                startIcon={<X size={16} />}
                                onClick={() => {
                                    setActiveBundle(null);
                                    setBundleTests(new Set());
                                    // Also clear location state if possible, though not strictly necessary since states are local
                                    navigate(location.pathname, { replace: true, state: {} });
                                }}
                                sx={{
                                    color: COLORS.secondary,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: alpha(COLORS.secondary, 0.05) }
                                }}
                            >
                                Clear Filter
                            </Button>
                        </Box>
                    )}
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
                            {loading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" width={120} height={40} sx={{ borderRadius: 2 }} />)
                            ) : activeBundle ? null : (
                                subjects.map((subject) => (
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
                            )}
                        </Box>
                    </Box>

                    {/* Year Filter Chips */}
                    {!loading && years.length > 1 && (
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

                {loading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Skeleton variant="rounded" sx={{ borderRadius: 3, width: '100%', height: 320 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : !currentSubject ? (
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
                                            height: '100%',
                                            minHeight: 320,
                                            borderRadius: 6,
                                            background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                                            boxShadow: `0 15px 35px ${alpha(COLORS.accent, 0.2)}`,
                                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            display: 'flex',
                                            flexDirection: 'column',
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
                                            <CardContent sx={{ p: 2.5, flexGrow: 1, position: 'relative', zIndex: 1 }}>
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
                                                    {React.createElement(getSubjectIcon(currentSubject.name), {
                                                        size: 130,
                                                        color: 'white',
                                                        strokeWidth: 1
                                                    })}
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
                                                                {currentSubject.name.toUpperCase()}
                                                            </Typography>
                                                        </Box>

                                                        {attempts[test.id] > 0 && (
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
                                                        lineHeight: 1.2,
                                                        minHeight: 48,
                                                        color: 'white',
                                                        fontSize: '1.15rem',
                                                        letterSpacing: '-0.01em',
                                                        textShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
                                                                {test.total_questions || 0} Qs
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
                                                                {test.total_questions || 0} Mks
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
                                                    onClick={() => handleStartTest(test.subject_id || currentSubject?.id, test.id, test.price)}
                                                    disabled={pendingTestIds.has(test.id)}
                                                    startIcon={(accessedTestIds.has(test.id) || (!attempts[test.id] || attempts[test.id] === 0)) ? <Play size={18} fill="currentColor" /> : pendingTestIds.has(test.id) ? <Clock size={18} /> : <Zap size={18} />}
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
                                                    {accessedTestIds.has(test.id)
                                                        ? (attempts[test.id] > 0 ? 'Re-Attempt' : 'Start Preparation')
                                                        : (pendingTestIds.has(test.id)
                                                            ? 'Processing...'
                                                            : ((!attempts[test.id] || attempts[test.id] === 0) 
                                                                ? 'Try Free'
                                                                : (test.price > 0 ? `Unlock - ₹${test.price}` : 'Access Now')))}
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

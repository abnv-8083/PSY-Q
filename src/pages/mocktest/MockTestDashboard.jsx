import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha, IconButton, Avatar, Menu, MenuItem, Divider,
    TextField, InputAdornment
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    BookOpen, Clock, ChevronRight, Target, Play, Calendar,
    User, LogOut, CheckCircle, ArrowRight, Award, Zap, Search, X
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
    success: '#10b981'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const MockTestDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [attempts, setAttempts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedYear, setSelectedYear] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const { user, loading: sessionLoading } = useSession();
    const [accessedTestIds, setAccessedTestIds] = useState(new Set());
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchData = async (userId) => {
            try {
                // Fetch Subjects
                const { data: subjectsData, error: subError } = await supabase
                    .from('subjects')
                    .select('*')
                    .order('name');

                if (subError) throw subError;

                // Fetch Tests for all subjects
                const { data: testsData, error: testsError } = await supabase
                    .from('tests')
                    .select('*, questions(count)');

                // Sort and filter in Javascript as a fallback
                const filteredTests = (testsData || []).filter(t => t.is_published !== false);
                const sortedTests = [...filteredTests].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

                if (testsError) throw testsError;

                // Map tests to subjects
                const subjectsWithTests = subjectsData.map(subject => ({
                    ...subject,
                    tests: sortedTests.filter(test => test.subject_id === subject.id)
                }));

                setSubjects(subjectsWithTests);

                // Set first subject as default
                if (subjectsWithTests.length > 0 && !selectedSubject) {
                    setSelectedSubject(subjectsWithTests[0].id);
                }

                // Fetch User Attempts
                if (userId) {
                    const { data: attemptData, error: attemptError } = await supabase
                        .from('attempts')
                        .select('test_id')
                        .eq('user_id', userId);

                    if (attemptError) throw attemptError;

                    const attemptMap = {};
                    attemptData?.forEach(attempt => {
                        attemptMap[attempt.test_id] = (attemptMap[attempt.test_id] || 0) + 1;
                    });
                    setAttempts(attemptMap);
                }

                // --- Fetch User Access ---
                if (userId) {
                    const accessIds = new Set();
                    const { data: userBundles, error: bundleError } = await supabase
                        .from('user_bundles')
                        .select('bundle_id, bundles(bundle_tests(test_id))')
                        .eq('user_id', userId);

                    if (!bundleError && userBundles) {
                        userBundles.forEach(ub => {
                            ub.bundles?.bundle_tests?.forEach(bt => {
                                if (bt.test_id) accessIds.add(bt.test_id);
                            });
                        });
                    }

                    const { data: payments, error: paymentError } = await supabase
                        .from('payments')
                        .select('item_id')
                        .eq('user_id', userId)
                        .eq('status', 'success')
                        .eq('type', 'test');

                    if (!paymentError && payments) {
                        payments.forEach(p => {
                            if (p.item_id) accessIds.add(p.item_id);
                        });
                    }

                    setAccessedTestIds(accessIds);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!sessionLoading) {
            fetchData(user?.id);
        }
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
        } else {
            // Placeholder for payment integration
            alert(`Please purchase this test for ₹${price} to access it.`);
            // initiateRazorpayPayment(...) // TODO: Integrate logic
        }
    };

    const currentSubject = subjects.find(s => s.id === selectedSubject);

    // Extract unique years from tests
    const years = ['All', ...new Set(currentSubject?.tests?.map(t => t.year).filter(Boolean).sort((a, b) => b - a))];

    // Filter tests by year and search query
    const displayTests = currentSubject?.tests?.filter(t => {
        const matchesYear = selectedYear === 'All' || t.year === selectedYear;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesYear && matchesSearch;
    }) || [];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Sub-Header / Hero area for Dashboard */}
            <Box sx={{
                bgcolor: COLORS.primary,
                color: 'white',
                pt: { xs: 4, md: 6 },
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
                    gap: 2
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
                            {loading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" width={120} height={40} sx={{ borderRadius: 2 }} />)
                            ) : (
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
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8 }}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <Card sx={{
                                            height: '100%',
                                            minHeight: 320,
                                            borderRadius: 3,
                                            border: `1px solid ${COLORS.border}`,
                                            boxShadow: 'none',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                                                borderColor: COLORS.accent
                                            },
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <CardContent sx={{ p: 2.5, flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
                                                {/* Decorative Icon */}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    right: -20,
                                                    bottom: -20,
                                                    opacity: 0.05,
                                                    transform: 'rotate(-15deg)',
                                                    pointerEvents: 'none'
                                                }}>
                                                    <BookOpen size={120} color={COLORS.primary} />
                                                </Box>

                                                {/* Header Info */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Typography variant="overline" sx={{ color: COLORS.accent, fontWeight: 700, letterSpacing: 1 }}>
                                                        {currentSubject.name.toUpperCase()}
                                                    </Typography>

                                                    {attempts[test.id] > 0 && (
                                                        <Chip
                                                            icon={<CheckCircle size={14} />}
                                                            label="Attempted"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#dcfce7',
                                                                color: '#15803d',
                                                                fontWeight: 700,
                                                                fontSize: '0.7rem',
                                                            }}
                                                        />
                                                    )}
                                                </Box>

                                                <Typography variant="h6" sx={{
                                                    fontWeight: 800,
                                                    mb: 1,
                                                    lineHeight: 1.3,
                                                    minHeight: 48,
                                                    color: COLORS.primary,
                                                    fontSize: '1rem',
                                                    wordWrap: 'break-word',
                                                    overflowWrap: 'break-word',
                                                    hyphens: 'auto'
                                                }}>
                                                    {test.name}
                                                </Typography>

                                                <Stack spacing={1.5} sx={{ mb: 3, mt: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                                            {test.questions?.[0]?.count || 0} Questions
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                                            {test.duration} mins Duration
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                                            {test.questions?.[0]?.count || 0} Marks
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <Chip
                                                    label="Expert Explanation in English"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(COLORS.accent, 0.1),
                                                        color: COLORS.accent,
                                                        fontWeight: 700,
                                                        borderRadius: 1,
                                                        px: 1
                                                    }}
                                                />
                                            </CardContent>

                                            <Box sx={{ p: 2, pt: 0 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleStartTest(currentSubject.id, test.id, test.price)}
                                                    startIcon={(accessedTestIds.has(test.id) || (!attempts[test.id] || attempts[test.id] === 0)) ? <Play size={16} /> : <Zap size={16} />}
                                                    sx={{
                                                        bgcolor: (accessedTestIds.has(test.id) || (!attempts[test.id] || attempts[test.id] === 0)) ? COLORS.success : COLORS.accent,
                                                        color: 'white',
                                                        fontWeight: 800,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        boxShadow: 'none',
                                                        py: 1.5,
                                                        fontSize: '1rem',
                                                        '&:hover': {
                                                            bgcolor: (accessedTestIds.has(test.id) || (!attempts[test.id] || attempts[test.id] === 0)) ? '#059669' : COLORS.accentHover,
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                                                        },
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {accessedTestIds.has(test.id)
                                                        ? (attempts[test.id] > 0 ? 'Retake Test' : 'Start Mock Test')
                                                        : (test.price > 0
                                                            ? ((attempts[test.id] > 0) ? `₹${test.price}` : 'Free Trial')
                                                            : 'Free')}
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

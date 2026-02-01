import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    CircularProgress, Paper, Tabs, Tab, TextField, useMediaQuery, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    Stack, alpha, Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { supabase } from '../../lib/supabaseClient';
import { onAuthStateChanged } from 'firebase/auth';
import {
    BookOpen, Clock, CheckCircle, Search, Trophy, Zap, ShieldCheck,
    Star, Info, Lock, PlayCircle, Filter, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import PaymentDialog from '../../components/PaymentDialog';
import ModernDialog from '../../components/ModernDialog';

// --- Design Constants ---
const COLORS = {
    primary: '#1e293b',       // Main headers
    secondary: '#4b5563',     // Sub headers
    accent: '#ca0056',        // Primary action
    accentHover: '#b8003f',   // Hover state
    background: '#fdf2f8',    // Page background
    cardBg: '#FFFFFF',        // Card background
    textLight: '#64748b',     // Secondary text
    success: '#10b981',
    warning: '#f59e0b',
    border: '#e2e8f0'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

import MockTestNavbar from '../../components/MockTestNavbar';

const MockTestDashboard = () => {
    // --- State Management ---
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [user, setUser] = useState(null);
    const [attempts, setAttempts] = useState({});
    const [bundles, setBundles] = useState([]);
    const [userBundles, setUserBundles] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name'); // name, price-low, price-high
    const [selectedBundleIds, setSelectedBundleIds] = useState([]);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [pendingTestData, setPendingTestData] = useState(null);
    const [pendingBundleData, setPendingBundleData] = useState(null);

    // Dialog State
    const [dialog, setDialog] = useState({
        open: false, title: '', message: '', type: 'info', onConfirm: null
    });

    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const bundleScrollRef = useRef(null);
    const testScrollRef = useRef(null);

    const handleScroll = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // --- Data Fetching & Real-time Sync ---
    const fetchInitialData = async () => {
        try {
            // 1. Fetch Subjects & Tests
            const { data: subjectsData, error: subjectsError } = await supabase
                .from('subjects')
                .select('*, tests(*)');

            if (subjectsError) throw subjectsError;

            // Process Subjects
            const formattedSubjects = subjectsData.map(s => ({
                ...s,
                tests: (s.tests || [])
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                    .map(t => ({ ...t, subjectId: s.id }))
            }));

            // Filter for Psychology or default
            const psychologySubject = formattedSubjects.find(s => s.name === 'Psychology');
            if (psychologySubject) {
                setSubjects([psychologySubject]);
                if (!selectedSubject) setSelectedSubject(psychologySubject.id);
            } else if (formattedSubjects.length > 0) {
                setSubjects(formattedSubjects);
                if (!selectedSubject) setSelectedSubject(formattedSubjects[0].id);
            } else {
                setSubjects([]);
            }

            // 2. Fetch Bundles
            const { data: bundlesData, error: bundlesError } = await supabase
                .from('bundles')
                .select('*, bundle_tests(test_id)');

            if (bundlesError) throw bundlesError;

            const formattedBundles = bundlesData.map(b => ({
                ...b,
                testIds: (b.bundle_tests || []).map(bt => bt.test_id)
            }));

            setBundles(formattedBundles);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();

        // Real-time Subscriptions
        const subjectChannel = supabase.channel('public:subjects')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, fetchInitialData)
            .subscribe();

        const testChannel = supabase.channel('public:tests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tests' }, fetchInitialData)
            .subscribe();

        const bundleChannel = supabase.channel('public:bundles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bundles' }, fetchInitialData)
            .subscribe();

        return () => {
            supabase.removeChannel(subjectChannel);
            supabase.removeChannel(testChannel);
            supabase.removeChannel(bundleChannel);
        };
    }, []);

    // Auth & User Data
    useEffect(() => {
        const fetchUserData = async (userId) => {
            // Attempts
            const { data: attemptsData } = await supabase
                .from('attempts')
                .select('test_id')
                .eq('user_id', userId);

            const attemptMap = {};
            attemptsData?.forEach(a => attemptMap[a.test_id] = (attemptMap[a.test_id] || 0) + 1);
            setAttempts(attemptMap);

            // Bundles
            const { data: bundleData } = await supabase
                .from('user_bundles')
                .select('bundle_id')
                .eq('user_id', userId);

            setUserBundles(bundleData?.map(d => d.bundle_id) || []);
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) fetchUserData(currentUser.uid);
            else {
                setAttempts({});
                setUserBundles([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const hasBundleAccess = (testId) => {
        return bundles.some(bundle =>
            userBundles.includes(bundle.id) && bundle.testIds.includes(testId)
        );
    };

    // --- Filtering Logic ---
    const allTests = subjects.flatMap(s => s.tests || []);
    const selectedBundles = bundles.filter(b => selectedBundleIds.includes(b.id));

    // Filter Bundles
    const filteredBundles = bundles.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return a.name.localeCompare(b.name);
    });

    const filteredTests = allTests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (activeTab === 'tests') return true;
        if (activeTab === 'bundles') return false;
        if (selectedBundleIds.length > 0) {
            return selectedBundles.some(b => b.testIds?.includes(test.id));
        }
        return true;
    }).sort((a, b) => {
        const ownedA = hasBundleAccess(a.id);
        const ownedB = hasBundleAccess(b.id);
        const attemptsA = attempts[a.id] || 0;
        const attemptsB = attempts[b.id] || 0;

        const isFreeTrialA = a.free || ownedA || (attemptsA === 0);
        const isFreeTrialB = b.free || ownedB || (attemptsB === 0);

        if (isFreeTrialA === isFreeTrialB) return 0;
        return isFreeTrialA ? -1 : 1;
    });

    // --- Handlers ---
    const handleStartTest = (subjectId, testId, price, testName) => {
        if (!user) {
            const testAttempts = attempts[testId] || 0;
            if (price > 0 && testAttempts > 0) {
                navigate('/student/signin', { state: { from: location } });
            } else {
                navigate('/student/signin', { state: { from: location } });
            }
            return;
        }

        if (hasBundleAccess(testId)) {
            navigate(`/academic/mocktest/${subjectId}/${testId}/rules`);
            return;
        }

        const testAttempts = attempts[testId] || 0;
        if (price > 0 && testAttempts > 0) {
            setPendingTestData({ subjectId, testId, price, testName });
            setPendingBundleData(null);
            setPaymentDialogOpen(true);
        } else {
            navigate(`/academic/mocktest/${subjectId}/${testId}/rules`);
        }
    };

    const handleBuyBundle = (bundle) => {
        if (!user) {
            navigate('/student/signin', { state: { from: location } });
            return;
        }
        setPendingBundleData(bundle);
        setPendingTestData(null);
        setPaymentDialogOpen(true);
    };

    const handleUnlockTest = async (paymentData) => {
        setPaymentDialogOpen(false);
        if (!user) return;

        try {
            // Record Payment
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    user_id: user.uid,
                    amount: paymentData.amount,
                    payment_id: paymentData.paymentId,
                    type: pendingBundleData ? 'bundle' : 'test',
                    item_id: pendingBundleData ? pendingBundleData.id : pendingTestData?.testId,
                    item_name: pendingBundleData ? pendingBundleData.name : pendingTestData?.testName,
                    status: 'success'
                });

            if (paymentError) throw paymentError;

            // Grant Access
            if (pendingBundleData) {
                await supabase.from('user_bundles').insert({
                    user_id: user.uid,
                    bundle_id: pendingBundleData.id
                });
                setUserBundles(prev => [...prev, pendingBundleData.id]);
                setDialog({
                    open: true, title: 'Success', type: 'success',
                    message: `You have successfully purchased ${pendingBundleData.name}!`
                });
            } else if (pendingTestData) {
                navigate(`/academic/mocktest/${pendingTestData.subjectId}/${pendingTestData.testId}/rules`);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            setDialog({
                open: true, title: 'Error', type: 'error',
                message: 'Payment recorded but access update failed. Contact support.'
            });
        }
    };

    // --- Render Helpers ---
    const renderBundleCard = (bundle) => {
        const isSelected = selectedBundleIds.includes(bundle.id);
        const isOwned = userBundles.includes(bundle.id);
        return (
            <motion.div
                whileHover={{ y: -5 }}
                style={{ height: '100%' }}
            >
                <Card
                    onClick={() => {
                        if (activeTab === 'all') {
                            setSelectedBundleIds(prev =>
                                prev.includes(bundle.id) ? prev.filter(id => id !== bundle.id) : [...prev, bundle.id]
                            );
                        }
                    }}
                    sx={{
                        height: '100%',
                        minHeight: 320, // Uniform height
                        cursor: activeTab === 'all' ? 'pointer' : 'default',
                        border: isSelected ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                        borderRadius: 3,
                        boxShadow: isSelected ? '0 8px 24px rgba(52, 152, 219, 0.15)' : 'none',
                        '&:hover': { boxShadow: '0 12px 24px rgba(0,0,0,0.05)', borderColor: COLORS.accent },
                        transition: 'all 0.3s',
                        display: 'flex', flexDirection: 'column',
                        position: 'relative',
                        p: 0.5 // Subtle internal padding
                    }}
                >
                    {isSelected && (
                        <Box sx={{
                            position: 'absolute', top: -10, right: -10,
                            bgcolor: COLORS.accent, color: 'white',
                            borderRadius: '50%', p: 0.5, zIndex: 2
                        }}>
                            <CheckCircle size={16} />
                        </Box>
                    )}

                    <CardContent sx={{ flexGrow: 1, p: 2.5, position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{
                            position: 'absolute', right: -20, bottom: -20, opacity: 0.05,
                            transform: 'rotate(-15deg)', pointerEvents: 'none'
                        }}>
                            <Layers size={120} color={COLORS.primary} />
                        </Box>

                        <Typography variant="overline" sx={{ color: COLORS.accent, fontWeight: 700, letterSpacing: 1 }}>
                            PREMIUM TEST BUNDLE
                        </Typography>

                        <Typography variant="h6" sx={{
                            fontWeight: 800, mb: 1, lineHeight: 1.3, minHeight: 54, color: COLORS.primary
                        }}>
                            {bundle.name}
                        </Typography>

                        <Typography variant="body2" sx={{ color: COLORS.textLight, mb: 2, minHeight: 40 }}>
                            {bundle.description}
                        </Typography>

                        <Stack spacing={1.5} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                    {bundle.testIds?.length || 0} Full Mock Tests
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                    Expert Recommendations
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                    Lifetime Analysis
                                </Typography>
                            </Box>
                        </Stack>

                        <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary, mb: 2 }}>
                            ₹{bundle.price}
                        </Typography>

                        {!isOwned ? (
                            <Button
                                fullWidth
                                variant="contained"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleBuyBundle(bundle); }}
                                sx={{
                                    bgcolor: COLORS.primary, color: 'white', fontWeight: 700, borderRadius: 2, textTransform: 'none', py: 1.2,
                                    '&:hover': { bgcolor: COLORS.secondary }
                                }}
                            >
                                Buy Bundle
                            </Button>
                        ) : (
                            <Chip label="Purchased & Active" size="medium" color="success" variant="filled" sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }} />
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    const renderTestCard = (test) => {
        const ownedByBundle = hasBundleAccess(test.id);
        const testAttempts = attempts[test.id] || 0;
        const isLocked = !test.free && !ownedByBundle && testAttempts > 0 && test.price > 0;

        return (
            <motion.div
                whileHover={{ y: -5 }}
                style={{ height: '100%' }}
            >
                <Card sx={{
                    height: '100%',
                    minHeight: 320, // Uniform height
                    borderRadius: 3,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 12px 24px rgba(0,0,0,0.05)', borderColor: COLORS.accent },
                    transition: 'all 0.3s',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <CardContent sx={{ flexGrow: 1, p: 2.5, position: 'relative', overflow: 'hidden' }}>
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

                        <Typography variant="overline" sx={{ color: COLORS.accent, fontWeight: 700, letterSpacing: 1 }}>
                            UGC-NET PAPER 2 PSYCHOLOGY
                        </Typography>

                        <Typography variant="h6" sx={{
                            fontWeight: 800, mb: 1, lineHeight: 1.3, minHeight: 48, color: COLORS.primary, fontSize: '1rem'
                        }}>
                            {test.name}
                        </Typography>

                        <Stack spacing={1.5} sx={{ mb: 3, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>100 Questions</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>3 Hours Duration</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>200 Marks</Typography>
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
                                width: '100%',
                                justifyContent: 'center'
                            }}
                        />
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                            fullWidth
                            variant={isLocked ? "outlined" : "contained"}
                            onClick={() => handleStartTest(test.subjectId, test.id, test.price, test.name)}
                            startIcon={isLocked ? <Lock size={16} /> : <PlayCircle size={16} />}
                            sx={{
                                bgcolor: isLocked ? 'transparent' : COLORS.accent,
                                color: isLocked ? COLORS.textLight : 'white',
                                borderColor: isLocked ? COLORS.border : 'transparent',
                                fontWeight: 700,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: isLocked ? alpha(COLORS.primary, 0.05) : COLORS.accentHover,
                                    boxShadow: isLocked ? 'none' : '0 4px 12px rgba(52, 152, 219, 0.3)'
                                }
                            }}
                        >
                            {ownedByBundle ? 'Start Mock Test' :
                                (test.free || testAttempts === 0) ? 'Free Trail' :
                                    `₹${test.price}`}
                        </Button>
                    </Box>
                </Card>
            </motion.div>
        );
    };

    const renderFeatureChip = (icon, label) => (
        <Chip
            icon={icon}
            label={label}
            sx={{
                bgcolor: 'white',
                border: `1px solid ${COLORS.border}`,
                fontWeight: 600,
                color: COLORS.secondary,
                '& .MuiChip-icon': { color: COLORS.accent }
            }}
        />
    );

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: COLORS.background,
            fontFamily: FONTS.primary,
            color: COLORS.primary
        }}>
            <MockTestNavbar />

            {/* --- Dashboard Content --- */}
            <Container maxWidth="lg" sx={{ py: 6 }}>

                {/* Guest CTA Banner */}
                {!user && (
                    <Paper
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 6,
                            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                            color: 'white',
                            mb: 6,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(30, 41, 59, 0.2)'
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Grid container spacing={4} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
                                        Ready to Ace your Exams?
                                    </Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 4, maxWidth: 500, fontSize: '1.1rem' }}>
                                        Create a free account to track your progress, unlock detailed analytics, and get personalized study recommendations.
                                    </Typography>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate('/student/signup')}
                                            sx={{
                                                bgcolor: COLORS.accent,
                                                color: 'white',
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: '50px',
                                                fontWeight: 800,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                '&:hover': { bgcolor: COLORS.accentHover }
                                            }}
                                        >
                                            Get Started Now
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/student/signin')}
                                            sx={{
                                                color: 'white',
                                                borderColor: 'rgba(255,255,255,0.3)',
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: '50px',
                                                fontWeight: 800,
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    bgcolor: 'rgba(255,255,255,0.1)'
                                                }
                                            }}
                                        >
                                            Login to your account
                                        </Button>
                                    </Stack>
                                </Grid>
                                {!isMobile && (
                                    <Grid item md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Trophy size={160} color="white" style={{ opacity: 0.2 }} />
                                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                                <Zap size={80} color={COLORS.accent} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                        {/* Background Decor */}
                        <Box sx={{
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${COLORS.accent}20 0%, transparent 70%)`
                        }} />
                    </Paper>
                )}

                {/* Navigation & Search */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 3,
                    mb: 5
                }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                minWidth: 100
                            },
                            '& .Mui-selected': { color: COLORS.accent },
                            '& .MuiTabs-indicator': { bgcolor: COLORS.accent }
                        }}
                    >
                        <Tab label="All Resources" value="all" />
                        <Tab label="Test Bundles" value="bundles" />
                        <Tab label="Mock Tests" value="tests" />
                    </Tabs>

                    <TextField
                        placeholder="Search tests..."
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <Search size={18} color={COLORS.textLight} style={{ marginRight: 10 }} />,
                            sx: {
                                borderRadius: 2,
                                bgcolor: 'white',
                                width: { xs: '100%', md: 300 },
                                '& fieldset': { borderColor: COLORS.border },
                                '&:hover fieldset': { borderColor: COLORS.accent }
                            }
                        }}
                    />
                </Box>
                <Divider sx={{ mb: 5 }} />

                {/* Content Area */}
                <Grid container spacing={4}>

                    {/* Column: Bundles */}
                    {(activeTab === 'all' || activeTab === 'bundles') && (
                        <Grid item xs={12} sx={{ mb: activeTab === 'all' ? 6 : 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Layers size={20} color={COLORS.accent} />
                                    Available Bundles
                                </Typography>

                                {activeTab === 'all' && filteredBundles.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                            onClick={() => handleScroll(bundleScrollRef, 'left')}
                                            sx={{ bgcolor: 'white', border: `1px solid ${COLORS.border}`, '&:hover': { bgcolor: alpha(COLORS.accent, 0.05) } }}
                                            size="small"
                                        >
                                            <ChevronLeft size={20} />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleScroll(bundleScrollRef, 'right')}
                                            sx={{ bgcolor: 'white', border: `1px solid ${COLORS.border}`, '&:hover': { bgcolor: alpha(COLORS.accent, 0.05) } }}
                                            size="small"
                                        >
                                            <ChevronRight size={20} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            {activeTab === 'all' ? (
                                <Box
                                    ref={bundleScrollRef}
                                    sx={{
                                        display: 'flex',
                                        overflowX: 'auto',
                                        pb: 3,
                                        gap: 3,
                                        scrollSnapType: 'x mandatory',
                                        scrollBehavior: 'smooth',
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none',
                                        '&::-webkit-scrollbar': { display: 'none' }
                                    }}
                                >
                                    {filteredBundles.length > 0 ? (
                                        filteredBundles.map((bundle) => (
                                            <Box key={bundle.id} sx={{ minWidth: { xs: '85%', sm: '45%', md: '30%', lg: '22%' }, scrollSnapAlign: 'start' }}>
                                                {renderBundleCard(bundle)}
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ p: 4, color: COLORS.textLight, fontStyle: 'italic' }}>
                                            No bundles found.
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {filteredBundles.length > 0 ? (
                                        filteredBundles.map((bundle) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={bundle.id}>
                                                {renderBundleCard(bundle)}
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid item xs={12}>
                                            <Typography variant="body2" sx={{ p: 4, color: COLORS.textLight, fontStyle: 'italic', textAlign: 'center' }}>
                                                No bundles found.
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                    )}

                    {/* Column: Tests */}
                    {(activeTab === 'all' || activeTab === 'tests') && (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Filter size={20} color={COLORS.accent} />
                                    {selectedBundleIds.length > 0 ? 'Bundle Tests' : 'All Tests'}
                                </Typography>

                                {activeTab === 'all' && filteredTests.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                            onClick={() => handleScroll(testScrollRef, 'left')}
                                            sx={{ bgcolor: 'white', border: `1px solid ${COLORS.border}`, '&:hover': { bgcolor: alpha(COLORS.accent, 0.05) } }}
                                            size="small"
                                        >
                                            <ChevronLeft size={20} />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleScroll(testScrollRef, 'right')}
                                            sx={{ bgcolor: 'white', border: `1px solid ${COLORS.border}`, '&:hover': { bgcolor: alpha(COLORS.accent, 0.05) } }}
                                            size="small"
                                        >
                                            <ChevronRight size={20} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            {activeTab === 'all' ? (
                                <Box
                                    ref={testScrollRef}
                                    sx={{
                                        display: 'flex',
                                        overflowX: 'auto',
                                        pb: 3,
                                        gap: 3,
                                        scrollSnapType: 'x mandatory',
                                        scrollBehavior: 'smooth',
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none',
                                        '&::-webkit-scrollbar': { display: 'none' }
                                    }}
                                >
                                    {filteredTests.length > 0 ? (
                                        filteredTests.map((test) => (
                                            <Box key={test.id} sx={{ minWidth: { xs: '85%', sm: '45%', md: '30%', lg: '22%' }, scrollSnapAlign: 'start' }}>
                                                {renderTestCard(test)}
                                            </Box>
                                        ))
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6, width: '100%' }}>
                                            <Info size={48} color={COLORS.textLight} />
                                            <Typography variant="h6" sx={{ mt: 2, color: COLORS.secondary }}>
                                                No tests found.
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {filteredTests.length > 0 ? (
                                        filteredTests.map((test) => (
                                            <Grid item xs={12} sm={6} md={4} lg={3} key={test.id}>
                                                {renderTestCard(test)}
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid item xs={12}>
                                            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                                                <Info size={48} color={COLORS.textLight} />
                                                <Typography variant="h6" sx={{ mt: 2, color: COLORS.secondary }}>
                                                    No tests found.
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Container>

            {/* --- Dialogs --- */}
            <PaymentDialog
                open={paymentDialogOpen}
                onClose={() => setPaymentDialogOpen(false)}
                data={pendingBundleData ? {
                    type: 'bundle',
                    ...pendingBundleData
                } : pendingTestData ? {
                    type: 'test',
                    ...pendingTestData
                } : null}
                onSuccess={handleUnlockTest}
            />

            <ModernDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
                onClose={() => setDialog({ ...dialog, open: false })}
                onConfirm={dialog.onConfirm}
            />
        </Box >
    );
};

export default MockTestDashboard;

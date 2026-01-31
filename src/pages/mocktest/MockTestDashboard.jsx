import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress, IconButton, Avatar, Menu, MenuItem, Divider, Paper, Tabs, Tab, TextField, useMediaQuery, useTheme, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { supabase } from '../../lib/supabaseClient';
import { collection, getDocs, query, where, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { BookOpen, Clock, ArrowLeft, CheckCircle, User, Users, LogOut, Sparkles, Settings, ChevronRight, Info, ShieldCheck, Trophy, Zap, Star, Package, Lock, Filter, Search, GraduationCap, Monitor, Smartphone, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentDialog from '../../components/PaymentDialog';
import ModernDialog from '../../components/ModernDialog';

const MockTestDashboard = () => {

    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        console.log("MockTestDashboard loaded - Version Fix 2.0");
    }, []);

    const [attempts, setAttempts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [bundles, setBundles] = useState([]);
    const [userBundles, setUserBundles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [pendingTestData, setPendingTestData] = useState(null);
    const [pendingBundleData, setPendingBundleData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modern Dialog State
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    const navigate = useNavigate();
    const location = useLocation();

    const [selectedBundleIds, setSelectedBundleIds] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Removed automatic bundle selection code

    const allTests = subjects.flatMap(s => s.tests || []);
    const activeSubject = subjects.find(s => s.id === selectedSubject);
    const selectedBundles = bundles.filter(b => selectedBundleIds.includes(b.id));

    // Updated displayedTests logic for Supabase junction table
    // Filtering logic:
    // 1. Filter by search query first
    const filteredBySearch = allTests.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. Further filter by selected bundles if any
    const displayedTests = selectedBundleIds.length > 0
        ? filteredBySearch.filter(t => selectedBundles.some(b => b.testIds?.includes(t.id)))
        : (activeSubject ? activeSubject.tests.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())) : []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Subjects & Tests (Joined)
                const { data: subjectsData, error: subjectsError } = await supabase
                    .from('subjects')
                    .select('*, tests(*)');

                if (subjectsError) throw subjectsError;

                // Format data to match existing structure
                const formattedSubjects = subjectsData.map(s => ({
                    ...s,
                    tests: s.tests
                        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                        .map(t => ({ ...t, subjectId: s.id }))
                }));

                // Strictly focus on "Psychology" subject
                const psychologySubject = formattedSubjects.find(s => s.name === 'Psychology');

                if (psychologySubject) {
                    setSubjects([psychologySubject]);
                    setSelectedSubject(psychologySubject.id);
                } else if (formattedSubjects.length > 0) {
                    // Fallback to first if Psychology not found
                    setSubjects([formattedSubjects[0]]);
                    setSelectedSubject(formattedSubjects[0].id);
                }

                // 2. Fetch Bundles & their Test IDs
                const { data: bundlesData, error: bundlesError } = await supabase
                    .from('bundles')
                    .select('*, bundle_tests(test_id)');

                if (bundlesError) throw bundlesError;

                const formattedBundles = bundlesData.map(b => ({
                    ...b,
                    testIds: b.bundle_tests.map(bt => bt.test_id)
                }));

                setBundles(formattedBundles);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching Supabase data:", error);
                setLoading(false);
            }
        };

        const fetchUserAttempts = async (userId) => {
            try {
                const { data, error } = await supabase
                    .from('attempts')
                    .select('test_id')
                    .eq('user_id', userId);

                if (error) throw error;

                const attemptMap = {};
                data.forEach(attempt => {
                    attemptMap[attempt.test_id] = (attemptMap[attempt.test_id] || 0) + 1;
                });
                setAttempts(attemptMap);
            } catch (error) {
                console.error("Error fetching attempts from Supabase:", error);
            }
        };

        const fetchUserBundles = async (userId) => {
            try {
                const { data, error } = await supabase
                    .from('user_bundles')
                    .select('bundle_id')
                    .eq('user_id', userId);

                if (error) throw error;
                setUserBundles(data.map(d => d.bundle_id));
            } catch (error) {
                console.error("Error fetching user bundles from Supabase:", error);
            }
        };

        // Initial Fetch
        fetchInitialData();

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchUserAttempts(currentUser.uid);
                fetchUserBundles(currentUser.uid);

                // Fetch user role
                try {
                    const { doc, getDoc } = await import('firebase/firestore');
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setUserRole(userDoc.data().role);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }
            } else {
                setUser(null);
                setUserRole(null);
                setAttempts({});
                setUserBundles([]);
            }
        });

        return () => {
            unsubscribeAuth();
        };
    }, [selectedSubject, auth, db]);

    const hasBundleAccess = (testId) => {
        return bundles.some(bundle =>
            userBundles.includes(bundle.id) && bundle.testIds.includes(testId)
        );
    };

    const handleStartTest = (subjectId, testId, price, testName) => {
        // If not logged in, decide whether to go to login or guest checkout
        if (!user) {
            const testAttempts = attempts[testId] || 0;
            if (price > 0 && testAttempts > 0) {
                navigate('/academic/mocktest/checkout', {
                    state: {
                        type: 'test',
                        subjectId,
                        testId,
                        price,
                        name: testName
                    }
                });
            } else {
                navigate('/student/signin', { state: { from: location } });
            }
            return;
        }

        // Check bundle access first - if owned, skip all other checks
        if (hasBundleAccess(testId)) {
            navigate(`/academic/mocktest/${subjectId}/${testId}/rules`);
            return;
        }

        const testAttempts = attempts[testId] || 0;

        if (price > 0 && testAttempts > 0) {
            // Show payment dialog instead of alert
            setPendingTestData({ subjectId, testId, price, testName });
            setPendingBundleData(null);
            setPaymentDialogOpen(true);
            return;
        }

        navigate(`/academic/mocktest/${subjectId}/${testId}/rules`);
    };

    const handleBuyBundle = (bundle) => {
        // If more than 1 bundle is selected, go to checkout page even if logged in
        if (selectedBundleIds.length > 1 && selectedBundleIds.includes(bundle.id)) {
            const bundlesToBuy = bundles.filter(b => selectedBundleIds.includes(b.id));
            navigate('/academic/mocktest/checkout', {
                state: {
                    type: 'multi',
                    items: bundlesToBuy.map(b => ({
                        type: 'bundle',
                        bundleId: b.id,
                        price: b.price,
                        name: b.name,
                        subjectId: b.subject_id
                    })),
                    price: bundlesToBuy.reduce((sum, b) => sum + b.price, 0),
                    name: `${bundlesToBuy.length} Bundles Selection`
                }
            });
            return;
        }

        if (!user) {
            navigate('/academic/mocktest/checkout', {
                state: {
                    type: 'bundle',
                    bundleId: bundle.id,
                    price: bundle.price,
                    name: bundle.name,
                    subjectId: bundle.subject_id
                }
            });
            return;
        }
        setPendingBundleData(bundle);
        setPendingTestData(null);
        setPaymentDialogOpen(true);
    };

    const handleUnlockTest = async (paymentData) => {
        // Payment successful - save to Supabase and navigate to test
        console.log('Payment completed:', paymentData);
        setPaymentDialogOpen(false);

        if (user) {
            try {
                // 1. Save payment record to Supabase
                const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                        user_id: user.uid,
                        amount: paymentData.amount,
                        payment_id: paymentData.paymentId,
                        order_id: paymentData.orderId || null,
                        signature: paymentData.signature || null,
                        type: pendingBundleData ? 'bundle' : 'test',
                        item_id: pendingBundleData ? pendingBundleData.id : pendingTestData?.testId,
                        item_name: pendingBundleData ? pendingBundleData.name : pendingTestData?.testName,
                        status: 'success'
                    });

                if (paymentError) throw paymentError;

                if (pendingBundleData) {
                    // 2. Grant bundle access in user_bundles table
                    const { error: accessError } = await supabase
                        .from('user_bundles')
                        .insert({
                            user_id: user.uid,
                            bundle_id: pendingBundleData.id
                        });

                    if (accessError) throw accessError;

                    setUserBundles(prev => [...prev, pendingBundleData.id]);
                    setDialog({
                        open: true,
                        title: 'Purchase Successful',
                        message: `Successfully purchased ${pendingBundleData.name}! You now have immediate access to all tests included in this bundle.`,
                        type: 'success'
                    });
                } else if (pendingTestData) {
                    navigate(`/academic/mocktest/${pendingTestData.subjectId}/${pendingTestData.testId}/rules`);
                }

                console.log('Payment record saved to Supabase');
            } catch (error) {
                console.error('Error saving payment record to Supabase:', error);
                setDialog({
                    open: true,
                    title: 'Access Update Failed',
                    message: "Your payment was successful, but we encountered an error updating your access. Please contact our support team with your receipt.",
                    type: 'error'
                });
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setAnchorEl(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const currentSubject = subjects.find(s => s.id === selectedSubject);

    const bundleGradients = [
        'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)', // Pink-Purple
        'linear-gradient(135deg, #0070f3 0%, #00dfd8 100%)', // Blue-Cyan
        'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', // Amber-Red
        'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', // Green-Blue
    ];

    const getBundleGradient = (id) => {
        const sum = Array.from(id || '').reduce((a, c) => a + c.charCodeAt(0), 0);
        return bundleGradients[sum % bundleGradients.length];
    };

    const renderBundleCard = (bundle, isList = false) => {
        const isSelected = selectedBundleIds.includes(bundle.id);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
            >
                <Card
                    key={bundle.id}
                    onClick={() => setSelectedBundleIds(prev =>
                        prev.includes(bundle.id)
                            ? prev.filter(id => id !== bundle.id)
                            : [...prev, bundle.id]
                    )}
                    sx={{
                        width: '100%',
                        cursor: 'pointer',
                        border: isSelected ? '2.5px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                        backgroundImage: getBundleGradient(bundle.id),
                        color: '#fff',
                        boxShadow: isSelected ? '0 15px 35px rgba(0,0,0,0.25)' : '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{bundle.name}</Typography>
                            {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle size={24} /></motion.div>}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                            <Chip size="small" label="Premium Access" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700, backdropFilter: 'blur(4px)' }} />
                            <Chip size="small" label="Full Analytics" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700, backdropFilter: 'blur(4px)' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, lineBreak: 'anywhere', height: 44, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {bundle.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5" sx={{ fontWeight: 900 }}>
                                ₹{bundle.price}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {!userBundles.includes(bundle.id) && (
                                    <Button
                                        size="small"
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#fff',
                                            color: '#db2777',
                                            fontWeight: 800,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                            '&:hover': { bgcolor: '#f8fafc', transform: 'scale(1.05)' }
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBuyBundle(bundle);
                                        }}
                                    >
                                        Buy Now
                                    </Button>
                                )}
                                <Button
                                    size="small"
                                    variant={isSelected ? "contained" : "outlined"}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        bgcolor: isSelected ? 'rgba(255,255,255,0.3)' : 'transparent',
                                        borderColor: '#fff',
                                        color: '#fff',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.4)', borderColor: '#fff' }
                                    }}
                                >
                                    {isSelected ? "Selected" : "Select"}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    const renderTestItem = (test) => {
        const ownedByBundle = hasBundleAccess(test.id);
        const testAttempts = attempts[test.id] || 0;
        const isFreeTry = !test.free && !ownedByBundle && testAttempts === 0;
        const isFullyUnlocked = test.free || ownedByBundle;

        return (
            <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%' }}
            >
                <Card
                    key={test.id}
                    elevation={0}
                    sx={{
                        p: 3,
                        height: '100%',
                        borderRadius: 1,
                        border: '1px solid #e2e8f0',
                        bgcolor: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        aspectRatio: '1/1',
                        '&:hover': {
                            boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                            borderColor: '#db2777'
                        }
                    }}
                >
                    {/* Status Badge */}
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                        {test.free ? (
                            <Chip label="FREE" size="small" sx={{ bgcolor: '#16a34a', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                        ) : isFreeTry ? (
                            <Chip label="FREE TRY" size="small" sx={{ bgcolor: '#db2777', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                        ) : null}
                    </Box>

                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3, lineHeight: 1.3, minHeight: '3.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {test.name}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748b' }}>
                                <Clock size={16} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{test.duration} Mins</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748b' }}>
                                <BookOpen size={16} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>100 Questions</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="text"
                            onClick={() => handleStartTest(test.subjectId || selectedSubject, test.id, test.price, test.name)}
                            sx={{
                                color: '#db2777',
                                fontWeight: 800,
                                textTransform: 'none',
                                fontSize: '1rem',
                                p: 0,
                                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                            }}
                        >
                            {isFullyUnlocked ? 'Start Test' : (isFreeTry ? 'Start Free Try' : `Unlock for ₹${test.price}`)}
                            <ChevronRight size={18} style={{ marginLeft: 4 }} />
                        </Button>
                    </Box>
                </Card>
            </motion.div>
        );
    };

    const renderAdvantagesBanner = () => (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                alignItems: 'center',
                mt: 2
            }}
            aria-label="mock test advantages"
        >
            <Chip icon={<Trophy size={14} color="#f59e0b" />} label="Exam-like practice" variant="outlined" sx={{ borderColor: 'rgba(245, 158, 11, 0.3)', bgcolor: 'rgba(245, 158, 11, 0.05)' }} />
            <Chip icon={<Zap size={14} color="#3b82f6" />} label="Instant feedback & analytics" variant="outlined" sx={{ borderColor: 'rgba(59, 130, 246, 0.3)', bgcolor: 'rgba(59, 130, 246, 0.05)' }} />
            <Chip icon={<ShieldCheck size={14} color="#10b981" />} label="Secure & fair testing" variant="outlined" sx={{ borderColor: 'rgba(16, 185, 129, 0.3)', bgcolor: 'rgba(16, 185, 129, 0.05)' }} />
        </Box>
    );

    const renderHowToAttemptFreely = () => (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, md: 3 },
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 3,
                bgcolor: 'rgba(59, 130, 246, 0.05)',
                backdropFilter: 'blur(8px)',
                mb: 3,
                position: 'relative',
                overflow: 'hidden'
            }}
            aria-label="How to attempt freely"
        >
            <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, transform: 'rotate(15deg)' }}>
                <Info size={80} color="#3b82f6" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info size={20} /> Getting Started
            </Typography>
            <Grid container spacing={2}>
                {[
                    "Look for tests marked with the Free label.",
                    "Select the test and press Start to begin.",
                    "If you own a bundle, all its tests are unlocked.",
                    "Paid tests can be unlocked via the Unlock button."
                ].map((step, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: '#3b82f6',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800
                            }}>
                                {i + 1}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 600 }}>{step}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }} className="mesh-bg">
            {/* Animated Background Blobs */}
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '50%',
                        height: '50%',
                        background: 'radial-gradient(circle, rgba(255, 0, 128, 0.12) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 120, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        right: '-5%',
                        width: '45%',
                        height: '45%',
                        background: 'radial-gradient(circle, rgba(121, 40, 202, 0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '20%',
                        right: '-10%',
                        width: '40%',
                        height: '40%',
                        background: 'radial-gradient(circle, rgba(0, 112, 243, 0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -120, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '-10%',
                        width: '40%',
                        height: '40%',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(80px)',
                    }}
                />
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <Box sx={{
                    pt: { xs: 6, md: 10 },
                    pb: { xs: 8, md: 12 },
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(219, 39, 119, 0.05) 0%, transparent 100%)'
                }}>
                    <Container maxWidth="lg">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Chip
                                label="UGC-NET EXCELLENCE"
                                sx={{
                                    bgcolor: '#db2777', color: '#fff', fontWeight: 900, mb: 3, px: 2, height: 32,
                                    boxShadow: '0 4px 15px rgba(219, 39, 119, 0.3)'
                                }}
                            />
                            <Typography variant="h1" sx={{
                                fontWeight: 900, fontSize: { xs: '2.5rem', md: '4.5rem' },
                                color: '#1e293b', mb: 3, letterSpacing: '-0.04em', lineHeight: 1.1
                            }}>
                                UGC-NET PAPER 2 <br />
                                <Box component="span" sx={{ color: '#db2777' }}>PSYCHOLOGY</Box> MOCK TEST
                            </Typography>
                            <Typography variant="h5" sx={{
                                fontWeight: 500, color: '#64748b', mb: 6, maxWidth: '850px', mx: 'auto',
                                lineHeight: 1.6, textAlign: 'center'
                            }}>
                                Boost your UGC NET Psychology score through systematic practice of previous year questions with expert explanations & performance analytics.
                            </Typography>

                            {/* Stats Bar */}
                            <Grid container spacing={3} sx={{ maxWidth: '600px', mx: 'auto', mb: 8, justifyContent: 'center' }}>
                                <Grid item xs={6} sm={5}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#db2777' }}>30+</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Mock Tests</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={5}>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#db2777' }}>20K+</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Users</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Feature Grid */}
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                What Will You Get
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { icon: <BookOpen />, title: "3K+ PYQs", text: "Extensive previous year question bank" },
                                    { icon: <MessageSquare />, title: "Expert Explanation", text: "Detailed rationale for every answer" },
                                    { icon: <ShieldCheck />, title: "Topic Based", text: "Focused practice for core concepts" },
                                    { icon: <Monitor />, title: "Real Experience", text: "Standard exam interface simulation" },
                                    { icon: <Clock />, title: "24/7 Access", text: "Practice anytime, anywhere" },
                                    { icon: <Smartphone />, title: "Multi-Device", text: "Desktop and mobile compatible" }
                                ].map((feature, i) => (
                                    <Grid item xs={6} sm={4} md={2} key={i}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box sx={{
                                                width: 50, height: 50, borderRadius: '16px', bgcolor: '#fff', mx: 'auto', mb: 2,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#db2777', boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                                                border: '1px solid #f1f5f9'
                                            }}>
                                                {feature.icon}
                                            </Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>{feature.title}</Typography>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1 }}>{feature.text}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    </Container>
                </Box>

                <Container maxWidth="xl" sx={{ py: 2 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, md: 4 },
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, v) => setActiveTab(v)}
                                aria-label="dashboard content filters"
                                textColor="primary"
                                indicatorColor="primary"
                                variant={isMobile ? "fullWidth" : "standard"}
                            >
                                <Tab label="All" value="all" />
                                <Tab label="Test Bundle" value="bundles" />
                                <Tab label="Mock Test" value="tests" />
                            </Tabs>
                        </Box>

                        {/* Filters and Search Bar Container */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: 2,
                            mb: 4
                        }}>
                            {/* Quick Test Name Filters */}
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                gap: 1,
                                overflowX: 'auto',
                                pb: 1,
                                '&::-webkit-scrollbar': { height: 4 },
                                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2 }
                            }}>
                                <Chip
                                    label="All"
                                    onClick={() => setSearchQuery('')}
                                    color={searchQuery === '' ? "primary" : "default"}
                                    variant={searchQuery === '' ? "filled" : "outlined"}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        bgcolor: searchQuery === '' ? '#db2777' : 'transparent',
                                        '&:hover': { bgcolor: searchQuery === '' ? '#db2777' : 'rgba(0,0,0,0.05)' }
                                    }}
                                />
                                {Array.from(new Set((activeSubject?.tests || []).map(t => t.name))).sort().map((testName) => (
                                    <Chip
                                        key={testName}
                                        label={testName}
                                        onClick={() => setSearchQuery(testName)}
                                        color={searchQuery === testName ? "primary" : "default"}
                                        variant={searchQuery === testName ? "filled" : "outlined"}
                                        sx={{
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            bgcolor: searchQuery === testName ? '#db2777' : 'transparent',
                                            '&:hover': { bgcolor: searchQuery === testName ? '#db2777' : 'rgba(0,0,0,0.05)' },
                                            whiteSpace: 'nowrap'
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Test Search Bar */}
                            <Box sx={{
                                width: { xs: '100%', sm: '240px', md: '300px' },
                                flexShrink: 0
                            }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    placeholder="Search tests..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <Search size={18} style={{ marginRight: 8, color: '#64748b' }} />
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            fontSize: '0.9rem',
                                            '& fieldset': { borderColor: '#e2e8f0' },
                                            '&:hover fieldset': { borderColor: '#db2777' },
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <AnimatePresence mode="wait">
                            {/* All View */}
                            {activeTab === 'all' && (
                                <motion.div
                                    key="all"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderAdvantagesBanner()}
                                    {renderHowToAttemptFreely()}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', md: 'row' },
                                        gap: 3
                                    }}>
                                        {/* Left Column - Bundles */}
                                        <Box sx={{
                                            width: { xs: '100%', md: '60%' },
                                            pr: { md: 2 },
                                            pb: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2
                                        }}>
                                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
                                                Test Bundles
                                            </Typography>
                                            {bundles.length > 0 ? (
                                                bundles.map((bundle) => renderBundleCard(bundle, true))
                                            ) : (
                                                <Typography color="textSecondary">No bundles available.</Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#db2777', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Sparkles size={24} /> Recommended Mock Tests
                                                </Typography>
                                            </Box>
                                            <Grid container spacing={3}>
                                                {displayedTests.slice(0, 6).map((test) => (
                                                    <Grid item xs={12} sm={6} md={4} key={test.id}>
                                                        {renderTestItem(test)}
                                                    </Grid>
                                                ))}
                                                {displayedTests.length === 0 && (
                                                    <Grid item xs={12}>
                                                        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 4, border: '1px dashed #ccc' }}>
                                                            <Typography color="textSecondary">No tests available for this selection.</Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    </Box>
                                </motion.div>
                            )}

                            {/* Test Bundle View */}
                            {activeTab === 'bundles' && (
                                <motion.div
                                    key="bundles"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderAdvantagesBanner()}
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                                            Test Bundles
                                        </Typography>
                                        <Grid container spacing={3}>
                                            {bundles.map((bundle) => (
                                                <Grid item xs={12} sm={6} md={4} key={bundle.id}>
                                                    {renderBundleCard(bundle, false)}
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </motion.div>
                            )}

                            {/* Mock Test View */}
                            {activeTab === 'tests' && (
                                <motion.div
                                    key="tests"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderAdvantagesBanner()}
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                                            {selectedBundleIds.length > 0 ? 'Tests in Selected Bundle' : 'All Mock Tests'}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {displayedTests.map((test) => (
                                                <Grid item xs={12} sm={6} md={4} key={test.id}>
                                                    {renderTestItem(test)}
                                                </Grid>
                                            ))}
                                            {displayedTests.length === 0 && (
                                                <Box sx={{ p: 4, textAlign: 'center', width: '100%' }}>
                                                    <Typography color="textSecondary">No tests found for this subject.</Typography>
                                                </Box>
                                            )}
                                        </Grid>
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Exam Pattern & About Content */}
                        <Box sx={{ mt: 10, pt: 8, borderTop: '1px solid #e2e8f0' }}>
                            <Grid container spacing={8} justifyContent="center">
                                <Grid item xs={12} md={10} lg={8}>
                                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 3 }}>
                                            UGC NET Mock Test Pattern
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: '700px', mx: 'auto' }}>
                                            Familiarize yourself with the syllabus and exam pattern based on the latest NTA guidelines to maximize your preparation efficiency.
                                        </Typography>
                                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden', maxWidth: '600px', mx: 'auto' }}>
                                            <Table>
                                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 800 }}>UGC NET Paper</TableCell>
                                                        <TableCell sx={{ fontWeight: 800 }} align="center">Questions</TableCell>
                                                        <TableCell sx={{ fontWeight: 800 }} align="center">Marks</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 600 }}>Paper I (Common)</TableCell>
                                                        <TableCell align="center">50</TableCell>
                                                        <TableCell align="center">100</TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ bgcolor: '#fff0f6' }}>
                                                        <TableCell sx={{ fontWeight: 800, color: '#db2777' }}>Paper II (Psychology)</TableCell>
                                                        <TableCell sx={{ fontWeight: 800, color: '#db2777' }} align="center">100</TableCell>
                                                        <TableCell sx={{ fontWeight: 800, color: '#db2777' }} align="center">200</TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell colSpan={3} sx={{ py: 2, bgcolor: '#f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textAlign: 'center', display: 'block' }}>
                                                                Total Duration: 3 Hours (No Break)
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={10} lg={8}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 3 }}>
                                            About UGC NET Psychology
                                        </Typography>
                                        <Box sx={{ color: '#475569', lineHeight: 1.8 }}>
                                            <Typography variant="body1" paragraph sx={{ textAlign: 'justify', mb: 2 }}>
                                                UGC NET Psychology is one of the most sought-after subjects under the National Eligibility Test conducted by the National Testing Agency (NTA). The examination determines eligibility for Assistant Professor and Junior Research Fellowship (JRF).
                                            </Typography>
                                            <Typography variant="body1" paragraph sx={{ textAlign: 'justify', mb: 2 }}>
                                                The syllabus is vast and interdisciplinary, covering core areas such as Research Methods, Cognitive Psychology, Social Psychology, and Psychopathology. Over the years, analysis of previous year questions (PYQs) reveals that NTA often repeats themes and models, making systematic practice essential.
                                            </Typography>
                                            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                                                {[
                                                    "Thorough understanding of core concepts",
                                                    "Regular practice of previous year questions",
                                                    "Exposure to exam-level mock tests",
                                                    "Continuous performance analysis and revision"
                                                ].map((item, i) => (
                                                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, width: 'fit-content' }}>
                                                        <Box sx={{ color: '#db2777', display: 'flex' }}><CheckCircle size={18} /></Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{item}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                            <Typography variant="body1" sx={{ mt: 4, fontStyle: 'italic', fontWeight: 500, color: '#db2777', textAlign: 'center', borderTop: '1px solid #f1f5f9', pt: 3 }}>
                                                "UGC NET Psychology: A gateway to academic excellence and research opportunities."
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Container>

                {/* Payment Modal */}
                <PaymentDialog
                    open={paymentDialogOpen}
                    onClose={() => setPaymentDialogOpen(false)}
                    testName={pendingTestData?.testName || pendingBundleData?.name}
                    testPrice={pendingTestData?.price || pendingBundleData?.price}
                    testId={pendingTestData?.testId}
                    bundleId={pendingBundleData?.id}
                    isBundle={!!pendingBundleData}
                    testCount={pendingBundleData?.testIds?.length}
                    subjectId={pendingTestData?.subjectId}
                    user={user}
                    onUnlock={handleUnlockTest}
                />

                <ModernDialog
                    open={dialog.open}
                    onClose={() => setDialog(prev => ({ ...prev, open: false }))}
                    onConfirm={dialog.onConfirm}
                    title={dialog.title}
                    message={dialog.message}
                    type={dialog.type}
                />
            </Box>
        </Box>
    );
};

export default MockTestDashboard;

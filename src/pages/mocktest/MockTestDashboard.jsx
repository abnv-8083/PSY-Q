import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress, IconButton, Avatar, Menu, MenuItem, Divider, Paper, Tabs, Tab, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { supabase } from '../../lib/supabaseClient';
import { collection, getDocs, query, where, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { BookOpen, Clock, ArrowLeft, CheckCircle, User, Users, LogOut, Sparkles, Settings, ChevronRight, Info, ShieldCheck, Trophy, Zap, Star, Package, Lock, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentDialog from '../../components/PaymentDialog';

const MockTestDashboard = () => {

    const [subjects, setSubjects] = useState([]);
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
                    alert(`Successfully purchased ${pendingBundleData.name}! You now have access to all tests in this bundle.`);
                } else if (pendingTestData) {
                    navigate(`/academic/mocktest/${pendingTestData.subjectId}/${pendingTestData.testId}/rules`);
                }

                console.log('Payment record saved to Supabase');
            } catch (error) {
                console.error('Error saving payment record to Supabase:', error);
                alert("Payment successful, but we had trouble updating your access. Please contact support.");
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
        const needsPayment = !isFullyUnlocked && !isFreeTry;

        const iconColor = (isFullyUnlocked || isFreeTry) ? '#16a34a' : '#e11d48';
        const iconBg = (isFullyUnlocked || isFreeTry) ? '#f0fdf4' : '#fff1f2';

        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
            >
                <Paper
                    key={test.id}
                    elevation={0}
                    sx={{
                        p: 2,
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2.5,
                        transition: 'all 0.2s',
                        background: 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(8px)',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            borderColor: '#db2777',
                            boxShadow: '0 8px 20px -10px rgba(219, 39, 119, 0.2)'
                        }
                    }}
                    aria-label={`mock test item ${test.name}`}
                >
                    <Avatar
                        sx={{
                            bgcolor: iconBg,
                            color: iconColor,
                            width: 44,
                            height: 44,
                            boxShadow: `0 4px 10px ${iconColor}15`
                        }}
                    >
                        {isFullyUnlocked ? <CheckCircle size={20} /> : (isFreeTry ? <Sparkles size={20} /> : <Lock size={20} />)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2, mb: 0.5 }}>
                            {test.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                                <Clock size={12} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{test.duration} min</Typography>
                            </Box>
                            {test.free && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a' }}>
                                    <Star size={12} fill="#16a34a" />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Free</Typography>
                                </Box>
                            )}
                            {isFreeTry && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#db2777' }}>
                                    <Sparkles size={12} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>1st Try Free</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Button
                        variant={(isFullyUnlocked || isFreeTry) ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handleStartTest(test.subjectId || selectedSubject, test.id, test.price, test.name)}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 800,
                            textTransform: 'none',
                            px: 2.5,
                            bgcolor: (isFullyUnlocked || isFreeTry) ? '#db2777' : 'transparent',
                            borderColor: '#db2777',
                            color: (isFullyUnlocked || isFreeTry) ? '#fff' : '#db2777',
                            '&:hover': {
                                bgcolor: (isFullyUnlocked || isFreeTry) ? '#be185d' : 'rgba(219, 39, 119, 0.05)',
                                borderColor: '#db2777'
                            }
                        }}
                    >
                        {isFullyUnlocked ? 'Start' : (isFreeTry ? 'Free Try' : `₹${test.price}`)}
                    </Button>
                </Paper>
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
                {/* Top Navigation / Breadcrumbs */}
                <Box sx={{ py: 2 }}>
                    <Container maxWidth="lg">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b', fontSize: '0.85rem' }}>
                                <Typography variant="body2" sx={{ cursor: 'pointer', color: '#64748b' }} onClick={() => navigate('/')}>Home</Typography>
                                <ChevronRight size={16} color="#94a3b8" />
                                <Typography variant="body2" sx={{ cursor: 'pointer', color: '#64748b' }}>UGC NET Psy...</Typography>
                                <ChevronRight size={16} color="#94a3b8" />
                                <Typography variant="body2" sx={{ color: '#db2777', fontWeight: 500 }}>Mock Tests</Typography>
                            </Box>

                            {user ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <IconButton onClick={handleMenuOpen} sx={{ border: '1px solid #e2e8f0' }}>
                                        <User size={20} color="#64748b" />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <MenuItem onClick={() => { handleMenuClose(); navigate('/student/profile'); }}>Profile</MenuItem>
                                        <MenuItem onClick={() => { handleMenuClose(); navigate('/student/payment'); }}>Payment</MenuItem>
                                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                        {(userRole === 'admin' || userRole === 'sub-admin') && (
                                            <MenuItem onClick={() => { handleMenuClose(); navigate('/admin'); }} sx={{ color: '#db2777', fontWeight: 700 }}>Admin Panel</MenuItem>
                                        )}
                                    </Menu>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/student/signup')}
                                        sx={{ borderRadius: 2, textTransform: 'none', color: '#db2777', borderColor: '#db2777' }}
                                        aria-label="Sign up"
                                    >
                                        Sign Up
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/student/signin')}
                                        sx={{ bgcolor: '#db2777', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                        aria-label="Sign in"
                                    >
                                        Sign In
                                    </Button>
                                </Box>
                            )}
                        </Box>
                        {renderAdvantagesBanner()}
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
                                        gap: 3,
                                        height: { md: 'calc(100vh - 200px)' },
                                        overflow: { md: 'hidden' }
                                    }}>
                                        {/* Left Column - Bundles */}
                                        <Box sx={{
                                            width: { xs: '100%', md: '60%' },
                                            overflowY: { md: 'auto' },
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

                                        {/* Right Column - Tests */}
                                        <Box sx={{
                                            width: { xs: '100%', md: '40%' },
                                            overflowY: { md: 'auto' },
                                            borderLeft: { md: '1px solid #e2e8f0' },
                                            pl: { md: 2 },
                                            pb: 2
                                        }}>
                                            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                    Test
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {displayedTests.length > 0 ? (
                                                    displayedTests.map((test) => renderTestItem(test))
                                                ) : (
                                                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 2, border: '1px dashed #ccc' }}>
                                                        <Typography color="textSecondary">No tests available for this selection.</Typography>
                                                    </Box>
                                                )}
                                            </Box>
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
                                            {selectedBundle ? 'Tests in Selected Bundle' : 'All Mock Tests'}
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
            </Box>
        </Box>
    );
};

export default MockTestDashboard;

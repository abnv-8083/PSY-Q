import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha
} from '@mui/material';
import {
    BookOpen, CheckCircle, Star, Users, Award, Mail, Phone, MapPin,
    ChevronRight, ChevronLeft, Clock, ShieldCheck, BarChart2, Zap, Target, Play, Calendar,
    Brain, FlaskConical, BarChart3, Library, Activity, Heart, Crown, Package, Sparkles, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';
import NotificationsCarousel from '../../components/NotificationsCarousel';
import { fetchBundles } from '../../api/bundlesApi';
import { useSession } from '../../contexts/SessionContext';

// --- Constants ---
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

const getBundleIcon = (bundleName) => {
    const name = bundleName?.toLowerCase() || '';
    if (name.includes('premium') || name.includes('pro') || name.includes('elite')) return Crown;
    if (name.includes('advanced') || name.includes('inter')) return Zap;
    if (name.includes('psych')) return Brain;
    if (name.includes('clinical')) return Activity;
    if (name.includes('counsel')) return Heart;
    return Package;
};

// --- Components ---

const MarqueeQuotes = ({ phrases }) => {
    // Join phrases with a separator for a continuous flow
    const combinedText = phrases.join("   •   ") + "   •   ";

    return (
        <Box sx={{ minHeight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <Box sx={{
                bgcolor: COLORS.accent,
                px: 3,
                py: 1.2,
                borderRadius: '50px',
                boxShadow: `0 4px 15px ${alpha(COLORS.accent, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                minWidth: { xs: '320px', sm: '550px', md: '800px' },
                height: '45px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 60, // Much slower speed
                        ease: "linear"
                    }}
                    style={{
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        position: 'absolute',
                        left: 0,
                        minWidth: '200%' // Ensure container is wide enough
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'white',
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            fontSize: '0.9rem',
                            mr: 4 // Add spacing at the end of the first block
                        }}
                    >
                        {combinedText}
                    </Typography>
                    {/* Duplicate the text to make the loop seamless */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'white',
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            fontSize: '0.9rem',
                            mr: 4 // Consistent spacing
                        }}
                    >
                        {combinedText}
                    </Typography>
                </motion.div>
            </Box>
        </Box>
    );
};

const AnimatedCounter = ({ end, label, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        const duration = 2000; // 2 seconds

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end]);

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.accent, lineHeight: 1 }}>
                {count}{suffix}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 700, letterSpacing: 0.5, display: 'block' }}>
                {label}
            </Typography>
        </Box>
    );
};

const HeroSection = ({ navigate }) => {
    const quotes = [
        "Every topper once made a small decision to practice seriously.",
        "Take that step today. We made this for you.",
        "Now its your turn.."
    ];

    return (
        <Box sx={{
            bgcolor: '#FFFFFF',
            pt: { xs: 8, sm: 10, md: 12 }, // Adjusted for single navbar
            pb: { xs: 8, md: 10 },
            borderBottom: `1px solid ${COLORS.border}`,
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center'
        }}>
            <Container maxWidth="lg">
                <Box sx={{ maxWidth: '900px', mx: 'auto', mb: 8 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <MarqueeQuotes phrases={quotes} />
                        <Typography variant="overline" sx={{
                            color: COLORS.accent, fontWeight: 800, letterSpacing: '0.15em', mb: 2, display: 'block'
                        }}>
                            UGC NET/JRF MOCK TEST
                        </Typography>
                        <Typography variant="h1" sx={{
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            fontWeight: 900, color: COLORS.primary, lineHeight: 1.1, mb: 3
                        }}>
                            Master UGC NET - JRF <br />
                            <Box component="span" sx={{ color: COLORS.accent }}>Psychology</Box>
                        </Typography>
                        <Typography variant="body1" sx={{
                            fontSize: '1.2rem', color: COLORS.secondary, mb: 4, maxWidth: '650px', lineHeight: 1.6, mx: 'auto'
                        }}>
                            Boost your exam score through systematic practice of previous year questions with expert explanations
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/academic/mocktest/dashboard')}
                                sx={{
                                    bgcolor: COLORS.accent, fontSize: '1.1rem', py: 1.5, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                                    '&:hover': { bgcolor: COLORS.accentHover }
                                }}
                            >
                                Start Practicing
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/academic/mocktest/dashboard')}
                                sx={{
                                    color: COLORS.primary, borderColor: COLORS.primary, fontSize: '1.1rem', py: 1.5, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700
                                }}
                            >
                                Free Trail
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={4} sx={{ justifyContent: 'center', mb: 4, mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Clock size={18} color={COLORS.accent} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                    24/7 Access
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Calendar size={18} color={COLORS.accent} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>
                                    1+ Year Validity
                                </Typography>
                            </Box>
                        </Stack>

                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: { xs: 4, md: 6 },
                            pt: 5,
                            borderTop: `1px solid ${alpha(COLORS.border, 0.5)}`,
                            justifyContent: 'center'
                        }}>
                            <AnimatedCounter end={50} label="FULL TESTS" suffix="+" />
                            <AnimatedCounter end={12} label="YEARS OF PYQs" suffix="+" />
                            <AnimatedCounter end={5} label="PRACTICE QUESTIONS" suffix="K+" />
                            <AnimatedCounter end={2} label="TOTAL EXPLANATIONS" suffix="K+" />
                            <AnimatedCounter end={2} label="TOTAL USERS" suffix="K+" />
                        </Box>

                        <Box sx={{ mt: 8, mb: 2 }}>
                            <NotificationsCarousel />
                        </Box>
                    </motion.div>
                </Box>
            </Container>
        </Box>
    );
};

const FeatureCardsSection = () => {
    const cardStyle = {
        height: '100%',
        minHeight: 280, // Fixed height for same size
        borderRadius: 4,
        p: 2.5,
        border: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
        }
    };

    const AnalyticsCardContent = () => (
        <>
            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ p: 1.5, bgcolor: `${COLORS.accent}15`, borderRadius: '50%' }}>
                    <BarChart2 size={24} color={COLORS.accent} />
                </Box>
            </Box>
            <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 1.5, color: COLORS.primary, lineHeight: 1.3, fontSize: '1rem' }}>
                REAL-TIME PERFORMANCE <br />ANALYTICS & INSIGHTS
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Zap size={16} color={COLORS.accent} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Speed Analysis</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Target size={16} color={COLORS.accent} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Accuracy Tracking</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Users size={16} color={COLORS.accent} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Percentile Score</Typography>
                </Box>
            </Stack>
        </>
    );

    const TestCardContent = () => (
        <>
            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ p: 1.5, bgcolor: `${COLORS.accent}15`, borderRadius: '50%' }}>
                    <BookOpen size={24} color={COLORS.accent} />
                </Box>
            </Box>
            <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 1.5, color: COLORS.primary, lineHeight: 1.3, fontSize: '1rem' }}>
                UGC-NET PAPER 2 PSYCHOLOGY<br />Previous Year Questions
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <CheckCircle size={16} color={COLORS.success} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Dynamic Question Sets</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Clock size={16} color={COLORS.accent} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Timed Exams</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Award size={16} color={COLORS.warning} style={{ color: '#F39C12' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Rich Analytics</Typography>
                </Box>
            </Stack>
        </>
    );

    return (
        <Box sx={{ py: 8, bgcolor: COLORS.background }}>
            <Container maxWidth="lg">
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' }, // Horizontal on desktop, stack on very small if needed, but keeping row for now as requested
                    gap: 3,
                    justifyContent: 'center',
                    '& > *': { flex: 1 } // Ensures all cards are same width
                }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <TestCardContent />
                    </Paper>

                    <Paper elevation={0} sx={{ ...cardStyle, bgcolor: COLORS.primary, color: 'white', border: 'none' }}>
                        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                                <Star size={24} color="#F1C40F" />
                            </Box>
                        </Box>
                        <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 2, color: 'white', fontSize: '1rem' }}>
                            English / Expert Explanation
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <CheckCircle size={18} color="#2ECC71" />
                                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Detailed analysis of every question by subject matter experts.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <CheckCircle size={18} color="#2ECC71" />
                                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Authored by top-ranking professors and NET qualified professionals.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <CheckCircle size={18} color="#2ECC71" />
                                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    Comprehensive coverage of all options, not just the correct answer.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper elevation={0} sx={cardStyle}>
                        <AnalyticsCardContent />
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

const Carousel = ({ title, items, renderItem, type = 'default' }) => {
    const scrollRef = React.useRef(null);

    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 400; // Standard scroll distance
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <Box sx={{ py: 6 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.primary }}>
                        {title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={() => handleScroll('left')}
                            size="small"
                            sx={{ minWidth: 0, p: 1, borderRadius: '50%', border: `1px solid ${COLORS.border}`, '&:hover': { bgcolor: alpha(COLORS.accent, 0.05) } }}
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <Button
                            onClick={() => handleScroll('right')}
                            size="small"
                            sx={{ minWidth: 0, p: 1, borderRadius: '50%', border: `1px solid ${COLORS.border}`, '&:hover': { bgcolor: alpha(COLORS.accent, 0.05) } }}
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </Box>
                </Box>

                <Box
                    ref={scrollRef}
                    sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 2,
                        scrollSnapType: 'x mandatory',
                        msOverflowStyle: 'none',  /* IE and Edge */
                        scrollbarWidth: 'none',   /* Firefox */
                        '&::-webkit-scrollbar': { display: 'none' } /* Chrome, Safari and Opera */
                    }}>
                    {items.map((item, index) => (
                        <Box key={index} sx={{
                            minWidth: { xs: '85%', sm: '45%', md: '30%', lg: '22%' },
                            scrollSnapAlign: 'start'
                        }}>
                            {renderItem(item, type)}
                        </Box>
                    ))}
                    {items.length === 0 && (
                        <Box sx={{ width: '100%', py: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">Loading items...</Typography>
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
};


const MockTestHome = () => {
    const navigate = useNavigate();
    const { user } = useSession();
    const [tests, setTests] = useState([]);
    const [bundles, setBundles] = useState([]);
    const [attempts, setAttempts] = useState({});
    const [loading, setLoading] = useState(true);
    const [purchasedBundleIds, setPurchasedBundleIds] = useState(new Set());
    const [pendingBundleIds, setPendingBundleIds] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Tests
                const { data: testsData } = await supabase
                    .from('tests')
                    .select('*, questions(id)')
                    .limit(6);
                if (testsData) setTests(testsData || []);

                // Fetch Bundles using the API for calculated fields
                const bundlesData = await fetchBundles();
                setBundles(bundlesData || []);
                // Fetch User Attempts if logged in
                if (user) {
                    const { data: attemptData } = await supabase
                        .from('attempts')
                        .select('test_id')
                        .eq('user_id', user.id);

                    if (attemptData) {
                        const attemptMap = {};
                        attemptData.forEach(attempt => {
                            attemptMap[attempt.test_id] = (attemptMap[attempt.test_id] || 0) + 1;
                        });
                        setAttempts(attemptMap);
                    }

                    // Fetch purchased bundles
                    const { data: userBundles } = await supabase
                        .from('user_bundles')
                        .select('bundle_id')
                        .eq('user_id', user.id);
                    if (userBundles) setPurchasedBundleIds(new Set(userBundles.map(ub => ub.bundle_id)));

                    // Fetch pending requests
                    const { data: requests } = await supabase
                        .from('purchase_requests')
                        .select('item_id')
                        .eq('user_id', user.id)
                        .eq('item_type', 'bundle')
                        .eq('status', 'pending');
                    if (requests) setPendingBundleIds(new Set(requests.map(r => r.item_id)));
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
            }
        };
        fetchData();
    }, [user]);

    // Scroll to top only on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const renderTestCard = (test) => {
        const isFree = test.price === 0;
        const IconComponent = getSubjectIcon(test.name);

        return (
            <motion.div
                whileHover={{ y: -5 }}
                style={{ height: '100%' }}
            >
                <Card sx={{
                    height: '100%',
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
                        transform: 'translateY(-8px)',
                        boxShadow: `0 25px 50px ${alpha(COLORS.accent, 0.4)}`,
                        '& .card-icon-bg': { transform: 'scale(1.2) rotate(-15deg)', opacity: 0.12 }
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
                            {React.createElement(IconComponent, {
                                size: 120,
                                color: 'white',
                                strokeWidth: 1
                            })}
                        </Box>

                        <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                            <Box>
                                <Box sx={{ 
                                    display: 'inline-flex',
                                    px: 1.2, 
                                    py: 0.4, 
                                    bgcolor: alpha('#ffffff', 0.15), 
                                    backdropFilter: 'blur(4px)',
                                    borderRadius: 1.5,
                                    mb: 1,
                                    border: `1px solid ${alpha('#ffffff', 0.2)}`
                                }}>
                                    <Typography variant="overline" sx={{ 
                                        color: 'white', 
                                        fontWeight: 900, 
                                        letterSpacing: 1.5,
                                        fontSize: '0.6rem'
                                    }}>
                                        UGC-NET PAPER 2 PSYCHOLOGY
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{
                                    fontWeight: 900,
                                    color: 'white',
                                    lineHeight: 1.2,
                                    fontSize: '1.2rem',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                }}>
                                    {test.name}
                                </Typography>
                            </Box>

                            {/* Compact Glass Metadata Grid */}
                            <Grid container spacing={1} sx={{ mb: 0.5 }}>
                                <Grid item xs={6}>
                                    <Box sx={{
                                        p: 1.2,
                                        borderRadius: 3,
                                        bgcolor: alpha('#000000', 0.15),
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${alpha('#ffffff', 0.1)}`,
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), fontWeight: 800, display: 'block', mb: 0.2, fontSize: '0.7rem' }}>
                                            QUESTIONS
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'white', lineHeight: 1 }}>
                                            {test.questions?.length || 0}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{
                                        p: 1.2,
                                        borderRadius: 3,
                                        bgcolor: alpha('#000000', 0.15),
                                        backdropFilter: 'blur(10px)',
                                        border: `1px solid ${alpha('#ffffff', 0.1)}`,
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), fontWeight: 800, display: 'block', mb: 0.2, fontSize: '0.7rem' }}>
                                            DURATION
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'white', lineHeight: 1 }}>
                                            {test.duration}m
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                                <Box sx={{ p: 0.8, bgcolor: alpha('#ffffff', 0.2), borderRadius: 1.5 }}>
                                    <Sparkles size={14} color="white" />
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', fontSize: '0.75rem', opacity: 0.9 }}>
                                    Expert Solution in English
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>

                    <Box sx={{ p: 2.5, pt: 0, position: 'relative', zIndex: 1 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate('/academic/mocktest/dashboard')}
                            endIcon={<ArrowRight size={18} />}
                            sx={{
                                bgcolor: 'white',
                                color: COLORS.accent,
                                fontWeight: 900,
                                borderRadius: 3,
                                textTransform: 'none',
                                py: 1.5,
                                fontSize: '0.9rem',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                '&:hover': {
                                    bgcolor: alpha('#ffffff', 0.9),
                                    boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {isFree ? 'Try for Free' : 'Unlock Access Now'}
                        </Button>
                    </Box>
                </Card>
            </motion.div>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'white', fontFamily: FONTS.primary }}>
            <MockTestNavbar />
            <HeroSection navigate={navigate} />
            <FeatureCardsSection />

            <Box sx={{ bgcolor: COLORS.background }}>
                <Carousel title="Featured Mock Tests" items={tests} renderItem={renderTestCard} />
            </Box>

            {/* Subscription Packages Section */}
            <Box sx={{ py: 10, bgcolor: 'white' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 900,
                            mb: 2,
                            textAlign: 'left',
                            color: COLORS.primary
                        }}
                    >
                        Available Packages
                    </Typography>
                    <Typography
                        sx={{
                            textAlign: 'left',
                            color: COLORS.textLight,
                            mb: 6,
                            fontSize: '1.1rem'
                        }}
                    >
                        Choose the perfect plan for your UGC NET Psychology preparation
                    </Typography>

                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 1200,
                            mx: 'auto',
                            px: 2,
                            overflowX: 'auto',
                            pb: 4,
                            '&::-webkit-scrollbar': {
                                height: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: alpha(COLORS.border, 0.5),
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: alpha(COLORS.accent, 0.3),
                                borderRadius: '10px',
                                '&:hover': {
                                    background: alpha(COLORS.accent, 0.5),
                                },
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 3,
                                pb: 1,
                                minWidth: 'min-content'
                            }}
                        >
                            {bundles
                                .map((bundle, index) => (
                                    <Box
                                        key={bundle.id}
                                        sx={{
                                            flex: '0 0 auto',
                                            width: { xs: '280px', sm: '320px', md: '350px' }
                                        }}
                                    >
                                        <motion.div
                                            whileHover={{ y: -6 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card sx={{
                                                height: 520,
                                                borderRadius: 4.5,
                                                overflow: 'hidden',
                                                background: `rgba(255, 255, 255, 0.8)`,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${alpha('#000000', 0.08)}`,
                                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                '&:hover': {
                                                    boxShadow: `0 20px 60px ${alpha(COLORS.accent, 0.12)}`,
                                                    borderColor: alpha(COLORS.accent, 0.3),
                                                    '& .card-gradient-bg': { transform: 'scale(1.2)', opacity: 0.8 }
                                                },
                                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}>
                                                {/* Animated Background Decor */}
                                                <Box className="card-gradient-bg" sx={{
                                                    position: 'absolute',
                                                    top: -50,
                                                    right: -50,
                                                    width: 150,
                                                    height: 150,
                                                    background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.15)} 0%, transparent 70%)`,
                                                    zIndex: 0,
                                                    transition: 'all 0.6s ease',
                                                    opacity: 0.5,
                                                    pointerEvents: 'none'
                                                }} />

                                                {/* Dynamic Background Icon */}
                                                <Box sx={{
                                                    position: 'absolute',
                                                    right: -20,
                                                    top: 60,
                                                    opacity: 0.04,
                                                    transform: 'rotate(-15deg)',
                                                    pointerEvents: 'none',
                                                    zIndex: 0
                                                }}>
                                                    {React.createElement(getBundleIcon(bundle.name), {
                                                        size: 180,
                                                        color: COLORS.primary,
                                                        strokeWidth: 1
                                                    })}
                                                </Box>

                                                {/* Bundle Header Color Band */}
                                                <Box sx={{
                                                    height: 60,
                                                    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    px: 3,
                                                    position: 'relative',
                                                    zIndex: 2
                                                }}>
                                                    <Typography variant="overline" sx={{ color: 'white', fontWeight: 900, letterSpacing: 2, fontSize: '0.7rem' }}>
                                                        {bundle.bundle_type || 'PACKAGE'}
                                                    </Typography>
                                                </Box>

                                                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                                                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: COLORS.primary, fontSize: '1.25rem', lineHeight: 1.2 }}>
                                                        {bundle.name}
                                                    </Typography>

                                                    <Typography variant="body2" sx={{ color: COLORS.textLight, mb: 3, minHeight: 40 }}>
                                                        {bundle.description}
                                                    </Typography>

                                                    <Stack spacing={1.5} sx={{ mb: 4, flexGrow: 1 }}>
                                                        {(bundle.features || ['5 Mock Tests', '1 Core Subjects', 'Expert Explanation']).slice(0, 4).map((feature, idx) => (
                                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <Box sx={{ p: 0.5, bgcolor: alpha(COLORS.accent, 0.1), borderRadius: '50%' }}>
                                                                    <CheckCircle size={14} color={COLORS.accent} />
                                                                </Box>
                                                                <Typography sx={{ fontWeight: 600, color: COLORS.secondary, fontSize: '0.85rem' }}>
                                                                    {feature}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Stack>

                                                    <Box sx={{ borderTop: `1px solid ${alpha('#000000', 0.05)}`, pt: 3, mt: 'auto' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2.5 }}>
                                                            {bundle.offer_price ? (
                                                                <>
                                                                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary }}>
                                                                        ₹{bundle.offer_price}
                                                                    </Typography>
                                                                    <Typography variant="body1" sx={{ color: COLORS.textLight, textDecoration: 'line-through', fontWeight: 600 }}>
                                                                        ₹{bundle.regular_price}
                                                                    </Typography>
                                                                    <Chip
                                                                        label={`${bundle.discount_percentage}% OFF`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: alpha('#10b981', 0.1),
                                                                            color: '#10b981',
                                                                            fontWeight: 800,
                                                                            fontSize: '0.7rem',
                                                                            borderRadius: 1.5
                                                                        }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary }}>
                                                                    ₹{bundle.regular_price}
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            onClick={() => navigate('/academic/mocktest/bundles')}
                                                            endIcon={<ArrowRight size={18} className="btn-arrow" style={{ transition: 'transform 0.3s' }} />}
                                                            sx={{
                                                                bgcolor: COLORS.accent,
                                                                color: 'white',
                                                                fontWeight: 800,
                                                                borderRadius: 3,
                                                                py: 1.8,
                                                                fontSize: '1rem',
                                                                textTransform: 'none',
                                                                boxShadow: `0 10px 25px -5px ${alpha(COLORS.accent, 0.4)}`,
                                                                '&:hover': {
                                                                    bgcolor: COLORS.accentHover,
                                                                    boxShadow: `0 15px 35px -5px ${alpha(COLORS.accent, 0.5)}`,
                                                                    '& .btn-arrow': { transform: 'translateX(4px)' }
                                                                },
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                            }}
                                                        >
                                                            Get Full Access
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Box>
                                ))}
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* About UGC NET Psychology Section */}
            <Box sx={{ py: 10, bgcolor: 'white', borderTop: `1px solid ${COLORS.border}` }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 4, color: COLORS.primary }}>
                        About <Box component="span" sx={{ color: COLORS.accent }}>UGC NET Psychology</Box>
                    </Typography>

                    <Typography sx={{ fontSize: '1.1rem', color: COLORS.secondary, lineHeight: 1.8, mb: 3 }}>
                        UGC NET Psychology is one of the most sought-after subjects under the National Eligibility Test conducted by the National Testing Agency (NTA). The examination determines eligibility for Assistant Professor and Junior Research Fellowship (JRF) in Indian universities and colleges.
                    </Typography>

                    <Typography sx={{ fontSize: '1.1rem', color: COLORS.secondary, lineHeight: 1.8, mb: 3 }}>
                        The syllabus of UGC NET Psychology is vast, conceptual, and interdisciplinary, covering core areas such as Research Methods, Psychological Testing, Cognitive Psychology, Social Psychology, Developmental Psychology, Counseling, Psychopathology, Organizational Psychology, and Emerging Areas. The exam emphasizes conceptual clarity, application-based understanding, and familiarity with previous year question trends rather than rote memorization.
                    </Typography>

                    <Typography sx={{ fontSize: '1.1rem', color: COLORS.secondary, lineHeight: 1.8, mb: 4 }}>
                        UGC NET Psychology follows an objective multiple-choice format, where accuracy, time management, and analytical thinking play a crucial role. Over the years, analysis of previous year questions (PYQs) reveals that the NTA often repeats themes, models, theorists, and research approaches, making systematic practice of PYQs an essential strategy for success.
                    </Typography>

                    <Box sx={{ p: 4, bgcolor: COLORS.background, borderRadius: 4, mb: 4, border: `1px solid ${alpha(COLORS.accent, 0.1)}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: COLORS.primary }}>
                            A strong preparation approach for UGC NET Psychology involves:
                        </Typography>
                        <Stack spacing={2}>
                            {[
                                'Thorough understanding of core concepts',
                                'Regular practice of previous year questions',
                                'Exposure to exam-level mock tests',
                                'Continuous performance analysis and revision'
                            ].map((item, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <CheckCircle size={20} color={COLORS.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                                    <Typography sx={{ fontWeight: 600, color: COLORS.secondary }}>{item}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>

                    <Typography sx={{ fontSize: '1.1rem', color: COLORS.secondary, lineHeight: 1.8 }}>
                        With disciplined preparation and the right practice resources, aspirants can not only qualify NET but also aim for JRF and top ranks. UGC NET Psychology is not just an examination—it is a gateway to academic excellence, research opportunities, and a career in teaching and psychology.
                    </Typography>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default MockTestHome;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, Paper, alpha, Divider
} from '@mui/material';
import {
    BookOpen, CheckCircle, Star, Users, Award,
    ChevronRight, ChevronLeft, Clock, BarChart2, Zap, Target,
    Calendar, ArrowRight, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MockTestNavbar from '../../components/MockTestNavbar';
import Loader from '../../components/Loader';
import Footer from '../../components/Footer';
import NotificationsCarousel from '../../components/NotificationsCarousel';
import { fetchTests } from '../../api/testsApi';
import { COLORS, FONTS, getSubjectIcon } from '../../theme/mocktestTheme';

// ─── Page Transition ──────────────────────────────────────────────
const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Marquee (CSS-driven) ────────────────────────────────────────
const MarqueeQuotes = ({ phrases }) => {
    const combinedText = phrases.join("   •   ") + "   •   ";
    return (
        <Box sx={{ minHeight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <Box sx={{
                bgcolor: COLORS.accent, px: 3, py: 1.2, borderRadius: '50px',
                boxShadow: `0 4px 15px ${alpha(COLORS.accent, 0.25)}`,
                display: 'flex', alignItems: 'center',
                minWidth: { xs: '320px', sm: '550px', md: '800px' },
                height: '45px', overflow: 'hidden', position: 'relative'
            }}>
                <Box sx={{
                    whiteSpace: 'nowrap', display: 'flex', position: 'absolute', left: 0,
                    animation: 'marqueeScroll 60s linear infinite',
                    '@keyframes marqueeScroll': {
                        '0%': { transform: 'translateX(0)' },
                        '100%': { transform: 'translateX(-50%)' },
                    },
                }}>
                    {[0, 1].map((i) => (
                        <Typography key={i} variant="body2" sx={{
                            color: 'white', fontWeight: 700, letterSpacing: 0.5,
                            fontSize: '0.9rem', mr: 4, flexShrink: 0,
                        }}>
                            {combinedText}
                        </Typography>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

// ─── Viewport-Aware Animated Counter ──────────────────────────────
const AnimatedCounter = ({ end, label, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
            { threshold: 0.3 }
        );
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (!started) return;
        let startTime;
        const duration = 2000;
        let rafId;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [started, end]);

    return (
        <Box ref={ref} sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.accent, lineHeight: 1 }}>
                {count}{suffix}
            </Typography>
            <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 700, letterSpacing: 0.5, display: 'block' }}>
                {label}
            </Typography>
        </Box>
    );
};

// ─── Hero Section ─────────────────────────────────────────────────
const HeroSection = ({ navigate }) => {
    const quotes = [
        "Every topper once made a small decision to practice seriously.",
        "Take that step today. We made this for you.",
        "Now its your turn.."
    ];

    return (
        <Box sx={{
            bgcolor: '#FFFFFF', pt: { xs: 4, md: 6 }, pb: { xs: 8, md: 10 },
            borderBottom: `1px solid ${COLORS.border}`, position: 'relative', overflow: 'hidden', textAlign: 'center'
        }}>
            <Container maxWidth="lg">
                <Box sx={{ maxWidth: '900px', mx: 'auto', mb: 8 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <MarqueeQuotes phrases={quotes} />
                        <Typography variant="overline" sx={{ color: COLORS.accent, fontWeight: 800, letterSpacing: '0.15em', mb: 2, display: 'block' }}>
                            UGC NET/JRF MOCK TEST
                        </Typography>
                        <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 900, color: COLORS.primary, lineHeight: 1.1, mb: 3 }}>
                            Master UGC NET - JRF <br />
                            <Box component="span" sx={{ color: COLORS.accent }}>Psychology</Box>
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem', color: COLORS.secondary, mb: 4, maxWidth: '650px', lineHeight: 1.6, mx: 'auto' }}>
                            Boost your exam score through systematic practice of previous year questions with expert explanations
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6, justifyContent: 'center' }}>
                            <Button
                                variant="contained" size="large"
                                onClick={() => navigate('/academic/mocktest/dashboard')}
                                sx={{
                                    bgcolor: COLORS.accent, fontSize: '1.1rem', py: 1.5, px: 4,
                                    borderRadius: 2, textTransform: 'none', fontWeight: 700,
                                    boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.35)}`,
                                    '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}`, transform: 'translateY(-2px)' },
                                    transition: 'all 0.3s'
                                }}
                            >
                                Start Practicing
                            </Button>
                            <Button
                                variant="outlined" size="large"
                                onClick={() => navigate('/academic/mocktest/bundles')}
                                sx={{
                                    color: COLORS.primary, borderColor: COLORS.primary, fontSize: '1.1rem',
                                    py: 1.5, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700,
                                    '&:hover': { borderColor: COLORS.accent, color: COLORS.accent, bgcolor: alpha(COLORS.accent, 0.05) },
                                    transition: 'all 0.3s'
                                }}
                            >
                                View Bundles
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={4} sx={{ justifyContent: 'center', mb: 4, mt: 2, flexWrap: 'wrap' }}>
                            {[
                                { icon: <Clock size={18} />, text: '24/7 Access' },
                                { icon: <Calendar size={18} />, text: '1+ Year Validity' },
                            ].map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ color: COLORS.accent }}>{item.icon}</Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>{item.text}</Typography>
                                </Box>
                            ))}
                        </Stack>

                        <Box sx={{
                            display: 'flex', flexWrap: 'wrap', gap: { xs: 4, md: 6 }, pt: 5,
                            borderTop: `1px solid ${alpha(COLORS.border, 0.5)}`, justifyContent: 'center'
                        }}>
                            <AnimatedCounter end={10} label="YEARS OF PYQ" suffix="+" />
                            <AnimatedCounter end={150} label="FULL TESTS" suffix="+" />
                            <AnimatedCounter end={6} label="PRACTICE QUESTIONS" suffix="K+" />
                            <AnimatedCounter end={2} label="EXPLANATIONS" suffix="K+" />
                            <AnimatedCounter end={2} label="TOTAL USERS" suffix="K+" />
                            <AnimatedCounter end={120} label="HOURS OF MOCKS" suffix="+" />
                            <AnimatedCounter end={100} label="TOPIC WISE TESTS" suffix="+" />
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

// ─── Feature Cards Section ────────────────────────────────────────
const FeatureCardsSection = () => {
    const cardStyle = {
        height: '100%', minHeight: 280, borderRadius: 4, p: 2.5,
        border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column',
        bgcolor: 'white', transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }
    };

    return (
        <Box sx={{ py: 8, bgcolor: COLORS.background }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'center', '& > *': { flex: 1 } }}>
                    {/* PYQ Card */}
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ p: 1.5, bgcolor: `${COLORS.accent}15`, borderRadius: '50%' }}>
                                <BookOpen size={24} color={COLORS.accent} />
                            </Box>
                        </Box>
                        <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 1.5, color: COLORS.primary, lineHeight: 1.3, fontSize: '1rem' }}>
                            UGC-NET PAPER 2 PSYCHOLOGY<br />Previous Year Questions
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                            {[
                                { icon: <CheckCircle size={16} color={COLORS.success} />, text: 'Dynamic Question Sets' },
                                { icon: <Clock size={16} color={COLORS.accent} />, text: 'Timed Exams' },
                                { icon: <Award size={16} color={COLORS.warning} />, text: 'Rich Analytics' },
                            ].map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                                    {item.icon}
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.text}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Expert Explanations Card (Dark) */}
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
                            {[
                                'Detailed analysis of every question by subject matter experts.',
                                'Authored by top-ranking professors and NET qualified professionals.',
                                'Comprehensive coverage of all options, not just the correct answer.',
                            ].map((text, i) => (
                                <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                                    <CheckCircle size={18} color="#2ECC71" />
                                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', lineHeight: 1.5 }}>{text}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Analytics Card */}
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ p: 1.5, bgcolor: `${COLORS.accent}15`, borderRadius: '50%' }}>
                                <BarChart2 size={24} color={COLORS.accent} />
                            </Box>
                        </Box>
                        <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 1.5, color: COLORS.primary, lineHeight: 1.3, fontSize: '1rem' }}>
                            REAL-TIME PERFORMANCE <br />ANALYTICS & INSIGHTS
                        </Typography>
                        <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                            {[
                                { icon: <Zap size={16} color={COLORS.accent} />, text: 'Speed Analysis' },
                                { icon: <Target size={16} color={COLORS.accent} />, text: 'Accuracy Tracking' },
                                { icon: <Users size={16} color={COLORS.accent} />, text: 'Percentile Score' },
                            ].map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                                    {item.icon}
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.text}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

// ─── Carousel ─────────────────────────────────────────────────────
const Carousel = ({ title, items, renderItem }) => {
    const scrollRef = React.useRef(null);
    const handleScroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' });
        }
    };

    return (
        <Box sx={{ py: 6 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.primary }}>{title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => handleScroll('left')} size="small" sx={{ minWidth: 0, p: 1, borderRadius: '50%', border: `1px solid ${COLORS.border}` }}>
                            <ChevronLeft size={20} />
                        </Button>
                        <Button onClick={() => handleScroll('right')} size="small" sx={{ minWidth: 0, p: 1, borderRadius: '50%', border: `1px solid ${COLORS.border}` }}>
                            <ChevronRight size={20} />
                        </Button>
                    </Box>
                </Box>
                <Box ref={scrollRef} sx={{
                    display: 'flex', gap: 3, overflowX: 'auto', pb: 2, scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }
                }}>
                    {items.map((item, index) => (
                        <Box key={index} sx={{ minWidth: { xs: '85%', sm: '45%', md: '30%', lg: '22%' }, scrollSnapAlign: 'start' }}>
                            {renderItem(item)}
                        </Box>
                    ))}
                    {items.length === 0 && (
                        <Box sx={{ width: '100%', py: 4, display: 'flex', justifyContent: 'center' }}>
                            <Loader text="Loading items..." />
                        </Box>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

// ─── Main Component ───────────────────────────────────────────────
const MockTestHome = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const testsData = await fetchTests();
                if (testsData) {
                    setTests(testsData.filter(t => t.is_published !== false).slice(0, 6));
                }
            } catch (error) {
                console.error("Error fetching home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const renderTestCard = useCallback((test) => {
        const isFree = test.price === 0;
        const IconComponent = getSubjectIcon(test.name);

        return (
            <motion.div whileHover={{ y: -5 }} style={{ height: '100%' }}>
                <Card sx={{
                    height: '100%', borderRadius: 6,
                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #9d174d 100%)`,
                    boxShadow: `0 15px 35px ${alpha(COLORS.accent, 0.2)}`,
                    display: 'flex', flexDirection: 'column', position: 'relative',
                    overflow: 'hidden', color: 'white',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 25px 50px ${alpha(COLORS.accent, 0.4)}`,
                        '& .card-icon-bg': { transform: 'scale(1.2) rotate(-15deg)', opacity: 0.12 }
                    }
                }}>
                    <CardContent sx={{ p: 2.5, flexGrow: 1, position: 'relative', zIndex: 1 }}>
                        <Box className="card-icon-bg" sx={{
                            position: 'absolute', right: -10, top: 15, opacity: 0.08,
                            transition: 'all 0.6s', pointerEvents: 'none', zIndex: 0
                        }}>
                            {React.createElement(IconComponent, { size: 120, color: 'white', strokeWidth: 1 })}
                        </Box>

                        <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                            <Box>
                                <Box sx={{
                                    display: 'inline-flex', px: 1.2, py: 0.4,
                                    bgcolor: alpha('#ffffff', 0.15), backdropFilter: 'blur(4px)',
                                    borderRadius: 1.5, mb: 1, border: `1px solid ${alpha('#ffffff', 0.2)}`
                                }}>
                                    <Typography variant="overline" sx={{ color: 'white', fontWeight: 900, letterSpacing: 1.5, fontSize: '0.6rem' }}>
                                        UGC-NET PAPER 2 PSYCHOLOGY
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'white', lineHeight: 1.2, fontSize: '1.2rem' }}>
                                    {test.name}
                                </Typography>
                            </Box>

                            <Grid container spacing={1} sx={{ mb: 0.5 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: alpha('#000000', 0.15), backdropFilter: 'blur(10px)', border: `1px solid ${alpha('#ffffff', 0.1)}`, textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), fontWeight: 800, display: 'block', mb: 0.2, fontSize: '0.7rem' }}>QUESTIONS</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'white', lineHeight: 1 }}>{test.total_questions || 0}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 1.2, borderRadius: 3, bgcolor: alpha('#000000', 0.15), backdropFilter: 'blur(10px)', border: `1px solid ${alpha('#ffffff', 0.1)}`, textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), fontWeight: 800, display: 'block', mb: 0.2, fontSize: '0.7rem' }}>DURATION</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'white', lineHeight: 1 }}>{test.duration}m</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Stack>
                    </CardContent>

                    <Box sx={{ p: 2.5, pt: 0, position: 'relative', zIndex: 1 }}>
                        <Button
                            fullWidth variant="contained"
                            onClick={() => {
                                if (test.is_free_trial) {
                                    navigate(`/academic/mocktest/psychology/${test._id || test.id}/rules`);
                                } else {
                                    navigate('/academic/mocktest/bundles');
                                }
                            }}
                            endIcon={<ArrowRight size={18} />}
                            sx={{
                                bgcolor: 'white', color: COLORS.accent, fontWeight: 900, borderRadius: 3,
                                textTransform: 'none', py: 1.5, fontSize: '0.9rem',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                '&:hover': { bgcolor: alpha('#ffffff', 0.9), transform: 'translateY(-2px)' },
                                transition: 'all 0.4s'
                            }}
                        >
                            {test.is_free_trial ? 'Try Free Trial' : (isFree ? 'Try for Free' : 'Unlock to Access')}
                        </Button>
                    </Box>
                </Card>
            </motion.div>
        );
    }, [navigate]);

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Box sx={{ minHeight: '100vh', bgcolor: 'white', fontFamily: FONTS.primary }}>
                <MockTestNavbar />
                <HeroSection navigate={navigate} />
                <FeatureCardsSection />

                <Box sx={{ bgcolor: COLORS.background }}>
                    <Carousel title="Featured Mock Tests" items={tests} renderItem={renderTestCard} />
                </Box>

                {/* CTA to Bundles Page */}
                <Box sx={{ py: 10, bgcolor: 'white' }}>
                    <Container maxWidth="lg">
                        <Paper sx={{
                            p: { xs: 4, md: 6 }, borderRadius: 6, textAlign: 'center',
                            background: `linear-gradient(135deg, ${COLORS.primary} 0%, #334155 100%)`,
                            color: 'white', position: 'relative', overflow: 'hidden'
                        }}>
                            {/* Decorative */}
                            <Box sx={{ position: 'absolute', right: -40, top: -40, opacity: 0.05 }}>
                                <Star size={300} color="white" strokeWidth={1} />
                            </Box>

                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, position: 'relative', zIndex: 1, letterSpacing: -1 }}>
                                Ready to Level Up?
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.8, mb: 4, maxWidth: 500, mx: 'auto', fontWeight: 500, position: 'relative', zIndex: 1 }}>
                                Browse our curated test bundles with expert explanations, analytics, and unlimited attempts.
                            </Typography>
                            <Button
                                variant="contained" size="large"
                                onClick={() => navigate('/academic/mocktest/bundles')}
                                endIcon={<ArrowUpRight size={20} />}
                                sx={{
                                    bgcolor: COLORS.accent, color: 'white', fontWeight: 800,
                                    px: 5, py: 1.8, borderRadius: 3, fontSize: '1.05rem',
                                    textTransform: 'none', position: 'relative', zIndex: 1,
                                    boxShadow: `0 10px 30px ${alpha(COLORS.accent, 0.4)}`,
                                    '&:hover': { bgcolor: COLORS.accentHover, transform: 'translateY(-2px)', boxShadow: `0 15px 40px ${alpha(COLORS.accent, 0.5)}` },
                                    transition: 'all 0.3s'
                                }}
                            >
                                View All Bundles
                            </Button>
                        </Paper>
                    </Container>
                </Box>

                <Footer />
            </Box>
        </motion.div>
    );
};

export default MockTestHome;

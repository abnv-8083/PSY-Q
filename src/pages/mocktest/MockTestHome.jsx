import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha
} from '@mui/material';
import {
    BookOpen, CheckCircle, Star, Users, Award, Mail, Phone, MapPin,
    ChevronRight, ChevronLeft, Clock, ShieldCheck, BarChart2, Zap, Target, Play, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';

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
    success: '#10b981'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
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
        "Every topper once made a small decision—to practice seriously.",
        "Take that step today. We made this for you.",
        "Now its your turn.."
    ];

    return (
        <Box sx={{
            bgcolor: '#FFFFFF',
            pt: { xs: 4, md: 6 }, // Reduced padding to fit typing effect nicely
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
                                onClick={() => navigate('/academic/mocktest/tests')}
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
                                onClick={() => navigate('/academic/mocktest/tests')}
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
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>100 Questions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Clock size={16} color={COLORS.accent} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>2 Hours Duration</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Award size={16} color={COLORS.warning} style={{ color: '#F39C12' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>200 Marks</Typography>
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
    const [tests, setTests] = useState([]);
    const [bundles, setBundles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Tests
            const { data: testsData } = await supabase
                .from('tests')
                .select('*')
                .limit(6);
            if (testsData) setTests(testsData);

            // Fetch Bundles
            const { data: bundlesData } = await supabase
                .from('bundles')
                .select('*')
                .limit(6);
            if (bundlesData) setBundles(bundlesData);
        };
        fetchData();
    }, []);

    const renderTestCard = (test) => {
        // Mock data or logic to mimic Dashboard card logic if needed
        const isLocked = false; // featured tests on home are usually free or clickable

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
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>{test.duration} mins Duration</Typography>
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
                            variant="contained"
                            onClick={() => navigate('/academic/mocktest/tests')}
                            startIcon={<Play size={16} />}
                            sx={{
                                bgcolor: COLORS.accent,
                                color: 'white',
                                fontWeight: 700,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: COLORS.accentHover,
                                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
                                }
                            }}
                        >
                            View Details
                        </Button>
                    </Box>
                </Card>
            </motion.div>
        );
    };

    const renderBundleCard = (bundle, type) => {
        const isDark = type === 'dark';
        return (
            <Card sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: isDark ? COLORS.secondary : COLORS.background,
                color: isDark ? 'white' : COLORS.primary,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: isDark ? 'none' : `1px solid ${COLORS.border}`
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{bundle.name}</Typography>
                    <Typography variant="body2" sx={{ mb: 3, opacity: 0.7, minHeight: 40 }}>{bundle.description?.substring(0, 60)}...</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: isDark ? COLORS.accent : COLORS.primary }}>₹{bundle.price}</Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            bgcolor: isDark ? COLORS.accent : COLORS.primary,
                            color: 'white',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700
                        }}
                    >
                        Explore Bundle
                    </Button>
                </CardContent>
            </Card>
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

            <Carousel title="Premium Bundles" items={bundles} renderItem={renderBundleCard} type="light" />

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

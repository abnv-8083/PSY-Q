import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
    Stack, useTheme, useMediaQuery, Paper, Skeleton, alpha
} from '@mui/material';
import {
    BookOpen, CheckCircle, Star, Users, Award, Mail, Phone, MapPin,
    ChevronRight, ChevronLeft, Clock, ShieldCheck, BarChart2, Zap, Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import MockTestNavbar from '../../components/MockTestNavbar';

// --- Constants ---
const COLORS = {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#3498DB',
    accentHover: '#2980B9',
    background: '#F8F9FA',
    cardBg: '#FFFFFF',
    textLight: '#7F8C8D',
    border: '#E0E0E0',
    success: '#27AE60'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

// --- Components ---

const HeroSection = ({ navigate }) => (
    <Box sx={{
        bgcolor: '#FFFFFF',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 10 },
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'relative',
        overflow: 'hidden'
    }}>
        <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={7}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <Typography variant="overline" sx={{
                            color: COLORS.accent, fontWeight: 800, letterSpacing: '0.15em', mb: 2, display: 'block'
                        }}>
                            ACE YOUR EXAMS
                        </Typography>
                        <Typography variant="h1" sx={{
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            fontWeight: 900, color: COLORS.primary, lineHeight: 1.1, mb: 3
                        }}>
                            Master UGC NET <br />
                            <Box component="span" sx={{ color: COLORS.accent }}>Psychology</Box>
                        </Typography>
                        <Typography variant="body1" sx={{
                            fontSize: '1.2rem', color: COLORS.secondary, mb: 5, maxWidth: '550px', lineHeight: 1.6
                        }}>
                            Comprehensive mock tests, expert explanations, and real-time analytics to boost your preparation score.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                                onClick={() => navigate('/academic/mocktest/features')}
                                sx={{
                                    color: COLORS.primary, borderColor: COLORS.primary, fontSize: '1.1rem', py: 1.5, px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700
                                }}
                            >
                                Explore Features
                            </Button>
                        </Stack>
                    </motion.div>
                </Grid>
                <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                        <Box
                            component="img"
                            src="/images/mocktest-hero.png"
                            alt="Psychology Exam Prep"
                            sx={{
                                width: '100%', maxWidth: 400, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                                transform: 'perspective(1000px) rotateY(-5deg)'
                            }}
                            onError={(e) => { e.target.src = 'https://placehold.co/600x400/eef2f5/2c3e50?text=Psychology+Prep'; }}
                        />
                    </motion.div>
                </Grid>
            </Grid>
        </Container>
    </Box>
);

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
                UGC-NET PAPER 2 PSYCHOLOGY<br />2020 December Questions
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <CheckCircle size={16} color={COLORS.success} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>100 Questions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: COLORS.background, p: 1, borderRadius: 2 }}>
                    <Clock size={16} color={COLORS.accent} />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>3 Hours Duration</Typography>
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

const AboutSection = () => (
    <Box sx={{ bgcolor: COLORS.primary, color: 'white', py: 10 }}>
        <Container maxWidth="lg">
            <Grid container spacing={8}>
                <Grid item xs={12} md={6}>
                    <Typography variant="overline" sx={{ color: COLORS.accent, fontWeight: 700, letterSpacing: '0.1em' }}>
                        ABOUT US
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 4 }}>
                        Empowering Future Psychologists
                    </Typography>
                    <Typography paragraph sx={{ opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.8 }}>
                        We are dedicated to providing the highest quality preparation resources for UGC NET Psychology aspirants. Our mission is to democratize access to expert-level guidance and comprehensive practice materials.
                    </Typography>
                    <Stack direction="row" spacing={4} sx={{ mt: 5 }}>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.accent }}>5K+</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>SUCCESSFUL STUDENTS</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: COLORS.accent }}>50+</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>EXPERT MENTORS</Typography>
                        </Box>
                    </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <MapPin color={COLORS.accent} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Headquarters</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>123 Education Lane, Knowledge Park, New Delhi - 110001</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Mail color={COLORS.accent} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Email Us</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>support@psy-q.com</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Phone color={COLORS.accent} />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Call Us</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>+91 98765 43210</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    </Box>
);

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

    const renderTestCard = (test) => (
        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${COLORS.border}` }}>
            <CardContent sx={{ p: 3 }}>
                <Chip label={test.subject_id === 1 ? 'Psychology' : 'General'} size="small" sx={{ mb: 2, bgcolor: `${COLORS.accent}15`, color: COLORS.accent, fontWeight: 700 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, minHeight: 64, lineHeight: 1.3 }}>
                    {test.name}
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: COLORS.textLight }}>
                        <span>Questions</span>
                        <span style={{ fontWeight: 600, color: COLORS.primary }}>100</span>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: COLORS.textLight }}>
                        <span>Duration</span>
                        <span style={{ fontWeight: 600, color: COLORS.primary }}>{test.duration} mins</span>
                    </Box>
                </Stack>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/academic/mocktest/tests')}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    View Details
                </Button>
            </CardContent>
        </Card>
    );

    const renderBundleCard = (bundle, type) => {
        const isDark = type === 'dark';
        return (
            <Card sx={{
                height: '100%',
                borderRadius: 3,
                bgcolor: isDark ? COLORS.secondary : 'white',
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

            <Box sx={{ bgcolor: '#2C3E50', py: 2 }}>
                <Carousel title="Exclusive Collections" items={bundles} renderItem={renderBundleCard} type="dark" />
            </Box>

            <AboutSection />
        </Box>
    );
};

export default MockTestHome;

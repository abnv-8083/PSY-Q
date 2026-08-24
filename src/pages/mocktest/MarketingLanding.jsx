import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Card, Stack, Chip, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { Clock, Target, Award, Zap, ArrowRight, AlertCircle, PartyPopper, Share2 } from 'lucide-react';
import { fetchMarketingTest } from '../../api/testsApi';
import MockTestNavbar from '../../components/MockTestNavbar';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';
import { COLORS, FONTS } from '../../theme/mocktestTheme';

const MarketingLanding = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [testInfo, setTestInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTest = async () => {
            try {
                const data = await fetchMarketingTest(slug);
                setTestInfo(data);
            } catch (err) {
                setError('This promo link is invalid or has expired.');
            } finally {
                setLoading(false);
            }
        };
        loadTest();
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd' }}>
                <MockTestNavbar />
                <Loader fullScreen text="Loading..." />
            </Box>
        );
    }

    if (error || !testInfo) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd' }}>
                <MockTestNavbar />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                    <Card sx={{ p: 6, textAlign: 'center', borderRadius: 5, maxWidth: 450, border: `1px solid ${COLORS.border}` }}>
                        <Box sx={{ mb: 3, display: 'inline-flex', p: 2.5, bgcolor: alpha('#ef4444', 0.08), borderRadius: '50%' }}>
                            <AlertCircle size={48} color="#ef4444" />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>Link Not Found</Typography>
                        <Typography sx={{ color: COLORS.textLight, mb: 4 }}>{error}</Typography>
                        <Button variant="contained" onClick={() => navigate('/academic/mocktest')} sx={{ bgcolor: COLORS.accent, borderRadius: 3, fontWeight: 800, textTransform: 'none' }}>
                            Go to Mock Tests
                        </Button>
                    </Card>
                </Box>
                <Footer />
            </Box>
        );
    }

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            <Box sx={{
                pt: { xs: 6, md: 10 }, pb: 10,
                background: `linear-gradient(160deg, ${COLORS.primary} 0%, #334155 50%, ${alpha(COLORS.accent, 0.15)} 100%)`,
                color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                {/* Decorative */}
                <Box sx={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', bgcolor: alpha('#fff', 0.03) }} />
                <Box sx={{ position: 'absolute', left: -40, bottom: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: alpha(COLORS.accent, 0.08) }} />

                <Container maxWidth="md">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Stack spacing={4} alignItems="center" textAlign="center">
                            <Chip
                                icon={<PartyPopper size={14} />}
                                label="FREE ACCESS"
                                sx={{
                                    bgcolor: alpha('#10b981', 0.2), color: '#34d399', fontWeight: 800,
                                    border: '1px solid rgba(16,185,129,0.3)', px: 1
                                }}
                            />

                            <Typography variant="overline" sx={{ color: alpha('#fff', 0.5), fontWeight: 700, letterSpacing: 2 }}>
                                LIMITED TIME OFFER
                            </Typography>

                            <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.15, letterSpacing: -1 }}>
                                {testInfo.name}
                            </Typography>

                            <Typography variant="h6" sx={{ opacity: 0.7, fontWeight: 500, maxWidth: 500 }}>
                                This test is temporarily free! Take advantage of this offer to practice and improve your preparation.
                            </Typography>

                            {/* Stats */}
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {[
                                    { icon: <Target size={18} />, label: `${testInfo.total_questions} Questions` },
                                    { icon: <Clock size={18} />, label: `${testInfo.duration} Minutes` },
                                    { icon: <Award size={18} />, label: `${(testInfo.total_questions || 0) * 2} Marks` },
                                ].map((stat, i) => (
                                    <Box key={i} sx={{
                                        px: 3, py: 1.5, borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', gap: 1.2
                                    }}>
                                        <Box sx={{ color: 'rgba(255,255,255,0.6)' }}>{stat.icon}</Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{stat.label}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Time window */}
                            {(testInfo.marketing_start || testInfo.marketing_end) && (
                                <Box sx={{
                                    p: 2.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', maxWidth: 400, width: '100%'
                                }}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Offer Valid
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mt: 0.5 }}>
                                        {testInfo.marketing_start && `From ${formatDate(testInfo.marketing_start)}`}
                                        {testInfo.marketing_start && testInfo.marketing_end && ' — '}
                                        {testInfo.marketing_end && `Until ${formatDate(testInfo.marketing_end)}`}
                                    </Typography>
                                </Box>
                            )}

                            {/* CTA */}
                            <Button
                                variant="contained" size="large"
                                endIcon={<ArrowRight size={20} />}
                                onClick={() => navigate(`/academic/mocktest/psychology/${testInfo.test_id}/rules`)}
                                sx={{
                                    bgcolor: testInfo.is_currently_free ? '#10b981' : COLORS.accent,
                                    color: 'white', fontWeight: 900, fontSize: '1.15rem',
                                    px: 6, py: 2, borderRadius: 4, textTransform: 'none',
                                    boxShadow: `0 12px 32px ${alpha(testInfo.is_currently_free ? '#10b981' : COLORS.accent, 0.4)}`,
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: `0 18px 40px ${alpha(testInfo.is_currently_free ? '#10b981' : COLORS.accent, 0.5)}`,
                                    },
                                    transition: 'all 0.3s'
                                }}
                            >
                                {testInfo.is_currently_free ? 'Start Free Test Now' : 'Check Availability'}
                            </Button>

                            <Typography variant="caption" sx={{ opacity: 0.4, fontWeight: 600 }}>
                                No payment required • Instant access
                            </Typography>
                        </Stack>
                    </motion.div>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default MarketingLanding;

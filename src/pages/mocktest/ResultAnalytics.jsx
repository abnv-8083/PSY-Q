import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Grid, Button, Divider,
    Accordion, AccordionSummary, AccordionDetails, Chip, CircularProgress,
    Stack, alpha
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, XCircle, ChevronDown, RefreshCw, Home, Award,
    Sparkles, PartyPopper, Star, ArrowRight, BarChart2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { auth } from '../../lib/firebase';
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

const ConfettiParticle = ({ side }) => {
    const colors = [COLORS.accent, '#FFD700', COLORS.primary, '#4CAF50', '#FF5722'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomAngle = (side === 'left' ? -45 : -135) + (Math.random() * 60 - 30);
    const distance = 200 + Math.random() * 300;

    return (
        <motion.div
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
                x: Math.cos(randomAngle * Math.PI / 180) * distance,
                y: Math.sin(randomAngle * Math.PI / 180) * distance,
                opacity: 0,
                scale: [0, 1.5, 0],
                rotate: Math.random() * 360
            }}
            transition={{ duration: 2, ease: "easeOut", delay: Math.random() * 0.5 }}
            style={{
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                backgroundColor: randomColor,
                zIndex: 100,
                pointerEvents: 'none'
            }}
        />
    );
};

const ResultAnalytics = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { subjectId, testId } = useParams();

    const [score, setScore] = useState(state?.score || 0);
    const [total, setTotal] = useState(state?.total || 0);
    const [answers, setAnswers] = useState(state?.answers || {});
    const [questions, setQuestions] = useState(state?.questions || []);
    const [loading, setLoading] = useState(!state);

    useEffect(() => {
        if (!state && testId) {
            const fetchData = async () => {
                try {
                    const { data: qData } = await supabase
                        .from('questions')
                        .select('*')
                        .eq('test_id', testId)
                        .order('created_at', { ascending: true });

                    if (qData) {
                        const mappedQuestions = qData.map(q => ({
                            ...q,
                            text: q.text || q.question_text,
                            correctKey: q.correct_key !== undefined ? q.correct_key : q.correct_answer
                        }));
                        setQuestions(mappedQuestions);
                        setTotal(mappedQuestions.length);

                        const { data: attempt } = await supabase
                            .from('attempts')
                            .select('*')
                            .eq('test_id', testId)
                            .eq('user_id', auth.currentUser?.uid)
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .single();

                        if (attempt) {
                            setScore(attempt.score);
                            setAnswers(attempt.answers || {});
                        }
                    }
                } catch (err) {
                    console.error("Error fetching result analytics:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [state, testId]);

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2, bgcolor: '#fbfcfd' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: COLORS.accent }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.secondary }}>Analyzing Your Performance...</Typography>
        </Box>
    );

    const percentage = Math.round((score / (total || 1)) * 100) || 0;

    const getQuote = (pct) => {
        if (pct >= 90) return "Outstanding Performance! You've mastered this mock test.";
        if (pct >= 75) return "Great job! Your understanding of the subject is very strong.";
        if (pct >= 50) return "Good effort! Keep practicing to further refine your skills.";
        return "Don't give up! Consistency and focused revision are keys to success.";
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fbfcfd' }}>
            <MockTestNavbar />

            <Box sx={{ position: 'relative', overflow: 'hidden', pt: 8, pb: 10 }}>
                {/* Background Blobs */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                    <motion.div
                        animate={{
                            x: [0, 40, 0],
                            y: [0, 60, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            top: '10%',
                            left: '10%',
                            width: '40%',
                            height: '40%',
                            background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.05)} 0%, transparent 70%)`,
                            filter: 'blur(80px)',
                            borderRadius: '50%'
                        }}
                    />
                </Box>

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Paper sx={{
                            p: { xs: 4, md: 6 },
                            borderRadius: 6,
                            textAlign: 'center',
                            mb: 6,
                            position: 'relative',
                            border: `1px solid ${COLORS.border}`,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                            bgcolor: 'white'
                        }}>
                            {percentage >= 80 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.5 }}
                                    style={{ position: 'absolute', top: -15, left: -15, zIndex: 10 }}
                                >
                                    <Chip
                                        icon={<PartyPopper size={16} />}
                                        label="Brilliant!"
                                        sx={{
                                            bgcolor: COLORS.accent,
                                            color: 'white',
                                            fontWeight: 800,
                                            px: 1,
                                            boxShadow: '0 8px 20px rgba(202, 0, 86, 0.3)'
                                        }}
                                    />
                                </motion.div>
                            )}

                            <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1, letterSpacing: -1 }}>
                                Performance <Box component="span" sx={{ color: COLORS.accent }}>Report</Box>
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Box sx={{
                                        width: 180, height: 180, borderRadius: '50%',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        border: `10px solid ${alpha(COLORS.accent, 0.1)}`,
                                        position: 'relative',
                                        bgcolor: 'white'
                                    }}>
                                        <Typography variant="h2" sx={{ fontWeight: 900, color: COLORS.accent }}>{score}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textLight }}>of {total}</Typography>
                                    </Box>

                                    {/* Circular Progress Overlay for effect or just visual */}
                                    <svg style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)', width: 180, height: 180 }}>
                                        <circle
                                            cx="90" cy="90" r="85"
                                            fill="none"
                                            stroke={alpha(COLORS.accent, 0.1)}
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="90" cy="90" r="85"
                                            fill="none"
                                            stroke={COLORS.accent}
                                            strokeWidth="10"
                                            strokeDasharray={`${2 * Math.PI * 85 * (percentage / 100)} ${2 * Math.PI * 85}`}
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    {percentage >= 80 && (
                                        <Box sx={{ position: 'absolute', bottom: 5, right: 5 }}>
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                                <Award size={40} color="#FFD700" fill="#FFD700" />
                                            </motion.div>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary }}>{percentage}%</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textLight }}>ACCURACY</Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ bgcolor: COLORS.border }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary }}>{score * 2}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.textLight }}>PTS EARNED</Typography>
                                </Box>
                            </Stack>

                            <Typography variant="h6" sx={{ color: COLORS.secondary, fontStyle: 'italic', mb: 5, maxWidth: 600, mx: 'auto' }}>
                                "{getQuote(percentage)}"
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                <Button
                                    variant="contained"
                                    startIcon={<RefreshCw size={20} />}
                                    onClick={() => navigate(`/academic/mocktest/tests`)}
                                    sx={{
                                        bgcolor: COLORS.accent,
                                        borderRadius: 3,
                                        px: 4, py: 1.5,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        '&:hover': { bgcolor: COLORS.accentHover }
                                    }}
                                >
                                    Try Another Test
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Home size={20} />}
                                    onClick={() => navigate('/academic/mocktest')}
                                    sx={{
                                        borderRadius: 3,
                                        px: 4,
                                        borderColor: COLORS.primary,
                                        color: COLORS.primary,
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        '&:hover': { borderColor: COLORS.accent, color: COLORS.accent, bgcolor: alpha(COLORS.accent, 0.05) }
                                    }}
                                >
                                    Back to Dash
                                </Button>
                            </Stack>

                            {/* Confetti effect for high scores */}
                            {percentage >= 80 && (
                                <>
                                    <Box sx={{ position: 'absolute', bottom: 40, left: 40, zIndex: 10 }}>
                                        {Array.from({ length: 20 }).map((_, i) => <ConfettiParticle key={i} side="left" />)}
                                    </Box>
                                    <Box sx={{ position: 'absolute', bottom: 40, right: 40, zIndex: 10 }}>
                                        {Array.from({ length: 20 }).map((_, i) => <ConfettiParticle key={i} side="right" />)}
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </motion.div>

                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BarChart2 size={24} color={COLORS.accent} />
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>Detailed Analysis</Typography>
                    </Box>

                    {questions.map((q, idx) => {
                        const isCorrect = answers[idx] === q.correctKey;
                        return (
                            <Accordion
                                key={idx}
                                sx={{
                                    mb: 2,
                                    borderRadius: '20px !important',
                                    overflow: 'hidden',
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                                    '&:before': { display: 'none' }
                                }}
                            >
                                <AccordionSummary expandIcon={<ChevronDown color={COLORS.textLight} />}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                                        <Box sx={{
                                            width: 32, height: 32, borderRadius: 1.5,
                                            bgcolor: isCorrect ? '#dcfce7' : '#fee2e2',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {isCorrect ? <CheckCircle2 size={18} color="#15803d" /> : <XCircle size={18} color="#b91c1c" />}
                                        </Box>
                                        <Typography sx={{ fontWeight: 700, color: COLORS.primary }}>Question {idx + 1}</Typography>
                                        <Box sx={{ flexGrow: 1 }} />
                                        <Chip
                                            label={isCorrect ? "Correct" : "Incorrect"}
                                            size="small"
                                            sx={{
                                                bgcolor: isCorrect ? alpha('#22c55e', 0.1) : alpha('#ef4444', 0.1),
                                                color: isCorrect ? '#166534' : '#991b1b',
                                                fontWeight: 800,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails sx={{ px: 4, pb: 4 }}>
                                    <Typography sx={{ mb: 3, fontWeight: 600, color: COLORS.secondary, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                                        {q.text}
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mb: 4 }}>
                                        {q.options && Object.entries(q.options).map(([key, value]) => {
                                            const optIdx = parseInt(key);
                                            const isUserAnswer = answers[idx] === optIdx;
                                            const isCorrectAnswer = q.correctKey === optIdx;

                                            let borderColor = COLORS.border;
                                            let bgColor = 'transparent';
                                            let textColor = COLORS.primary;

                                            if (isCorrectAnswer) {
                                                borderColor = '#22c55e';
                                                bgColor = alpha('#22c55e', 0.05);
                                            } else if (isUserAnswer && !isCorrect) {
                                                borderColor = '#ef4444';
                                                bgColor = alpha('#ef4444', 0.05);
                                            }

                                            return (
                                                <Grid item xs={12} key={key}>
                                                    <Box sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        border: `1.5px solid ${borderColor}`,
                                                        bgcolor: bgColor,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2
                                                    }}>
                                                        <Box sx={{
                                                            width: 26, height: 26, borderRadius: '50%',
                                                            bgcolor: isCorrectAnswer ? '#22c55e' : (isUserAnswer ? '#ef4444' : alpha(COLORS.textLight, 0.1)),
                                                            color: 'white',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.75rem', fontWeight: 800
                                                        }}>
                                                            {optIdx + 1}
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: textColor }}>{value}</Typography>
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>

                                    <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: `1px solid ${COLORS.border}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, color: COLORS.accent }}>
                                            <Star size={18} fill={COLORS.accent} />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Expert Explanation</Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{ color: COLORS.secondary, lineHeight: 1.6 }}>
                                            {q.explanation || "Detailed explanation for this answer will be available soon in our premium guide."}
                                        </Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Container>
            </Box>
            <Footer />
        </Box>
    );
};

export default ResultAnalytics;

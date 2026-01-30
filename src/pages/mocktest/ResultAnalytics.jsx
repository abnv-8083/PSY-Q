import React from 'react';
import { Box, Container, Typography, Paper, Grid, Button, Divider, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown, RefreshCw, Home, Award, Sparkles, PartyPopper, Star } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const ConfettiParticle = ({ side }) => {
    const colors = ['#E91E63', '#FFD700', '#2196F3', '#4CAF50', '#FF5722'];
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
    const { subjectId } = useParams();
    const { score, total, answers, questions } = state || { score: 0, total: 0, answers: {}, questions: [] };

    const percentage = Math.round((score / total) * 100) || 0;

    const getQuote = (pct) => {
        if (pct >= 90) return "Outstanding! You've mastered this subject.";
        if (pct >= 75) return "Great job! Your understanding is very strong.";
        if (pct >= 50) return "Good effort! Keep practicing to reach the top.";
        return "Keep learning! Consistency is the key to success.";
    };

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }} className="mesh-bg">
            {/* Animated Background Blobs */}
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, 80, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '-5%',
                        left: '5%',
                        width: '35%',
                        height: '35%',
                        background: 'radial-gradient(circle, rgba(219, 39, 119, 0.06) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(60px)',
                    }}
                />
            </Box>

            <Container maxWidth="md" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper className="glass-card" sx={{ p: 6, borderRadius: 5, textAlign: 'center', mb: 4, position: 'relative', overflow: 'visible', border: '1px solid rgba(241, 245, 249, 0.4)' }}>
                        <AnimatePresence>
                            {percentage >= 80 && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -15 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        top: 20,
                                        left: 20,
                                        zIndex: 10
                                    }}
                                >
                                    <Chip
                                        icon={<PartyPopper size={16} />}
                                        label="Magnificent!"
                                        sx={{
                                            bgcolor: '#FFD700',
                                            color: '#000',
                                            fontWeight: 900,
                                            fontSize: '0.8rem',
                                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                                            border: '2px solid #fff'
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                            {percentage >= 80 ? (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Award size={220} color="#FFD700" />
                                </motion.div>
                            ) : (
                                <Award size={200} color="#E91E63" />
                            )}
                        </Box>

                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>Your Results</Typography>
                        <Box sx={{ display: 'inline-flex', position: 'relative', mb: 3 }}>
                            <Box
                                sx={{
                                    width: 150, height: 150, borderRadius: '50%',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    border: '8px solid #E91E63',
                                    bgcolor: '#fff',
                                    boxShadow: percentage >= 80 ? '0 0 30px rgba(255, 215, 0, 0.4)' : '0 0 20px rgba(233, 30, 99, 0.2)',
                                    animation: percentage >= 80 ? 'pulse 2s infinite' : 'none',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.05)' },
                                        '100%': { transform: 'scale(1)' }
                                    }
                                }}
                            >
                                <Typography variant="h3" sx={{ fontWeight: 800, color: percentage >= 80 ? '#B8860B' : '#E91E63' }}>{score}</Typography>
                                <Typography variant="body2" color="textSecondary">out of {total}</Typography>
                                {percentage >= 80 && (
                                    <Box sx={{ position: 'absolute', top: -10, right: -10 }}>
                                        <motion.div
                                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <Sparkles color="#FFD700" size={24} fill="#FFD700" />
                                        </motion.div>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{percentage}% Score</Typography>
                        <Typography variant="body1" sx={{ color: '#5f6368', mb: 4, maxWidth: 500, mx: 'auto' }}>
                            {getQuote(percentage)}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshCw size={18} />}
                                onClick={() => navigate(`/academic/mocktest`)}
                                sx={{ bgcolor: '#E91E63', borderRadius: 2, px: 3, py: 1.2 }}
                            >
                                Retake Test
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Home size={18} />}
                                onClick={() => navigate('/')}
                                sx={{ borderRadius: 2, px: 3 }}
                            >
                                Back to Home
                            </Button>
                        </Box>

                        {/* Birthday Poppers */}
                        {percentage >= 80 && (
                            <>
                                <Box sx={{ position: 'absolute', bottom: 20, left: 30, zIndex: 10 }}>
                                    <motion.div
                                        initial={{ scale: 0, rotate: 45 }}
                                        animate={{ scale: [0, 1.5, 1], rotate: [45, -10, 0] }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                    >
                                        <PartyPopper size={48} color="#E91E63" />
                                        {Array.from({ length: 30 }).map((_, i) => (
                                            <ConfettiParticle key={i} side="left" />
                                        ))}
                                    </motion.div>
                                </Box>
                                <Box sx={{ position: 'absolute', bottom: 20, right: 30, zIndex: 10 }}>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: [0, 1.5, 1], rotate: [-45, 10, 0] }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                    >
                                        <PartyPopper size={48} color="#E91E63" style={{ transform: 'scaleX(-1)' }} />
                                        {Array.from({ length: 30 }).map((_, i) => (
                                            <ConfettiParticle key={i} side="right" />
                                        ))}
                                    </motion.div>
                                </Box>
                            </>
                        )}
                    </Paper>
                </motion.div>

                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Question Review</Typography>

                {questions.map((q, idx) => {
                    const isCorrect = answers[idx] === q.correctKey;
                    return (
                        <Accordion key={idx} className="glass-card" sx={{ mb: 2, borderRadius: '12px !important', '&:before': { display: 'none' }, border: '1px solid rgba(241, 245, 249, 0.4)' }}>
                            <AccordionSummary expandIcon={<ChevronDown />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    {isCorrect ? <CheckCircle2 color="#4CAF50" size={20} /> : <XCircle color="#F44336" size={20} />}
                                    <Typography sx={{ fontWeight: 600 }}>Question {idx + 1}</Typography>
                                    <Chip
                                        label={isCorrect ? "Correct" : "Incorrect"}
                                        size="small"
                                        sx={{
                                            ml: 'auto', mr: 2,
                                            bgcolor: isCorrect ? '#E8F5E9' : '#FFEBEE',
                                            color: isCorrect ? '#2E7D32' : '#C62828',
                                            fontWeight: 700
                                        }}
                                    />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography sx={{ mb: 3, fontWeight: 500 }}>{q.text}</Typography>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    {q.options.map((opt, i) => {
                                        let border = '1px solid #eee';
                                        let bg = 'transparent';
                                        if (i === q.correctKey) {
                                            border = '2px solid #4CAF50';
                                            bg = '#F1F8E9';
                                        } else if (i === answers[idx] && !isCorrect) {
                                            border = '2px solid #F44336';
                                            bg = '#FFEBEE';
                                        }
                                        return (
                                            <Grid item xs={12} key={i}>
                                                <Box sx={{ p: 2, borderRadius: 2, border, bgcolor: bg, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                                        {String.fromCharCode(65 + i)}
                                                    </Box>
                                                    <Typography variant="body2">{opt}</Typography>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Explanation:</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {q.explanation || "No explanation provided for this question."}
                                    </Typography>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Container>
        </Box>
    );
};

export default ResultAnalytics;

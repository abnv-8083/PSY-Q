import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Grid, Paper, IconButton, Chip, CircularProgress, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Clock, Send, LayoutGrid, X } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { supabase } from '../../lib/supabaseClient';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const MockTestInterface = () => {
    const { subjectId, testId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [testName, setTestName] = useState('');
    const [answers, setAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [timeLeft, setTimeLeft] = useState(3600); // 60 mins in seconds
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Status mapping: Red: Skipped, Orange: Flagged, Green: Attempted, White: Unvisited
    const getStatus = (idx) => {
        if (flags[idx]) return '#FF9800'; // Orange
        if (answers[idx] !== undefined) return '#4CAF50'; // Green
        // Simple logic for "skipped" vs "unvisited" - if we've been to a page but didn't answer
        // For simplicity, we'll mark any visited non-answered as "Red" later if we want
        return '#E0E0E0'; // White/Gray
    };

    useEffect(() => {
        console.log("📝 MockTestInterface: Fetching data from Supabase for", { testId });
        const fetchTestData = async () => {
            try {
                // Fetch Test Details directly from Supabase
                const { data: testData, error: testErr } = await supabase
                    .from('tests')
                    .select('*')
                    .eq('id', testId)
                    .single();

                if (testErr) throw testErr;

                if (testData) {
                    console.log("📝 MockTestInterface: Test details found:", testData);
                    setTestName(testData.name);
                    if (testData.duration) {
                        setTimeLeft(testData.duration * 60);
                    }
                }

                // Fetch Questions for this test
                const { data: qData, error: qErr } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('test_id', testId)
                    .order('created_at', { ascending: true });

                if (qErr) throw qErr;

                if (qData.length === 0) {
                    console.log("📝 MockTestInterface: No questions found in Supabase");
                    setError("No questions found for this test.");
                } else {
                    // Map correct_key to correctKey for compatibility
                    const formattedQuestions = qData.map(q => ({
                        ...q,
                        correctKey: q.correct_key
                    }));
                    setQuestions(formattedQuestions);
                }
            } catch (err) {
                console.error("📝 MockTestInterface: Error fetching Supabase data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTestData();
    }, [testId]);

    const handleSubmit = useCallback(async () => {
        // Submit results to Supabase
        try {
            const score = questions.reduce((acc, q, idx) => {
                return answers[idx] === q.correctKey ? acc + 1 : acc;
            }, 0);

            // Save Attempt to Supabase
            const { error: attemptError } = await supabase
                .from('attempts')
                .insert({
                    user_id: auth.currentUser?.uid,
                    test_id: testId,
                    subject_id: subjectId,
                    score: score,
                    total: questions.length,
                    answers: answers
                });

            if (attemptError) throw attemptError;

            navigate(`/academic/mocktest/${subjectId}/${testId}/results`, {
                state: { score, total: questions.length, answers, questions }
            });
        } catch (err) {
            console.error("Supabase Submission error:", err);
        }
    }, [answers, questions, subjectId, testId, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, handleSubmit]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return (
        <Box sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#E91E63', mb: 2 }} />
            <Typography>Loading Exam...</Typography>
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>Error Loading Exam</Typography>
            <Typography sx={{ mb: 3 }}>{error}</Typography>
            <Button variant="contained" onClick={() => navigate(-1)} sx={{ bgcolor: '#E91E63' }}>
                Go Back
            </Button>
        </Box>
    );

    console.log("📝 MockTestInterface: Rendering main block", { questions: questions.length, currentIdx });
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f0f2f5' }}>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>{testName || subjectId}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFF0F3', px: { xs: 1.5, sm: 2 }, py: 1, borderRadius: 2 }}>
                        <Clock size={20} color="#E91E63" />
                        <Typography sx={{ fontWeight: 700, color: '#E91E63', fontSize: { xs: '0.9rem', sm: '1rem' } }}>{formatTime(timeLeft)}</Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<X size={18} />}
                        onClick={() => { if (window.confirm("Are you sure you want to quit the test? Your progress will not be saved.")) navigate(-1); }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                        Quit
                    </Button>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
                {/* Left Side: Question Panel */}
                <Box sx={{
                    flex: 1,
                    p: { xs: 2, sm: 3, md: 4 },
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#f0f2f5'
                }}>
                    <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
                        {questions.length > 0 ? (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Chip label={`Question ${currentIdx + 1} of ${questions.length}`} variant="outlined" />
                                    <IconButton onClick={() => setFlags(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}>
                                        <Flag size={20} color={flags[currentIdx] ? "#FF9800" : "#bdbdbd"} fill={flags[currentIdx] ? "#FF9800" : "none"} />
                                    </IconButton>
                                </Box>
                                <Typography variant="h6" sx={{ mb: 4, fontWeight: 500 }}>
                                    {questions[currentIdx]?.text}
                                </Typography>
                                <Grid container spacing={2}>
                                    {questions[currentIdx]?.options?.map((opt, i) => (
                                        <Grid item xs={12} key={i}>
                                            <Button
                                                fullWidth
                                                variant={answers[currentIdx] === i ? "contained" : "outlined"}
                                                onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                                                sx={{
                                                    justifyContent: 'flex-start',
                                                    py: 2,
                                                    px: 3,
                                                    borderRadius: 3,
                                                    textAlign: 'left',
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    borderColor: '#ddd',
                                                    bgcolor: answers[currentIdx] === i ? '#E91E63' : 'transparent',
                                                    '&:hover': { bgcolor: answers[currentIdx] === i ? '#C2185B' : '#f8f9fa' }
                                                }}
                                            >
                                                <Box sx={{
                                                    width: 28, height: 28, borderRadius: '50%', border: '1px solid',
                                                    borderColor: answers[currentIdx] === i ? '#fff' : '#ddd',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2,
                                                    bgcolor: answers[currentIdx] === i ? 'rgba(255,255,255,0.2)' : 'transparent'
                                                }}>
                                                    {String.fromCharCode(65 + i)}
                                                </Box>
                                                {opt}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        ) : (
                            <Box sx={{ py: 10, textAlign: 'center' }}>
                                <Typography variant="h6" color="textSecondary">No questions available for this test.</Typography>
                                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
                            </Box>
                        )}
                    </Paper>

                    {/* Navigation */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            disabled={currentIdx === 0}
                            startIcon={<ChevronLeft />}
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                        >
                            Previous
                        </Button>
                        {currentIdx === questions.length - 1 ? (
                            <Button
                                endIcon={<Send />}
                                variant="contained"
                                onClick={handleSubmit}
                                sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' }, fontWeight: 700, px: 4 }}
                            >
                                Submit Test
                            </Button>
                        ) : (
                            <Button
                                endIcon={<ChevronRight />}
                                variant="contained"
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                sx={{ bgcolor: '#424242', '&:hover': { bgcolor: '#212121' } }}
                            >
                                Next Question
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Right Side: Sidebar Status Tracker */}
                <Box sx={{
                    width: { xs: '100%', md: '300px', lg: '350px' },
                    bgcolor: '#fff',
                    borderLeft: { md: '1px solid #ddd' },
                    borderTop: { xs: '1px solid #ddd', md: 'none' },
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    overflowY: 'auto'
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LayoutGrid size={18} /> Question Status
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 1.5 }}>
                        {questions.map((_, i) => (
                            <Box
                                key={i}
                                onClick={() => setCurrentIdx(i)}
                                sx={{
                                    aspectRatio: '1/1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1.5,
                                    bgcolor: getStatus(i),
                                    cursor: 'pointer',
                                    border: currentIdx === i ? '2px solid #E91E63' : 'none',
                                    transition: 'all 0.2s',
                                    '&:hover': { transform: 'scale(1.1)', zIndex: 1 }
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.85rem', fontWeight: 700, color: getStatus(i) === '#E0E0E0' ? '#757575' : '#fff'
                                    }}
                                >
                                    {i + 1}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <StatusLegend color="#4CAF50" label="Attempted" />
                        <StatusLegend color="#FF9800" label="Flagged" />
                        <StatusLegend color="#E0E0E0" label="Unvisited" />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

const StatusLegend = ({ color, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: color }} />
        <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>{label}</Typography>
    </Box>
);

export default MockTestInterface;

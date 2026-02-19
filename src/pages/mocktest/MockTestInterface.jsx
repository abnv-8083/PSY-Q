import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Divider,
    Avatar,
    Select,
    MenuItem,
    Drawer,
    useMediaQuery,
    useTheme,
    Fab
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Home,
    ChevronDown,
    ChevronUp,
    User,
    Menu as MenuIcon,
    LogOut,
    X
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useSession } from '../../contexts/SessionContext';

import ModernDialog from '../../components/ModernDialog';

const MockTestInterface = () => {
    const { subjectId, testId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [testName, setTestName] = useState('');
    const [answers, setAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [visited, setVisited] = useState({ 0: true });
    const [timeLeft, setTimeLeft] = useState(6000); // Default 100 mins
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentName, setStudentName] = useState('Student');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Modern Dialog State
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    const { user, loading: sessionLoading } = useSession();

    useEffect(() => {
        if (!sessionLoading && !user) {
            navigate('/student/signin');
            return;
        }

        const fetchTestData = async () => {
            if (!user) return;
            try {
                const { data: testData, error: testErr } = await supabase
                    .from('tests')
                    .select('*')
                    .eq('id', testId)
                    .single();

                if (testErr) throw testErr;
                if (testData) {
                    setTestName(testData.name);
                    if (testData.duration) setTimeLeft(testData.duration * 60);
                }

                const { data: qData, error: qErr } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('test_id', testId)
                    .order('created_at', { ascending: true });

                if (qErr) throw qErr;
                setQuestions(qData.map(q => ({
                    ...q,
                    text: q.text || q.question_text,
                    correctKey: q.correct_key !== undefined ? q.correct_key : q.correct_answer
                })));

                // Set student name from session
                setStudentName(user.full_name || 'Student');

            } catch (err) {
                console.error("Error fetching exam data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTestData();
    }, [testId, user, sessionLoading]);


    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => {
            if (prev <= 1) {
                clearInterval(timer);
                return 0;
            }
            return prev - 1;
        }), 1000);
        return () => clearInterval(timer);
    }, []); // Only run once on mount

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (optionIdx) => {
        setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    };

    const goToNext = useCallback(() => {
        const nextIdx = currentIdx + 1;
        if (nextIdx < questions.length) {
            setCurrentIdx(nextIdx);
            setVisited(prev => ({ ...prev, [nextIdx]: true }));
        }
    }, [currentIdx, questions.length]);

    const handleSaveNext = () => {
        // Clear review flag for the current question when saving
        setFlags(prev => {
            const next = { ...prev };
            delete next[currentIdx];
            return next;
        });
        goToNext();
    };

    const handleClear = () => {
        setAnswers(prev => {
            const next = { ...prev };
            delete next[currentIdx];
            return next;
        });
        setFlags(prev => {
            const next = { ...prev };
            delete next[currentIdx];
            return next;
        });
    };

    const handleMarkReview = () => {
        setFlags(prev => ({ ...prev, [currentIdx]: true }));
        goToNext();
    };

    const handleQuit = () => {
        setDialog({
            open: true,
            title: 'Quit Test?',
            message: 'Are you sure you want to quit the test? Your current progress will be lost and no attempt will be recorded.',
            type: 'confirm',
            onConfirm: () => {
                setDialog(prev => ({ ...prev, open: false }));
                navigate('/academic/mocktest');
            }
        });
    };

    const handleSubmit = async () => {
        setDialog({
            open: true,
            title: 'Submit Test?',
            message: 'Are you sure you want to submit your answers? You won\'t be able to change them later.',
            type: 'confirm',
            onConfirm: async () => {
                setDialog(prev => ({ ...prev, open: false }));
                const score = questions.reduce((acc, q, idx) => {
                    return answers[idx] === q.correctKey ? acc + 1 : acc;
                }, 0);

                try {
                    const { error: insertError } = await supabase.from('attempts').insert({
                        user_id: user?.id,

                        test_id: testId,
                        score,
                        total_questions: questions.length,
                        answers
                    });

                    if (insertError) throw insertError;

                    navigate(`/academic/mocktest/${subjectId}/${testId}/results`, {
                        state: { score, total: questions.length, answers, questions }
                    });
                } catch (err) {
                    console.error("Submission failed:", err);
                    setDialog({
                        open: true,
                        title: 'Submission Failed',
                        message: `Failed to save your result.\n\nReason: ${err.message || 'Unknown error'}\n\nPlease try clicking Submit again.`,
                        type: 'error'
                    });
                }
            }
        });
    };

    const getStatusColor = (idx) => {
        const isAnswered = answers[idx] !== undefined;
        const isFlagged = flags[idx];

        if (isAnswered && isFlagged) return 'answered-marked';
        if (isFlagged) return 'marked';
        if (isAnswered) return 'answered';
        if (visited[idx]) return 'not-answered';
        return 'not-visited';
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

    const currentQuestion = questions[currentIdx];

    // Helper component for status shapes
    const StatusShape = ({ status, label }) => {
        if (status === 'not-visited') return <Box sx={{ width: 30, height: 26, bgcolor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{label}</Box>;
        if (status === 'not-answered') return <Box sx={{ width: 32, height: 26, bgcolor: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#fff', clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)' }}>{label}</Box>;
        if (status === 'answered') return <Box sx={{ width: 32, height: 26, bgcolor: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#fff', clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)' }}>{label}</Box>;
        if (status === 'marked') return <Box sx={{ width: 28, height: 28, bgcolor: '#9b59b6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{label}</Box>;
        if (status === 'answered-marked') return (
            <Box sx={{ width: 28, height: 28, bgcolor: '#9b59b6', borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                {label}
                <Box sx={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, bgcolor: '#2ecc71', borderRadius: '50%', border: '1.5px solid #fff' }} />
            </Box>
        );
        return null;
    };

    const renderSidebarContent = () => (
        <>
            {/* Status Board */}
            <Box sx={{ p: 2, borderBottom: '1.5px dashed #ccc' }}>
                <Grid container spacing={1.5}>
                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <StatusShape status="not-visited" label={questions.length - Object.keys(visited).length} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>Not Visited</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <StatusShape status="not-answered" label={Object.keys(visited).filter(idx => answers[idx] === undefined && !flags[idx]).length} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>Not Answered</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <StatusShape status="answered" label={Object.keys(answers).filter(idx => !flags[idx]).length} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>Answered</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <StatusShape status="marked" label={Object.keys(flags).filter(idx => answers[idx] === undefined).length} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>Marked</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <StatusShape status="answered-marked" label={Object.keys(flags).filter(idx => answers[idx] !== undefined).length} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>Answered & Marked</Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Question Grid Title */}
            <Box sx={{ bgcolor: '#ca0056', color: '#fff', py: 0.8, px: 2, mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>Section: Mock Test</Typography>
            </Box>

            {/* Question Grid */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                <Typography variant="caption" display="block" sx={{ mb: 1.5, fontWeight: 700, color: '#666' }}>SELECT A QUESTION:</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, p: 1 }}>
                    {questions.map((_, idx) => (
                        <Box
                            key={idx}
                            onClick={() => {
                                setCurrentIdx(idx);
                                setVisited(prev => ({ ...prev, [idx]: true }));
                                if (isMobile) setDrawerOpen(false);
                            }}
                            sx={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                        >
                            <StatusShape
                                status={getStatusColor(idx)}
                                label={idx + 1}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Sidebar Footer Buttons */}
            <Box sx={{ p: 2, borderTop: '1px solid #ddd', bgcolor: '#f8f9fa' }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 800, py: 1.2 }}
                >
                    SUBMIT TEST
                </Button>
            </Box>
        </>
    );

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            {/* Top Bar */}
            <Box sx={{ bgcolor: '#1e293b', color: '#fff', py: 0.5, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, height: 32 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" sx={{ color: '#fff', p: 0.5 }} onClick={() => navigate(-1)}>
                        <ChevronLeft size={14} />
                        <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem', display: { xs: 'none', sm: 'inline' } }}>Back</Typography>
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#fff', p: 0.5 }} onClick={() => navigate('/academic/mocktest')}>
                        <Home size={14} />
                        <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem', display: { xs: 'none', sm: 'inline' } }}>Home</Typography>
                    </IconButton>
                </Box>
                <IconButton size="small" sx={{ color: '#ff4d4d', p: 0.5, '&:hover': { bgcolor: 'rgba(255, 77, 77, 0.1)' } }} onClick={handleQuit}>
                    <LogOut size={14} />
                    <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700, fontSize: '0.7rem' }}>QUIT</Typography>
                </IconButton>
            </Box>

            {/* Logo Bar */}
            <Box sx={{ py: 0.5, px: { xs: 1, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', height: 45 }}>
                <Box component="img" src="/logos/psyq-logo-header.png" sx={{ height: { xs: 24, md: 30 } }} />
                <Box sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>PSYCHOLOGY QUESTION BANK</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box component="img" src="/logos/ignou.png" sx={{ height: { xs: 20, md: 25 }, opacity: 0.7 }} />
                </Box>
            </Box>

            {/* Candidate Header */}
            <Box sx={{ bgcolor: '#f8f9fa', py: 0.5, px: { xs: 1, md: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', minHeight: 40, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center', flex: 1 }}>
                    <Avatar sx={{ bgcolor: '#e0e0e0', color: '#666', width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 } }}><User size={18} /></Avatar>
                    <Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                                {isMobile ? studentName : `Candidate: ${studentName}`}
                            </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>Exam:</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b' }}>{testName}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Clock size={14} color="#ca0056" />
                        <Typography variant="caption" sx={{ fontWeight: 900, bgcolor: '#fdf2f8', color: '#ca0056', border: '1px solid #ca0056', px: 1, py: 0.2, borderRadius: 1, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>{formatTime(timeLeft)}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left: Question Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', p: { xs: 2, md: 3 }, position: 'relative' }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.25rem' } }}>Q {currentIdx + 1}</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                                size="small"
                                onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
                                disabled={currentIdx === 0}
                                sx={{ bgcolor: '#ca0056', color: '#fff', '&:hover': { bgcolor: '#b8003f' }, '&:disabled': { bgcolor: '#ccc' } }}
                            >
                                <ChevronUp size={16} />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => currentIdx < questions.length - 1 && setCurrentIdx(currentIdx + 1)}
                                disabled={currentIdx === questions.length - 1}
                                sx={{ bgcolor: '#ca0056', color: '#fff', '&:hover': { bgcolor: '#b8003f' }, '&:disabled': { bgcolor: '#ccc' } }}
                            >
                                <ChevronDown size={16} />
                            </IconButton>
                        </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mt: 2, mb: 4, fontWeight: 500, lineHeight: 1.6, fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#1a2035', whiteSpace: 'pre-wrap' }}>
                        {(currentQuestion?.text || currentQuestion?.question_text) || (loading ? "Loading question..." : "Question text not available")}
                    </Typography>

                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>Options</Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {currentQuestion?.options && Object.entries(currentQuestion.options).map(([key, value]) => (
                            <Box
                                key={key}
                                onClick={() => handleAnswerSelect(parseInt(key))}
                                sx={{
                                    p: { xs: 1.5, md: 2 },
                                    borderRadius: 2,
                                    border: '1.5px solid',
                                    borderColor: answers[currentIdx] === parseInt(key) ? '#ca0056' : '#e2e8f0',
                                    bgcolor: answers[currentIdx] === parseInt(key) ? '#ca005605' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: { xs: 1.5, md: 2 },
                                    '&:hover': { borderColor: '#ca005680', bgcolor: '#ca005603' }
                                }}
                            >
                                <Box sx={{
                                    width: { xs: 24, md: 28 },
                                    height: { xs: 24, md: 28 },
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: answers[currentIdx] === parseInt(key) ? '#ca0056' : '#cbd5e1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: { xs: '0.75rem', md: '0.85rem' },
                                    fontWeight: 800,
                                    color: answers[currentIdx] === parseInt(key) ? '#ca0056' : '#64748b',
                                    flexShrink: 0
                                }}>
                                    {parseInt(key) + 1}
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>{value}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Button Bar Sticky Bottom of Left side */}
                    <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid #eee', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={handleSaveNext}
                                sx={{
                                    bgcolor: '#10b981',
                                    '&:hover': { bgcolor: '#059669' },
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    px: { xs: 2, md: 3 }
                                }}
                            >
                                {isMobile ? 'SAVE & NEXT' : 'SAVE & NEXT'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleClear}
                                sx={{
                                    color: '#666',
                                    borderColor: '#ccc',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    px: { xs: 2, md: 3 }
                                }}
                            >
                                CLEAR
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={handleMarkReview}
                                sx={{
                                    bgcolor: '#9b59b6',
                                    '&:hover': { bgcolor: '#8e44ad' },
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    px: { xs: 2, md: 3 }
                                }}
                            >
                                {isMobile ? 'MARK & NEXT' : 'MARK FOR REVIEW & NEXT'}
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Right: Sidebar - Desktop */}
                {!isMobile && (
                    <Box sx={{ width: 340, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                        {renderSidebarContent()}
                    </Box>
                )}
            </Box>

            {/* Mobile: Floating Action Button for Question Palette */}
            {isMobile && (
                <Fab
                    color="primary"
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        bgcolor: '#ca0056',
                        '&:hover': { bgcolor: '#b8003f' },
                        zIndex: 1000
                    }}
                >
                    <MenuIcon size={24} />
                </Fab>
            )}

            {/* Mobile: Drawer for Question Palette */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: { xs: '85%', sm: 340 },
                        maxWidth: 340
                    }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Question Palette</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}>
                            <X size={20} />
                        </IconButton>
                    </Box>
                    {renderSidebarContent()}
                </Box>
            </Drawer>

            {/* Footer Bar */}
            <Box sx={{ bgcolor: '#1e293b', color: '#fff', py: 1, textAlign: 'center', borderTop: '3px solid #ca0056' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                    © All Rights Reserved - Psychology Question Bank (Psy-Q)
                </Typography>
            </Box>

            <ModernDialog
                open={dialog.open}
                onClose={() => setDialog(prev => ({ ...prev, open: false }))}
                onConfirm={dialog.onConfirm}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
            />
        </Box>
    );
};

export default MockTestInterface;

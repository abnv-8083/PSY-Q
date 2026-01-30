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
    MenuItem
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
    Menu
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { supabase } from '../../lib/supabaseClient';

const MockTestInterface = () => {
    const { subjectId, testId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [testName, setTestName] = useState('');
    const [answers, setAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [visited, setVisited] = useState({ 0: true });
    const [timeLeft, setTimeLeft] = useState(7200); // Default 120 mins
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentName, setStudentName] = useState('Student');

    useEffect(() => {
        const fetchTestData = async () => {
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

                // Fetch Student Profile for exact name
                if (auth.currentUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', auth.currentUser.uid)
                        .single();
                    if (profile?.full_name) {
                        setStudentName(profile.full_name);
                    } else if (auth.currentUser.displayName) {
                        setStudentName(auth.currentUser.displayName);
                    }
                }
            } catch (err) {
                console.error("Error fetching exam data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTestData();
    }, [testId]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (optionIdx) => {
        setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    };

    const handleSaveNext = () => {
        const nextIdx = currentIdx + 1;
        if (nextIdx < questions.length) {
            setCurrentIdx(nextIdx);
            setVisited(prev => ({ ...prev, [nextIdx]: true }));
        }
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
        handleSaveNext();
    };

    const handleSubmit = async () => {
        // Validation/Confirm
        if (window.confirm("Are you sure you want to submit the test?")) {
            const score = questions.reduce((acc, q, idx) => {
                return answers[idx] === q.correctKey ? acc + 1 : acc;
            }, 0);

            try {
                await supabase.from('attempts').insert({
                    user_id: auth.currentUser?.uid,
                    test_id: testId,
                    subject_id: subjectId,
                    score,
                    total: questions.length,
                    answers
                });
                navigate(`/academic/mocktest/${subjectId}/${testId}/results`);
            } catch (err) {
                console.error("Submission failed:", err);
            }
        }
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

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            {/* Top Bar */}
            <Box sx={{ bgcolor: '#003366', color: '#fff', py: 0.5, px: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <IconButton size="small" sx={{ color: '#fff' }} onClick={() => navigate('/academic/mocktest')}>
                    <Home size={16} />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>Home</Typography>
                </IconButton>
            </Box>

            {/* Logo Bar */}
            <Box sx={{ py: 1.5, px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <Box component="img" src="/logos/psyq-logo-header.png" sx={{ height: 45 }} />
                <Box sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#003366' }}>PSYCHOLOGY QUESTION BANK</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box component="img" src="/logos/ignou.png" sx={{ height: 35, opacity: 0.7 }} />
                </Box>
            </Box>

            {/* Candidate Header */}
            <Box sx={{ bgcolor: '#f8f9fa', py: 1.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#e0e0e0', color: '#666', width: 50, height: 50 }}><User size={30} /></Avatar>
                    <Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>Candidate Name :</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#db2777' }}>{studentName}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>Exam Name :</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#003366' }}>{testName}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>Remaining Time :</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900, bgcolor: '#00d2ff', px: 1, borderRadius: 1 }}>{formatTime(timeLeft)}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>Exam Center: <strong>Online</strong></Typography>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left: Question Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', p: 3, position: 'relative' }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', pb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Question {currentIdx + 1}:</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ bgcolor: '#007bff', color: '#fff', '&:hover': { bgcolor: '#0056b3' } }}><ChevronUp size={16} /></IconButton>
                            <IconButton size="small" sx={{ bgcolor: '#007bff', color: '#fff', '&:hover': { bgcolor: '#0056b3' } }}><ChevronDown size={16} /></IconButton>
                        </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mt: 2, mb: 4, fontWeight: 500, lineHeight: 1.6, fontSize: '1.05rem', color: '#1a2035' }}>
                        {(currentQuestion?.text || currentQuestion?.question_text) || (loading ? "Loading question..." : "Question text not available")}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {currentQuestion?.options && Object.entries(currentQuestion.options).map(([key, value]) => (
                            <Box
                                key={key}
                                onClick={() => handleAnswerSelect(parseInt(key))}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: '1.5px solid',
                                    borderColor: answers[currentIdx] === parseInt(key) ? '#db2777' : '#e2e8f0',
                                    bgcolor: answers[currentIdx] === parseInt(key) ? '#db277705' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': { borderColor: '#db277780', bgcolor: '#db277703' }
                                }}
                            >
                                <Box sx={{
                                    width: 28, height: 28,
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: answers[currentIdx] === parseInt(key) ? '#db2777' : '#cbd5e1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.85rem', fontWeight: 800,
                                    color: answers[currentIdx] === parseInt(key) ? '#db2777' : '#64748b'
                                }}>
                                    {parseInt(key) + 1}
                                </Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{value}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Button Bar Sticky Bottom of Left side */}
                    <Box sx={{ mt: 'auto', pt: 4, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={handleSaveNext} sx={{ bgcolor: '#5cb85c', '&:hover': { bgcolor: '#4cae4c' }, fontWeight: 700, textTransform: 'none' }}>SAVE & NEXT</Button>
                            <Button variant="outlined" onClick={handleClear} sx={{ color: '#666', borderColor: '#ccc', fontWeight: 700, textTransform: 'none' }}>CLEAR</Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={handleMarkReview} sx={{ bgcolor: '#f0ad4e', '&:hover': { bgcolor: '#ec971f' }, fontWeight: 700, textTransform: 'none' }}>SAVE & MARK FOR REVIEW</Button>
                            <Button variant="contained" onClick={handleMarkReview} sx={{ bgcolor: '#337ab7', '&:hover': { bgcolor: '#286090' }, fontWeight: 700, textTransform: 'none' }}>MARK FOR REVIEW & NEXT</Button>
                        </Box>
                    </Box>
                </Box>

                {/* Right: Sidebar */}
                <Box sx={{ width: 340, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                    {/* Status Board */}
                    <Box sx={{ p: 2, borderBottom: '1.5px dashed #ccc' }}>
                        <Grid container spacing={1.5}>
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <StatusShape status="not-visited" label={questions.length - Object.keys(visited).length} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Not Visited</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <StatusShape status="not-answered" label={Object.keys(visited).filter(idx => answers[idx] === undefined && !flags[idx]).length} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Not Answered</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <StatusShape status="answered" label={Object.keys(answers).filter(idx => !flags[idx]).length} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Answered</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <StatusShape status="marked" label={Object.keys(flags).filter(idx => answers[idx] === undefined).length} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Marked for Review</Typography>
                            </Grid>
                            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <StatusShape status="answered-marked" label={Object.keys(flags).filter(idx => answers[idx] !== undefined).length} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Answered & Marked for Review (considered for evaluation)</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Question Grid Title */}
                    <Box sx={{ bgcolor: '#007bff', color: '#fff', py: 0.8, px: 2, mt: 2 }}>
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
                            sx={{ bgcolor: '#5cb85c', '&:hover': { bgcolor: '#4cae4c' }, fontWeight: 800, py: 1.2 }}
                        >
                            SUBMIT TEST
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Footer Bar */}
            <Box sx={{ bgcolor: '#00264d', color: '#fff', py: 1, textAlign: 'center', borderTop: '3px solid #db2777' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    © All Rights Reserved - Psychology Question Bank (Psy-Q)
                </Typography>
            </Box>
        </Box>
    );
};

export default MockTestInterface;

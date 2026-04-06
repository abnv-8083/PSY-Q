import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    Paper,
    Divider,
    IconButton,
    Container,
    Stack,
    Grid,
    alpha
} from '@mui/material';
import { Home, ChevronDown, ChevronUp, LogOut, ArrowRight, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
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

const GeneralInstructions = () => {
    const { subjectId, testId } = useParams();
    const navigate = useNavigate();
    const [testDetails, setTestDetails] = useState(null);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const { data: test, error } = await supabase
                    .from('tests')
                    .select('*')
                    .eq('id', testId)
                    .single();

                if (error) throw error;
                setTestDetails(test);
            } catch (err) {
                console.error("Error fetching test details:", err);
            }
        };
        fetchTestDetails();
    }, [testId]);

    const handleProceed = () => {
        if (agreed) {
            navigate(`/academic/mocktest/${subjectId}/${testId}/exam`);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fbfcfd' }}>
            <MockTestNavbar />

            {/* Header Section */}
            <Box sx={{ bgcolor: COLORS.primary, color: 'white', py: 4 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                        <Box sx={{ bgcolor: alpha(COLORS.accent, 0.2), p: 1, borderRadius: 2 }}>
                            <BookOpen size={24} color={COLORS.accent} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1 }}>
                            Test <Box component="span" sx={{ color: COLORS.accent }}>Instructions</Box>
                        </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                        {testDetails?.name || 'Loading Test Details...'}
                    </Typography>
                </Container>
            </Box>

            {/* Main Content Area */}
            <Container maxWidth="lg" sx={{ mt: -3, mb: 10, flexGrow: 1 }}>
                <Paper sx={{
                    p: { xs: 3, md: 6 },
                    borderRadius: 5,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                    border: `1px solid ${COLORS.border}`
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary, mb: 4, textAlign: 'center' }}>
                        Please read the instructions carefully before starting
                    </Typography>

                    <Box sx={{ mb: 6 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Box sx={{ width: 4, height: 24, bgcolor: COLORS.accent, borderRadius: 1 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.primary }}>
                                General Information
                            </Typography>
                        </Stack>

                        <Typography variant="body1" component="div" sx={{ color: COLORS.secondary, lineHeight: 1.8 }}>
                            <ol style={{ paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '12px' }}>
                                    The total duration of the test is <strong>{testDetails?.duration || 60} minutes</strong>.
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    The Questions Palette displayed on the right side of screen will show the status of each question using symbols for visited, answered, and marked for review.
                                </li>
                            </ol>
                        </Typography>
                    </Box>

                    {/* Legendary Symbols Section */}
                    <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 4, mb: 6, border: `1px solid ${COLORS.border}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: COLORS.primary }}>
                            Question Status Symbols:
                        </Typography>
                        <Grid container spacing={3}>
                            {[
                                { color: '#e2e8f0', text: 'You have not visited the question yet.', shape: 'rect' },
                                { color: '#ff4d4d', text: 'You have not answered the question.', shape: 'status' },
                                { color: '#10b981', text: 'You have answered the question.', shape: 'status' },
                                { color: '#9b59b6', text: 'You have marked the question for review.', shape: 'circle' }
                            ].map((item, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        {item.shape === 'rect' && <Box sx={{ width: 30, height: 26, bgcolor: item.color, border: '1px solid #cbd5e1', borderRadius: 0.5 }} />}
                                        {item.shape === 'status' && <Box sx={{ width: 32, height: 26, bgcolor: item.color, clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)' }} />}
                                        {item.shape === 'circle' && <Box sx={{ width: 28, height: 28, bgcolor: item.color, borderRadius: '50%' }} />}
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary }}>{item.text}</Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box sx={{ mb: 6 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Box sx={{ width: 4, height: 24, bgcolor: COLORS.accent, borderRadius: 1 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.primary }}>
                                Navigating and Answering
                            </Typography>
                        </Stack>
                        <Typography variant="body1" component="div" sx={{ color: COLORS.secondary, lineHeight: 1.8 }}>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '8px' }}>Click on the question number in the palette to navigate directly.</li>
                                <li style={{ marginBottom: '8px' }}>Click <strong>Save & Next</strong> to save your answer and proceed.</li>
                                <li style={{ marginBottom: '8px' }}>Use <strong>Mark for Review</strong> if you want to revisit the question later.</li>
                                <li style={{ marginBottom: '8px' }}>Answers marked for review with a selected option <strong>will be evaluated</strong>.</li>
                            </ul>
                        </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: alpha('#ef4444', 0.05), borderRadius: 3, border: `1px solid ${alpha('#ef4444', 0.1)}`, mb: 6, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <AlertTriangle color="#ef4444" size={24} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#b91c1c' }}>
                            Ensure you have a stable internet connection. Closing the browser or refreshing the page might result in loss of attempt data.
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 5 }} />

                    <Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    sx={{
                                        color: COLORS.accent,
                                        '&.Mui-checked': { color: COLORS.accent }
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary, lineHeight: 1.6 }}>
                                    I have read and understood the instructions. I agree to abide by the rules of the examination and understand that any violation may lead to disqualification.
                                </Typography>
                            }
                            sx={{ alignItems: 'flex-start', mb: 4 }}
                        />

                        <Stack direction="row" justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleProceed}
                                disabled={!agreed}
                                endIcon={<ArrowRight size={20} />}
                                sx={{
                                    bgcolor: COLORS.accent,
                                    '&:hover': { bgcolor: COLORS.accentHover },
                                    color: 'white',
                                    px: 8,
                                    py: 2,
                                    borderRadius: 4,
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    boxShadow: agreed ? `0 10px 30px ${alpha(COLORS.accent, 0.4)}` : 'none',
                                    transition: 'all 0.3s'
                                }}
                            >
                                I am ready to begin
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>

            <Footer />
        </Box>
    );
};

export default GeneralInstructions;

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
    IconButton
} from '@mui/material';
import { Home, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

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
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            {/* Top Blue Bar */}
            <Box sx={{ bgcolor: '#1e293b', color: '#fff', py: 0.5, px: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <IconButton size="small" sx={{ color: '#fff', borderRadius: 1 }} onClick={() => navigate('/academic/mocktest')}>
                    <Home size={18} />
                    <Typography variant="caption" sx={{ ml: 0.5 }}>Home</Typography>
                </IconButton>
                <IconButton size="small" sx={{ color: '#ff4d4d', borderRadius: 1, '&:hover': { bgcolor: 'rgba(255, 77, 77, 0.1)' } }} onClick={() => navigate('/academic/mocktest')}>
                    <LogOut size={16} />
                    <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700 }}>QUIT</Typography>
                </IconButton>
            </Box>

            {/* Logo Bar */}
            <Box sx={{
                py: 2,
                px: { xs: 2, md: 8 },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #eee'
            }}>
                <Box component="img" src="/logos/psyq-logo-header.png" sx={{ height: { xs: 40, md: 60 } }} />
                <Box sx={{ textAlign: 'center', flex: 1, display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.2rem' }}>
                        PSYCHOLOGY QUESTION BANK
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                        Advancing Excellence in Assessment
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Placeholder for other logos as seen in NTA */}
                    <Box component="img" src="/logos/ignou.png" sx={{ height: 40, opacity: 0.7 }} />
                </Box>
            </Box>

            {/* Title Bar */}
            <Box sx={{ bgcolor: '#f5f5f5', py: 1.5, px: { xs: 2, md: 8 }, borderBottom: '1px solid #ddd' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>
                    GENERAL INSTRUCTIONS
                </Typography>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ maxWidth: 1000, width: '100%', mb: 4 }}>

                    <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 4 }}>
                        Please read the instructions carefully
                    </Typography>

                    <Box sx={{ textAlign: 'left', px: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, textDecoration: 'underline', mb: 2 }}>
                            General Instructions:
                        </Typography>

                        <Typography variant="body2" component="div">
                            <ol style={{ paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}>
                                    Total duration of <strong>{testDetails?.name || 'Mock Test'}</strong> is <strong>{testDetails?.duration || 120} min</strong>.
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
                                </li>
                                <li style={{ marginBottom: '20px' }}>
                                    The Questions Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 30, height: 30, bgcolor: '#e0e0e0', border: '1px solid #ccc', borderRadius: 0 }} />
                                            <Typography variant="body2">You have not visited the question yet.</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 32, height: 30,
                                                bgcolor: '#ff9800',
                                                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                                            }} />
                                            <Typography variant="body2">You have not answered the question.</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 32, height: 30,
                                                bgcolor: '#4caf50',
                                                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                                            }} />
                                            <Typography variant="body2">You have answered the question.</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 30, height: 30,
                                                bgcolor: '#ca0056',
                                                borderRadius: '50%'
                                            }} />
                                            <Typography variant="body2">You have NOT answered the question, but have marked the question for review.</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 30, height: 30,
                                                bgcolor: '#ca0056',
                                                borderRadius: '50%',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Box sx={{ width: 10, height: 10, bgcolor: '#4caf50', borderRadius: '50%', position: 'absolute', bottom: 0, right: 0, border: '1px solid #fff' }} />
                                            </Box>
                                            <Typography variant="body2">The question(s) "Answered and Marked for Review" will be considered for evaluation.</Typography>
                                        </Box>
                                    </Box>
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    You can click on the "&gt;" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "&lt;" which appears on the right side of question window.
                                </li>
                                <li style={{ marginBottom: '10px' }}>
                                    You can click on your "Profile" image on top right corner of your screen to see your details.
                                </li>
                                <li style={{ marginBottom: '20px' }}>
                                    You can click on <Box component="span" sx={{ display: 'inline-flex', bgcolor: '#ca0056', borderRadius: '50%', p: 0.2, color: '#fff' }}><ChevronDown size={14} /></Box> to navigate to the bottom and <Box component="span" sx={{ display: 'inline-flex', bgcolor: '#ca0056', borderRadius: '50%', p: 0.2, color: '#fff' }}><ChevronUp size={14} /></Box> to navigate to top of the question area, without scrolling.
                                </li>
                            </ol>

                            <Typography variant="subtitle1" sx={{ fontWeight: 800, textDecoration: 'underline', mb: 2, mt: 4 }}>
                                Navigating to a Question:
                            </Typography>
                            <ol start="7" style={{ paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}>
                                    To answer a question, do the following:
                                    <ol type="a" style={{ paddingLeft: '20px', marginTop: '10px' }}>
                                        <li style={{ marginBottom: '8px' }}>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                                        <li style={{ marginBottom: '8px' }}>Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
                                        <li style={{ marginBottom: '8px' }}>Click on <strong>Mark for Review & Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
                                    </ol>
                                </li>
                            </ol>

                            <Typography variant="subtitle1" sx={{ fontWeight: 800, textDecoration: 'underline', mb: 2, mt: 4 }}>
                                Answering a Question:
                            </Typography>
                            <ol start="8" style={{ paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '10px' }}>
                                    Procedure for answering a multiple choice type question:
                                    <ol type="a" style={{ paddingLeft: '20px', marginTop: '10px' }}>
                                        <li style={{ marginBottom: '8px' }}>To select your answer, click on the button of one of the options.</li>
                                        <li style={{ marginBottom: '8px' }}>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button.</li>
                                        <li style={{ marginBottom: '8px' }}>To change your chosen answer, click on the button of another option.</li>
                                        <li style={{ marginBottom: '8px' }}>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
                                        <li style={{ marginBottom: '8px' }}>To mark the question for review, click on the <strong>Mark for Review & Next</strong> button.</li>
                                    </ol>
                                </li>
                                <li style={{ marginBottom: '20px' }}>
                                    To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.
                                </li>
                            </ol>

                            <Typography variant="subtitle1" sx={{ fontWeight: 800, textDecoration: 'underline', mb: 2, mt: 4 }}>
                                Navigating through sections:
                            </Typography>
                            <ol start="10" style={{ paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '8px' }}>Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by clicking on the section name. The section you are currently viewing is highlighted.</li>
                                <li style={{ marginBottom: '8px' }}>After clicking the Save & Next button on the last question for a section, you will automatically be taken to the first question of the next section.</li>
                                <li style={{ marginBottom: '8px' }}>You can shuffle between sections and questions anything during the examination as per your convenience only during the time stipulated.</li>
                                <li style={{ marginBottom: '8px' }}>Candidate can view the corresponding section summary as part of the legend that appears in every section above the question palette.</li>
                            </ol>
                        </Typography>

                        <Divider sx={{ my: 4 }} />

                        <Box sx={{ color: '#d32f2f', textAlign: 'center', mb: 4, fontWeight: 700 }}>
                            Please note all questions will appear in English.
                        </Box>

                        <Box sx={{ borderTop: '1px solid #ddd', pt: 4, mb: 4 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        sx={{
                                            color: '#ca0056',
                                            '&.Mui-checked': { color: '#ca0056' }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                                        I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations
                                    </Typography>
                                }
                                sx={{ alignItems: 'flex-start' }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Bottom Proceed Button */}
            <Box sx={{ borderTop: '1px solid #ddd', py: 2, display: 'flex', justifyContent: 'center', bgcolor: '#fff' }}>
                <Button
                    variant="contained"
                    onClick={handleProceed}
                    disabled={!agreed}
                    sx={{
                        bgcolor: agreed ? '#10b981' : '#ddd',
                        '&:hover': { bgcolor: '#059669' },
                        color: agreed ? '#fff' : '#888',
                        px: 12,
                        py: 1.2,
                        fontSize: '1rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: 1
                    }}
                >
                    Proceed
                </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: '#1e293b', color: '#fff', py: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    © All Rights Reserved - Psychology Question Bank (Psy-Q)
                </Typography>
            </Box>
        </Box>
    );
};

export default GeneralInstructions;

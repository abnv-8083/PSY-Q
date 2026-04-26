import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Checkbox, FormControlLabel } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTestById } from '../../api/testsApi';
import { useSession } from '../../contexts/SessionContext';
import MockTestNavbar from '../../components/MockTestNavbar';

const MockTestRules = () => {
    const { subjectId, testId } = useParams();
    const navigate = useNavigate();
    const [testDetails, setTestDetails] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const { user, loading: sessionLoading } = useSession();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (sessionLoading) return;

        const fetchTestDetails = async () => {
            try {
                const test = await fetchTestById(testId);
                
                // Auth check for non-free tests
                if (!user && !test.is_free_trial) {
                    navigate('/student/signin');
                    return;
                }

                setTestDetails({
                    name: test.name,
                    duration: test.duration,
                    questions: test.total_questions || 0,
                    marks: test.total_marks || test.total_questions || 0
                });
            } catch (error) {
                console.error("Error fetching test details:", error);
            }
        };
        fetchTestDetails();
    }, [testId, user, sessionLoading, navigate]);

    const handleStart = () => {
        if (agreed) {
            navigate(`/academic/mocktest/${subjectId}/${testId}/exam`);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', color: '#000000', pb: 8 }}>
            <MockTestNavbar />
            
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ p: { xs: 2, md: 4 }, fontFamily: 'Arial, sans-serif' }}>
                    
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '1.1rem', mb: 2 }}>
                        General Instructions:
                    </Typography>

                    <ol style={{ paddingLeft: '20px', margin: 0, lineHeight: 1.8, fontSize: '0.95rem' }}>
                        <li>Total duration of <strong>{testDetails?.name || 'the examination'}</strong> is <strong>{testDetails?.duration || 120} min</strong>.</li>
                        <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
                        <li>The Questions Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                                    <Box sx={{ width: 26, height: 26, bgcolor: '#e0e0e0', flexShrink: 0 }} />
                                    <Typography variant="body2">You have not visited the question yet.</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                                    <Box sx={{ 
                                        width: 26, height: 26, bgcolor: '#f57c00', flexShrink: 0,
                                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                    }} />
                                    <Typography variant="body2">You have not answered the question.</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                                    <Box sx={{ 
                                        width: 26, height: 26, bgcolor: '#4caf50', flexShrink: 0,
                                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                    }} />
                                    <Typography variant="body2">You have answered the question.</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                                    <Box sx={{ width: 26, height: 26, bgcolor: '#d81b60', borderRadius: '50%', flexShrink: 0 }} />
                                    <Typography variant="body2">You have NOT answered the question, but have marked the question for review.</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
                                    <Box sx={{ width: 26, height: 26, bgcolor: '#d81b60', borderRadius: '50%', position: 'relative', flexShrink: 0 }}>
                                        <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%', position: 'absolute', bottom: 2, right: 2 }} />
                                    </Box>
                                    <Typography variant="body2">The question(s) "Answered and Marked for Review" will be considered for evaluation.</Typography>
                                </Box>
                            </Box>
                        </li>
                        <li>You can click on the "&gt;" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "&lt;" which appears on the right side of question window.</li>
                        <li>You can click on your "Profile" image on top right corner of your screen to change the language during the exam for entire question paper. On clicking of Profile image you will get a drop-down to change the question content to the desired language.</li>
                        <li>You can click on <span style={{color:'#d81b60', fontWeight:'bold'}}>&#8595;</span> to navigate to the bottom and <span style={{color:'#d81b60', fontWeight:'bold'}}>&#8593;</span> to navigate to top of the question area, without scrolling.</li>
                    </ol>

                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '1.1rem', mt: 4, mb: 2 }}>
                        Navigating to a Question:
                    </Typography>

                    <ol start="7" style={{ paddingLeft: '20px', margin: 0, lineHeight: 1.8, fontSize: '0.95rem' }}>
                        <li>To answer a question, do the following:
                            <ol type="a" style={{ paddingLeft: '20px', marginTop: '8px' }}>
                                <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                                <li>Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
                                <li>Click on <strong>Mark for Review & Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
                            </ol>
                        </li>
                    </ol>

                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '1.1rem', mt: 4, mb: 2 }}>
                        Answering a Question:
                    </Typography>

                    <ol start="8" style={{ paddingLeft: '20px', margin: 0, lineHeight: 1.8, fontSize: '0.95rem' }}>
                        <li>Procedure for answering a multiple choice type question:
                            <ol type="a" style={{ paddingLeft: '20px', marginTop: '8px' }}>
                                <li>To select your answer, click on the button of one of the options.</li>
                                <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button.</li>
                                <li>To change your chosen answer, click on the button of another option.</li>
                                <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
                                <li>To mark the question for review, click on the <strong>Mark for Review & Next</strong> button.</li>
                            </ol>
                        </li>
                        <li>To change your answer to a question that has already been answered, first select that question for answering and then follow the procedure for answering that type of question.</li>
                    </ol>

                    <Box sx={{ mt: 6, p: 3, bgcolor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={agreed} 
                                    onChange={(e) => setAgreed(e.target.checked)} 
                                    color="primary" 
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations.
                                </Typography>
                            }
                            sx={{ alignItems: 'flex-start', m: 0 }}
                        />
                    </Box>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleStart}
                            disabled={!agreed}
                            sx={{ 
                                py: 1.5, 
                                px: 6,
                                textTransform: 'none', 
                                fontWeight: 600, 
                                fontSize: '1.1rem',
                                bgcolor: agreed ? '#4caf50' : '#e0e0e0', 
                                color: agreed ? '#ffffff' : '#9e9e9e',
                                '&:hover': { bgcolor: '#388e3c' } 
                            }}
                        >
                            PROCEED
                        </Button>
                    </Box>
                    
                </Box>
            </Container>
        </Box>
    );
};

export default MockTestRules;

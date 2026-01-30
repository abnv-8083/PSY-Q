import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const MockTestRules = () => {
    const { subjectId, testId } = useParams();
    const navigate = useNavigate();
    const [testDetails, setTestDetails] = useState(null);

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                // Fetch Test details and count questions
                const { data: test, error } = await supabase
                    .from('tests')
                    .select('*, questions(id)')
                    .eq('id', testId)
                    .single();

                if (error) throw error;

                setTestDetails({
                    name: test.name,
                    duration: test.duration,
                    questions: test.questions?.length || 0,
                    marks: test.questions?.length || 0
                });
            } catch (error) {
                console.error("Error fetching test details from Supabase:", error);
            }
        };
        fetchTestDetails();
    }, [testId]);

    const handleStart = () => {
        navigate(`/academic/mocktest/${subjectId}/${testId}/exam`);
    };

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }} className="mesh-bg">
            {/* Animated Background Blobs */}
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                <motion.div
                    animate={{
                        x: [0, 80, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: '10%',
                        right: '10%',
                        width: '30%',
                        height: '30%',
                        background: 'radial-gradient(circle, rgba(219, 39, 119, 0.05) 0%, transparent 70%)',
                        borderRadius: '50%',
                        filter: 'blur(50px)',
                    }}
                />
            </Box>

            <Container maxWidth="md" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
                <Paper className="glass-card" sx={{ p: 5, borderRadius: 4, border: '1px solid rgba(241, 245, 249, 0.4)' }}>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>Before You Start</Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: '#5f6368' }}> Please read the instructions carefully.</Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 3, mb: 4 }}>
                        <Box sx={{ p: 2, bgcolor: '#FFF0F3', borderRadius: 3, textAlign: 'center' }}>
                            <Clock size={24} color="#E91E63" style={{ marginBottom: 8 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{testDetails?.duration} mins</Typography>
                            <Typography variant="caption">Total Duration</Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: '#E3F2FD', borderRadius: 3, textAlign: 'center' }}>
                            <FileText size={24} color="#1E88E5" style={{ marginBottom: 8 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{testDetails?.questions} Qs</Typography>
                            <Typography variant="caption">Total Questions</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <List sx={{ mb: 4 }}>
                        {[
                            "Ensure you have a stable internet connection.",
                            "Once you start, the timer cannot be paused.",
                            "Questions can be flagged for review and returned to later.",
                            "The test will auto-submit once the timer reaches zero.",
                            "Each question carries 1 mark. There is no negative marking."
                        ].map((text, index) => (
                            <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                                <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                                    <CheckCircle2 size={20} color="#4CAF50" />
                                </ListItemIcon>
                                <ListItemText primary={text} primaryTypographyProps={{ fontSize: '0.95rem', color: '#374151' }} />
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ p: 2, bgcolor: '#FFFDE7', borderRadius: 3, display: 'flex', gap: 2, mb: 5, border: '1px solid #FFF59D' }}>
                        <AlertCircle size={24} color="#FBC02D" />
                        <Typography variant="body2" color="#5D4037">
                            Do not refresh the page or navigate away during the exam, as this may result in data loss.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{ flex: 1, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleStart}
                            sx={{ flex: 2, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#E91E63', '&:hover': { bgcolor: '#C2185B' } }}
                        >
                            I Understand, Start Test
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default MockTestRules;

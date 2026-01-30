import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormLabel, RadioGroup, FormControlLabel, Radio, Divider, Grid } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Trash2, ChevronLeft, HelpCircle } from 'lucide-react';

const QuestionBank = ({ subject, test, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [openQDialog, setOpenQDialog] = useState(false);
    const [newQ, setNewQ] = useState({
        text: '',
        options: ['', '', '', ''],
        correctKey: 0,
        explanation: ''
    });

    useEffect(() => {
        fetchQuestions();
    }, [test.id]);

    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('test_id', test.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Map correct_key back to correctKey for compatibility
            const formattedQuestions = data.map(q => ({
                ...q,
                correctKey: q.correct_key
            }));

            setQuestions(formattedQuestions);
        } catch (error) {
            console.error("Error fetching questions from Supabase:", error);
            alert("Failed to fetch questions. Please try again.");
        }
    };

    const handleAddQuestion = async () => {
        if (!newQ.text || newQ.options.some(opt => !opt)) return;
        try {
            const { error } = await supabase
                .from('questions')
                .insert({
                    test_id: test.id,
                    text: newQ.text,
                    options: newQ.options,
                    correct_key: newQ.correctKey,
                    explanation: newQ.explanation
                });

            if (error) throw error;

            setNewQ({ text: '', options: ['', '', '', ''], correctKey: 0, explanation: '' });
            setOpenQDialog(false);
            fetchQuestions();
        } catch (error) {
            console.error("Error adding question to Supabase:", error);
            alert("Failed to add question. Please try again.");
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Delete this question?")) {
            try {
                const { error } = await supabase
                    .from('questions')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchQuestions();
            } catch (error) {
                console.error("Error deleting question in Supabase:", error);
                alert("Failed to delete question. Please try again.");
            }
        }
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...newQ.options];
        updatedOptions[index] = value;
        setNewQ({ ...newQ, options: updatedOptions });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <IconButton onClick={onBack}><ChevronLeft /></IconButton>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Question Bank</Typography>
                    <Typography variant="body2" color="textSecondary">{test.name} ({subject.name})</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenQDialog(true)}
                    sx={{ ml: 'auto', bgcolor: '#E91E63' }}
                >
                    Add Question
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {questions.length === 0 ? (
                    <Paper sx={{ p: 5, textAlign: 'center', border: '1px dashed #ccc', bgcolor: 'transparent' }}>
                        <HelpCircle size={48} color="#ccc" style={{ marginBottom: 16 }} />
                        <Typography color="textSecondary">No questions added yet. Start by clicking "Add Question".</Typography>
                    </Paper>
                ) : (
                    questions.map((q, idx) => (
                        <Paper key={q.id} sx={{ p: 4, borderRadius: 3, border: '1px solid #eee', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                                <IconButton size="small" onClick={() => handleDeleteQuestion(q.id)}><Trash2 size={18} color="#F44336" /></IconButton>
                            </Box>
                            <Typography sx={{ fontWeight: 700, mb: 2, pr: 4 }}>Q{idx + 1}. {q.text}</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                                {q.options.map((opt, i) => (
                                    <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: i === q.correctKey ? '#E8F5E9' : '#f8f9fa', border: '1px solid', borderColor: i === q.correctKey ? '#4CAF50' : '#eee' }}>
                                        <Typography variant="body2" sx={{ fontWeight: i === q.correctKey ? 700 : 400 }}>{String.fromCharCode(65 + i)}. {opt}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            {q.explanation && (
                                <Box sx={{ p: 1.5, bgcolor: '#FFFDE7', borderRadius: 2, border: '1px solid #FFF59D' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#FBC02D' }}>EXPLANATION:</Typography>
                                    <Typography variant="body2" color="textSecondary">{q.explanation}</Typography>
                                </Box>
                            )}
                        </Paper>
                    ))
                )}
            </Box>

            {/* Add Question Dialog */}
            <Dialog open={openQDialog} onClose={() => setOpenQDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Add New Question</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth label="Question Text" margin="normal" multiline rows={6}
                        value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                    />
                    <Divider sx={{ my: 2 }} />
                    <FormLabel component="legend" sx={{ mb: 2, fontWeight: 700 }}>Options (Mark the correct one)</FormLabel>
                    <RadioGroup
                        value={newQ.correctKey}
                        onChange={(e) => setNewQ({ ...newQ, correctKey: Number(e.target.value) })}
                    >
                        <Grid container spacing={2}>
                            {newQ.options.map((opt, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FormControlLabel value={i} control={<Radio color="success" />} label="" sx={{ ml: 0, mr: 0 }} />
                                        <TextField
                                            fullWidth size="small" label={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt} onChange={(e) => handleOptionChange(i, e.target.value)}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </RadioGroup>
                    <TextField
                        fullWidth label="Explanation (Optional)" margin="normal" multiline rows={2} sx={{ mt: 3 }}
                        value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenQDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddQuestion} sx={{ bgcolor: '#E91E63' }}>Add to Bank</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionBank;

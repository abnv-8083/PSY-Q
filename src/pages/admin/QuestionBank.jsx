import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormLabel, RadioGroup, FormControlLabel, Radio, Divider, Grid } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Trash2, ChevronLeft, HelpCircle, CheckCircle2, MessageSquare, FileUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromPDF, parseQuestionsFromText } from '../../utils/pdfParser';

const QuestionBank = ({ subject, test, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [openQDialog, setOpenQDialog] = useState(false);
    const [newQ, setNewQ] = useState({
        text: '',
        options: ['', '', '', ''],
        correctKey: 0,
        explanation: ''
    });
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [parsedQuestions, setParsedQuestions] = useState([]);

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
                alert("Failed to delete question: " + (error.message || "Unknown error"));
            }
        }
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...newQ.options];
        updatedOptions[index] = value;
        setNewQ({ ...newQ, options: updatedOptions });
    };

    const handlePDFUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        try {
            const text = await extractTextFromPDF(file);
            const questions = parseQuestionsFromText(text);

            if (questions.length === 0) {
                alert("No questions found in the PDF. Please ensure it follows the required format.");
            } else {
                setParsedQuestions(questions);
            }
        } catch (error) {
            console.error("Error parsing PDF:", error);
            alert(`Failed to parse PDF.\n\nError: ${error.message || "Unknown error"}\n\nCheck the browser console (Press F12) for detailed logs.`);
        } finally {
            setImporting(false);
        }
    };

    const handleSaveImported = async () => {
        if (parsedQuestions.length === 0) return;

        try {
            setImporting(true);
            const { error } = await supabase
                .from('questions')
                .insert(parsedQuestions.map(q => ({
                    test_id: test.id,
                    text: q.text,
                    options: q.options,
                    correct_key: q.correctKey,
                    explanation: q.explanation
                })));

            if (error) throw error;

            alert(`Successfully imported ${parsedQuestions.length} questions!`);
            setImportDialogOpen(false);
            setParsedQuestions([]);
            fetchQuestions();
        } catch (error) {
            console.error("Error importing questions to Supabase:", error);
            alert("Failed to import questions. Please try again.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        onClick={onBack}
                        sx={{ bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                    >
                        <ChevronLeft />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>Question Bank</Typography>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>{test.name} • {subject.name}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<FileUp size={18} />}
                        onClick={() => setImportDialogOpen(true)}
                        sx={{
                            bgcolor: '#6366f1', borderRadius: 3, px: 3, py: 1.5,
                            fontWeight: 800, textTransform: 'none',
                            color: '#fff',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                            '&:hover': { bgcolor: '#4f46e5' }
                        }}
                    >
                        Import from PDF
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setOpenQDialog(true)}
                        sx={{
                            bgcolor: '#E91E63', borderRadius: 3, px: 3, py: 1.5,
                            fontWeight: 800, textTransform: 'none',
                            boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                            '&:hover': { bgcolor: '#D81B60', boxShadow: '0 10px 25px rgba(233, 30, 99, 0.4)' }
                        }}
                    >
                        Add Question DEBUG
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <AnimatePresence>
                    {questions.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Paper className="glass-card" sx={{ p: 8, textAlign: 'center', borderRadius: 5 }}>
                                <HelpCircle size={54} color="#E91E63" style={{ marginBottom: 20, opacity: 0.5 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>No questions yet</Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>Start building your question bank for this test.</Typography>
                            </Paper>
                        </motion.div>
                    ) : (
                        questions.map((q, idx) => (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Paper className="glass-card" sx={{
                                    p: 4, borderRadius: 5, position: 'relative',
                                    transition: 'all 0.3s',
                                    '&:hover': { boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                                }}>
                                    <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteQuestion(q.id)}
                                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Chip
                                            label={`Question ${idx + 1}`}
                                            size="small"
                                            sx={{ bgcolor: 'rgba(15, 23, 42, 0.05)', color: '#0f172a', fontWeight: 800, mb: 2, borderRadius: 1.5 }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.5, pr: 4, whiteSpace: 'pre-wrap' }}>
                                            {q.text}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        {q.options.map((opt, i) => {
                                            const isCorrect = i === q.correctKey;
                                            return (
                                                <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                                    <Box sx={{
                                                        p: 2, borderRadius: 3,
                                                        bgcolor: isCorrect ? 'rgba(34, 197, 94, 0.08)' : '#f8fafc',
                                                        border: '1px solid',
                                                        borderColor: isCorrect ? '#22c55e' : '#f1f5f9',
                                                        display: 'flex', alignItems: 'center', gap: 2,
                                                        position: 'relative',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        <Box sx={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            bgcolor: isCorrect ? '#22c55e' : '#e2e8f0',
                                                            color: isCorrect ? '#fff' : '#64748b',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 900, fontSize: '0.875rem'
                                                        }}>
                                                            {String.fromCharCode(65 + i)}
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: isCorrect ? 800 : 500, color: isCorrect ? '#166534' : '#475569', whiteSpace: 'pre-wrap' }}>
                                                            {opt}
                                                        </Typography>
                                                        {isCorrect && (
                                                            <CheckCircle2 size={16} color="#22c55e" style={{ marginLeft: 'auto' }} />
                                                        )}
                                                    </Box>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>

                                    {q.explanation && (
                                        <Box sx={{
                                            p: 2.5, bgcolor: 'rgba(99, 102, 241, 0.05)', borderRadius: 4,
                                            borderLeft: '4px solid #6366f1',
                                            display: 'flex', gap: 2
                                        }}>
                                            <MessageSquare size={20} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <Box>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>EXPLANATION</Typography>
                                                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{q.explanation}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Paper>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </Box>

            <Dialog
                open={openQDialog}
                onClose={() => setOpenQDialog(false)}
                fullWidth maxWidth="md"
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>Add New Question</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            fullWidth label="Question Text" multiline rows={4}
                            value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                            placeholder="Enter the question statement here..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                        />

                        <Divider sx={{ my: 4, opacity: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Options</Typography>
                        </Divider>

                        <RadioGroup
                            value={newQ.correctKey}
                            onChange={(e) => setNewQ({ ...newQ, correctKey: Number(e.target.value) })}
                        >
                            <Grid container spacing={2.5}>
                                {newQ.options.map((opt, i) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                        <Box sx={{
                                            display: 'flex', alignItems: 'flex-start', gap: 1,
                                            p: 1.5, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9',
                                            transition: 'all 0.2s',
                                            '&:focus-within': { borderColor: '#E91E63', bgcolor: '#fff' }
                                        }}>
                                            <FormControlLabel
                                                value={i}
                                                control={<Radio sx={{ color: '#E91E63', '&.Mui-checked': { color: '#E91E63' } }} />}
                                                label=""
                                                sx={{ m: 0, mt: 0.5 }}
                                            />
                                            <TextField
                                                fullWidth multiline maxRows={3} variant="standard"
                                                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                value={opt} onChange={(e) => handleOptionChange(i, e.target.value)}
                                                InputProps={{ disableUnderline: true, sx: { fontWeight: 600, fontSize: '0.925rem' } }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </RadioGroup>

                        <TextField
                            fullWidth label="Explanation (Optional)" multiline rows={3}
                            value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                            placeholder="Explain why the correct option is right..."
                            sx={{ mt: 4, '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 1 }}>
                    <Button onClick={() => setOpenQDialog(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddQuestion}
                        sx={{
                            bgcolor: '#E91E63', borderRadius: 3, fontWeight: 800, px: 4, py: 1.2,
                            boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                            '&:hover': { bgcolor: '#D81B60' }
                        }}
                    >
                        Add to Bank
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Import PDF Dialog */}
            <Dialog
                open={importDialogOpen}
                onClose={() => !importing && setImportDialogOpen(false)}
                fullWidth maxWidth="md"
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FileUp color="#E91E63" /> Import Questions from PDF
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {parsedQuestions.length === 0 ? (
                            <Box sx={{
                                p: 6, border: '2px dashed #e2e8f0', borderRadius: 5,
                                textAlign: 'center', bgcolor: '#f8fafc',
                                transition: 'all 0.3s',
                                '&:hover': { borderColor: '#E91E63', bgcolor: '#fff' }
                            }}>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    id="pdf-upload-input"
                                    onChange={handlePDFUpload}
                                />
                                <label htmlFor="pdf-upload-input" style={{ cursor: importing ? 'default' : 'pointer' }}>
                                    {importing ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                            <Loader2 className="animate-spin" size={48} color="#E91E63" />
                                            <Typography sx={{ fontWeight: 700, color: '#64748b' }}>Parsing PDF Content...</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ p: 2, bgcolor: 'rgba(233, 30, 99, 0.08)', borderRadius: '50%' }}>
                                                <FileUp size={48} color="#E91E63" />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>Upload PDF File</Typography>
                                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                    Click to browse or drag and drop your PDF here
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ width: '100%', my: 2 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Format Requirements</Typography>
                                            </Divider>
                                            <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'left', px: 4, lineHeight: 1.6 }}>
                                                • Questions should start with "N. "<br />
                                                • Options should be in "(1) Text (2) Text..." format<br />
                                                • Correct answer as "Answer = (N)"<br />
                                                • Explanation starting with "Explanation:"
                                            </Typography>
                                        </Box>
                                    )}
                                </label>
                            </Box>
                        ) : (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                                        Previewing {parsedQuestions.length} Questions
                                    </Typography>
                                    <Button
                                        size="small"
                                        onClick={() => setParsedQuestions([])}
                                        sx={{ textTransform: 'none', fontWeight: 700, color: '#ef4444' }}
                                    >
                                        Clear and Re-upload
                                    </Button>
                                </Box>
                                <Box sx={{ maxHeight: 500, overflow: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {parsedQuestions.map((q, i) => (
                                        <Paper key={i} variant="outlined" sx={{ p: 2.5, borderRadius: 4, bgcolor: '#f8fafc' }}>
                                            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 1.5, color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                                                {i + 1}. {q.text}
                                            </Typography>
                                            <Grid container spacing={1.5}>
                                                {q.options.map((opt, oi) => (
                                                    <Grid size={{ xs: 12, sm: 6 }} key={oi}>
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', gap: 1,
                                                            p: 1, borderRadius: 2,
                                                            bgcolor: oi === q.correctKey ? 'rgba(34, 197, 94, 0.08)' : '#fff',
                                                            border: '1px solid',
                                                            borderColor: oi === q.correctKey ? '#22c55e' : '#e2e8f0'
                                                        }}>
                                                            <Typography sx={{ fontWeight: 900, minWidth: 20, fontSize: '0.75rem', color: oi === q.correctKey ? '#166534' : '#64748b' }}>
                                                                ({oi + 1})
                                                            </Typography>
                                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: oi === q.correctKey ? '#166534' : '#475569', whiteSpace: 'pre-wrap' }}>
                                                                {opt}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Paper>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 1 }}>
                    <Button onClick={() => setImportDialogOpen(false)} disabled={importing} sx={{ fontWeight: 700 }}>Close</Button>
                    {parsedQuestions.length > 0 && (
                        <Button
                            variant="contained"
                            disabled={importing}
                            onClick={handleSaveImported}
                            sx={{
                                bgcolor: '#E91E63', borderRadius: 3, fontWeight: 800, px: 4, py: 1.2,
                                boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                                '&:hover': { bgcolor: '#D81B60' }
                            }}
                        >
                            {importing ? <Loader2 className="animate-spin" size={18} /> : `Import All ${parsedQuestions.length} Questions`}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuestionBank;

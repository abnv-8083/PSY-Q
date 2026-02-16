import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, TextField, Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormLabel, RadioGroup, FormControlLabel, Radio, Divider, Grid, Avatar, Fab, Alert, alpha } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import ModernDialog from '../../components/ModernDialog';
import { Plus, Trash2, ChevronLeft, HelpCircle, CheckCircle2, MessageSquare, FileUp, Loader2, Pencil, Circle, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromPDF, parseQuestionsFromText } from '../../utils/pdfParser';

// Premium Color Theme
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
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const contentRef = useRef(null);

    // Modern Dialog State
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    useEffect(() => {
        if (test && test.id) {
            fetchQuestions();
        }
    }, [test?.id]);

    // Handle scroll to show/hide scroll to top button
    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) return;
            const st = contentRef.current.scrollTop;
            setShowScrollTop(st > 300);
            if (st <= 40) {
                setNavHidden(false);
            } else {
                setNavHidden(st > lastScrollTop);
            }
            setLastScrollTop(st);
        };
        const el = contentRef.current;
        if (el) {
            el.addEventListener('scroll', handleScroll, { passive: true });
            return () => el.removeEventListener('scroll', handleScroll);
        }
    }, [lastScrollTop]);

    const scrollToTop = () => {
        if (contentRef.current) {
            contentRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const fetchQuestions = async () => {
        if (!test || !test.id) return;
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
            setDialog({
                open: true,
                title: 'Fetch Failed',
                message: "Failed to fetch questions. Please check your connection.",
                type: 'error'
            });
        }
    };

    const handleSaveQuestion = async () => {
        if (!newQ.text || newQ.options.some(opt => !opt)) return;
        try {
            if (isEditMode && editingQuestion) {
                const { error } = await supabase
                    .from('questions')
                    .update({
                        text: newQ.text,
                        options: newQ.options,
                        correct_key: newQ.correctKey,
                        explanation: newQ.explanation
                    })
                    .eq('id', editingQuestion.id);

                if (error) throw error;
            } else {
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
            }

            setNewQ({ text: '', options: ['', '', '', ''], correctKey: 0, explanation: '' });
            setOpenQDialog(false);
            setIsEditMode(false);
            setEditingQuestion(null);
            fetchQuestions();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} question in Supabase:`, error);
            setDialog({
                open: true,
                title: `${isEditMode ? 'Update' : 'Add'} Failed`,
                message: `Failed to ${isEditMode ? 'update' : 'add'} question to the database. Please try again.`,
                type: 'error'
            });
        }
    };

    const handleEditQuestion = (q) => {
        setNewQ({
            text: q.text,
            options: q.options,
            correctKey: q.correctKey,
            explanation: q.explanation || ''
        });
        setEditingQuestion(q);
        setIsEditMode(true);
        setOpenQDialog(true);
    };

    const handleDeleteQuestion = (id) => {
        setDialog({
            open: true,
            title: 'Delete Question?',
            message: 'Are you sure you want to remove this question? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                setDialog(prev => ({ ...prev, open: false }));
                try {
                    const { error } = await supabase
                        .from('questions')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    fetchQuestions();
                } catch (error) {
                    console.error("Error deleting question in Supabase:", error);
                    setDialog({
                        open: true,
                        title: 'Delete Failed',
                        message: "Failed to delete question. Please check your connection and try again.",
                        type: 'error'
                    });
                }
            }
        });
    };

    const handlePdfImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        try {
            const text = await extractTextFromPDF(file);
            const questions = parseQuestionsFromText(text);

            if (questions.length === 0) {
                setDialog({
                    open: true,
                    title: 'No Questions Found',
                    message: "No questions found in the PDF. Please ensure it follows the required format.",
                    type: 'warning'
                });
            } else {
                setParsedQuestions(questions);
            }
        } catch (error) {
            console.error("Error parsing PDF:", error);
            setDialog({
                open: true,
                title: 'Parsing Error',
                message: `Failed to parse PDF: ${error.message}`,
                type: 'error'
            });
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

            setDialog({
                open: true,
                title: 'Import Successful',
                message: `Successfully imported ${parsedQuestions.length} questions!`,
                type: 'success'
            });
            setImportDialogOpen(false);
            setParsedQuestions([]);
            fetchQuestions();
        } catch (error) {
            console.error("Error importing questions to Supabase:", error);
            setDialog({
                open: true,
                title: 'Import Failed',
                message: "Failed to import questions. Please try again.",
                type: 'error'
            });
        } finally {
            setImporting(false);
        }
    };

    if (!subject || !test) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <HelpCircle size={64} color={COLORS.textLight} style={{ marginBottom: 16, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                    No Test Selected
                </Typography>
                <Typography variant="body1" sx={{ color: COLORS.textLight, mb: 4, maxWidth: 400 }}>
                    Please select a test from the Content Management section to view and manage its question bank.
                </Typography>
                <Button
                    variant="contained"
                    onClick={onBack}
                    sx={{ bgcolor: COLORS.primary, borderRadius: 3, fontWeight: 800, px: 4 }}
                >
                    Go to Content Management
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
                component={motion.div}
                role="navigation"
                aria-label="Question bank actions"
                initial={{ y: 0, opacity: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                animate={{ y: navHidden ? -80 : 0, opacity: navHidden ? 0.9 : 1 }}
                transition={{ duration: 0.25 }}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1200,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    py: 3,
                    px: { xs: 3, md: 6 },
                    borderBottom: `1px solid ${COLORS.border}`,
                    flexShrink: 0
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <IconButton
                        onClick={onBack}
                        aria-label="Go back"
                        sx={{
                            bgcolor: 'rgba(0,0,0,0.04)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', transform: 'translateX(-2px)' },
                            transition: 'all 0.2s'
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1 }}>Question Bank</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{test.name} • {subject.name}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileUp size={18} />}
                        onClick={() => setImportDialogOpen(true)}
                        sx={{
                            borderRadius: 4, px: 3, py: 1.5,
                            fontWeight: 800, textTransform: 'none',
                            color: COLORS.secondary,
                            borderColor: COLORS.border,
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: COLORS.secondary }
                        }}
                    >
                        Import from PDF
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setOpenQDialog(true)}
                        sx={{
                            bgcolor: COLORS.accent, borderRadius: 4, px: 3, py: 1.5,
                            fontWeight: 900, textTransform: 'none',
                            boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.3)}`,
                            '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.4)}`, transform: 'translateY(-2px)' },
                            transition: 'all 0.3s'
                        }}
                    >
                        Add Question
                    </Button>
                </Box>
            </Box>

            <Box id="question-content" ref={contentRef} sx={{ flex: 1, overflow: 'auto', p: { xs: 3, md: 6 }, bgcolor: '#f8fafc' }}>
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -0.5 }}>
                        All Questions <Chip label={questions.length} size="small" sx={{ ml: 1, fontWeight: 900, bgcolor: COLORS.primary, color: 'white' }} />
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <AnimatePresence>
                        {questions.map((q, idx) => (
                            <Grid item xs={12} key={q.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Paper sx={{
                                        p: 4, borderRadius: 6, border: `1px solid ${COLORS.border}`,
                                        position: 'relative', transition: 'all 0.3s',
                                        '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.06)', transform: 'translateY(-4px)', borderColor: COLORS.accent },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: '#fff'
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent, fontWeight: 900, width: 32, height: 32, fontSize: '0.875rem' }}>
                                                    {idx + 1}
                                                </Avatar>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1.5 }}>Question Details</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditQuestion(q)}
                                                    sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', '&:hover': { bgcolor: alpha('#6366f1', 0.2) } }}
                                                >
                                                    <Pencil size={18} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                    sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.2) } }}
                                                >
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Typography sx={{
                                            fontWeight: 800,
                                            fontSize: '1.25rem',
                                            mb: 4,
                                            color: COLORS.primary,
                                            lineHeight: 1.5,
                                            letterSpacing: -0.2
                                        }}>
                                            {q.text}
                                        </Typography>

                                        <Grid container spacing={2} sx={{ mb: q.explanation ? 4 : 0 }}>
                                            {q.options.map((opt, i) => (
                                                <Grid item xs={12} md={6} key={i}>
                                                    <Box sx={{
                                                        p: 2.5, borderRadius: 4, border: '2px solid',
                                                        borderColor: i === q.correctKey ? COLORS.success : COLORS.border,
                                                        bgcolor: i === q.correctKey ? alpha(COLORS.success, 0.05) : '#fff',
                                                        display: 'flex', alignItems: 'center', gap: 2.5,
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        <Avatar sx={{
                                                            width: 30, height: 30, fontSize: '0.875rem', fontWeight: 900,
                                                            bgcolor: i === q.correctKey ? COLORS.success : alpha(COLORS.textLight, 0.1),
                                                            color: i === q.correctKey ? 'white' : COLORS.textLight
                                                        }}>
                                                            {String.fromCharCode(65 + i)}
                                                        </Avatar>
                                                        <Typography sx={{
                                                            fontWeight: 700,
                                                            color: i === q.correctKey ? '#15803d' : COLORS.secondary,
                                                            fontSize: '1rem'
                                                        }}>
                                                            {opt}
                                                        </Typography>
                                                        {i === q.correctKey && <CheckCircle2 size={20} color={COLORS.success} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                                                    </Box>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        {q.explanation && (
                                            <Box sx={{
                                                mt: 'auto', p: 3,
                                                bgcolor: alpha('#6366f1', 0.03),
                                                borderRadius: 4,
                                                borderLeft: `6px solid #6366f1`,
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                            }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                    <MessageSquare size={16} color="#6366f1" />
                                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>Solution Explanation</Typography>
                                                </Box>
                                                <Typography variant="body1" sx={{ color: COLORS.secondary, fontWeight: 600, lineHeight: 1.6 }}>{q.explanation}</Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>

                {questions.length === 0 && (
                    <Box sx={{ py: 12, textAlign: 'center' }}>
                        <Box sx={{ mb: 4, display: 'inline-flex', p: 3, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '50%' }}>
                            <HelpCircle size={64} color={COLORS.textLight} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1.5 }}>No Questions Yet</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textLight, maxWidth: 400, mx: 'auto', mb: 4 }}>
                            This test doesn't have any questions. You can add them manually or import from a PDF file.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus />}
                            onClick={() => setOpenQDialog(true)}
                            sx={{ bgcolor: COLORS.accent, borderRadius: 4, px: 4, py: 1.5, fontWeight: 900 }}
                        >
                            Add Your First Question
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Question Editor Dialog */}
            <Dialog
                open={openQDialog}
                onClose={() => {
                    setOpenQDialog(false);
                    setIsEditMode(false);
                    setEditingQuestion(null);
                    setNewQ({ text: '', options: ['', '', '', ''], correctKey: 0, explanation: '' });
                }}
                fullWidth maxWidth="md"
                PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary }}>
                    {isEditMode ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
                        <TextField
                            fullWidth label="Question Text" multiline rows={4}
                            placeholder="Type your question here..."
                            value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                            InputProps={{ sx: { fontWeight: 700, fontSize: '1.1rem' } }}
                        />

                        <Typography variant="overline" sx={{ fontWeight: 900, color: COLORS.textLight, letterSpacing: 2, mb: -2 }}>
                            Options & Correct Answer
                        </Typography>

                        <Grid container spacing={3}>
                            {newQ.options.map((opt, i) => (
                                <Grid item xs={12} md={6} key={i}>
                                    <Box sx={{
                                        display: 'flex', gap: 2, alignItems: 'center',
                                        p: 2, borderRadius: 4, border: `2px solid ${newQ.correctKey === i ? COLORS.success : COLORS.border}`,
                                        bgcolor: newQ.correctKey === i ? alpha(COLORS.success, 0.05) : 'transparent',
                                        transition: 'all 0.2s'
                                    }}>
                                        <Avatar sx={{
                                            width: 32, height: 32, fontWeight: 900,
                                            bgcolor: newQ.correctKey === i ? COLORS.success : alpha(COLORS.textLight, 0.1),
                                            color: newQ.correctKey === i ? 'white' : COLORS.textLight
                                        }}>
                                            {String.fromCharCode(65 + i)}
                                        </Avatar>
                                        <TextField
                                            fullWidth variant="standard" placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt} onChange={(e) => {
                                                const opts = [...newQ.options];
                                                opts[i] = e.target.value;
                                                setNewQ({ ...newQ, options: opts });
                                            }}
                                            InputProps={{ disableUnderline: true, sx: { fontWeight: 700 } }}
                                        />
                                        <IconButton
                                            onClick={() => setNewQ({ ...newQ, correctKey: i })}
                                            sx={{
                                                color: newQ.correctKey === i ? COLORS.success : COLORS.border,
                                                bgcolor: newQ.correctKey === i ? alpha(COLORS.success, 0.1) : 'transparent'
                                            }}
                                        >
                                            {newQ.correctKey === i ? <CheckCircle2 /> : <Circle />}
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <TextField
                            fullWidth label="Explanation (Optional)" multiline rows={3}
                            placeholder="Explain why the answer is correct..."
                            value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button onClick={() => {
                        setOpenQDialog(false);
                        setIsEditMode(false);
                        setEditingQuestion(null);
                        setNewQ({ text: '', options: ['', '', '', ''], correctKey: 0, explanation: '' });
                    }} sx={{ fontWeight: 800, color: COLORS.textLight }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveQuestion}
                        disabled={!newQ.text || newQ.options.some(opt => !opt)}
                        sx={{
                            bgcolor: COLORS.accent, borderRadius: 4, fontWeight: 900, px: 5, py: 1.5,
                            boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.4)}`,
                            '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}` }
                        }}
                    >
                        {isEditMode ? 'Update Question' : 'Save Question'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* PDF Import Dialog */}
            <Dialog
                open={importDialogOpen}
                onClose={() => setImportDialogOpen(false)}
                fullWidth maxWidth="md"
                PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem' }}>Import from PDF</DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2 }}>
                        <Alert severity="info" sx={{ borderRadius: 4, mb: 4, bgcolor: alpha('#3b82f6', 0.1), color: '#1e40af', border: 'none', fontWeight: 600 }}>
                            Upload a PDF file containing questions. Our system will automatically extract questions, options, and answers.
                        </Alert>

                        <Box sx={{
                            p: 8, borderRadius: 6, border: '3px dashed', borderColor: COLORS.border, bgcolor: '#f8fafc',
                            textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: alpha(COLORS.accent, 0.02), borderColor: COLORS.accent },
                            transition: 'all 0.3s'
                        }}>
                            <input
                                type="file" accept="application/pdf" id="pdf-upload" style={{ display: 'none' }}
                                onChange={handlePdfImport}
                                disabled={importing}
                            />
                            <label htmlFor="pdf-upload" style={{ cursor: 'pointer' }}>
                                <Box sx={{ mb: 3, display: 'inline-flex', p: 2.5, bgcolor: alpha(COLORS.accent, 0.1), borderRadius: 4 }}>
                                    {importing ? <Loader2 size={48} color={COLORS.accent} className="animate-spin" /> : <FileUp size={48} color={COLORS.accent} />}
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                                    {importing ? 'Processing Document...' : 'Select PDF File'}
                                </Typography>
                                <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                    {importing ? 'This may take up to a minute. Please wait.' : 'Click to browse or drag and drop your file here'}
                                </Typography>
                            </label>
                        </Box>

                        {parsedQuestions.length > 0 && (
                            <Box sx={{ mt: 6 }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Preview extracted content ({parsedQuestions.length} questions)</Typography>
                                <Box sx={{ maxHeight: 400, overflow: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {parsedQuestions.map((q, i) => (
                                        <Paper key={i} variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#fff', border: `1px solid ${COLORS.border}` }}>
                                            <Typography variant="body1" sx={{ fontWeight: 800, mb: 2 }}>{i + 1}. {q.text}</Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip label={`Answer: ${String.fromCharCode(65 + q.correctKey)}`} size="small" sx={{ fontWeight: 800, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }} />
                                                <Chip label={`${q.options.length} Options`} size="small" sx={{ fontWeight: 800 }} />
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                                <Button
                                    fullWidth variant="contained" onClick={handleSaveImported}
                                    sx={{
                                        mt: 5, bgcolor: COLORS.accent, borderRadius: 4, fontWeight: 900, py: 2, fontSize: '1.1rem',
                                        boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.4)}`,
                                        '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}` }
                                    }}
                                >
                                    Confirm & Import All Questions
                                </Button>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button onClick={() => setImportDialogOpen(false)} disabled={importing} sx={{ fontWeight: 800, color: COLORS.textLight }}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <ModernDialog
                open={dialog.open}
                onClose={() => setDialog(prev => ({ ...prev, open: false }))}
                onConfirm={dialog.onConfirm}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
            />

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        style={{
                            position: 'fixed',
                            bottom: 40,
                            right: 40,
                            zIndex: 1000
                        }}
                    >
                        <Fab
                            onClick={scrollToTop}
                            sx={{
                                bgcolor: COLORS.primary,
                                color: 'white',
                                boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                                '&:hover': {
                                    bgcolor: '#000',
                                    transform: 'translateY(-4px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <ArrowUp size={28} />
                        </Fab>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default QuestionBank;

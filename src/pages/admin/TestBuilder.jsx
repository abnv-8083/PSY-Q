import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, Grid, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, alpha } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import ModernDialog from '../../components/ModernDialog';
import { Plus, Trash2, Clock, Target, Pencil, GripVertical, ChevronLeft, Calendar, Layout, Layers, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../../components/StrictModeDroppable';

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

const TestBuilder = ({ subject, onBack, onManageQuestions }) => {
    const [tests, setTests] = useState([]);
    const [openTestDialog, setOpenTestDialog] = useState(false);
    const [newTest, setNewTest] = useState({ name: '', price: 0, duration: 100, year: '' });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingTest, setEditingTest] = useState(null);

    // Modern Dialog State
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    useEffect(() => {
        if (subject && subject.id) {
            fetchTests();
        }
    }, [subject?.id]);

    const fetchTests = async () => {
        if (!subject || !subject.id) return;
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*, questions(count)')
                .eq('subject_id', subject.id)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setTests(data);
        } catch (error) {
            console.error("Error fetching tests from Supabase:", error);
            setDialog({
                open: true,
                title: 'Fetch Failed',
                message: "We couldn't load the tests. Please check your connection and try again.",
                type: 'error'
            });
        }
    };

    const handleSaveTest = async () => {
        if (!newTest.name) return;
        try {
            if (isEditMode && editingTest) {
                const { error } = await supabase
                    .from('tests')
                    .update({
                        name: newTest.name,
                        price: Number(newTest.price),
                        duration: Number(newTest.duration),
                        year: newTest.year ? Number(newTest.year) : null
                    })
                    .eq('id', editingTest.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('tests')
                    .insert({
                        subject_id: subject.id,
                        name: newTest.name,
                        price: Number(newTest.price),
                        duration: Number(newTest.duration),
                        year: newTest.year ? Number(newTest.year) : null,
                        is_published: true,
                        display_order: tests.length > 0 ? Math.max(...tests.map(t => t.display_order || 0)) + 1 : 0
                    });

                if (error) throw error;
            }

            setNewTest({ name: '', price: 0, duration: 100, year: '' });
            setOpenTestDialog(false);
            setIsEditMode(false);
            setEditingTest(null);
            fetchTests();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} test in Supabase:`, error);
            setDialog({
                open: true,
                title: `${isEditMode ? 'Update' : 'Add'} Failed`,
                message: `Failed to ${isEditMode ? 'update' : 'create'} the test. Please check all fields and try again.`,
                type: 'error'
            });
        }
    };

    const handleEditClick = (test) => {
        setNewTest({
            name: test.name,
            price: test.price,
            duration: test.duration,
            year: test.year || ''
        });
        setEditingTest(test);
        setIsEditMode(true);
        setOpenTestDialog(true);
    };

    const handleDeleteTest = async (id) => {
        setDialog({
            open: true,
            title: 'Delete Test?',
            message: 'Are you sure? This will delete all questions in this test and cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                setDialog(prev => ({ ...prev, open: false }));
                try {
                    const { error } = await supabase
                        .from('tests')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    fetchTests();
                } catch (error) {
                    console.error("Error deleting test in Supabase:", error);
                    setDialog({
                        open: true,
                        title: 'Delete Failed',
                        message: "Failed to delete test: " + (error.message || "Unknown error"),
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(tests);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately for UX
        setTests(items);

        try {
            // Batch update display_order in Supabase
            const updates = items.map((test, index) =>
                supabase
                    .from('tests')
                    .update({ display_order: index })
                    .eq('id', test.id)
            );

            await Promise.all(updates);
        } catch (error) {
            console.error("Error reordering tests:", error);
            fetchTests();
        }
    };

    if (!subject) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Layout size={64} color={COLORS.textLight} style={{ marginBottom: 16, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                    No Subject Selected
                </Typography>
                <Typography variant="body1" sx={{ color: COLORS.textLight, mb: 4, maxWidth: 400 }}>
                    Please select a subject from the Content Management section to view and manage its tests.
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
        <Box sx={{ p: { xs: 3, md: 6 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    {onBack && (
                        <IconButton
                            onClick={onBack}
                            sx={{
                                bgcolor: 'rgba(0,0,0,0.04)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', transform: 'translateX(-2px)' },
                                transition: 'all 0.2s'
                            }}
                        >
                            <ChevronLeft />
                        </IconButton>
                    )}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Avatar sx={{ bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent }}>
                                <Layers size={20} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1 }}>Mock Tests</Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                            Manage tests for <Chip label={subject.name} size="small" sx={{ fontWeight: 800, bgcolor: COLORS.primary, color: 'white', ml: 1 }} />
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => {
                        setNewTest({ name: '', price: 0, duration: 100, year: '' });
                        setIsEditMode(false);
                        setEditingTest(null);
                        setOpenTestDialog(true);
                    }}
                    sx={{
                        bgcolor: COLORS.accent, borderRadius: 4, px: 3, py: 1.5,
                        fontWeight: 900, textTransform: 'none',
                        boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.3)}`,
                        '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.4)}`, transform: 'translateY(-2px)' },
                        transition: 'all 0.3s'
                    }}
                >
                    Add New Test
                </Button>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <StrictModeDroppable droppableId="tests-list">
                    {(provided) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}
                        >
                            <AnimatePresence>
                                {tests.map((test, index) => (
                                    <Draggable key={test.id} draggableId={test.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <Box
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Paper sx={{
                                                        p: 4, borderRadius: 6, position: 'relative',
                                                        transition: 'all 0.3s',
                                                        border: snapshot.isDragging ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                                                        bgcolor: snapshot.isDragging ? alpha(COLORS.accent, 0.02) : '#fff',
                                                        boxShadow: snapshot.isDragging ? `0 20px 48px ${alpha(COLORS.accent, 0.2)}` : 'none',
                                                        '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(0,0,0,0.06)', borderColor: COLORS.accent }
                                                    }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                                <Box
                                                                    {...provided.dragHandleProps}
                                                                    sx={{ cursor: 'grab', color: COLORS.textLight, '&:hover': { color: COLORS.primary } }}
                                                                >
                                                                    <GripVertical size={24} />
                                                                </Box>
                                                                <Box sx={{ p: 2, borderRadius: 4, bgcolor: alpha(COLORS.accent, 0.08), color: COLORS.accent }}>
                                                                    <Target size={28} />
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary, lineHeight: 1.2 }}>{test.name}</Typography>
                                                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Added: {new Date(test.created_at).toLocaleDateString()}</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditClick(test)}
                                                                    sx={{ bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', '&:hover': { bgcolor: alpha('#6366f1', 0.2) } }}
                                                                >
                                                                    <Pencil size={18} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteTest(test.id)}
                                                                    sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.2) } }}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
                                                            <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: '#f8fafc', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <Clock size={16} color={COLORS.textLight} />
                                                                <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.primary }}>{test.duration} mins</Typography>
                                                            </Box>
                                                            <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <HelpCircle size={16} color="#0284c7" />
                                                                <Typography variant="body2" sx={{ fontWeight: 900, color: '#0369a1' }}>
                                                                    {test.questions?.[0]?.count || 0} Questions
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{
                                                                px: 2, py: 1, borderRadius: 3,
                                                                bgcolor: test.price === 0 ? alpha(COLORS.success, 0.08) : alpha('#6366f1', 0.08),
                                                                border: `1px solid ${test.price === 0 ? alpha(COLORS.success, 0.2) : alpha('#6366f1', 0.2)}`,
                                                                display: 'flex', alignItems: 'center', gap: 1.5
                                                            }}>
                                                                <Typography variant="body2" sx={{
                                                                    fontWeight: 900,
                                                                    color: test.price === 0 ? COLORS.success : '#6366f1'
                                                                }}>
                                                                    {test.price === 0 ? 'FREE TRIAL' : `₹${test.price}`}
                                                                </Typography>
                                                            </Box>
                                                            {test.year && (
                                                                <Box sx={{ px: 2, py: 1, borderRadius: 3, bgcolor: '#fffbed', border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                    <Calendar size={16} color="#d97706" />
                                                                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#92400e' }}>{test.year}</Typography>
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        <Button
                                                            fullWidth
                                                            variant="contained"
                                                            onClick={() => onManageQuestions(test)}
                                                            sx={{
                                                                borderRadius: 4, py: 2,
                                                                bgcolor: COLORS.primary, color: '#fff',
                                                                fontWeight: 900, textTransform: 'none', fontSize: '1rem',
                                                                boxShadow: `0 8px 20px ${alpha(COLORS.primary, 0.2)}`,
                                                                '&:hover': { bgcolor: '#000', transform: 'translateY(-2px)', boxShadow: `0 12px 28px ${alpha(COLORS.primary, 0.3)}` },
                                                                transition: 'all 0.3s'
                                                            }}
                                                        >
                                                            Manage Question Bank
                                                        </Button>
                                                    </Paper>
                                                </motion.div>
                                            </Box>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </AnimatePresence>
                        </Box>
                    )}
                </StrictModeDroppable>
            </DragDropContext>

            {tests.length === 0 && (
                <Box sx={{ py: 12, textAlign: 'center' }}>
                    <Box sx={{ mb: 4, display: 'inline-flex', p: 3, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '50%' }}>
                        <Layout size={64} color={COLORS.textLight} />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1.5 }}>No Tests Found</Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textLight, maxWidth: 400, mx: 'auto', mb: 4 }}>
                        You haven't created any tests for this subject yet. Start by adding a new mock test.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Plus />}
                        onClick={() => setOpenTestDialog(true)}
                        sx={{ bgcolor: COLORS.accent, borderRadius: 4, px: 4, py: 1.5, fontWeight: 900 }}
                    >
                        Create Your First Test
                    </Button>
                </Box>
            )}

            <Dialog
                open={openTestDialog}
                onClose={() => {
                    setOpenTestDialog(false);
                    setIsEditMode(false);
                    setEditingTest(null);
                    setNewTest({ name: '', price: 0, duration: 100, year: '' });
                }}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary }}>
                    {isEditMode ? 'Edit Mock Test' : 'Add New Mock Test'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: 2 }}>
                        <TextField
                            fullWidth label="Test Name"
                            placeholder="e.g. Psychology Basics - Part 1"
                            value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                            InputProps={{ sx: { fontWeight: 700, fontSize: '1.1rem' } }}
                        />
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth label="Year" type="number"
                                    placeholder="e.g. 2025"
                                    value={newTest.year} onChange={(e) => setNewTest({ ...newTest, year: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth label="Duration (mins)" type="number"
                                    value={newTest.duration} onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth label="Price (₹)" type="number"
                                    value={newTest.price} onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button onClick={() => {
                        setOpenTestDialog(false);
                        setIsEditMode(false);
                        setEditingTest(null);
                        setNewTest({ name: '', price: 0, duration: 100, year: '' });
                    }} sx={{ fontWeight: 800, color: COLORS.textLight }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveTest}
                        disabled={!newTest.name}
                        sx={{
                            bgcolor: COLORS.accent, borderRadius: 4, fontWeight: 900, px: 5, py: 1.5,
                            boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.4)}`,
                            '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}` }
                        }}
                    >
                        {isEditMode ? 'Save Changes' : 'Create Test'}
                    </Button>
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
        </Box>
    );
};

export default TestBuilder;

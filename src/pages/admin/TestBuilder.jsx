import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, Grid, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import ModernDialog from '../../components/ModernDialog';
import { Plus, Trash2, Clock, DollarSign, ChevronLeft, Target, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TestBuilder = ({ subject, onBack, onManageQuestions }) => {
    const [tests, setTests] = useState([]);
    const [openTestDialog, setOpenTestDialog] = useState(false);
    const [newTest, setNewTest] = useState({ name: '', price: 0, duration: 60 });
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
        fetchTests();
    }, [subject.id]);

    const fetchTests = async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .eq('subject_id', subject.id)
                .order('created_at', { ascending: true });

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
                        duration: Number(newTest.duration)
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
                        is_published: true
                    });

                if (error) throw error;
            }

            setNewTest({ name: '', price: 0, duration: 60 });
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
            duration: test.duration
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

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {onBack && (
                        <IconButton
                            onClick={onBack}
                            sx={{ bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                        >
                            <ChevronLeft />
                        </IconButton>
                    )}
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>Mock Tests</Typography>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>Manage test list for {subject.name}.</Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenTestDialog(true)}
                    sx={{
                        bgcolor: '#E91E63', borderRadius: 3, px: 3, py: 1.5,
                        fontWeight: 800, textTransform: 'none',
                        boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                        '&:hover': { bgcolor: '#D81B60', boxShadow: '0 10px 25px rgba(233, 30, 99, 0.4)' }
                    }}
                >
                    Add New Test
                </Button>
            </Box>

            <Grid container spacing={3}>
                <AnimatePresence>
                    {tests.map((test, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={test.id}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Paper className="glass-card" sx={{
                                    p: 3, borderRadius: 5, position: 'relative',
                                    transition: 'all 0.3s',
                                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(233, 30, 99, 0.08)', color: '#E91E63' }}>
                                                <Target size={24} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{test.name}</Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Created: {new Date(test.created_at).toLocaleDateString()}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditClick(test)}
                                                sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }}
                                            >
                                                <Pencil size={18} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteTest(test.id)}
                                                sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                                        <Box sx={{ px: 2, py: 0.75, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Clock size={14} color="#64748b" />
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569' }}>{test.duration}m</Typography>
                                        </Box>
                                        <Box sx={{
                                            px: 2, py: 0.75, borderRadius: 2,
                                            bgcolor: test.price === 0 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                                            display: 'flex', alignItems: 'center', gap: 1
                                        }}>
                                            <Typography variant="body2" sx={{
                                                fontWeight: 900,
                                                color: test.price === 0 ? '#16a34a' : '#6366f1'
                                            }}>
                                                {test.price === 0 ? 'FREE' : `₹${test.price}`}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => onManageQuestions(test)}
                                        sx={{
                                            borderRadius: 3, py: 1.5,
                                            bgcolor: '#0f172a', color: '#fff',
                                            fontWeight: 800, textTransform: 'none',
                                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                                            '&:hover': { bgcolor: '#1e293b', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        Manage Question Bank
                                    </Button>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            <Dialog
                open={openTestDialog}
                onClose={() => {
                    setOpenTestDialog(false);
                    setIsEditMode(false);
                    setEditingTest(null);
                    setNewTest({ name: '', price: 0, duration: 60 });
                }}
                fullWidth maxWidth="xs"
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>{isEditMode ? 'Edit Mock Test' : 'Add New Mock Test'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            fullWidth label="Test Name"
                            value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <TextField
                                    fullWidth label="Duration (mins)" type="number"
                                    value={newTest.duration} onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    fullWidth label="Price (0 for Free)" type="number"
                                    value={newTest.price} onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 1 }}>
                    <Button onClick={() => {
                        setOpenTestDialog(false);
                        setIsEditMode(false);
                        setEditingTest(null);
                        setNewTest({ name: '', price: 0, duration: 60 });
                    }} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveTest}
                        sx={{
                            bgcolor: '#E91E63', borderRadius: 3, fontWeight: 800, px: 4, py: 1.2,
                            boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                            '&:hover': { bgcolor: '#D81B60' }
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

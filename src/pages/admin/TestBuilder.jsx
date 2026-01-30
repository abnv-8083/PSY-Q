import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, Grid, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Trash2, Clock, DollarSign, ChevronLeft } from 'lucide-react';

const TestBuilder = ({ subject, onBack, onManageQuestions }) => {
    const [tests, setTests] = useState([]);
    const [openTestDialog, setOpenTestDialog] = useState(false);
    const [newTest, setNewTest] = useState({ name: '', price: 0, duration: 60 });

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
            alert("Failed to fetch tests. Please try again.");
        }
    };

    const handleAddTest = async () => {
        if (!newTest.name) return;
        try {
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

            setNewTest({ name: '', price: 0, duration: 60 });
            setOpenTestDialog(false);
            fetchTests();
        } catch (error) {
            console.error("Error adding test in Supabase:", error);
            alert("Failed to add test. Please try again.");
        }
    };

    const handleDeleteTest = async (id) => {
        if (window.confirm("Are you sure? This will delete all questions in this test.")) {
            try {
                const { error } = await supabase
                    .from('tests')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchTests();
            } catch (error) {
                console.error("Error deleting test in Supabase:", error);
                alert("Failed to delete test. Please try again.");
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                {onBack && <IconButton onClick={onBack}><ChevronLeft /></IconButton>}
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Tests for {subject.name}</Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenTestDialog(true)}
                    sx={{ ml: 'auto', bgcolor: '#E91E63' }}
                >
                    Add Test
                </Button>
            </Box>

            <Grid container spacing={3}>
                {tests.map((test) => (
                    <Grid item xs={12} md={6} key={test.id}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{test.name}</Typography>
                                <IconButton size="small" onClick={() => handleDeleteTest(test.id)}><Trash2 size={18} color="#F44336" /></IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Chip icon={<Clock size={16} />} label={`${test.duration} mins`} variant="outlined" size="small" />
                                <Chip icon={<DollarSign size={16} />} label={test.price === 0 ? 'Free Try' : `₹${test.price}`} variant="outlined" size="small" color={test.price === 0 ? 'success' : 'default'} />
                            </Box>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => onManageQuestions(test)}
                                sx={{ borderRadius: 2 }}
                            >
                                Manage Question Bank
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Add Test Dialog */}
            <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>Add New Mock Test</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth label="Test Name" margin="dense"
                        value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth label="Duration (mins)" margin="dense" type="number"
                                value={newTest.duration} onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth label="Price (0 for Free)" margin="dense" type="number"
                                value={newTest.price} onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTestDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddTest} sx={{ bgcolor: '#E91E63' }}>Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TestBuilder;

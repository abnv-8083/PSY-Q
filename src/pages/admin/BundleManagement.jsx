import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Chip, List, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, Plus, Package, BookOpen, CheckCircle } from 'lucide-react';

const BundleManagement = ({ subject }) => {
    const [bundles, setBundles] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newBundle, setNewBundle] = useState({
        name: '',
        description: '',
        price: '',
        testIds: [],
        features: ['Unlimited Re-attempts', 'Detailed Solutions', 'All-India Ranking']
    });

    useEffect(() => {
        if (subject) {
            fetchData();
        }
    }, [subject]);

    const fetchData = async () => {
        if (!subject) return;
        setLoading(true);
        try {
            // Fetch Bundles with junction data
            const { data: bundlesData, error: bundlesError } = await supabase
                .from('bundles')
                .select('*, bundle_tests(test_id)')
                .eq('subject_id', subject.id);

            if (bundlesError) throw bundlesError;

            const formattedBundles = bundlesData.map(b => ({
                ...b,
                testIds: b.bundle_tests.map(bt => bt.test_id)
            }));
            setBundles(formattedBundles);

            // Fetch Tests for the current subject
            const { data: testsData, error: testsError } = await supabase
                .from('tests')
                .select('*')
                .eq('subject_id', subject.id);

            if (testsError) throw testsError;
            setTests(testsData);

        } catch (error) {
            console.error("Error fetching bundle data from Supabase:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBundle = async () => {
        if (!newBundle.name || !newBundle.price || newBundle.testIds.length === 0) {
            alert("Please fill name, price and select at least one test.");
            return;
        }

        try {
            // 1. Create Bundle record
            const { data: bundle, error: bundleError } = await supabase
                .from('bundles')
                .insert({
                    subject_id: subject.id,
                    name: newBundle.name,
                    description: newBundle.description,
                    price: Number(newBundle.price)
                })
                .select()
                .single();

            if (bundleError) throw bundleError;

            // 2. Create junction records for tests
            const bundleTests = newBundle.testIds.map(testId => ({
                bundle_id: bundle.id,
                test_id: testId
            }));

            const { error: junctionError } = await supabase
                .from('bundle_tests')
                .insert(bundleTests);

            if (junctionError) throw junctionError;

            setOpenDialog(false);
            setNewBundle({ name: '', description: '', price: '', testIds: [], features: ['Unlimited Re-attempts', 'Detailed Solutions', 'All-India Ranking'] });
            fetchData();
        } catch (error) {
            console.error("Error creating bundle in Supabase:", error);
            alert("Failed to create bundle. Please try again.");
        }
    };

    const handleDeleteBundle = async (id) => {
        if (window.confirm("Are you sure you want to delete this bundle?")) {
            try {
                const { error } = await supabase
                    .from('bundles')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchData();
            } catch (error) {
                console.error("Error deleting bundle in Supabase:", error);
                alert("Failed to delete bundle. Please try again.");
            }
        }
    };

    const toggleTestSelection = (testId) => {
        setNewBundle(prev => {
            const exists = prev.testIds.includes(testId);
            if (exists) {
                return { ...prev, testIds: prev.testIds.filter(id => id !== testId) };
            } else {
                return { ...prev, testIds: [...prev.testIds, testId] };
            }
        });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Test Bundles</Typography>
                <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setOpenDialog(true)} sx={{ bgcolor: '#db2777', '&:hover': { bgcolor: '#be185d' } }}>
                    Create Bundle
                </Button>
            </Box>

            <Grid container spacing={3}>
                {bundles.length === 0 ? (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '2px dashed #eee' }}>
                            <Package size={48} color="#ccc" style={{ marginBottom: 16 }} />
                            <Typography color="textSecondary">No test bundles created yet.</Typography>
                        </Paper>
                    </Grid>
                ) : (
                    bundles.map((bundle) => (
                        <Grid item xs={12} md={6} key={bundle.id}>
                            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #eee', position: 'relative' }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteBundle(bundle.id)}
                                    sx={{ position: 'absolute', top: 16, right: 16, color: '#ef4444' }}
                                >
                                    <Trash2 size={18} />
                                </IconButton>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{bundle.name}</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{bundle.description}</Typography>

                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip label={`₹${bundle.price}`} size="small" sx={{ bgcolor: '#fdf2f8', color: '#db2777', fontWeight: 700 }} />
                                    <Chip label={`${bundle.testIds?.length || 0} Tests`} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }} />
                                </Box>

                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>INCLUDED TESTS:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {Array.isArray(bundle.testIds) && bundle.testIds.map(tid => {
                                        const test = tests.find(t => t.id === tid);
                                        return test ? <Chip key={tid} label={test.name} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} /> : null;
                                    })}
                                </Box>
                            </Paper>
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Create Bundle Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>Create New Test Bundle</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth label="Bundle Name"
                            value={newBundle.name} onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                        />
                        <TextField
                            fullWidth label="Description" multiline rows={2}
                            value={newBundle.description} onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                        />
                        <TextField
                            fullWidth label="Price (INR)" type="number"
                            value={newBundle.price} onChange={(e) => setNewBundle({ ...newBundle, price: e.target.value })}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Select Tests to Include:</Typography>
                            {tests.length > 0 && (
                                <Box>
                                    <Button size="small" onClick={() => setNewBundle(prev => ({ ...prev, testIds: tests.map(t => t.id) }))} sx={{ textTransform: 'none', fontWeight: 700, p: 0, mr: 2 }}>Select All</Button>
                                    <Button size="small" onClick={() => setNewBundle(prev => ({ ...prev, testIds: [] }))} sx={{ textTransform: 'none', fontWeight: 700, p: 0, color: '#ef4444' }}>Deselect All</Button>
                                </Box>
                            )}
                        </Box>

                        <Paper sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                            {tests.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>No tests found for this subject!</Typography>
                                    <Typography variant="caption" color="textSecondary">Add tests in Content Management first.</Typography>
                                </Box>
                            ) : (
                                <List sx={{ width: '100%', p: 0 }}>
                                    {tests.map((test) => (
                                        <ListItem
                                            key={test.id}
                                            button
                                            onClick={() => toggleTestSelection(test.id)}
                                            sx={{
                                                borderBottom: '1px solid #f1f5f9',
                                                '&:hover': { bgcolor: '#f1f5f9' },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={newBundle.testIds.includes(test.id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    size="small"
                                                    sx={{ color: '#db2777', '&.Mui-checked': { color: '#db2777' } }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={test.name}
                                                secondary={`${test.questions || 0} Questions • ${test.duration || 0} mins`}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                            />
                                            {newBundle.testIds.includes(test.id) && (
                                                <CheckCircle size={16} color="#22c55e" />
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>Bundle Features:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {newBundle.features.map((feature, i) => (
                                <Chip key={i} label={feature} size="small" onDelete={() => {
                                    setNewBundle(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));
                                }} />
                            ))}
                            <Button size="small" onClick={() => {
                                const f = prompt("Enter feature:");
                                if (f) setNewBundle(prev => ({ ...prev, features: [...prev.features, f] }));
                            }}>+ Add Feature</Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: '#64748b' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateBundle} sx={{ bgcolor: '#db2777', '&:hover': { bgcolor: '#be185d' }, px: 4 }}>
                        Create Bundle
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BundleManagement;

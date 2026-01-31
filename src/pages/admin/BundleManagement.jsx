import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Chip, List, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import ModernDialog from '../../components/ModernDialog';
import { Trash2, Plus, Package, BookOpen, CheckCircle, Edit, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BundleManagement = ({ subject }) => {
    const [bundles, setBundles] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newBundle, setNewBundle] = useState({
        id: null,
        name: '',
        description: '',
        price: '',
        testIds: [],
        features: ['Unlimited Re-attempts', 'Detailed Solutions', 'All-India Ranking']
    });

    // Modern Dialog State
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
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

    const handleSaveBundle = async () => {
        if (!newBundle.name || !newBundle.price || newBundle.testIds.length === 0) {
            setDialog({
                open: true,
                title: 'Missing Information',
                message: "Please fill in the name, price, and select at least one test to create/update a bundle.",
                type: 'warning'
            });
            return;
        }

        try {
            let bundleId = newBundle.id;

            if (bundleId) {
                // Update existing bundle
                const { error: updateError } = await supabase
                    .from('bundles')
                    .update({
                        name: newBundle.name,
                        description: newBundle.description,
                        price: Number(newBundle.price)
                    })
                    .eq('id', bundleId);

                if (updateError) throw updateError;
            } else {
                // Create new bundle
                const { data: bundle, error: insertError } = await supabase
                    .from('bundles')
                    .insert({
                        subject_id: subject.id,
                        name: newBundle.name,
                        description: newBundle.description,
                        price: Number(newBundle.price)
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                bundleId = bundle.id;
            }

            // Sync tests using diff logic
            const { data: existingData, error: fetchError } = await supabase
                .from('bundle_tests')
                .select('test_id')
                .eq('bundle_id', bundleId);

            if (fetchError) throw fetchError;

            // Use IDs as strings (they are UUIDs)
            const existingTestIds = existingData ? existingData.map(item => String(item.test_id)) : [];
            const newTestIds = Array.isArray(newBundle.testIds) ? newBundle.testIds.map(id => String(id)) : [];

            // Determine which tests to add and which to remove
            const testsToAdd = newTestIds.filter(id => !existingTestIds.includes(id));
            const testsToRemove = existingTestIds.filter(id => !newTestIds.includes(id));

            // 1. Remove deselected tests
            if (testsToRemove.length > 0) {
                const { error: deleteError } = await supabase
                    .from('bundle_tests')
                    .delete()
                    .eq('bundle_id', bundleId)
                    .in('test_id', testsToRemove);

                if (deleteError) throw deleteError;
            }

            // 2. Add newly selected tests
            if (testsToAdd.length > 0) {
                const recordsToAdd = testsToAdd.map(testId => ({
                    bundle_id: bundleId,
                    test_id: testId
                }));

                const { error: insertError } = await supabase
                    .from('bundle_tests')
                    .insert(recordsToAdd);

                if (insertError) throw insertError;
            }

            setDialog({
                open: true,
                title: 'Bundle Saved',
                message: "Bundle saved successfully!",
                type: 'success'
            });
            setOpenDialog(false);
            setNewBundle({ id: null, name: '', description: '', price: '', testIds: [], features: ['Unlimited Re-attempts', 'Detailed Solutions', 'All-India Ranking'] });
            fetchData();
        } catch (error) {
            console.error("Critical Saving Error:", error);
            setDialog({
                open: true,
                title: 'Save Failed',
                message: `Failed to save the bundle.\n\nReason: ${error.message || "Unknown error"}`,
                type: 'error'
            });
        }
    };

    const handleEditBundle = (bundle) => {
        setNewBundle({
            id: bundle.id,
            name: bundle.name,
            description: bundle.description || '',
            price: bundle.price,
            testIds: bundle.testIds || [],
            features: ['Unlimited Re-attempts', 'Detailed Solutions', 'All-India Ranking'] // Keep default features for now as we don't store them individually yet
        });
        setOpenDialog(true);
    };

    const handleDeleteBundle = async (id) => {
        setDialog({
            open: true,
            title: 'Delete Bundle?',
            message: 'Are you sure you want to delete this bundle? This will also remove it from payments and user records. This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                setDialog(prev => ({ ...prev, open: false }));
                try {
                    // 1. Delete related entries in bundle_tests first (to handle FK constraints)
                    const { error: err1 } = await supabase.from('bundle_tests').delete().eq('bundle_id', id);
                    if (err1) console.warn("Note: Error cleaning bundle_tests:", err1.message);

                    // 2. Delete entries in user_bundles (to handle FK constraints)
                    const { error: err2 } = await supabase.from('user_bundles').delete().eq('bundle_id', id);
                    if (err2) console.warn("Note: Error cleaning user_bundles:", err2.message);

                    // 3. Optional: Delete from payments if item_id is a foreign key
                    const { error: err3 } = await supabase.from('payments').delete().eq('item_id', id).eq('type', 'bundle');
                    if (err3) console.warn("Note: Error cleaning payments:", err3.message);

                    // 4. Delete from guest_orders (Guest checkout system)
                    const { error: err4 } = await supabase.from('guest_orders').delete().eq('item_id', id).eq('item_type', 'bundle');
                    if (err4) console.warn("Note: Error cleaning guest_orders:", err4.message);

                    // 5. Delete the bundle itself
                    console.log("DEBUG: Attempting to delete bundle with ID:", id);
                    const { data: deletedData, error } = await supabase
                        .from('bundles')
                        .delete()
                        .eq('id', id)
                        .select();

                    if (error) throw error;

                    if (!deletedData || deletedData.length === 0) {
                        console.error("CRITICAL: Deletion returned success but NO rows were deleted. This usually implies an RLS Policy issue.");
                        setDialog({
                            open: true,
                            title: 'Deletion Failed',
                            message: "WARNING: The server said it worked, but the bundle record was NOT removed.\n\nThis is likely an RLS (Row Level Security) Permission issue on the 'bundles' table.",
                            type: 'error'
                        });
                    } else {
                        console.log("DEBUG: Rows deleted from database:", deletedData);
                        setDialog({
                            open: true,
                            title: 'Bundle Deleted',
                            message: "The bundle has been successfully removed from the database.",
                            type: 'success'
                        });
                    }

                    await fetchData();
                } catch (error) {
                    console.error("Critical Deletion Error:", error);
                    setDialog({
                        open: true,
                        title: 'Delete Failed',
                        message: `FAILED TO DELETE BUNDLE!\n\nReason: ${error.message || "Unknown error"}`,
                        type: 'error'
                    });
                }
            }
        });
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>Test Bundles</Typography>
                    <Typography variant="body1" sx={{ color: '#64748b' }}>Curate and manage your test packages.</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        bgcolor: '#E91E63', borderRadius: 3, px: 3, py: 1.5,
                        fontWeight: 800, textTransform: 'none',
                        boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                        '&:hover': { bgcolor: '#D81B60', boxShadow: '0 10px 25px rgba(233, 30, 99, 0.4)' }
                    }}
                >
                    Create Bundle
                </Button>
            </Box>

            <Grid container spacing={3}>
                <AnimatePresence>
                    {bundles.length === 0 ? (
                        <Grid size={12}>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Paper className="glass-card" sx={{ p: 8, textAlign: 'center', borderRadius: 5 }}>
                                    <Package size={54} color="#E91E63" style={{ marginBottom: 20, opacity: 0.5 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>No test bundles yet</Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Start by creating your first bundle to group tests together.</Typography>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ) : (
                        bundles.map((bundle, index) => (
                            <Grid size={{ xs: 12, md: 6 }} key={bundle.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Paper className="glass-card" sx={{
                                        p: 4, borderRadius: 5, position: 'relative',
                                        transition: 'all 0.3s',
                                        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                                    }}>
                                        <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditBundle(bundle)}
                                                sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                                            >
                                                <Edit size={18} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteBundle(bundle.id)}
                                                sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } }}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>{bundle.name}</Typography>
                                            <Typography variant="body2" sx={{ color: '#64748b', mb: 3, minHeight: 40 }}>{bundle.description}</Typography>

                                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(233, 30, 99, 0.08)', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ color: '#E91E63', fontWeight: 900 }}>₹{bundle.price}</Typography>
                                                </Box>
                                                <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(99, 102, 241, 0.08)', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <BookOpen size={16} color="#6366f1" />
                                                    <Typography variant="subtitle2" sx={{ color: '#6366f1', fontWeight: 800 }}>{bundle.testIds?.length || 0} Tests</Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.04)' }} />

                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 2 }}>INCLUDED TESTS</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {Array.isArray(bundle.testIds) && bundle.testIds.map(tid => {
                                                const test = tests.find(t => t.id === tid);
                                                return test ? (
                                                    <Box key={tid} sx={{ px: 1.5, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>{test.name}</Typography>
                                                    </Box>
                                                ) : null;
                                            })}
                                        </Box>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))
                    )}
                </AnimatePresence>
            </Grid>

            <Dialog open={openDialog} onClose={() => {
                setOpenDialog(false);
                setNewBundle({ name: '', description: '', price: '', testIds: [], features: ['Unlimited Re-attempts', 'Detailed Solutions', 'All-India Ranking'] });
            }} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 5 } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>{newBundle.id ? 'Edit Test Bundle' : 'Create New Test Bundle'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            fullWidth label="Bundle Name"
                            value={newBundle.name} onChange={(e) => setNewBundle({ ...newBundle, name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth label="Description" multiline rows={2}
                            value={newBundle.description} onChange={(e) => setNewBundle({ ...newBundle, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth label="Price (INR)" type="number"
                            value={newBundle.price} onChange={(e) => setNewBundle({ ...newBundle, price: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />

                        <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8' }}>Include Tests</Typography>
                                <Box>
                                    <Button size="small" onClick={() => setNewBundle(prev => ({ ...prev, testIds: tests.map(t => t.id) }))} sx={{ textTransform: 'none', fontWeight: 800 }}>Select All</Button>
                                    <Button size="small" onClick={() => setNewBundle(prev => ({ ...prev, testIds: [] }))} sx={{ textTransform: 'none', fontWeight: 800, color: '#ef4444' }}>Deselect All</Button>
                                </Box>
                            </Box>

                            <Paper sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid #f1f5f9', borderRadius: 4, bgcolor: '#f8fafc' }}>
                                {tests.length === 0 ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="error" sx={{ fontWeight: 700 }}>No tests found for this subject!</Typography>
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
                                                    transition: 'all 0.2s',
                                                    py: 1.5
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={newBundle.testIds.includes(test.id)}
                                                        tabIndex={-1}
                                                        disableRipple
                                                        size="small"
                                                        sx={{ color: '#E91E63', '&.Mui-checked': { color: '#E91E63' } }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={test.name}
                                                    secondary={`${test.questions || 0} Questions • ${test.duration || 0} mins`}
                                                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.875rem' }}
                                                    secondaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 600 }}
                                                />
                                                {newBundle.testIds.includes(test.id) && (
                                                    <CheckCircle size={16} color="#E91E63" />
                                                )}
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', mb: 1.5 }}>Bundle Features</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {newBundle.features.map((feature, i) => (
                                    <Chip
                                        key={i} label={feature} size="small"
                                        onDelete={() => {
                                            setNewBundle(prev => ({ ...prev, features: prev.features.filter((_, idx) => idx !== i) }));
                                        }}
                                        sx={{ fontWeight: 700, bgcolor: '#f1f5f9', borderRadius: 2 }}
                                    />
                                ))}
                                <Button
                                    size="small"
                                    onClick={() => {
                                        const f = prompt("Enter feature:");
                                        if (f) setNewBundle(prev => ({ ...prev, features: [...prev.features, f] }));
                                    }}
                                    sx={{ fontWeight: 800, textTransform: 'none' }}
                                >
                                    + Add Feature
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 1 }}>
                    <Button onClick={() => {
                        setOpenDialog(false);
                        setNewBundle({ name: '', description: '', price: '', testIds: [], features: ['Unlimited Re-attempts', 'Detailed Solutions', 'All-India Ranking'] });
                    }} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained" onClick={handleSaveBundle}
                        sx={{
                            bgcolor: '#E91E63', borderRadius: 3, fontWeight: 800, px: 4, py: 1.2,
                            boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                            '&:hover': { bgcolor: '#D81B60' }
                        }}
                    >
                        {newBundle.id ? 'Save Changes' : 'Create Bundle'}
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

export default BundleManagement;

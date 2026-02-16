import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Chip, Alert, InputAdornment, alpha } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import ModernDialog from '../../components/ModernDialog';
import { Package, BookOpen, CheckCircle, Edit, Save, X, Plus, Trash2, TrendingDown, GripVertical, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBundles, updateBundle, addTestToBundle, removeTestFromBundle, updateBundleFeatures, fetchAvailableTests } from '../../api/bundlesApi';
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

const BundleManagement = () => {
    const [bundles, setBundles] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBundle, setEditingBundle] = useState(null);
    const [openPricingDialog, setOpenPricingDialog] = useState(false);
    const [openTestsDialog, setOpenTestsDialog] = useState(false);
    const [openFeaturesDialog, setOpenFeaturesDialog] = useState(false);

    // Pricing form state
    const [pricingForm, setPricingForm] = useState({
        regular_price: '',
        offer_price: ''
    });

    // Features form state
    const [featuresForm, setFeaturesForm] = useState([]);
    const [newFeature, setNewFeature] = useState('');

    // Modern Dialog State
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch bundles with tests
            const bundlesData = await fetchBundles();
            setBundles(bundlesData);

            // Fetch all available tests
            const testsData = await fetchAvailableTests();
            setTests(testsData);

        } catch (error) {
            console.error("Error fetching bundle data:", error);
            setDialog({
                open: true,
                title: 'Error Loading Data',
                message: `Failed to load bundles: ${error.message}`,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPricingDialog = (bundle) => {
        setEditingBundle(bundle);
        setPricingForm({
            regular_price: bundle.regular_price || '',
            offer_price: bundle.offer_price || ''
        });
        setOpenPricingDialog(true);
    };

    const handleSavePricing = async () => {
        const regularPrice = parseFloat(pricingForm.regular_price);
        const offerPrice = pricingForm.offer_price ? parseFloat(pricingForm.offer_price) : null;

        // Validation
        if (isNaN(regularPrice) || regularPrice < 0) {
            setDialog({
                open: true,
                title: 'Invalid Price',
                message: 'Regular price must be a valid non-negative number.',
                type: 'warning'
            });
            return;
        }

        if (offerPrice !== null && (isNaN(offerPrice) || offerPrice < 0)) {
            setDialog({
                open: true,
                title: 'Invalid Offer Price',
                message: 'Offer price must be a valid non-negative number.',
                type: 'warning'
            });
            return;
        }

        if (offerPrice !== null && offerPrice > regularPrice) {
            setDialog({
                open: true,
                title: 'Invalid Pricing',
                message: 'Offer price cannot be higher than regular price.',
                type: 'warning'
            });
            return;
        }

        try {
            await updateBundle(editingBundle.id, {
                regular_price: regularPrice,
                offer_price: offerPrice
            });

            setDialog({
                open: true,
                title: 'Pricing Updated',
                message: 'Bundle pricing has been updated successfully!',
                type: 'success'
            });
            setOpenPricingDialog(false);
            fetchData();
        } catch (error) {
            console.error("Error updating pricing:", error);
            setDialog({
                open: true,
                title: 'Update Failed',
                message: `Failed to update pricing: ${error.message}`,
                type: 'error'
            });
        }
    };

    const handleOpenTestsDialog = (bundle) => {
        setEditingBundle(bundle);
        setOpenTestsDialog(true);
    };

    const handleToggleTest = async (testId) => {
        const isCurrentlyIncluded = editingBundle.tests.some(t => t.id === testId);

        try {
            if (isCurrentlyIncluded) {
                await removeTestFromBundle(editingBundle.id, testId);
            } else {
                await addTestToBundle(editingBundle.id, testId);
            }

            // Refresh data
            await fetchData();

            // Update editing bundle to reflect changes
            const updatedBundle = bundles.find(b => b.id === editingBundle.id);
            if (updatedBundle) {
                setEditingBundle(updatedBundle);
            }
        } catch (error) {
            console.error("Error toggling test:", error);
            setDialog({
                open: true,
                title: 'Error',
                message: `Failed to update tests: ${error.message}`,
                type: 'error'
            });
        }
    };

    const handleOpenFeaturesDialog = (bundle) => {
        setEditingBundle(bundle);
        setFeaturesForm(bundle.features || []);
        setNewFeature('');
        setOpenFeaturesDialog(true);
    };

    const handleAddFeature = () => {
        if (newFeature.trim()) {
            setFeaturesForm([...featuresForm, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const handleRemoveFeature = (index) => {
        setFeaturesForm(featuresForm.filter((_, i) => i !== index));
    };

    const handleSaveFeatures = async () => {
        try {
            await updateBundleFeatures(editingBundle.id, featuresForm);

            setDialog({
                open: true,
                title: 'Features Updated',
                message: 'Bundle features have been updated successfully!',
                type: 'success'
            });
            setOpenFeaturesDialog(false);
            fetchData();
        } catch (error) {
            console.error("Error updating features:", error);
            setDialog({
                open: true,
                title: 'Update Failed',
                message: `Failed to update features: ${error.message}`,
                type: 'error'
            });
        }
    };

    const calculateDiscount = (regularPrice, offerPrice) => {
        if (!offerPrice || offerPrice >= regularPrice) return 0;
        return Math.round(((regularPrice - offerPrice) / regularPrice) * 100);
    };

    const getBundleColor = (bundleType) => {
        switch (bundleType) {
            case 'BASIC': return '#6366f1';
            case 'ADVANCED': return '#f59e0b';
            case 'PREMIUM': return COLORS.accent;
            default: return '#6366f1';
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(bundles);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately
        setBundles(items);

        try {
            // Batch update display_order in Supabase
            const updates = items.map((bundle, index) =>
                supabase
                    .from('bundles')
                    .update({ display_order: index })
                    .eq('id', bundle.id)
            );

            await Promise.all(updates);
        } catch (error) {
            console.error("Error reordering bundles:", error);
            fetchData();
        }
    };

    return (
        <Box sx={{ p: { xs: 3, md: 6 } }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1, mb: 1.5 }}>
                    Bundle Management
                </Typography>
                <Typography variant="h6" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                    Configure pricing and content for your subscription bundles
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 12 }}>
                    <Typography variant="h6" sx={{ color: COLORS.textLight, fontWeight: 600 }}>Loading bundles...</Typography>
                </Box>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <StrictModeDroppable droppableId="bundles-list" direction="horizontal">
                        {(provided) => (
                            <Grid container spacing={4} {...provided.droppableProps} ref={provided.innerRef}>
                                <AnimatePresence>
                                    {bundles.map((bundle, index) => {
                                        const discount = calculateDiscount(bundle.regular_price, bundle.offer_price);
                                        const bundleColor = getBundleColor(bundle.bundle_type);

                                        return (
                                            <Draggable key={bundle.id} draggableId={bundle.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        md={4}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        sx={{ ...provided.draggableProps.style }}
                                                    >
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0, scale: snapshot.isDragging ? 1.02 : 1 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <Paper sx={{
                                                                p: 4,
                                                                borderRadius: 6,
                                                                position: 'relative',
                                                                border: snapshot.isDragging ? `3px solid ${bundleColor}` : (bundle.bundle_type === 'PREMIUM' ? `3px solid ${bundleColor}` : `2px solid ${COLORS.border}`),
                                                                transition: 'all 0.3s',
                                                                boxShadow: snapshot.isDragging ? `0 20px 60px ${alpha(bundleColor, 0.3)}` : '0 4px 12px rgba(0,0,0,0.05)',
                                                                bgcolor: '#fff',
                                                                '&:hover': {
                                                                    transform: 'translateY(-8px)',
                                                                    borderColor: bundleColor,
                                                                    boxShadow: `0 24px 48px ${alpha(bundleColor, 0.15)}`
                                                                }
                                                            }}>
                                                                {/* Bundle Type Badge */}
                                                                <Box sx={{
                                                                    position: 'absolute',
                                                                    top: -16,
                                                                    left: 24,
                                                                    px: 2.5,
                                                                    py: 1,
                                                                    bgcolor: bundleColor,
                                                                    borderRadius: 3,
                                                                    boxShadow: `0 8px 16px ${alpha(bundleColor, 0.4)}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5
                                                                }}>
                                                                    <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', opacity: 0.9, color: 'white' }}>
                                                                        <GripVertical size={16} />
                                                                    </Box>
                                                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                                                        {bundle.bundle_type}
                                                                    </Typography>
                                                                </Box>

                                                                {/* Best Value Badge for Premium */}
                                                                {bundle.bundle_type === 'PREMIUM' && (
                                                                    <Box sx={{
                                                                        position: 'absolute',
                                                                        top: -16,
                                                                        right: 24,
                                                                        px: 2.5,
                                                                        py: 1,
                                                                        bgcolor: '#10b981',
                                                                        borderRadius: 3,
                                                                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.4)'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                                                            BEST VALUE
                                                                        </Typography>
                                                                    </Box>
                                                                )}

                                                                <Box sx={{ mt: 3, mb: 4 }}>
                                                                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1, fontSize: '1.5rem' }}>
                                                                        {bundle.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 500, minHeight: 48, lineHeight: 1.6 }}>
                                                                        {bundle.description}
                                                                    </Typography>
                                                                </Box>

                                                                {/* Pricing Section */}
                                                                <Box sx={{ mb: 4 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1.5 }}>
                                                                        {bundle.offer_price ? (
                                                                            <>
                                                                                <Typography variant="h3" sx={{ fontWeight: 900, color: bundleColor, fontSize: '2.25rem' }}>
                                                                                    ₹{bundle.offer_price}
                                                                                </Typography>
                                                                                <Typography variant="h6" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: '#94a3b8',
                                                                                    textDecoration: 'line-through'
                                                                                }}>
                                                                                    ₹{bundle.regular_price}
                                                                                </Typography>
                                                                                {discount > 0 && (
                                                                                    <Chip
                                                                                        icon={<TrendingDown size={14} />}
                                                                                        label={`${discount}% OFF`}
                                                                                        size="small"
                                                                                        sx={{
                                                                                            bgcolor: '#dcfce7',
                                                                                            color: '#059669',
                                                                                            fontWeight: 900,
                                                                                            fontSize: '0.8rem',
                                                                                            borderRadius: 2
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <Typography variant="h3" sx={{ fontWeight: 900, color: bundleColor, fontSize: '2.25rem' }}>
                                                                                ₹{bundle.regular_price}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                    <Button
                                                                        size="medium"
                                                                        startIcon={<Edit size={16} />}
                                                                        onClick={() => handleOpenPricingDialog(bundle)}
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            fontWeight: 800,
                                                                            color: bundleColor,
                                                                            borderRadius: 3,
                                                                            px: 2,
                                                                            '&:hover': { bgcolor: alpha(bundleColor, 0.1) }
                                                                        }}
                                                                    >
                                                                        Edit Pricing
                                                                    </Button>
                                                                </Box>

                                                                <Divider sx={{ mb: 4, borderColor: alpha(COLORS.border, 0.5) }} />

                                                                {/* Features Section */}
                                                                <Box sx={{ mb: 4 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                        <Typography variant="overline" sx={{
                                                                            fontWeight: 900,
                                                                            color: COLORS.textLight,
                                                                            letterSpacing: 2
                                                                        }}>
                                                                            Features
                                                                        </Typography>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleOpenFeaturesDialog(bundle)}
                                                                            sx={{ color: bundleColor, bgcolor: alpha(bundleColor, 0.1), '&:hover': { bgcolor: alpha(bundleColor, 0.2) } }}
                                                                        >
                                                                            <Edit size={18} />
                                                                        </IconButton>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                                        {bundle.features?.slice(0, 4).map((feature, idx) => (
                                                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5, borderRadius: '50%', bgcolor: alpha(bundleColor, 0.1) }}>
                                                                                    <CheckCircle size={14} color={bundleColor} />
                                                                                </Box>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.secondary, fontSize: '0.9rem' }}>
                                                                                    {feature}
                                                                                </Typography>
                                                                            </Box>
                                                                        ))}
                                                                    </Box>
                                                                </Box>

                                                                <Divider sx={{ mb: 4, borderColor: alpha(COLORS.border, 0.5) }} />

                                                                {/* Tests Section */}
                                                                <Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(bundleColor, 0.1), color: bundleColor }}>
                                                                                <BookOpen size={18} />
                                                                            </Box>
                                                                            <Typography variant="overline" sx={{
                                                                                fontWeight: 900,
                                                                                color: COLORS.textLight,
                                                                                letterSpacing: 2
                                                                            }}>
                                                                                {bundle.tests?.length || 0} Tests
                                                                            </Typography>
                                                                        </Box>
                                                                        <Button
                                                                            size="small"
                                                                            startIcon={<Plus size={16} />}
                                                                            onClick={() => handleOpenTestsDialog(bundle)}
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                fontWeight: 800,
                                                                                fontSize: '0.8rem',
                                                                                color: bundleColor,
                                                                                borderRadius: 2.5,
                                                                                '&:hover': { bgcolor: alpha(bundleColor, 0.1) }
                                                                            }}
                                                                        >
                                                                            Manage
                                                                        </Button>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                        {bundle.tests?.slice(0, 3).map((test) => (
                                                                            <Chip
                                                                                key={test.id}
                                                                                label={test.name}
                                                                                size="small"
                                                                                sx={{
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 700,
                                                                                    bgcolor: '#f1f5f9',
                                                                                    color: COLORS.secondary,
                                                                                    borderRadius: 2
                                                                                }}
                                                                            />
                                                                        ))}
                                                                        {bundle.tests?.length > 3 && (
                                                                            <Chip
                                                                                label={`+${bundle.tests.length - 3} more`}
                                                                                size="small"
                                                                                sx={{
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 800,
                                                                                    bgcolor: alpha(bundleColor, 0.1),
                                                                                    color: bundleColor,
                                                                                    borderRadius: 2
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Paper>
                                                        </motion.div>
                                                    </Grid>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </AnimatePresence>
                            </Grid>
                        )}
                    </StrictModeDroppable>
                </DragDropContext>
            )}

            {/* Pricing Dialog */}
            <Dialog
                open={openPricingDialog}
                onClose={() => setOpenPricingDialog(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary }}>
                    Edit Pricing
                    <Typography sx={{ color: COLORS.textLight, fontWeight: 600, mt: 0.5 }}>{editingBundle?.name}</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
                        <Alert severity="info" sx={{ borderRadius: 4, bgcolor: alpha('#3b82f6', 0.1), color: '#1e40af', border: 'none', fontWeight: 600 }}>
                            Set the regular price and optional offer price. Discount will be calculated automatically.
                        </Alert>

                        <TextField
                            fullWidth
                            label="Regular Price"
                            type="number"
                            value={pricingForm.regular_price}
                            onChange={(e) => setPricingForm({ ...pricingForm, regular_price: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Offer Price (Optional)"
                            type="number"
                            value={pricingForm.offer_price}
                            onChange={(e) => setPricingForm({ ...pricingForm, offer_price: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                            helperText="Leave empty for no discount"
                        />

                        {pricingForm.regular_price && pricingForm.offer_price && (
                            <Box sx={{
                                p: 2.5,
                                bgcolor: '#dcfce7',
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                border: '1px solid #bbf7d0'
                            }}>
                                <TrendingDown size={24} color="#059669" />
                                <Typography sx={{ fontWeight: 900, color: '#059669', fontSize: '1.1rem' }}>
                                    {calculateDiscount(parseFloat(pricingForm.regular_price), parseFloat(pricingForm.offer_price))}% Discount Applied
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button onClick={() => setOpenPricingDialog(false)} sx={{ fontWeight: 800, color: COLORS.textLight, borderRadius: 3, px: 3 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSavePricing}
                        sx={{
                            bgcolor: COLORS.accent,
                            borderRadius: 4,
                            fontWeight: 900,
                            px: 5,
                            py: 1.5,
                            boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.4)}`,
                            '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}` }
                        }}
                    >
                        Save Pricing
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Tests Management Dialog */}
            <Dialog
                open={openTestsDialog}
                onClose={() => setOpenTestsDialog(false)}
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary }}>
                    Manage Tests
                    <Typography sx={{ color: COLORS.textLight, fontWeight: 600, mt: 0.5 }}>{editingBundle?.name}</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Alert severity="info" sx={{ borderRadius: 4, mb: 4, bgcolor: alpha('#3b82f6', 0.1), color: '#1e40af', border: 'none', fontWeight: 600 }}>
                            Select which mock tests should be included in this bundle.
                        </Alert>

                        <Paper elevation={0} sx={{
                            maxHeight: 500,
                            overflow: 'auto',
                            border: `2px solid ${COLORS.border}`,
                            borderRadius: 5,
                            bgcolor: '#f8fafc'
                        }}>
                            {tests.length === 0 ? (
                                <Box sx={{ p: 8, textAlign: 'center' }}>
                                    <Typography variant="h6" color="error" sx={{ fontWeight: 800, mb: 1 }}>
                                        No tests available!
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                        Create tests in Content Management first.
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ width: '100%', p: 1 }}>
                                    {tests.map((test) => {
                                        const isIncluded = editingBundle?.tests?.some(t => t.id === test.id);

                                        return (
                                            <ListItem
                                                key={test.id}
                                                disablePadding
                                                sx={{ mb: 1 }}
                                            >
                                                <ListItemButton
                                                    onClick={() => handleToggleTest(test.id)}
                                                    sx={{
                                                        borderRadius: 4,
                                                        py: 2,
                                                        px: 3,
                                                        border: `2px solid ${isIncluded ? COLORS.accent : 'transparent'}`,
                                                        bgcolor: isIncluded ? alpha(COLORS.accent, 0.05) : '#fff',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { bgcolor: isIncluded ? alpha(COLORS.accent, 0.08) : alpha(COLORS.border, 0.4) }
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 48 }}>
                                                        <Checkbox
                                                            edge="start"
                                                            checked={isIncluded}
                                                            tabIndex={-1}
                                                            disableRipple
                                                            size="medium"
                                                            sx={{ color: COLORS.accent, '&.Mui-checked': { color: COLORS.accent } }}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={test.name}
                                                        secondary={`${test.subjects?.name || 'Unknown Subject'} • ${test.duration || 0} mins`}
                                                        primaryTypographyProps={{ fontWeight: 800, fontSize: '1rem', color: isIncluded ? COLORS.accent : COLORS.primary }}
                                                        secondaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textLight }}
                                                    />
                                                    {isIncluded && (
                                                        <CheckCircle size={24} color={COLORS.accent} />
                                                    )}
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button onClick={() => setOpenTestsDialog(false)} variant="contained" sx={{
                        bgcolor: COLORS.accent,
                        borderRadius: 4,
                        fontWeight: 900,
                        px: 6,
                        py: 1.5,
                        boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.4)}`,
                        '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}` }
                    }}>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Features Dialog */}
            <Dialog
                open={openFeaturesDialog}
                onClose={() => setOpenFeaturesDialog(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary }}>
                    Edit Features
                    <Typography sx={{ color: COLORS.textLight, fontWeight: 600, mt: 0.5 }}>{editingBundle?.name}</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                            <TextField
                                fullWidth
                                label="Add Feature"
                                placeholder="e.g., Priority Support"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddFeature}
                                sx={{
                                    bgcolor: COLORS.accent,
                                    borderRadius: 4,
                                    minWidth: 64,
                                    '&:hover': { bgcolor: COLORS.accentHover }
                                }}
                            >
                                <Plus size={24} color="white" />
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <AnimatePresence>
                                {featuresForm.map((feature, index) => (
                                    <Box
                                        key={index}
                                        component={motion.div}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2.5,
                                            bgcolor: '#f8fafc',
                                            borderRadius: 4,
                                            border: `2px solid ${COLORS.border}`,
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: COLORS.accent, bgcolor: alpha(COLORS.accent, 0.02) }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.75, borderRadius: '50%', bgcolor: alpha('#059669', 0.1) }}>
                                            <CheckCircle size={18} color="#059669" />
                                        </Box>
                                        <Typography sx={{ flex: 1, fontWeight: 700, color: COLORS.secondary, fontSize: '1rem' }}>
                                            {feature}
                                        </Typography>
                                        <IconButton
                                            size="medium"
                                            onClick={() => handleRemoveFeature(index)}
                                            sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                                        >
                                            <Trash2 size={20} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </AnimatePresence>

                            {featuresForm.length === 0 && (
                                <Box sx={{ py: 6, textAlign: 'center', border: `2px dashed ${COLORS.border}`, borderRadius: 5 }}>
                                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                        No features added yet. Use the field above to add features.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 4, pt: 2 }}>
                    <Button onClick={() => setOpenFeaturesDialog(false)} sx={{ fontWeight: 800, color: COLORS.textLight, borderRadius: 3, px: 3 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveFeatures}
                        sx={{
                            bgcolor: COLORS.accent,
                            borderRadius: 4,
                            fontWeight: 900,
                            px: 5,
                            py: 1.5,
                            boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.4)}`,
                            '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}` }
                        }}
                    >
                        Save Features
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

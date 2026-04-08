import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Chip, Alert, InputAdornment, alpha } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import ModernDialog from '../../components/ModernDialog';
import { Package, BookOpen, CheckCircle, Edit, Save, X, Plus, Trash2, TrendingDown, GripVertical, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBundles, updateBundle, addTestToBundle, removeTestFromBundle, updateBundleFeatures, fetchAvailableTests } from '../../api/bundlesApi';
import { DragDropContext, Draggable } from '@hello-pangea/dnd';
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

    // New functional components for background effects
    const Blob = ({ style }) => (
        <Box sx={{
            position: 'absolute',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.2,
            pointerEvents: 'none',
            zIndex: 0,
            ...style
        }} />
    );

    return (
        <Box sx={{ p: { xs: 3, md: 6 }, position: 'relative', minHeight: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', overflow: 'hidden' }}>
            <Blob style={{ width: 500, height: 500, top: -150, left: -150, bgcolor: COLORS.accent }} />
            <Blob style={{ width: 600, height: 600, bottom: -200, right: -200, bgcolor: '#3b82f6' }} />
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
                backgroundSize: '24px 24px', pointerEvents: 'none'
            }} />

            <Box sx={{ mb: 6, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ p: 2, borderRadius: 4, bgcolor: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                    <Package size={32} color={COLORS.accent} />
                </Box>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1, mb: 0.5 }}>
                        Bundle Management
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                        Configure pricing and content for your premium subscriptions
                    </Typography>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 12, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ color: COLORS.textLight, fontWeight: 600, animation: 'pulse 2s infinite' }}>Loading your premium packages...</Typography>
                </Box>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <StrictModeDroppable droppableId="bundles-list" direction="horizontal">
                        {(provided) => (
                            <Box 
                                {...provided.droppableProps} 
                                ref={provided.innerRef} 
                                sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, // Explicitly 3 in 1 row on desktop
                                    gap: 4,
                                    position: 'relative', 
                                    zIndex: 1,
                                    alignItems: 'stretch'
                                }}
                            >
                                <AnimatePresence>
                                    {bundles.map((bundle, index) => {
                                        const discount = calculateDiscount(bundle.regular_price, bundle.offer_price);
                                        const bundleColor = getBundleColor(bundle.bundle_type);

                                        return (
                                            <Draggable key={bundle.id} draggableId={bundle.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <Box
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        sx={{ 
                                                            ...provided.draggableProps.style,
                                                            height: '100%'
                                                        }}
                                                    >
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 30 }}
                                                            animate={{ opacity: 1, y: 0, scale: snapshot.isDragging ? 1.03 : 1 }}
                                                            style={{ height: '100%' }}
                                                            transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                                                        >
                                                            <Paper sx={{
                                                                p: 4,
                                                                borderRadius: '28px',
                                                                position: 'relative',
                                                                border: `1px solid rgba(255,255,255,0.7)`,
                                                                background: snapshot.isDragging 
                                                                    ? `linear-gradient(135deg, rgba(255,255,255,1), rgba(255,255,255,0.85))` 
                                                                    : `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.6))`,
                                                                backdropFilter: 'blur(20px)',
                                                                boxShadow: snapshot.isDragging 
                                                                    ? `0 32px 80px ${alpha(bundleColor, 0.35)}, inset 0 1px 0 rgba(255,255,255,1)` 
                                                                    : `0 12px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)`,
                                                                height: '100%',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                maxWidth: { xs: '100%', md: '420px' }, // Enforce max width
                                                                mx: 'auto', // Center if Grid box is wider
                                                                width: '100%',
                                                                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                                                '&:hover': {
                                                                    transform: 'translateY(-12px)',
                                                                    boxShadow: `0 32px 70px ${alpha(bundleColor, 0.2)}, inset 0 1px 0 rgba(255,255,255,1)`,
                                                                    borderColor: alpha(bundleColor, 0.3)
                                                                }
                                                            }}>
                                                                {/* Decorative Top Glow */}
                                                                <Box sx={{
                                                                    position: 'absolute', top: 0, left: '10%', right: '10%', height: '4px',
                                                                    background: `linear-gradient(90deg, transparent, ${bundleColor}, transparent)`,
                                                                    opacity: 0.6, borderBottomRadius: 4
                                                                }} />

                                                                {/* Bundle Type Badge */}
                                                                <Box sx={{
                                                                    position: 'absolute',
                                                                    top: -18,
                                                                    left: 32,
                                                                    px: 3,
                                                                    py: 1.2,
                                                                    background: `linear-gradient(135deg, ${bundleColor}, ${alpha(bundleColor, 0.8)})`,
                                                                    borderRadius: '12px',
                                                                    boxShadow: `0 8px 20px ${alpha(bundleColor, 0.4)}`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    backdropFilter: 'blur(10px)',
                                                                    maxWidth: 'calc(100% - 64px)'
                                                                }}>
                                                                    <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', cursor: 'grab', opacity: 0.9, color: 'white', '&:active': { cursor: 'grabbing' }, flexShrink: 0 }}>
                                                                        <GripVertical size={16} />
                                                                    </Box>
                                                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                                        borderRadius: '10px',
                                                                        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                                                                        animation: 'pulse 2s infinite',
                                                                        maxWidth: '120px'
                                                                    }}>
                                                                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                            ★ MOST POPULAR
                                                                        </Typography>
                                                                    </Box>
                                                                )}

                                                                <Box sx={{ mt: 3, mb: 4, flexGrow: 0, width: '100%', overflow: 'hidden' }}>
                                                                    <Typography variant="h4" sx={{ 
                                                                        fontWeight: 900, color: COLORS.primary, mb: 1, letterSpacing: -0.5,
                                                                        wordBreak: 'break-word', overflowWrap: 'break-word'
                                                                    }}>
                                                                        {bundle.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ 
                                                                        color: COLORS.secondary, fontWeight: 500, minHeight: 48, lineHeight: 1.7, opacity: 0.8,
                                                                        wordBreak: 'break-word', overflowWrap: 'break-word'
                                                                    }}>
                                                                        {bundle.description}
                                                                    </Typography>
                                                                </Box>

                                                                {/* Pricing Section */}
                                                                <Box sx={{ mb: 4, bgcolor: alpha(bundleColor, 0.04), p: 3, borderRadius: '20px', border: `1px solid ${alpha(bundleColor, 0.1)}` }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1.5 }}>
                                                                        {bundle.offer_price ? (
                                                                            <>
                                                                                <Typography variant="h3" sx={{ fontWeight: 900, color: bundleColor, fontSize: '2.5rem', letterSpacing: -1 }}>
                                                                                    ₹{bundle.offer_price}
                                                                                </Typography>
                                                                                <Typography variant="h6" sx={{
                                                                                    fontWeight: 600,
                                                                                    color: COLORS.textLight,
                                                                                    textDecoration: 'line-through',
                                                                                    opacity: 0.6
                                                                                }}>
                                                                                    ₹{bundle.regular_price}
                                                                                </Typography>
                                                                            </>
                                                                        ) : (
                                                                            <Typography variant="h3" sx={{ fontWeight: 900, color: bundleColor, fontSize: '2.5rem', letterSpacing: -1 }}>
                                                                                ₹{bundle.regular_price}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                                                        <Button
                                                                            size="small"
                                                                            startIcon={<Edit size={16} />}
                                                                            onClick={() => handleOpenPricingDialog(bundle)}
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                fontWeight: 800,
                                                                                color: bundleColor,
                                                                                borderRadius: '10px',
                                                                                bgcolor: '#fff',
                                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                                                px: 2,
                                                                                py: 1,
                                                                                '&:hover': { bgcolor: bundleColor, color: '#fff', boxShadow: `0 8px 20px ${alpha(bundleColor, 0.3)}` }
                                                                            }}
                                                                        >
                                                                            Edit Price
                                                                        </Button>
                                                                        {discount > 0 && (
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: alpha('#10b981', 0.1), color: '#059669', px: 2, py: 0.5, borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>
                                                                                <TrendingDown size={14} />
                                                                                {discount}% OFF
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                </Box>

                                                                {/* Features Section */}
                                                                <Box sx={{ mb: 4, flexGrow: 1 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                                        <Typography variant="overline" sx={{
                                                                            fontWeight: 900,
                                                                            color: COLORS.primary,
                                                                            letterSpacing: 2
                                                                        }}>
                                                                            Features Overview
                                                                        </Typography>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleOpenFeaturesDialog(bundle)}
                                                                            sx={{ color: bundleColor, bgcolor: alpha(bundleColor, 0.1), '&:hover': { bgcolor: bundleColor, color: '#fff' }, transition: 'all 0.3s' }}
                                                                        >
                                                                            <Edit size={16} />
                                                                        </IconButton>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', overflow: 'hidden' }}>
                                                                        {bundle.features?.slice(0, 5).map((feature, idx) => (
                                                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5, borderRadius: '50%', background: `linear-gradient(135deg, ${alpha(bundleColor, 0.2)}, ${alpha(bundleColor, 0.05)})`, flexShrink: 0 }}>
                                                                                    <CheckCircle size={15} color={bundleColor} strokeWidth={3} />
                                                                                </Box>
                                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary, wordBreak: 'break-word', overflowWrap: 'break-word', flex: 1 }}>
                                                                                    {feature}
                                                                                </Typography>
                                                                            </Box>
                                                                        ))}
                                                                    </Box>
                                                                </Box>

                                                                {/* Tests Section */}
                                                                <Box sx={{ pt: 3, borderTop: `1px dashed ${alpha(COLORS.border, 0.8)}` }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(bundleColor, 0.1), color: bundleColor, display: 'flex' }}>
                                                                                <BookOpen size={18} />
                                                                            </Box>
                                                                            <Typography variant="subtitle2" sx={{
                                                                                fontWeight: 900,
                                                                                color: COLORS.primary
                                                                            }}>
                                                                                {bundle.tests?.length || 0} Included Tests
                                                                            </Typography>
                                                                        </Box>
                                                                        <Button
                                                                            size="small"
                                                                            onClick={() => handleOpenTestsDialog(bundle)}
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                fontWeight: 800,
                                                                                fontSize: '0.85rem',
                                                                                color: bundleColor,
                                                                                borderRadius: '20px',
                                                                                bgcolor: alpha(bundleColor, 0.1),
                                                                                '&:hover': { bgcolor: bundleColor, color: '#fff' },
                                                                                transition: 'all 0.3s'
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
                                                                                    bgcolor: '#fff',
                                                                                    color: COLORS.primary,
                                                                                    border: `1px solid ${COLORS.border}`,
                                                                                    borderRadius: '8px',
                                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                                                                    '&:hover': { borderColor: bundleColor }
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
                                                                                    bgcolor: bundleColor,
                                                                                    color: '#fff',
                                                                                    borderRadius: '8px',
                                                                                    border: 'none',
                                                                                    boxShadow: `0 4px 12px ${alpha(bundleColor, 0.3)}`
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Paper>
                                                        </motion.div>
                                                    </Box>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </AnimatePresence>
                            </Box>
                        )}
                    </StrictModeDroppable>
                </DragDropContext>
            )}

            {/* Premium Pricing Dialog */}
            <Dialog open={openPricingDialog} onClose={() => setOpenPricingDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary, background: 'linear-gradient(to right, #f8fafc, #fff)', p: 4, pb: 2 }}>
                    Update Pricing Model
                    <Typography sx={{ color: COLORS.accent, fontWeight: 700, mt: 0.5, fontSize: '1rem' }}>{editingBundle?.name} Package</Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 4, pb: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                        <TextField
                            fullWidth label="Regular Price" type="number"
                            value={pricingForm.regular_price}
                            onChange={(e) => setPricingForm({ ...pricingForm, regular_price: e.target.value })}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{fontWeight:800, color:COLORS.primary}}>₹</Typography></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f8fafc', fontWeight: 700 } }}
                            required
                        />
                        <TextField
                            fullWidth label="Offer Price (Promotional)" type="number"
                            value={pricingForm.offer_price}
                            onChange={(e) => setPricingForm({ ...pricingForm, offer_price: e.target.value })}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{fontWeight:800, color:COLORS.accent}}>₹</Typography></InputAdornment> }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: alpha(COLORS.accent, 0.03), fontWeight: 700, '&.Mui-focused fieldset': { borderColor: COLORS.accent } } }}
                        />
                        {pricingForm.regular_price && pricingForm.offer_price && (
                            <Box sx={{ p: 2, bgcolor: alpha('#10b981', 0.1), borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <TrendingDown size={24} color="#059669" />
                                <Box>
                                    <Typography sx={{ fontWeight: 800, color: '#059669' }}>{calculateDiscount(parseFloat(pricingForm.regular_price), parseFloat(pricingForm.offer_price))}% Discount</Typography>
                                    <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600 }}>Effectively applied to checkout automatically.</Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, px: 4, bgcolor: '#f8fafc', borderTop: `1px solid ${COLORS.border}` }}>
                    <Button onClick={() => setOpenPricingDialog(false)} sx={{ fontWeight: 800, color: COLORS.textLight, borderRadius: '12px' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSavePricing} sx={{ bgcolor: COLORS.primary, borderRadius: '12px', fontWeight: 800, px: 4, py: 1.2, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#0f172a' } }}>Apply Changes</Button>
                </DialogActions>
            </Dialog>

            {/* Tests Management Dialog */}
            <Dialog open={openTestsDialog} onClose={() => setOpenTestsDialog(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary, background: 'linear-gradient(to right, #f8fafc, #fff)', p: 4, pb: 2 }}>
                    Manage Associated Tests
                    <Typography sx={{ color: COLORS.accent, fontWeight: 700, mt: 0.5, fontSize: '1rem' }}>{editingBundle?.name} Package</Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 4, pb: 4, bgcolor: '#f8fafc' }}>
                    <Box sx={{ pt: 2 }}>
                        <Paper elevation={0} sx={{ maxHeight: 450, overflow: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            {tests.length === 0 ? (
                                <Box sx={{ p: 8, textAlign: 'center' }}>
                                    <Typography variant="h6" color="error" sx={{ fontWeight: 800, mb: 1 }}>No tests created yet!</Typography>
                                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>Create mock tests in the Content Management portal first.</Typography>
                                </Box>
                            ) : (
                                <List sx={{ width: '100%', p: 1.5 }}>
                                    {tests.map((test) => {
                                        const isIncluded = editingBundle?.tests?.some(t => t.id === test.id);
                                        return (
                                            <ListItem key={test.id} disablePadding sx={{ mb: 1.5 }}>
                                                <ListItemButton
                                                    onClick={() => handleToggleTest(test.id)}
                                                    sx={{
                                                        borderRadius: '12px', py: 2, px: 3,
                                                        border: `2px solid ${isIncluded ? COLORS.primary : COLORS.border}`,
                                                        bgcolor: isIncluded ? alpha(COLORS.primary, 0.02) : '#fff',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': { borderColor: isIncluded ? COLORS.primary : COLORS.accent, transform: 'translateX(4px)' }
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 48 }}>
                                                        <Checkbox edge="start" checked={isIncluded} disableRipple sx={{ color: COLORS.primary, '&.Mui-checked': { color: COLORS.primary } }} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={test.name}
                                                        secondary={`${test.subjects?.name || 'Assorted Topic'} • ${test.duration || 0} minutes duration`}
                                                        primaryTypographyProps={{ fontWeight: 800, fontSize: '1.05rem', color: COLORS.primary }}
                                                        secondaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.textLight, mt: 0.5 }}
                                                    />
                                                    {isIncluded && <CheckCircle size={28} color={COLORS.primary} strokeWidth={2.5} />}
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, px: 4, bgcolor: '#fff', borderTop: `1px solid ${COLORS.border}` }}>
                    <Button onClick={() => setOpenTestsDialog(false)} variant="contained" sx={{ bgcolor: COLORS.primary, borderRadius: '12px', fontWeight: 800, px: 6, py: 1.2, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#0f172a' } }}>Finish Matching</Button>
                </DialogActions>
            </Dialog>

            {/* Features Dialog */}
            <Dialog open={openFeaturesDialog} onClose={() => setOpenFeaturesDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', color: COLORS.primary, background: 'linear-gradient(to right, #f8fafc, #fff)', p: 4, pb: 2 }}>
                    Highlight Features
                    <Typography sx={{ color: COLORS.accent, fontWeight: 700, mt: 0.5, fontSize: '1rem' }}>{editingBundle?.name} Package</Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 4, pb: 4 }}>
                    <Box sx={{ pt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
                            <TextField
                                fullWidth label="Enter strong selling point..."
                                value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', fontWeight: 600 } }}
                            />
                            <Button variant="contained" onClick={handleAddFeature} sx={{ bgcolor: COLORS.primary, borderRadius: '14px', height: 56, minWidth: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <Plus size={24} color="white" />
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <AnimatePresence>
                                {featuresForm.map((feature, index) => (
                                    <Box key={index} component={motion.div} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '14px', border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
                                            <CheckCircle size={16} strokeWidth={3} />
                                        </Box>
                                        <Typography sx={{ flex: 1, fontWeight: 700, color: COLORS.primary }}>{feature}</Typography>
                                        <IconButton size="small" onClick={() => handleRemoveFeature(index)} sx={{ color: '#ef4444', bgcolor: alpha('#ef4444', 0.1), '&:hover': { bgcolor: '#ef4444', color: 'white' } }}>
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </AnimatePresence>
                            {featuresForm.length === 0 && (
                                <Box sx={{ py: 6, textAlign: 'center', border: `2px dashed ${COLORS.border}`, borderRadius: '16px', bgcolor: '#f8fafc' }}>
                                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 700 }}>No features active. Type above to add compelling features.</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, px: 4, bgcolor: '#f8fafc', borderTop: `1px solid ${COLORS.border}` }}>
                    <Button onClick={() => setOpenFeaturesDialog(false)} sx={{ fontWeight: 800, color: COLORS.textLight, borderRadius: '12px' }}>Discard</Button>
                    <Button variant="contained" onClick={handleSaveFeatures} sx={{ bgcolor: COLORS.primary, borderRadius: '12px', fontWeight: 800, px: 4, py: 1.2, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#0f172a' } }}>Update Features</Button>
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

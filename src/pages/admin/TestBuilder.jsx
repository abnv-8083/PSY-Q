import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper, Grid, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, alpha, Switch, Tooltip, LinearProgress, InputAdornment } from '@mui/material';
import { fetchTests, createTest, updateTest, deleteTest } from '../../api/testsApi';
import ModernDialog from '../../components/ModernDialog';
import { Plus, Trash2, Clock, Target, Pencil, GripVertical, ChevronLeft, Calendar, Layout, Layers, HelpCircle, BookOpen, Gift, DollarSign, Zap, CircleCheck, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    success: '#10b981',
    info: '#0284c7',
    warning: '#d97706',
    indigo: '#6366f1',
};

// Stat Card for the summary bar
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <Box sx={{
        flex: 1,
        minWidth: 120,
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        px: 3,
        py: 2.5,
        borderRadius: 4,
        background: bg || 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${alpha(color, 0.15)}`,
        boxShadow: `0 2px 12px ${alpha(color, 0.08)}`,
    }}>
        <Box sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(color, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
        }}>
            <Icon size={20} />
        </Box>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Typography>
        </Box>
    </Box>
);

const TestBuilder = ({ subject, onBack, onManageQuestions }) => {
    const [tests, setTests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openTestDialog, setOpenTestDialog] = useState(false);
    const [newTest, setNewTest] = useState({ name: '', price: 0, duration: 100, year: '', is_free_trial: false, free_trial_limit: 1 });
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
            getTests();
        }
    }, [subject?.id]);

    const getTests = async () => {
        if (!subject || !subject.id) return;
        try {
            const data = await fetchTests(subject.id);
            setTests(data.map(t => ({ ...t, id: t._id })));
        } catch (error) {
            console.error("Error fetching tests from MongoDB:", error);
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
                await updateTest(editingTest.id, {
                    name: newTest.name,
                    price: Number(newTest.price),
                    duration: Number(newTest.duration),
                    year: newTest.year ? Number(newTest.year) : null,
                    is_free_trial: newTest.is_free_trial,
                    free_trial_limit: Number(newTest.free_trial_limit)
                });
            } else {
                await createTest({
                    subject_id: subject.id,
                    name: newTest.name,
                    price: Number(newTest.price),
                    duration: Number(newTest.duration),
                    year: newTest.year ? Number(newTest.year) : null,
                    is_free_trial: newTest.is_free_trial,
                    free_trial_limit: Number(newTest.free_trial_limit),
                    is_published: true,
                    display_order: tests.length > 0 ? Math.max(...tests.map(t => t.display_order || 0)) + 1 : 0
                });
            }

            setNewTest({ name: '', price: 0, duration: 100, year: '', is_free_trial: false, free_trial_limit: 1 });
            setOpenTestDialog(false);
            setIsEditMode(false);
            setEditingTest(null);
            getTests();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} test in MongoDB:`, error);
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
            year: test.year || '',
            is_free_trial: test.is_free_trial || false,
            free_trial_limit: test.free_trial_limit || 1
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
                    await deleteTest(id);
                    getTests();
                } catch (error) {
                    console.error("Error deleting test in MongoDB:", error);
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

        setTests(items);

        try {
            const updates = items.map((test, index) => updateTest(test.id, { display_order: index }));
            await Promise.all(updates);
        } catch (error) {
            console.error("Error reordering tests:", error);
            getTests();
        }
    };

    const closeDialog = () => {
        setOpenTestDialog(false);
        setIsEditMode(false);
        setEditingTest(null);
        setNewTest({ name: '', price: 0, duration: 100, year: '', is_free_trial: false, free_trial_limit: 1 });
    };

    // Computed stats
    const totalQuestions = tests.reduce((acc, t) => acc + (t.total_questions || t.questions?.[0]?.count || 0), 0);
    const freeTests = tests.filter(t => t.price === 0 || t.is_free_trial).length;
    const paidTests = tests.filter(t => t.price > 0 && !t.is_free_trial).length;

    // Search filter
    const filteredTests = searchQuery.trim()
        ? tests.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : tests;
    const isSearching = searchQuery.trim().length > 0;

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
        <Box sx={{ p: { xs: 3, md: 5 }, minHeight: '100vh', background: `linear-gradient(160deg, #fdf2f8 0%, #f8fafc 100%)` }}>

            {/* ── Header ────────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    {onBack && (
                        <Tooltip title="Go Back">
                            <IconButton
                                onClick={onBack}
                                sx={{
                                    bgcolor: 'white',
                                    border: `1px solid ${COLORS.border}`,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    '&:hover': { bgcolor: COLORS.primary, color: 'white', borderColor: COLORS.primary, transform: 'translateX(-2px)' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ChevronLeft size={20} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Box>
                        {/* Breadcrumb */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Content Management
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.border }}>›</Typography>
                            <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Mock Tests
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -0.5, lineHeight: 1 }}>
                                Mock Tests
                            </Typography>
                            <Chip
                                label={`${tests.length} Tests`}
                                size="small"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    bgcolor: alpha(COLORS.accent, 0.1),
                                    color: COLORS.accent,
                                    border: `1px solid ${alpha(COLORS.accent, 0.2)}`,
                                    height: 24,
                                }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600, mt: 0.5 }}>
                            Managing tests for{' '}
                            <Chip
                                label={subject.name}
                                size="small"
                                sx={{ fontWeight: 800, bgcolor: COLORS.primary, color: 'white', height: 20, fontSize: '0.7rem', ml: 0.5 }}
                            />
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => {
                        setNewTest({ name: '', price: 0, duration: 100, year: '', is_free_trial: false, free_trial_limit: 1 });
                        setIsEditMode(false);
                        setEditingTest(null);
                        setOpenTestDialog(true);
                    }}
                    sx={{
                        bgcolor: COLORS.accent,
                        borderRadius: 3,
                        px: 3.5,
                        py: 1.5,
                        fontWeight: 900,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.35)}`,
                        '&:hover': {
                            bgcolor: COLORS.accentHover,
                            boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.45)}`,
                            transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.25s',
                    }}
                >
                    Add New Test
                </Button>
            </Box>

            {/* ── Stats Bar ─────────────────────────────────────────────── */}
            {tests.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <StatCard icon={Layers} label="Total Tests" value={tests.length} color={COLORS.accent} />
                    <StatCard icon={HelpCircle} label="Total Questions" value={totalQuestions} color={COLORS.info} />
                    <StatCard icon={Gift} label="Free Tests" value={freeTests} color={COLORS.success} />
                    <StatCard icon={DollarSign} label="Paid Tests" value={paidTests} color={COLORS.indigo} />
                </Box>
            )}

            {/* ── Search Bar ────────────────────────────────────────────── */}
            {tests.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        placeholder="Search tests by name…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} color={isSearching ? COLORS.accent : COLORS.textLight} />
                                </InputAdornment>
                            ),
                            endAdornment: isSearching && (
                                <InputAdornment position="end">
                                    <Tooltip title="Clear search">
                                        <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: COLORS.textLight, '&:hover': { color: COLORS.accent } }}>
                                            <X size={16} />
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                            sx: { fontWeight: 600, fontSize: '0.95rem', borderRadius: 3 },
                        }}
                        sx={{
                            maxWidth: 480,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s',
                                '&:hover fieldset': { borderColor: alpha(COLORS.accent, 0.4) },
                                '&.Mui-focused fieldset': {
                                    borderColor: COLORS.accent,
                                    borderWidth: 2,
                                },
                            },
                        }}
                    />
                    {isSearching && (
                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, mt: 1, display: 'block' }}>
                            {filteredTests.length === 0
                                ? 'No tests match your search'
                                : `Showing ${filteredTests.length} of ${tests.length} test${tests.length !== 1 ? 's' : ''}`}
                        </Typography>
                    )}
                </Box>
            )}

            {/* ── Test Cards Grid ────────────────────────────────────────── */}
            <DragDropContext onDragEnd={isSearching ? () => {} : handleDragEnd}>
                <StrictModeDroppable droppableId="tests-list" isDropDisabled={isSearching}>
                    {(provided) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}
                        >
                            <AnimatePresence>
                                {filteredTests.map((test, index) => {
                                    const qCount = test.total_questions || test.questions?.[0]?.count || 0;
                                    const isFree = test.price === 0 && !test.is_free_trial;
                                    const isPaid = test.price > 0 && !test.is_free_trial;
                                    const isFreeTrial = test.is_free_trial;

                                    // Pricing badge config
                                    const pricingConfig = isFreeTrial
                                        ? { label: `Free Trial · ${test.free_trial_limit || 1} attempt${test.free_trial_limit > 1 ? 's' : ''}`, color: COLORS.accent, bg: alpha(COLORS.accent, 0.08), icon: Gift }
                                        : isFree
                                        ? { label: 'FREE', color: COLORS.success, bg: alpha(COLORS.success, 0.08), icon: CircleCheck }
                                        : { label: `₹${test.price}`, color: COLORS.indigo, bg: alpha(COLORS.indigo, 0.08), icon: DollarSign };

                                    const PricingIcon = pricingConfig.icon;

                                    return (
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
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                                    >
                                                        <Paper elevation={0} sx={{
                                                            borderRadius: 5,
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                                            border: snapshot.isDragging
                                                                ? `2px solid ${COLORS.accent}`
                                                                : `1px solid ${COLORS.border}`,
                                                            bgcolor: snapshot.isDragging ? alpha(COLORS.accent, 0.02) : '#fff',
                                                            boxShadow: snapshot.isDragging
                                                                ? `0 24px 56px ${alpha(COLORS.accent, 0.22)}`
                                                                : '0 2px 8px rgba(0,0,0,0.04)',
                                                            '&:hover': {
                                                                transform: 'translateY(-5px)',
                                                                boxShadow: `0 20px 48px rgba(0,0,0,0.1)`,
                                                                borderColor: alpha(COLORS.accent, 0.4),
                                                            },
                                                        }}>
                                                            {/* Accent strip at top */}
                                                            <Box sx={{
                                                                height: 4,
                                                                background: `linear-gradient(90deg, ${COLORS.accent} 0%, #ec4899 100%)`,
                                                                opacity: snapshot.isDragging ? 1 : 0.7,
                                                                transition: 'opacity 0.3s',
                                                                '&:hover': { opacity: 1 }
                                                            }} />

                                                            <Box sx={{ p: 3.5 }}>
                                                                {/* Row 1: Drag + Icon + Title + Actions */}
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                        {/* Index number + drag handle */}
                                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                                            <Typography sx={{
                                                                                fontWeight: 900,
                                                                                fontSize: '1rem',
                                                                                color: alpha(COLORS.accent, 0.35),
                                                                                lineHeight: 1,
                                                                                userSelect: 'none',
                                                                            }}>
                                                                                #{String(index + 1).padStart(2, '0')}
                                                                            </Typography>
                                                                            <Box
                                                                                {...provided.dragHandleProps}
                                                                                sx={{
                                                                                    cursor: 'grab',
                                                                                    color: COLORS.border,
                                                                                    '&:hover': { color: COLORS.textLight },
                                                                                    transition: 'color 0.2s',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                }}
                                                                            >
                                                                                <GripVertical size={16} />
                                                                            </Box>
                                                                        </Box>

                                                                        {/* Icon bubble */}
                                                                        <Box sx={{
                                                                            p: 1.5,
                                                                            borderRadius: 3.5,
                                                                            background: `linear-gradient(135deg, ${alpha(COLORS.accent, 0.15)} 0%, ${alpha('#ec4899', 0.08)} 100%)`,
                                                                            color: COLORS.accent,
                                                                            flexShrink: 0,
                                                                        }}>
                                                                            <Target size={24} />
                                                                        </Box>

                                                                        {/* Title area */}
                                                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                                                            <Typography
                                                                                variant="h6"
                                                                                sx={{
                                                                                    fontWeight: 900,
                                                                                    color: COLORS.primary,
                                                                                    lineHeight: 1.25,
                                                                                    fontSize: '1rem',
                                                                                    display: '-webkit-box',
                                                                                    WebkitLineClamp: 2,
                                                                                    WebkitBoxOrient: 'vertical',
                                                                                    overflow: 'hidden',
                                                                                }}
                                                                            >
                                                                                {test.name}
                                                                            </Typography>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                                                                                <Calendar size={11} color={COLORS.textLight} />
                                                                                <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, fontSize: '0.7rem' }}>
                                                                                    Added {new Date(test.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                                </Typography>
                                                                                {test.year && (
                                                                                    <Chip
                                                                                        label={test.year}
                                                                                        size="small"
                                                                                        sx={{
                                                                                            height: 16,
                                                                                            fontSize: '0.65rem',
                                                                                            fontWeight: 800,
                                                                                            bgcolor: '#fffbeb',
                                                                                            color: '#92400e',
                                                                                            border: '1px solid #fde68a',
                                                                                            ml: 0.5,
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                        </Box>
                                                                    </Box>

                                                                    {/* Action buttons */}
                                                                    <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, ml: 1 }}>
                                                                        <Tooltip title="Edit Test">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleEditClick(test)}
                                                                                sx={{
                                                                                    bgcolor: alpha('#6366f1', 0.08),
                                                                                    color: '#6366f1',
                                                                                    width: 32,
                                                                                    height: 32,
                                                                                    '&:hover': { bgcolor: '#6366f1', color: '#fff', transform: 'scale(1.1)' },
                                                                                    transition: 'all 0.2s',
                                                                                }}
                                                                            >
                                                                                <Pencil size={15} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Delete Test">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleDeleteTest(test.id)}
                                                                                sx={{
                                                                                    bgcolor: alpha('#ef4444', 0.08),
                                                                                    color: '#ef4444',
                                                                                    width: 32,
                                                                                    height: 32,
                                                                                    '&:hover': { bgcolor: '#ef4444', color: '#fff', transform: 'scale(1.1)' },
                                                                                    transition: 'all 0.2s',
                                                                                }}
                                                                            >
                                                                                <Trash2 size={15} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                </Box>

                                                                {/* Row 2: Stat pills */}
                                                                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                                                                    {/* Duration */}
                                                                    <Box sx={{
                                                                        px: 2, py: 0.75,
                                                                        borderRadius: 2.5,
                                                                        bgcolor: '#f8fafc',
                                                                        border: `1px solid ${COLORS.border}`,
                                                                        display: 'flex', alignItems: 'center', gap: 1,
                                                                    }}>
                                                                        <Clock size={13} color={COLORS.textLight} />
                                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.primary, fontSize: '0.8rem' }}>
                                                                            {test.duration} mins
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Questions */}
                                                                    <Box sx={{
                                                                        px: 2, py: 0.75,
                                                                        borderRadius: 2.5,
                                                                        bgcolor: '#f0f9ff',
                                                                        border: '1px solid #bae6fd',
                                                                        display: 'flex', alignItems: 'center', gap: 1,
                                                                    }}>
                                                                        <HelpCircle size={13} color={COLORS.info} />
                                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0369a1', fontSize: '0.8rem' }}>
                                                                            {qCount} Question{qCount !== 1 ? 's' : ''}
                                                                        </Typography>
                                                                    </Box>

                                                                    {/* Pricing */}
                                                                    <Box sx={{
                                                                        px: 2, py: 0.75,
                                                                        borderRadius: 2.5,
                                                                        bgcolor: pricingConfig.bg,
                                                                        border: `1px solid ${alpha(pricingConfig.color, 0.2)}`,
                                                                        display: 'flex', alignItems: 'center', gap: 1,
                                                                    }}>
                                                                        <PricingIcon size={13} color={pricingConfig.color} />
                                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: pricingConfig.color, fontSize: '0.8rem' }}>
                                                                            {pricingConfig.label}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {/* Row 3: Question progress bar */}
                                                                {qCount > 0 && (
                                                                    <Box sx={{ mb: 3 }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                                                            <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                                                                Question Bank
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 800, fontSize: '0.7rem' }}>
                                                                                {qCount} / {Math.max(qCount, 100)}
                                                                            </Typography>
                                                                        </Box>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={Math.min((qCount / Math.max(qCount, 100)) * 100, 100)}
                                                                            sx={{
                                                                                height: 6,
                                                                                borderRadius: 3,
                                                                                bgcolor: alpha(COLORS.accent, 0.1),
                                                                                '& .MuiLinearProgress-bar': {
                                                                                    borderRadius: 3,
                                                                                    background: `linear-gradient(90deg, ${COLORS.accent} 0%, #ec4899 100%)`,
                                                                                }
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                )}

                                                                {/* Row 4: CTA Button */}
                                                                <Button
                                                                    fullWidth
                                                                    variant="contained"
                                                                    startIcon={<BookOpen size={16} />}
                                                                    onClick={() => onManageQuestions(test)}
                                                                    sx={{
                                                                        borderRadius: 3,
                                                                        py: 1.5,
                                                                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, #334155 100%)`,
                                                                        color: '#fff',
                                                                        fontWeight: 800,
                                                                        textTransform: 'none',
                                                                        fontSize: '0.9rem',
                                                                        letterSpacing: 0.2,
                                                                        boxShadow: `0 6px 18px ${alpha(COLORS.primary, 0.25)}`,
                                                                        '&:hover': {
                                                                            background: `linear-gradient(135deg, #0f172a 0%, ${COLORS.primary} 100%)`,
                                                                            transform: 'translateY(-2px)',
                                                                            boxShadow: `0 10px 28px ${alpha(COLORS.primary, 0.35)}`,
                                                                        },
                                                                        transition: 'all 0.25s',
                                                                    }}
                                                                >
                                                                    Manage Question Bank
                                                                </Button>
                                                            </Box>
                                                        </Paper>
                                                    </motion.div>
                                                </Box>
                                            )}
                                        </Draggable>
                                    );
                                })}
                            </AnimatePresence>
                            {provided.placeholder}
                        </Box>
                    )}
                </StrictModeDroppable>
            </DragDropContext>

            {/* ── Search No-Results State ───────────────────────────────── */}
            {isSearching && filteredTests.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Box sx={{
                        py: 10,
                        textAlign: 'center',
                        border: `1.5px dashed ${alpha(COLORS.textLight, 0.2)}`,
                        borderRadius: 5,
                        bgcolor: alpha(COLORS.textLight, 0.02),
                    }}>
                        <Box sx={{
                            mb: 2.5,
                            display: 'inline-flex',
                            p: 2.5,
                            borderRadius: '50%',
                            bgcolor: alpha(COLORS.textLight, 0.08),
                        }}>
                            <Search size={40} color={COLORS.textLight} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                            No tests found
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 500, mb: 3 }}>
                            No results for <strong>"{searchQuery}"</strong>. Try a different keyword.
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<X size={15} />}
                            onClick={() => setSearchQuery('')}
                            sx={{
                                borderRadius: 3,
                                fontWeight: 800,
                                textTransform: 'none',
                                borderColor: alpha(COLORS.textLight, 0.3),
                                color: COLORS.textLight,
                                '&:hover': { borderColor: COLORS.accent, color: COLORS.accent, bgcolor: alpha(COLORS.accent, 0.04) },
                            }}
                        >
                            Clear Search
                        </Button>
                    </Box>
                </motion.div>
            )}

            {/* ── Empty State ────────────────────────────────────────────── */}
            {tests.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Box
                        sx={{
                            py: 12,
                            textAlign: 'center',
                            border: `2px dashed ${alpha(COLORS.accent, 0.25)}`,
                            borderRadius: 6,
                            bgcolor: alpha(COLORS.accent, 0.02),
                            cursor: 'pointer',
                            transition: 'all 0.25s',
                            '&:hover': {
                                bgcolor: alpha(COLORS.accent, 0.04),
                                borderColor: alpha(COLORS.accent, 0.45),
                            },
                        }}
                        onClick={() => {
                            setNewTest({ name: '', price: 0, duration: 100, year: '', is_free_trial: false, free_trial_limit: 1 });
                            setOpenTestDialog(true);
                        }}
                    >
                        <Box sx={{
                            mb: 3,
                            display: 'inline-flex',
                            p: 3,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${alpha(COLORS.accent, 0.12)} 0%, ${alpha('#ec4899', 0.06)} 100%)`,
                        }}>
                            <Zap size={52} color={COLORS.accent} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1.5 }}>
                            No Tests Yet
                        </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textLight, maxWidth: 380, mx: 'auto', mb: 4, fontWeight: 500 }}>
                            You haven't created any mock tests yet. Click here or use the button above to get started.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            sx={{
                                bgcolor: COLORS.accent,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 900,
                                textTransform: 'none',
                                boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.3)}`,
                                '&:hover': { bgcolor: COLORS.accentHover },
                            }}
                        >
                            Create Your First Test
                        </Button>
                    </Box>
                </motion.div>
            )}

            {/* ── Add / Edit Dialog ─────────────────────────────────────── */}
            <Dialog
                open={openTestDialog}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 5,
                        overflow: 'hidden',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.18)',
                    }
                }}
            >
                {/* Dialog header bar */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 4,
                    pt: 4,
                    pb: 3,
                    borderBottom: `1px solid ${COLORS.border}`,
                }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ec4899 100%)`,
                        color: '#fff',
                        display: 'flex',
                    }}>
                        {isEditMode ? <Pencil size={20} /> : <Plus size={20} />}
                    </Box>
                    <Box>
                        <DialogTitle sx={{ p: 0, fontWeight: 900, fontSize: '1.4rem', color: COLORS.primary, lineHeight: 1.2 }}>
                            {isEditMode ? 'Edit Mock Test' : 'Create Mock Test'}
                        </DialogTitle>
                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700 }}>
                            {isEditMode ? 'Update the test details below' : 'Fill in the details to create a new test'}
                        </Typography>
                    </Box>
                </Box>

                <DialogContent sx={{ px: 4, py: 3.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Test Name */}
                        <TextField
                            fullWidth
                            label="Test Name"
                            placeholder="e.g. Introduction to Psychology – Paper 1"
                            value={newTest.name}
                            onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            InputProps={{ sx: { fontWeight: 700, fontSize: '1rem' } }}
                            required
                        />

                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Year"
                                    type="number"
                                    placeholder="e.g. 2025"
                                    value={newTest.year}
                                    onChange={(e) => setNewTest({ ...newTest, year: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Duration (mins)"
                                    type="number"
                                    value={newTest.duration}
                                    onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Price (₹)"
                                    type="number"
                                    value={newTest.price}
                                    onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                    helperText={newTest.price == 0 ? 'Free access' : 'Paid test'}
                                />
                            </Grid>
                        </Grid>

                        {/* Free Trial toggle */}
                        <Box sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            border: `1px solid ${newTest.is_free_trial ? alpha(COLORS.accent, 0.3) : COLORS.border}`,
                            bgcolor: newTest.is_free_trial ? alpha(COLORS.accent, 0.04) : '#fafafa',
                            transition: 'all 0.25s',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Gift size={20} color={newTest.is_free_trial ? COLORS.accent : COLORS.textLight} />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary }}>
                                            Free Trial
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                            Let guests attempt this test without logging in
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch
                                    checked={newTest.is_free_trial}
                                    onChange={(e) => setNewTest({ ...newTest, is_free_trial: e.target.checked })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.accent },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.accent },
                                    }}
                                />
                            </Box>

                            <AnimatePresence>
                                {newTest.is_free_trial && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(COLORS.accent, 0.15)}` }}>
                                            <TextField
                                                fullWidth
                                                label="Attempt Limit per Browser"
                                                type="number"
                                                value={newTest.free_trial_limit}
                                                onChange={(e) => setNewTest({ ...newTest, free_trial_limit: e.target.value })}
                                                size="small"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, maxWidth: 260 }}
                                                helperText="How many times a guest can attempt this test"
                                            />
                                        </Box>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 4, pb: 4, pt: 1, gap: 1.5 }}>
                    <Button
                        onClick={closeDialog}
                        sx={{
                            fontWeight: 800,
                            color: COLORS.textLight,
                            borderRadius: 3,
                            px: 3,
                            '&:hover': { bgcolor: alpha(COLORS.textLight, 0.08) },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveTest}
                        disabled={!newTest.name}
                        startIcon={isEditMode ? <CircleCheck size={18} /> : <Plus size={18} />}
                        sx={{
                            bgcolor: COLORS.accent,
                            borderRadius: 3,
                            fontWeight: 900,
                            px: 4,
                            py: 1.25,
                            textTransform: 'none',
                            boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.35)}`,
                            '&:hover': {
                                bgcolor: COLORS.accentHover,
                                boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.5)}`,
                            },
                            '&.Mui-disabled': { bgcolor: alpha(COLORS.accent, 0.3) },
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

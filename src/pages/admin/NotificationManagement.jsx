import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, Paper, IconButton, Chip, Dialog, DialogTitle,
    DialogContent, DialogActions, Tooltip, Switch, InputAdornment, Avatar, alpha, Skeleton
} from '@mui/material';
import { Edit, Trash2, Plus, GripVertical, Image as ImageIcon, Search, X, Bell, Layout, Eye, EyeOff } from 'lucide-react';
import { COLORS } from '../../theme/adminTheme';
import { DragDropContext, Draggable } from '@hello-pangea/dnd';
import { StrictModeDroppable } from '../../components/StrictModeDroppable';
import {
    fetchAllNotifications, createNotification, updateNotification,
    deleteNotification, reorderNotifications, toggleNotificationStatus
} from '../../api/notificationsApi';
import ModernDialog from '../../components/ModernDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeaderSkeleton } from '../../components/AdminSkeleton';

const NotificationManagement = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDialog, setEditDialog] = useState({ open: false, notification: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', type: 'info' });

    const [formData, setFormData] = useState({ image_url: '', header: '', description: '', is_active: true });

    useEffect(() => { loadNotifications(); }, []);

    const loadNotifications = async () => {
        setLoading(true);
        const { data, error } = await fetchAllNotifications();
        if (data && !error) setNotifications(data.map(n => ({ ...n, id: n._id || n.id })));
        setLoading(false);
    };

    const handleCreate = () => {
        setFormData({ image_url: '', header: '', description: '', is_active: true });
        setEditDialog({ open: true, notification: null });
    };

    const handleEdit = (notification) => {
        setFormData({
            image_url: notification.image_url,
            header: notification.header,
            description: notification.description,
            is_active: notification.is_active
        });
        setEditDialog({ open: true, notification });
    };

    const handleSave = async () => {
        if (!formData.header || !formData.description || !formData.image_url) {
            setDialog({ open: true, title: 'Missing Fields', message: 'Please fill in header, description, and image URL.', type: 'error' });
            return;
        }
        try {
            if (editDialog.notification) {
                const { data, error } = await updateNotification(editDialog.notification.id, formData);
                if (error) throw error;
                if (data) {
                    setNotifications(prev => prev.map(n => n.id === editDialog.notification.id ? { ...data, id: data._id || data.id } : n));
                }
            } else {
                const { data, error } = await createNotification({ ...formData, display_order: notifications.length });
                if (error) throw error;
                if (data) setNotifications(prev => [...prev, { ...data, id: data._id || data.id }]);
            }
            setEditDialog({ open: false, notification: null });
        } catch (err) {
            setDialog({ open: true, title: 'Save Failed', message: err.message, type: 'error' });
        }
    };

    const handleDelete = async () => {
        const { success, error } = await deleteNotification(deleteDialog.id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== deleteDialog.id));
            setDeleteDialog({ open: false, id: null });
        } else {
            setDialog({ open: true, title: 'Delete Failed', message: error?.message || 'Unknown error', type: 'error' });
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        const { data, error } = await toggleNotificationStatus(id, !currentStatus);
        if (!error && data) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_active: !currentStatus } : n));
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;
        const items = Array.from(notifications);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setNotifications(items);
        await reorderNotifications(items.map((item, index) => ({ id: item.id, display_order: index })));
    };

    const isSearching = searchQuery.trim().length > 0;
    const filteredNotifications = isSearching
        ? notifications.filter(n => n.header.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : notifications;

    const activeCount = notifications.filter(n => n.is_active).length;
    const inactiveCount = notifications.length - activeCount;

    if (loading) {
        return (
            <Box sx={{ p: { xs: 3, md: 5 }, minHeight: '100vh', background: 'linear-gradient(160deg, #fdf2f8 0%, #f8fafc 100%)' }}>
                <PageHeaderSkeleton />
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" width={180} height={90} sx={{ borderRadius: 4 }} />)}
                </Box>
                {Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ p: 3, mb: 2, borderRadius: 4, border: '1px solid', borderColor: COLORS.border, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Skeleton variant="rounded" width={160} height={100} sx={{ borderRadius: 3 }} />
                        <Box sx={{ flex: 1 }}><Skeleton variant="text" width="60%" height={24} /><Skeleton variant="text" width="85%" height={16} /></Box>
                        <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 2 }} />
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 3, md: 5 }, minHeight: '100vh', background: 'linear-gradient(160deg, #fdf2f8 0%, #f8fafc 100%)' }}>

            {/* ── Header ────────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Content Management
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.border }}>›</Typography>
                        <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Notifications
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -0.5, lineHeight: 1 }}>
                            Notification Slides
                        </Typography>
                        <Chip
                            label={`${notifications.length} Slides`}
                            size="small"
                            sx={{
                                fontWeight: 800, fontSize: '0.75rem',
                                bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent,
                                border: `1px solid ${alpha(COLORS.accent, 0.2)}`, height: 24,
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600, mt: 0.5 }}>
                        Manage carousel slides and alerts for the mock test dashboard
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleCreate}
                    sx={{
                        bgcolor: COLORS.accent, borderRadius: 3, px: 3.5, py: 1.5,
                        fontWeight: 900, textTransform: 'none', fontSize: '0.95rem',
                        boxShadow: `0 8px 24px ${alpha(COLORS.accent, 0.35)}`,
                        '&:hover': { bgcolor: COLORS.accentHover, boxShadow: `0 12px 32px ${alpha(COLORS.accent, 0.45)}`, transform: 'translateY(-2px)' },
                        transition: 'all 0.25s',
                    }}
                >
                    Add New Slide
                </Button>
            </Box>

            {/* ── Stats Bar ─────────────────────────────────────────────── */}
            {notifications.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {[
                        { icon: Layout, label: 'Total Slides', value: notifications.length, color: COLORS.accent },
                        { icon: Bell, label: 'Active', value: activeCount, color: COLORS.success },
                        { icon: EyeOff, label: 'Inactive', value: inactiveCount, color: COLORS.textLight },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <Box key={label} sx={{
                            flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: 2.5,
                            px: 3, py: 2.5, borderRadius: 4, background: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(12px)', border: `1px solid ${alpha(color, 0.15)}`,
                            boxShadow: `0 2px 12px ${alpha(color, 0.08)}`,
                        }}>
                            <Box sx={{
                                p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.12),
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                            }}>
                                <Icon size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, lineHeight: 1 }}>{value}</Typography>
                                <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* ── Search Bar ────────────────────────────────────────────── */}
            {notifications.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        placeholder="Search slides by header or description…"
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
                                borderRadius: 3, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s',
                                '&:hover fieldset': { borderColor: alpha(COLORS.accent, 0.4) },
                                '&.Mui-focused fieldset': { borderColor: COLORS.accent, borderWidth: 2 },
                            },
                        }}
                    />
                    {isSearching && (
                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, mt: 1, display: 'block' }}>
                            {filteredNotifications.length === 0 ? 'No slides match your search' : `Showing ${filteredNotifications.length} of ${notifications.length} slide${notifications.length !== 1 ? 's' : ''}`}
                        </Typography>
                    )}
                </Box>
            )}

            {/* ── Slide Cards Grid ────────────────────────────────────────── */}
            {filteredNotifications.length === 0 ? (
                <Paper sx={{
                    textAlign: 'center', py: 10, borderRadius: 5,
                    border: `2px dashed ${COLORS.border}`, bgcolor: 'rgba(255,255,255,0.6)',
                }}>
                    <Bell size={56} color={COLORS.border} style={{ marginBottom: 16 }} />
                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                        {isSearching ? 'No slides match your search' : 'No slides yet'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.textLight, mb: 3, maxWidth: 360, mx: 'auto' }}>
                        {isSearching ? 'Try a different search term.' : 'Create your first notification slide to display on the dashboard carousel.'}
                    </Typography>
                    {!isSearching && (
                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            onClick={handleCreate}
                            sx={{ bgcolor: COLORS.accent, borderRadius: 3, px: 4, py: 1.5, fontWeight: 800, textTransform: 'none' }}
                        >
                            Create First Slide
                        </Button>
                    )}
                </Paper>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <StrictModeDroppable droppableId="notifications">
                        {(provided) => (
                            <Box
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}
                            >
                                <AnimatePresence>
                                    {filteredNotifications.map((notification, index) => (
                                        <Draggable key={notification.id} draggableId={notification.id.toString()} index={index}>
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
                                                            borderRadius: 5, position: 'relative', overflow: 'hidden',
                                                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                                            border: snapshot.isDragging ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                                                            bgcolor: snapshot.isDragging ? alpha(COLORS.accent, 0.02) : '#fff',
                                                            boxShadow: snapshot.isDragging
                                                                ? `0 24px 56px ${alpha(COLORS.accent, 0.22)}`
                                                                : '0 2px 8px rgba(0,0,0,0.04)',
                                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(0,0,0,0.1)', borderColor: alpha(COLORS.accent, 0.4) },
                                                        }}>
                                                            {/* Accent strip */}
                                                            <Box sx={{
                                                                height: 4,
                                                                background: notification.is_active
                                                                    ? `linear-gradient(90deg, ${COLORS.accent} 0%, #ec4899 100%)`
                                                                    : `linear-gradient(90deg, ${COLORS.border} 0%, #cbd5e1 100%)`,
                                                                opacity: snapshot.isDragging ? 1 : 0.7,
                                                            }} />

                                                            {/* Image */}
                                                            <Box sx={{ position: 'relative' }}>
                                                                {notification.image_url ? (
                                                                    <Box
                                                                        component="img"
                                                                        src={notification.image_url}
                                                                        alt={notification.header}
                                                                        sx={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                                                                        onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                                                                    />
                                                                ) : (
                                                                    <Box sx={{
                                                                        width: '100%', height: 180,
                                                                        bgcolor: alpha(COLORS.accent, 0.04),
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    }}>
                                                                        <ImageIcon size={40} color={COLORS.border} />
                                                                    </Box>
                                                                )}
                                                                {/* Index badge */}
                                                                <Box sx={{
                                                                    position: 'absolute', top: 12, left: 12,
                                                                    bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                                                    borderRadius: 2, px: 1.2, py: 0.4,
                                                                    display: 'flex', alignItems: 'center', gap: 0.5,
                                                                }}>
                                                                    <Typography sx={{ fontWeight: 900, fontSize: '0.7rem', color: '#fff' }}>
                                                                        #{String(index + 1).padStart(2, '0')}
                                                                    </Typography>
                                                                </Box>
                                                                {/* Status badge */}
                                                                <Box sx={{
                                                                    position: 'absolute', top: 12, right: 12,
                                                                    bgcolor: notification.is_active ? alpha('#10b981', 0.9) : alpha('#64748b', 0.9),
                                                                    borderRadius: 2, px: 1.2, py: 0.4,
                                                                    display: 'flex', alignItems: 'center', gap: 0.5,
                                                                }}>
                                                                    {notification.is_active ? <Eye size={11} color="#fff" /> : <EyeOff size={11} color="#fff" />}
                                                                    <Typography sx={{ fontWeight: 800, fontSize: '0.65rem', color: '#fff' }}>
                                                                        {notification.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Box sx={{ p: 3 }}>
                                                                {/* Title + drag handle */}
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                                    <Box
                                                                        {...provided.dragHandleProps}
                                                                        sx={{ cursor: 'grab', color: COLORS.border, '&:hover': { color: COLORS.textLight }, transition: 'color 0.2s', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                                                    >
                                                                        <GripVertical size={16} />
                                                                    </Box>
                                                                    <Typography sx={{
                                                                        fontWeight: 900, fontSize: '1rem', color: COLORS.primary, lineHeight: 1.3,
                                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                                    }}>
                                                                        {notification.header}
                                                                    </Typography>
                                                                </Box>

                                                                {/* Description */}
                                                                <Typography variant="body2" sx={{
                                                                    color: COLORS.textLight, fontWeight: 500, lineHeight: 1.5,
                                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                                    mb: 2.5,
                                                                }}>
                                                                    {notification.description}
                                                                </Typography>

                                                                {/* Actions */}
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Tooltip title={notification.is_active ? 'Deactivate' : 'Activate'}>
                                                                        <Switch
                                                                            size="small"
                                                                            checked={notification.is_active}
                                                                            onChange={() => handleToggleActive(notification.id, notification.is_active)}
                                                                            sx={{
                                                                                '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.success },
                                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.success },
                                                                            }}
                                                                        />
                                                                    </Tooltip>
                                                                    <Box sx={{ flex: 1 }} />
                                                                    <Tooltip title="Edit Slide">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleEdit(notification)}
                                                                            sx={{
                                                                                bgcolor: alpha('#6366f1', 0.08), color: '#6366f1', width: 32, height: 32,
                                                                                '&:hover': { bgcolor: '#6366f1', color: '#fff', transform: 'scale(1.1)' },
                                                                                transition: 'all 0.2s',
                                                                            }}
                                                                        >
                                                                            <Edit size={15} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete Slide">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => setDeleteDialog({ open: true, id: notification.id })}
                                                                            sx={{
                                                                                bgcolor: alpha('#ef4444', 0.08), color: '#ef4444', width: 32, height: 32,
                                                                                '&:hover': { bgcolor: '#ef4444', color: '#fff', transform: 'scale(1.1)' },
                                                                                transition: 'all 0.2s',
                                                                            }}
                                                                        >
                                                                            <Trash2 size={15} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Box>
                                                        </Paper>
                                                    </motion.div>
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                </AnimatePresence>
                                {provided.placeholder}
                            </Box>
                        )}
                    </StrictModeDroppable>
                </DragDropContext>
            )}

            {/* ── Edit Dialog ───────────────────────────────────────────── */}
            <Dialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, notification: null })}
                maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.15rem' }}>
                    {editDialog.notification ? 'Edit Slide' : 'Create New Slide'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            fullWidth label="Header Title" value={formData.header}
                            onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                            placeholder="e.g. New Features Released"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth label="Image URL" value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        {formData.image_url && (
                            <Box sx={{ p: 1, border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                <Box
                                    component="img" src={formData.image_url} alt="Preview"
                                    sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2 }}
                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                />
                            </Box>
                        )}
                        <TextField
                            fullWidth label="Description" multiline rows={4} value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description for the carousel slide"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Active</Typography>
                            <Switch
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.success },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.success },
                                }}
                            />
                            <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                {formData.is_active ? 'Visible on dashboard' : 'Hidden from dashboard'}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditDialog({ open: false, notification: null })} sx={{ fontWeight: 700, textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained" onClick={handleSave}
                        sx={{
                            bgcolor: COLORS.accent, borderRadius: 3, px: 4, fontWeight: 800, textTransform: 'none',
                            '&:hover': { bgcolor: COLORS.accentHover },
                        }}
                    >
                        {editDialog.notification ? 'Update Slide' : 'Create Slide'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Confirmation ──────────────────────────────────── */}
            <ModernDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Slide?"
                message="Are you sure you want to delete this slide? It will be removed from all carousels."
                type="confirm"
            />

            {/* ── Generic Dialog ────────────────────────────────────────── */}
            <ModernDialog
                open={dialog.open}
                onClose={() => setDialog({ ...dialog, open: false })}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
            />
        </Box>
    );
};

export default NotificationManagement;

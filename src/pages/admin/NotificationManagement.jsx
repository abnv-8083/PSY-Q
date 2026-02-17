import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Switch,
    Button,
    TextField,
    CircularProgress,
    Avatar,
    Tooltip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Edit, Trash2, Plus, GripVertical, Image as ImageIcon, Search, AlertCircle } from 'lucide-react';
import { DragDropContext, Draggable } from '@hello-pangea/dnd';
import { StrictModeDroppable } from '../../components/StrictModeDroppable';
import {
    fetchAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    reorderNotifications,
    toggleNotificationStatus
} from '../../api/notificationsApi';
import ModernDialog from '../../components/ModernDialog';
import { motion } from 'framer-motion';

const COLORS = {
    primary: '#0f172a',
    accent: '#ca0056',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    textLight: '#64748b'
};

const NotificationManagement = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDialog, setEditDialog] = useState({ open: false, notification: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        image_url: '',
        header: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        const { data, error } = await fetchAllNotifications();
        if (data && !error) {
            setNotifications(data);
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setFormData({
            image_url: '',
            header: '',
            description: '',
            is_active: true
        });
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
            alert('Please fill in all fields');
            return;
        }

        try {
            if (editDialog.notification) {
                const { data, error } = await updateNotification(editDialog.notification.id, formData);
                if (error) throw error;
                if (data) {
                    setNotifications(prev => prev.map(n => n.id === data.id ? data : n));
                }
            } else {
                const newNotification = {
                    ...formData,
                    display_order: notifications.length
                };
                const { data, error } = await createNotification(newNotification);
                if (error) throw error;
                if (data) {
                    setNotifications(prev => [...prev, data]);
                }
            }
            setEditDialog({ open: false, notification: null });
        } catch (err) {
            console.error('Error saving notification:', err);
            alert(`Failed to save notification: ${err.message}`);
        }
    };

    const handleDelete = async () => {
        const { success, error } = await deleteNotification(deleteDialog.id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== deleteDialog.id));
            setDeleteDialog({ open: false, id: null });
        } else {
            alert(`Failed to delete: ${error?.message || 'Unknown error'}`);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        const { data, error } = await toggleNotificationStatus(id, !currentStatus);
        if (!error && data) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_active: !currentStatus } : n)
            );
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(notifications);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setNotifications(items);

        const updates = items.map((item, index) => ({
            id: item.id,
            display_order: index
        }));
        await reorderNotifications(updates);
    };

    const filteredNotifications = notifications.filter(n =>
        n.header.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ p: { xs: 3, md: 6 } }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1, mb: 1 }}>
                        Notification Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textLight }}>
                        Manage carousel slides and alerts for the mock test dashboard
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleCreate}
                    sx={{
                        bgcolor: COLORS.accent,
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: `0 8px 20px rgba(202, 0, 86, 0.3)`,
                        '&:hover': {
                            bgcolor: '#b8003f',
                            boxShadow: `0 10px 25px rgba(202, 0, 86, 0.4)`
                        }
                    }}
                >
                    Add Slide
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4, border: '1px solid #e2e8f0' }}>
                <TextField
                    fullWidth
                    placeholder="Search slides by header or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    InputProps={{
                        startAdornment: <Search size={18} style={{ marginRight: 8, color: COLORS.textLight }} />
                    }}
                />
            </Paper>

            {/* List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: COLORS.accent }} />
                </Box>
            ) : filteredNotifications.length === 0 ? (
                <Paper sx={{ textAlign: 'center', py: 8, borderRadius: 5, border: `2px dashed ${COLORS.border}` }}>
                    <AlertCircle size={48} color={COLORS.textLight} style={{ marginBottom: 16 }} />
                    <Typography variant="h6" sx={{ color: COLORS.textLight, mb: 1 }}>
                        No slides found
                    </Typography>
                    <Button onClick={handleCreate} sx={{ color: COLORS.accent, fontWeight: 700 }}>
                        Create your first slide
                    </Button>
                </Paper>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <StrictModeDroppable droppableId="notifications">
                        {(provided) => (
                            <TableContainer
                                component={Paper}
                                sx={{ borderRadius: 5, overflow: 'hidden', border: '1px solid #e2e8f0' }}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                <Table>
                                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                        <TableRow>
                                            <TableCell sx={{ width: 50 }}></TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>PREVIEW</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>HEADER</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>DESCRIPTION</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>STATUS</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }} align="right">ACTIONS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredNotifications.map((notification, index) => (
                                            <Draggable
                                                key={notification.id}
                                                draggableId={notification.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <TableRow
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        sx={{
                                                            bgcolor: snapshot.isDragging ? 'rgba(233, 30, 99, 0.05)' : 'transparent',
                                                            '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.02)' }
                                                        }}
                                                    >
                                                        <TableCell {...provided.dragHandleProps}>
                                                            <GripVertical size={18} color="#94a3b8" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Avatar
                                                                variant="rounded"
                                                                src={notification.image_url}
                                                                sx={{ width: 80, height: 50, borderRadius: 2, bgcolor: '#f1f5f9' }}
                                                            >
                                                                <ImageIcon size={20} color="#94a3b8" />
                                                            </Avatar>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                                                {notification.header}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ maxWidth: 300 }}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: COLORS.textLight,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}
                                                            >
                                                                {notification.description}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Switch
                                                                checked={notification.is_active}
                                                                onChange={() => handleToggleActive(notification.id, notification.is_active)}
                                                                sx={{
                                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.accent },
                                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.accent }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                                <Tooltip title="Edit">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleEdit(notification)}
                                                                        sx={{ color: '#6366f1' }}
                                                                    >
                                                                        <Edit size={18} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => setDeleteDialog({ open: true, id: notification.id })}
                                                                        sx={{ color: COLORS.error }}
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </StrictModeDroppable>
                </DragDropContext>
            )}

            {/* Edit Dialog */}
            <Dialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, notification: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>
                    {editDialog.notification ? 'Edit Slide' : 'Create New Slide'}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Header Title"
                            value={formData.header}
                            onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                            placeholder="e.g. New Features Released"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth
                            label="Image URL"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        {formData.image_url && (
                            <Box sx={{ p: 1, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8 }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ fontWeight: 600 }}>Active Status</Typography>
                            <Switch
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.accent },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: COLORS.accent }
                                }}
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setEditDialog({ open: false, notification: null })} sx={{ fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            bgcolor: COLORS.accent,
                            borderRadius: 3,
                            px: 4,
                            fontWeight: 800,
                            '&:hover': { bgcolor: '#b8003f' }
                        }}
                    >
                        {editDialog.notification ? 'Update Slide' : 'Create Slide'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <ModernDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Slide?"
                message="Are you sure you want to delete this slide? It will be removed from all carousels."
                type="confirm"
            />
        </Box>
    );
};

export default NotificationManagement;

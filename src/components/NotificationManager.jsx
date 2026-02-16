import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Switch,
    Paper,
    CircularProgress,
    Avatar
} from '@mui/material';
import { Edit, Trash2, Plus, GripVertical, Image as ImageIcon } from 'lucide-react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';
import {
    fetchAllNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    reorderNotifications,
    toggleNotificationStatus
} from '../api/notificationsApi';
import ModernDialog from './ModernDialog';

const NotificationManager = ({ open, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editDialog, setEditDialog] = useState({ open: false, notification: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

    // Form state
    const [formData, setFormData] = useState({
        image_url: '',
        header: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        if (open) {
            loadNotifications();
        }
    }, [open]);

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
        console.log('handleSave called with formData:', formData);

        if (!formData.header || !formData.description || !formData.image_url) {
            alert('Please fill in all fields');
            return;
        }

        try {
            if (editDialog.notification) {
                // Update existing
                console.log('Updating notification:', editDialog.notification.id);
                const { data, error } = await updateNotification(editDialog.notification.id, formData);

                if (error) {
                    console.error('Error updating notification:', error);
                    alert(`Failed to update notification: ${error.message || JSON.stringify(error)}`);
                    return;
                }

                if (data) {
                    console.log('Notification updated successfully:', data);
                    setNotifications(prev =>
                        prev.map(n => n.id === data.id ? data : n)
                    );
                }
            } else {
                // Create new
                const newNotification = {
                    ...formData,
                    display_order: notifications.length
                };
                console.log('Creating new notification:', newNotification);

                const { data, error } = await createNotification(newNotification);

                if (error) {
                    console.error('Error creating notification:', error);
                    alert(`Failed to create notification: ${error.message || JSON.stringify(error)}`);
                    return;
                }

                if (data) {
                    console.log('Notification created successfully:', data);
                    setNotifications(prev => [...prev, data]);
                } else {
                    console.warn('No data returned from createNotification');
                    alert('Notification may not have been created. Check console for details.');
                }
            }

            setEditDialog({ open: false, notification: null });
        } catch (err) {
            console.error('Unexpected error in handleSave:', err);
            alert(`An unexpected error occurred: ${err.message}`);
        }
    };

    const handleDelete = async () => {
        const { success } = await deleteNotification(deleteDialog.id);
        if (success) {
            setNotifications(prev => prev.filter(n => n.id !== deleteDialog.id));
        }
        setDeleteDialog({ open: false, id: null });
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

        // Update local state immediately
        setNotifications(items);

        // Update in database
        const updates = items.map((item, index) => ({
            id: item.id,
            display_order: index
        }));
        await reorderNotifications(updates);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 5, maxHeight: '90vh' } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                                Manage Notifications
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Create and manage carousel slides for the admin dashboard
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={18} />}
                            onClick={handleCreate}
                            sx={{
                                bgcolor: '#E91E63',
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                fontWeight: 800,
                                textTransform: 'none',
                                boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                                '&:hover': {
                                    bgcolor: '#D81B60',
                                    boxShadow: '0 10px 25px rgba(233, 30, 99, 0.4)'
                                }
                            }}
                        >
                            Add Notification
                        </Button>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#E91E63' }} />
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 8,
                            bgcolor: 'rgba(0,0,0,0.02)',
                            borderRadius: 4
                        }}>
                            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                                No notifications yet
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                Click "Add Notification" to create your first carousel slide
                            </Typography>
                        </Box>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <StrictModeDroppable droppableId="notifications">
                                {(provided) => (
                                    <TableContainer
                                        component={Paper}
                                        sx={{ borderRadius: 4, overflow: 'hidden' }}
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        <Table>
                                            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b', width: 50 }}></TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b', width: 100 }}>IMAGE</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>HEADER</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>DESCRIPTION</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b', width: 100 }}>STATUS</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b', width: 150 }} align="right">ACTIONS</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {notifications.map((notification, index) => (
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
                                                                        sx={{ width: 60, height: 40, bgcolor: '#f1f5f9' }}
                                                                    >
                                                                        <ImageIcon size={20} color="#94a3b8" />
                                                                    </Avatar>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                                                        {notification.header}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography
                                                                        sx={{
                                                                            color: '#64748b',
                                                                            fontSize: '0.875rem',
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
                                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                                color: '#E91E63'
                                                                            },
                                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                                bgcolor: '#E91E63'
                                                                            }
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleEdit(notification)}
                                                                            sx={{ color: '#6366f1' }}
                                                                        >
                                                                            <Edit size={18} />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => setDeleteDialog({ open: true, id: notification.id })}
                                                                            sx={{ color: '#ef4444' }}
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </IconButton>
                                                                    </Box>
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
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={onClose}
                        sx={{ fontWeight: 700, borderRadius: 3, px: 3 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit/Create Dialog */}
            <Dialog
                open={editDialog.open}
                onClose={() => setEditDialog({ open: false, notification: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>
                    {editDialog.notification ? 'Edit Notification' : 'Create Notification'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        fullWidth
                        label="Image URL"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        margin="normal"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    {formData.image_url && (
                        <Box sx={{ mt: 2, mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                                Image Preview:
                            </Typography>
                            <Box
                                component="img"
                                src={formData.image_url}
                                alt="Preview"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                                sx={{
                                    width: '100%',
                                    height: 150,
                                    objectFit: 'cover',
                                    borderRadius: 3,
                                    border: '1px solid rgba(0,0,0,0.1)'
                                }}
                            />
                        </Box>
                    )}
                    <TextField
                        fullWidth
                        label="Header"
                        value={formData.header}
                        onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                        placeholder="Enter a compelling header"
                        margin="normal"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter a detailed description"
                        margin="normal"
                        multiline
                        rows={3}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Active Status:
                        </Typography>
                        <Switch
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#E91E63'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    bgcolor: '#E91E63'
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setEditDialog({ open: false, notification: null })}
                        sx={{ fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            bgcolor: '#E91E63',
                            borderRadius: 3,
                            fontWeight: 800,
                            px: 4,
                            '&:hover': { bgcolor: '#D81B60' }
                        }}
                    >
                        {editDialog.notification ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <ModernDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Notification?"
                message="Are you sure you want to delete this notification? This action cannot be undone."
                type="confirm"
            />
        </>
    );
};

export default NotificationManager;

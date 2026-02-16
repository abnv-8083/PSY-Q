import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, TextField, MenuItem, Stack, Avatar, Tooltip, Link
} from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { Eye, Trash2, Download, ExternalLink, Filter, Search, X, Image as ImageIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = {
    primary: '#0f172a',
    accent: '#E91E63',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    textLight: '#64748b'
};

const ContactSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubmissions(data || []);
        } catch (error) {
            console.error('Error fetching contact submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSubmission = (submission) => {
        setSelectedSubmission(submission);
        setOpenViewDialog(true);
    };

    const handleDeleteSubmission = async (id) => {
        if (!confirm('Are you sure you want to delete this submission?')) return;

        try {
            const { error } = await supabase
                .from('contact_submissions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSubmissions(prev => prev.filter(s => s.id !== id));
            alert('Submission deleted successfully');
        } catch (error) {
            console.error('Error deleting submission:', error);
            alert('Failed to delete submission');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'bug': return { bg: '#fee2e2', color: '#ef4444' };
            case 'feedback': return { bg: '#dbeafe', color: '#3b82f6' };
            case 'general': return { bg: '#f3e8ff', color: '#a855f7' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'bug': return 'Bug Report';
            case 'feedback': return 'Feedback';
            case 'general': return 'General Inquiry';
            default: return type;
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        const matchesType = filterType === 'all' || submission.contact_type === filterType;
        const matchesSearch =
            submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <Box sx={{ p: { xs: 3, md: 6 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1, mb: 1 }}>
                    Contact Submissions
                </Typography>
                <Typography variant="body1" sx={{ color: COLORS.textLight }}>
                    View and manage feedback, bug reports, and inquiries from users
                </Typography>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4, border: '1px solid #e2e8f0' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search by name, email, subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        InputProps={{
                            startAdornment: <Search size={18} style={{ marginRight: 8, color: COLORS.textLight }} />
                        }}
                    />
                    <TextField
                        select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        size="small"
                        sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="bug">Bug Reports</MenuItem>
                        <MenuItem value="feedback">Feedback</MenuItem>
                        <MenuItem value="general">General Inquiries</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Stats */}
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Paper sx={{ p: 2, borderRadius: 3, flex: 1, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700 }}>TOTAL</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>{submissions.length}</Typography>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 3, flex: 1, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700 }}>BUG REPORTS</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#ef4444' }}>
                        {submissions.filter(s => s.contact_type === 'bug').length}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 2, borderRadius: 3, flex: 1, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700 }}>FEEDBACK</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#3b82f6' }}>
                        {submissions.filter(s => s.contact_type === 'feedback').length}
                    </Typography>
                </Paper>
            </Stack>

            {/* Submissions Table */}
            <Paper sx={{ borderRadius: 5, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>NAME</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>EMAIL</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>TYPE</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>SUBJECT</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>ATTACHMENTS</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>DATE</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }} align="right">ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: COLORS.textLight }}>
                                        Loading submissions...
                                    </TableCell>
                                </TableRow>
                            ) : filteredSubmissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: COLORS.textLight }}>
                                        No submissions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubmissions.map((submission) => {
                                    const typeStyle = getTypeColor(submission.contact_type);
                                    return (
                                        <TableRow
                                            key={submission.id}
                                            component={motion.tr}
                                            whileHover={{ backgroundColor: 'rgba(233, 30, 99, 0.02)' }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.accent, fontSize: '0.75rem' }}>
                                                        {submission.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography sx={{ fontWeight: 700 }}>{submission.name}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{submission.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getTypeLabel(submission.contact_type)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: typeStyle.bg,
                                                        color: typeStyle.color,
                                                        fontWeight: 800,
                                                        fontSize: '0.7rem'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        maxWidth: 200,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {submission.subject}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {submission.attachment_urls && submission.attachment_urls.length > 0 ? (
                                                    <Chip
                                                        icon={<ImageIcon size={14} />}
                                                        label={submission.attachment_urls.length}
                                                        size="small"
                                                        sx={{ bgcolor: '#f1f5f9', fontWeight: 700 }}
                                                    />
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: COLORS.textLight }}>—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ color: COLORS.textLight, fontSize: '0.875rem' }}>
                                                {new Date(submission.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewSubmission(submission)}
                                                            sx={{ color: '#6366f1' }}
                                                        >
                                                            <Eye size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteSubmission(submission.id)}
                                                            sx={{ color: COLORS.error }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* View Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                {selectedSubmission && (
                    <>
                        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
                            Submission Details
                            <IconButton
                                onClick={() => setOpenViewDialog(false)}
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <X size={20} />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Stack spacing={3}>
                                {/* Contact Info */}
                                <Box>
                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase' }}>
                                        Contact Information
                                    </Typography>
                                    <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            <strong>Name:</strong> {selectedSubmission.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                                            <strong>Email:</strong> {selectedSubmission.email}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Type:</strong> {getTypeLabel(selectedSubmission.contact_type)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Subject */}
                                <Box>
                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase' }}>
                                        Subject
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                                        {selectedSubmission.subject}
                                    </Typography>
                                </Box>

                                {/* Message */}
                                <Box>
                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase' }}>
                                        Message
                                    </Typography>
                                    <Paper sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                            {selectedSubmission.message}
                                        </Typography>
                                    </Paper>
                                </Box>

                                {/* Attachments */}
                                {selectedSubmission.attachment_urls && selectedSubmission.attachment_urls.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                            Attachments ({selectedSubmission.attachment_urls.length})
                                        </Typography>
                                        <Stack spacing={1}>
                                            {selectedSubmission.attachment_urls.map((url, index) => (
                                                <Paper
                                                    key={index}
                                                    sx={{
                                                        p: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        border: '1px solid #e2e8f0'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <ImageIcon size={20} color={COLORS.accent} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Attachment {index + 1}
                                                        </Typography>
                                                    </Box>
                                                    <Link
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                    >
                                                        <ExternalLink size={16} />
                                                        <Typography variant="caption" sx={{ fontWeight: 700 }}>View</Typography>
                                                    </Link>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Metadata */}
                                <Box>
                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase' }}>
                                        Metadata
                                    </Typography>
                                    <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: COLORS.textLight }}>
                                            Submitted: {new Date(selectedSubmission.created_at).toLocaleString()}
                                        </Typography>
                                        {selectedSubmission.user_id && (
                                            <Typography variant="caption" sx={{ display: 'block', color: COLORS.textLight }}>
                                                User ID: {selectedSubmission.user_id}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button
                                onClick={() => setOpenViewDialog(false)}
                                sx={{ fontWeight: 700 }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default ContactSubmissions;

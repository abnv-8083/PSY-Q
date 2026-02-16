import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    alpha,
    CircularProgress,
    Avatar
} from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { UserPlus, Shield, Mail, Trash2, ShieldCheck, User, Search, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';

const COLORS = {
    primary: '#1e293b',
    accent: '#ca0056',
    background: '#fdf2f8',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
};

const AdminManagement = () => {
    const { profile } = useSession();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', fullName: '' });
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            // Fetch from profiles where role is admin or superadmin
            // or from the admins table if it has more details
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['admin', 'superadmin', 'super_admin'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAdmins(data);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setError('Failed to load administrators.');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        setError(null);
        setSuccess(null);

        try {
            // Note: In a real app, this would call a Supabase Edge Function
            // to securely use the Service Role Key for inviting users.
            // For now, we will add a placeholder in the profiles table 
            // and show instructions for the Edge Function.

            // 1. Validation
            if (!inviteForm.email || !inviteForm.fullName) {
                throw new Error('Please fill in all fields.');
            }

            // 2. Implementation Strategy: 
            // We'll call a hypothetical Edge Function 'create-admin'
            // If it doesn't exist, we show a clear error with instructions.
            const { data, error: functionError } = await supabase.functions.invoke('create-admin', {
                body: { email: inviteForm.email, fullName: inviteForm.fullName }
            });

            if (functionError) {
                if (functionError.message?.includes('not found')) {
                    throw new Error('Invitation system (Edge Function) is not yet deployed. Please contact the technical administrator.');
                }
                throw functionError;
            }

            setSuccess(`Invitation sent to ${inviteForm.email}!`);
            setInviteForm({ email: '', fullName: '' });
            setInviteDialogOpen(false);
            fetchAdmins();
        } catch (err) {
            setError(err.message);
        } finally {
            setInviting(false);
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to remove this administrator? They will lose all access.')) return;

        try {
            // Again, this should be done via a secure function to handle Auth side
            const { error: deleteError } = await supabase
                .from('profiles')
                .update({ role: 'student' }) // Downgrade to student as a safe alternative to deletion
                .eq('id', adminId);

            if (deleteError) throw deleteError;

            setAdmins(admins.filter(a => a.id !== adminId));
            setSuccess('Admin access revoked successfully.');
        } catch (err) {
            setError('Failed to revoke admin access.');
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (profile?.role !== 'superadmin' && profile?.role !== 'super_admin') {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Shield size={64} color={COLORS.error} style={{ marginBottom: 16, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                    Access Denied
                </Typography>
                <Typography variant="body1" sx={{ color: COLORS.textLight }}>
                    Only Super Administrators have access to this section.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 3, md: 6 } }}>
            {/* Header Area */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 3, mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: '-0.02em', mb: 1 }}>
                        Admin Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                        Create and manage privileges for your administrative team.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<UserPlus size={20} />}
                    onClick={() => setInviteDialogOpen(true)}
                    sx={{
                        bgcolor: COLORS.accent,
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: COLORS.accentHover, transform: 'translateY(-2px)' },
                        transition: 'all 0.3s',
                        boxShadow: `0 8px 20px ${alpha(COLORS.accent, 0.2)}`
                    }}
                >
                    Add New Admin
                </Button>
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 3, border: 'none', bgcolor: alpha(COLORS.error, 0.1), color: COLORS.error, fontWeight: 600 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 4, borderRadius: 3, border: 'none', bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success, fontWeight: 600 }}>
                    {success}
                </Alert>
            )}

            {/* Filtering */}
            <Paper sx={{ mb: 4, p: 2, borderRadius: 4, border: `1px solid ${COLORS.border}`, boxShadow: 'none' }}>
                <TextField
                    fullWidth
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search size={20} color={COLORS.textLight} style={{ marginRight: 12 }} />,
                        sx: { fontWeight: 600, '& fieldset': { border: 'none' } }
                    }}
                />
            </Paper>

            {/* Admins Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 6, border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(COLORS.primary, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: COLORS.primary }}>Administrator</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: COLORS.primary }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: COLORS.primary }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: COLORS.primary }}>Added On</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: COLORS.primary, textAlign: 'right' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                                    <CircularProgress sx={{ color: COLORS.accent }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredAdmins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                                    <User size={48} color={COLORS.textLight} style={{ opacity: 0.3, marginBottom: 16 }} />
                                    <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                        No administrators found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <TableRow key={admin.id} sx={{ '&:hover': { bgcolor: alpha(COLORS.accent, 0.01) }, transition: 'background 0.2s' }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent }}>
                                                <User size={20} />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: COLORS.primary }}>
                                                    {admin.full_name || 'Unnamed Admin'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                                    {admin.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={admin.role === 'superadmin' || admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                            size="small"
                                            icon={<Shield size={14} />}
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: '0.75rem',
                                                bgcolor: admin.role?.includes('super') ? alpha(COLORS.accent, 0.1) : alpha(COLORS.primary, 0.1),
                                                color: admin.role?.includes('super') ? COLORS.accent : COLORS.primary,
                                                border: 'none'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label="Active"
                                            size="small"
                                            sx={{ fontWeight: 800, fontSize: '0.75rem', bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        {(admin.role !== 'superadmin' && admin.role !== 'super_admin') && (
                                            <IconButton
                                                onClick={() => handleDeleteAdmin(admin.id)}
                                                sx={{ color: COLORS.error, '&:hover': { bgcolor: alpha(COLORS.error, 0.1) } }}
                                            >
                                                <Trash2 size={18} />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Invite Dialog */}
            <Dialog
                open={inviteDialogOpen}
                onClose={() => setInviteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 6, p: 1, width: '100%', maxWidth: 450 } }}
            >
                <form onSubmit={handleInvite}>
                    <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>Add New Administrator</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ color: COLORS.textLight, mb: 3 }}>
                            An invitation link will be sent to the email address provided. They will be granted administrator privileges upon signing up.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                variant="outlined"
                                required
                                value={inviteForm.fullName}
                                onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                variant="outlined"
                                required
                                value={inviteForm.email}
                                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setInviteDialogOpen(false)}
                            sx={{ fontWeight: 700, color: COLORS.textLight }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={inviting}
                            startIcon={inviting ? <CircularProgress size={20} color="inherit" /> : <ShieldCheck size={20} />}
                            sx={{
                                bgcolor: COLORS.accent,
                                borderRadius: 3,
                                px: 3,
                                fontWeight: 800,
                                '&:hover': { bgcolor: COLORS.accentHover }
                            }}
                        >
                            {inviting ? 'Inviting...' : 'Send Invitation'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default AdminManagement;

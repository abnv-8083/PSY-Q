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
import {
    UserPlus, Shield, Mail, Trash2, ShieldCheck, User,
    Lock,
    Copy,
    CheckCheck, Search, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';
import emailjs from '@emailjs/browser';

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

const ALL_PERMISSION_KEYS = [
    'manageUsers',
    'manageContent',
    'manageBundles',
    'manageTests',
    'manageQuestions',
    'viewAnalytics',
    'manageSettings'
];

const AdminManagement = () => {
    const {
        user: currentUser,
        adminResetPasswordRequest
    } = useSession();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [inviteForm, setInviteForm] = useState({ email: '', fullName: '', role: 'admin' });
    const [editForm, setEditForm] = useState({ fullName: '', role: '', permissions: {} });
    const [inviting, setInviting] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [createdAdmin, setCreatedAdmin] = useState(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Config - Matches Edge Function check
    const ADMIN_API_KEY = 'psyq_admin_secret_2024';

    const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'superadmin';

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.functions.invoke('create-admin', {
                method: 'GET',
                headers: {
                    'x-admin-api-key': ADMIN_API_KEY
                }
            });

            if (error) throw error;
            setAdmins(data || []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setError('Failed to load administrators. Make sure you have applied the database migrations.');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        setError(null);
        setSuccess(null);

        // EmailJS Credentials from .env
        const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        try {
            if (!inviteForm.email || !inviteForm.fullName || !inviteForm.role) {
                throw new Error('Please fill in all fields.');
            }

            // 1. Generate password
            const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';

            // 2. Call Edge Function (POST)
            const { data, error: functionError } = await supabase.functions.invoke('create-admin', {
                method: 'POST',
                headers: {
                    'x-admin-api-key': ADMIN_API_KEY
                },
                body: {
                    email: inviteForm.email,
                    fullName: inviteForm.fullName,
                    role: inviteForm.role,
                    password: tempPassword
                }
            });

            if (functionError) throw functionError;
            if (data.error) throw new Error(data.error);

            // 3. Send Email via EmailJS
            const toEmail = inviteForm.email?.trim();
            if (!toEmail) throw new Error('Recipient email is missing.');

            console.log('Sending Invite Email to:', toEmail);
            try {
                await emailjs.send(
                    SERVICE_ID,
                    TEMPLATE_ID,
                    {
                        admin_name: inviteForm.fullName,
                        email_subject: 'Your PsyQ Administrator Account',
                        email_content: `Your administrator account has been created. Your temporary password is: ${tempPassword}`,
                        to_email: toEmail
                    },
                    PUBLIC_KEY
                );
                setCreatedAdmin({
                    email: inviteForm.email,
                    password: tempPassword,
                    fullName: inviteForm.fullName
                });
                setSuccessDialogOpen(true);
                setSuccess(`Success! Account created and credentials sent to ${inviteForm.email}.`);
            } catch (emailErr) {
                console.warn('EmailJS error:', emailErr);
                setCreatedAdmin({
                    email: inviteForm.email,
                    password: tempPassword,
                    fullName: inviteForm.fullName
                });
                setSuccessDialogOpen(true);
                setSuccess(`Account created for ${inviteForm.email}, but email delivery failed.`);
            }

            setInviteForm({ email: '', fullName: '', role: 'admin' });
            setInviteDialogOpen(false);
            fetchAdmins();
        } catch (err) {
            console.error('Creation Error:', err);
            setError(err.message);
        } finally {
            setInviting(false);
        }
    };

    const handleEditAdmin = (admin) => {
        setSelectedAdmin(admin);
        setEditForm({
            fullName: admin.full_name,
            role: admin.role,
            permissions: admin.permissions || {}
        });
        setEditDialogOpen(true);
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        setSuccess(null);

        try {
            const { data, error: updateError } = await supabase.functions.invoke('create-admin', {
                method: 'PATCH',
                headers: {
                    'x-admin-api-key': ADMIN_API_KEY
                },
                body: {
                    id: selectedAdmin.id,
                    full_name: editForm.fullName,
                    role: editForm.role,
                    permissions: editForm.permissions
                }
            });

            if (updateError) throw updateError;
            if (data.error) throw new Error(data.error);

            setSuccess('Admin updated successfully.');
            setEditDialogOpen(false);
            fetchAdmins();
        } catch (err) {
            setError('Failed to update admin.');
        } finally {
            setUpdating(false);
        }
    };

    const handleBlockToggle = async (admin) => {
        const action = admin.is_blocked ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this administrator?`)) return;

        try {
            const { data, error: updateError } = await supabase.functions.invoke('create-admin', {
                method: 'PATCH',
                headers: {
                    'x-admin-api-key': ADMIN_API_KEY
                },
                body: {
                    id: admin.id,
                    is_blocked: !admin.is_blocked
                }
            });

            console.log('Block Toggle Data:', data);
            if (updateError) throw updateError;
            if (data.error) throw new Error(data.error);

            setSuccess(`Admin ${action}ed successfully.`);
            fetchAdmins();
        } catch (err) {
            setError(`Failed to ${action} admin.`);
        }
    };

    const handleResendPassword = async (admin) => {
        if (!window.confirm(`Are you sure you want to send a password reset link to ${admin.email}?`)) return;

        setUpdating(true);
        setError(null);
        setSuccess(null);

        try {
            // 1. Request token from Edge Function
            const { token } = await adminResetPasswordRequest(admin.email);

            // 2. Generate Reset Link
            const resetLink = `${window.location.origin}/admin/reset-password?token=${token}&email=${admin.email}`;

            // 3. Send via EmailJS
            const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            const recipientEmail = admin.email?.trim();
            if (!recipientEmail) throw new Error('Recipient email address not found for this administrator.');

            console.log('Final Reset Email Data:', {
                to_email: recipientEmail,
                admin_name: admin.full_name,
                reset_link: resetLink
            });

            await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                {
                    admin_name: admin.full_name,
                    email_subject: 'Password Reset Request',
                    email_content: `A password reset link has been requested for your administrator account. Please click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.`,
                    to_email: recipientEmail
                },
                PUBLIC_KEY
            );

            setSuccess(`Success! A password reset link has been sent to ${admin.email}.`);
        } catch (err) {
            console.error('Reset Error:', err);
            setError(err.message || 'Failed to send reset link.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to remove this administrator? They will be permanently deleted.')) return;

        try {
            const { error: deleteError } = await supabase.functions.invoke(`create-admin?id=${adminId}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-api-key': ADMIN_API_KEY
                }
            });

            if (deleteError) throw deleteError;

            setAdmins(admins.filter(a => a.id !== adminId));
            setSuccess('Admin deleted successfully.');
        } catch (err) {
            setError('Failed to delete admin.');
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Basic access check using custom session user object
    if (!currentUser || !isSuperAdmin) {
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
                    <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                        Admin Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                        Manage administrators and their specific privileges.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<UserPlus size={20} />}
                    onClick={() => setInviteDialogOpen(true)}
                    sx={{
                        bgcolor: COLORS.accent,
                        borderRadius: 2, // LOWER RADIUS
                        px: 4,
                        py: 1.5,
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: alpha(COLORS.accent, 0.9) },
                        boxShadow: `0 8px 20px ${alpha(COLORS.accent, 0.2)}`
                    }}
                >
                    Add New Admin
                </Button>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>{success}</Alert>}

            {/* Filtering */}
            <Paper sx={{ mb: 4, p: 2, borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
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

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, border: `1px solid ${COLORS.border}` }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(COLORS.primary, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Administrator</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Created At</TableCell>
                            <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : filteredAdmins.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No admins found</TableCell></TableRow>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <TableRow key={admin.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent }}><User size={20} /></Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{admin.full_name}</Typography>
                                                <Typography variant="caption" sx={{ color: COLORS.textLight }}>{admin.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={admin.role} size="small" variant="outlined" color={admin.role === 'super_admin' ? 'secondary' : 'default'} /></TableCell>
                                    <TableCell>
                                        <Chip
                                            label={admin.is_blocked ? 'Blocked' : 'Active'}
                                            size="small"
                                            color={admin.is_blocked ? 'error' : 'success'}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <IconButton onClick={() => handleEditAdmin(admin)} size="small" title="Edit Permissions"><ShieldCheck size={18} /></IconButton>
                                            <IconButton onClick={() => handleResendPassword(admin)} size="small" color="primary" title="Resend Password"><Mail size={18} /></IconButton>
                                            <IconButton onClick={() => handleBlockToggle(admin)} size="small" color={admin.is_blocked ? 'success' : 'warning'} title={admin.is_blocked ? 'Unblock' : 'Block'}>
                                                <User size={18} style={{ opacity: admin.is_blocked ? 1 : 0.5 }} />
                                            </IconButton>
                                            {admin.email !== currentUser.email && (
                                                <IconButton onClick={() => handleDeleteAdmin(admin.id)} color="error" size="small" title="Delete Admin"><Trash2 size={18} /></IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Invite Dialog */}
            <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
                <form onSubmit={handleInvite}>
                    <DialogTitle sx={{ fontWeight: 800 }}>Add New Administrator</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField label="Full Name" fullWidth required value={inviteForm.fullName} onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })} />
                            <TextField label="Email Address" fullWidth required type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
                            <TextField label="Role" select fullWidth required value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} SelectProps={{ native: true }}>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setInviteDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={inviting} sx={{ fontWeight: 800, bgcolor: COLORS.accent }}>{inviting ? 'Creating...' : 'Create Admin'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} PaperProps={{ sx: { borderRadius: 2, minWidth: 400 } }}>
                <form onSubmit={handleUpdateAdmin}>
                    <DialogTitle sx={{ fontWeight: 800 }}>Edit Administrator</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField label="Full Name" fullWidth required value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
                            <TextField label="Role" select fullWidth required value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} SelectProps={{ native: true }}>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </TextField>

                            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 800 }}>Permissions</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                {ALL_PERMISSION_KEYS.map(perm => (
                                    <Box key={perm} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <input
                                            type="checkbox"
                                            checked={editForm.permissions[perm] || false}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                permissions: { ...editForm.permissions, [perm]: e.target.checked }
                                            })}
                                        />
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {perm.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setEditDialogOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={updating} sx={{ fontWeight: 800, bgcolor: COLORS.accent }}>{updating ? 'Updating...' : 'Save Changes'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Success Credentials Dialog */}
            <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} PaperProps={{ sx: { borderRadius: 2, minWidth: 400 } }}>
                <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', color: COLORS.success }}>
                    Admin Created Successfully
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, p: 3, bgcolor: alpha(COLORS.success, 0.05), borderRadius: 2, border: `1px solid ${alpha(COLORS.success, 0.2)}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Credentials for: {createdAdmin?.fullName}</Typography>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700 }}>EMAIL</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>{createdAdmin?.email}</Typography>
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700 }}>TEMPORARY PASSWORD</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.accent, letterSpacing: 1 }}>{createdAdmin?.password}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: COLORS.textLight }}>
                        Please share these credentials with the new administrator securely.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={copied ? <CheckCheck size={20} /> : <Copy size={20} />}
                        onClick={() => {
                            const text = `Email: ${createdAdmin?.email}\nPassword: ${createdAdmin?.password}`;
                            navigator.clipboard.writeText(text);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                        sx={{
                            bgcolor: copied ? COLORS.success : COLORS.primary,
                            borderRadius: 2,
                            fontWeight: 800,
                            py: 1.5,
                            '&:hover': { bgcolor: copied ? COLORS.success : alpha(COLORS.primary, 0.9) }
                        }}
                    >
                        {copied ? 'Credentials Copied!' : 'Copy Credentials'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminManagement;

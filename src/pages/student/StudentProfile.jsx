import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    Grid,
    IconButton,
    Breadcrumbs,
    Link
} from '@mui/material';
import { 
    ArrowLeft, User, Mail, Lock, Save, 
    Edit2, Camera, Calendar, ShieldCheck,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';

const COLORS = {
    primary: '#1e293b',
    accent: '#ca0056',
    secondary: '#64748b'
};

const StudentProfile = () => {
    const navigate = useNavigate();
    const { studentUser, loading: sessionLoading } = useSession();

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [userData, setUserData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!sessionLoading) {
            if (!studentUser) {
                navigate('/student/signin');
                return;
            }

            const fetchUserData = async () => {
                try {
                    setLoading(true);
                    const { data: profile, error } = await supabase
                        .from('students')
                        .select('*')
                        .eq('id', studentUser.id)
                        .single();

                    if (error) throw error;

                    if (profile) {
                        setUserData(profile);
                        setFormData({
                            name: profile.full_name || '',
                            email: profile.email || '',
                            newPassword: '',
                            confirmPassword: ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setMessage({ type: 'error', text: 'Failed to load profile data' });
                } finally {
                    setLoading(false);
                }
            };
            fetchUserData();
        }
    }, [studentUser, sessionLoading, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            if (!studentUser) throw new Error('No user logged in');

            const updates = {};
            if (formData.name !== userData?.full_name) updates.full_name = formData.name;
            if (formData.email !== userData?.email) updates.email = formData.email;

            if (formData.newPassword) {
                if (formData.newPassword.length < 6) {
                    throw new Error('Password must be at least 6 characters');
                }
                if (formData.newPassword !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                
                // Update password via Supabase Auth
                const { error: authError } = await supabase.auth.updateUser({
                    password: formData.newPassword
                });
                if (authError) throw authError;
            }

            if (Object.keys(updates).length > 0) {
                const { error: studentError } = await supabase
                    .from('students')
                    .update(updates)
                    .eq('id', studentUser.id);

                if (studentError) throw studentError;
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            
            // Refresh local data
            setUserData(prev => ({ ...prev, ...updates }));

        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (sessionLoading || loading) {
        return (
            <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: COLORS.accent }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: '#f8fafc', pt: 4, pb: 8 }}>
            <Container maxWidth="lg">
                {/* Breadcrumbs */}
                <Breadcrumbs 
                    separator={<ChevronRight size={14} />} 
                    sx={{ mb: 3 }}
                >
                    <Link 
                        underline="hover" 
                        color="inherit" 
                        onClick={() => navigate('/academic/mocktest')}
                        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}
                    >
                        <User size={14} /> Mock Test
                    </Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Profile</Typography>
                </Breadcrumbs>

                <Grid container spacing={4}>
                    {/* Left Side: Photo & Quick Info */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            bgcolor: COLORS.accent,
                                            fontSize: '48px',
                                            fontWeight: 800,
                                            boxShadow: '0 10px 25px rgba(202, 0, 86, 0.2)'
                                        }}
                                    >
                                        {formData.name?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <IconButton 
                                        sx={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            right: 0, 
                                            bgcolor: 'white', 
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            '&:hover': { bgcolor: '#f8fafc' }
                                        }}
                                        size="small"
                                    >
                                        <Camera size={16} color={COLORS.accent} />
                                    </IconButton>
                                </Box>
                                
                                <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary, mb: 0.5 }}>
                                    {userData?.full_name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: COLORS.secondary, mb: 3 }}>
                                    {userData?.email}
                                </Typography>

                                <Divider sx={{ my: 3 }} />

                                <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(202, 0, 86, 0.05)', color: COLORS.accent }}>
                                            <Calendar size={18} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: COLORS.secondary, display: 'block' }}>Joined Since</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {new Date(userData?.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', color: '#10b981' }}>
                                            <ShieldCheck size={18} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: COLORS.secondary, display: 'block' }}>Account Status</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>Verified</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>

                    {/* Right Side: Form */}
                    <Grid item xs={12} md={8}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary }}>
                                        Personal Settings
                                    </Typography>
                                    {!isEditing && (
                                        <Button
                                            startIcon={<Edit2 size={18} />}
                                            onClick={() => setIsEditing(true)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                color: COLORS.accent,
                                                borderRadius: '12px',
                                                px: 3,
                                                '&:hover': { bgcolor: 'rgba(202, 0, 86, 0.05)' }
                                            }}
                                        >
                                            Edit Details
                                        </Button>
                                    )}
                                </Box>

                                {message.text && (
                                    <Alert severity={message.type} sx={{ mb: 3, borderRadius: 3 }}>
                                        {message.text}
                                    </Alert>
                                )}

                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: COLORS.primary }}>Full Name</Typography>
                                        <TextField
                                            fullWidth
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: <User size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: COLORS.primary }}>Email Address</Typography>
                                        <TextField
                                            fullWidth
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: <Mail size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        />
                                    </Grid>

                                    {isEditing && (
                                        <>
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 2, mb: 1, color: COLORS.primary }}>
                                                    Change Password
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: COLORS.primary }}>New Password</Typography>
                                                <TextField
                                                    fullWidth
                                                    name="newPassword"
                                                    type="password"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    placeholder="Min. 6 characters"
                                                    InputProps={{
                                                        startAdornment: <Lock size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                                    }}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: COLORS.primary }}>Confirm Password</Typography>
                                                <TextField
                                                    fullWidth
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Match new password"
                                                    InputProps={{
                                                        startAdornment: <Lock size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                                    }}
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </Grid>

                                {isEditing && (
                                    <Box sx={{ display: 'flex', gap: 2, mt: 5 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => setIsEditing(false)}
                                            sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Save size={18} />}
                                            sx={{ 
                                                py: 1.5, 
                                                borderRadius: 3, 
                                                fontWeight: 700, 
                                                textTransform: 'none',
                                                bgcolor: COLORS.accent,
                                                '&:hover': { bgcolor: '#9d174d' }
                                            }}
                                        >
                                            {isSaving ? 'Processing...' : 'Save Changes'}
                                        </Button>
                                    </Box>
                                )}
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default StudentProfile;

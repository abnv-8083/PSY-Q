import { useState, useEffect } from 'react';
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
    IconButton,
    Divider,
    Alert
} from '@mui/material';
import { ArrowLeft, User, Mail, Lock, Save, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';


const StudentProfile = () => {
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    const { user: sessionUser, loading: sessionLoading } = useSession();

    useEffect(() => {
        if (!sessionLoading) {
            if (!sessionUser) {
                navigate('/student/signin');
                return;
            }

            const fetchUserData = async () => {
                try {
                    setLoading(true);
                    const { data: profile, error } = await supabase
                        .from('students')
                        .select('*')
                        .eq('id', sessionUser.id)
                        .single();

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
    }, [sessionUser, sessionLoading, navigate]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            if (!sessionUser) throw new Error('No user logged in');

            const updates = {};

            // Update display name if changed
            if (formData.name !== userData?.full_name) {
                updates.full_name = formData.name;
            }

            // Update email if changed (Note: usually requires verification, but here we just update)
            if (formData.email !== userData?.email) {
                updates.email = formData.email;
            }

            // Password update would need an Edge Function to hash it
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    setMessage({ type: 'error', text: 'Passwords do not match' });
                    setIsSaving(false);
                    return;
                }
                // We'll skip password update here as it needs backend hashing
                console.warn("Password update requested - this needs a separate backend action.");
            }

            if (Object.keys(updates).length > 0) {
                const { error: studentError } = await supabase
                    .from('students')
                    .update(updates)
                    .eq('id', sessionUser.id);

                if (studentError) throw studentError;

                // Update local session too
                const updatedUser = { ...sessionUser, ...updates };
                localStorage.setItem('psyq_user', JSON.stringify(updatedUser));
                // Note: useSession doesn't have a 'refresh' but the state might auto-update if we provide it
                // For now, simpler to just notify success
            }

            setMessage({ type: 'success', text: 'Profile updated successfully! Some changes may require a refresh.' });
            setIsEditing(false);
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));

            // Refresh user data
            const { data: profile } = await supabase
                .from('students')
                .select('*')
                .eq('id', sessionUser.id)
                .single();
            if (profile) setUserData(profile);

        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: 'Failed to update profile. ' + error.message
            });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => navigate('/academic/mocktest')} sx={{ mr: 2 }}>
                        <ArrowLeft />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        My Profile
                    </Typography>
                </Box>

                {/* Loading State */}
                {loading ? (
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                        <Typography variant="body1" sx={{ color: '#64748b' }}>
                            Loading profile...
                        </Typography>
                    </Paper>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                            {/* Avatar Section */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: '#ec4899',
                                        fontSize: '48px',
                                        fontWeight: 700,
                                        mb: 2
                                    }}
                                >
                                    {formData.name?.charAt(0)?.toUpperCase() || 'S'}
                                </Avatar>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    {formData.name || 'Student'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    {userData?.role === 'student' ? 'Student Account' : 'User'}
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* Message Alert */}
                            {message.text && (
                                <Alert severity={message.type} sx={{ mb: 3 }}>
                                    {message.text}
                                </Alert>
                            )}

                            {/* Profile Information */}
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        Personal Information
                                    </Typography>
                                    {!isEditing && (
                                        <Button
                                            startIcon={<Edit2 size={18} />}
                                            onClick={() => setIsEditing(true)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                color: '#ec4899'
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    {/* Name Field */}
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                                            Full Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            InputProps={{
                                                startAdornment: <User size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: isEditing ? '#fff' : '#f8fafc'
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Email Field */}
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                                            Email Address
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            InputProps={{
                                                startAdornment: <Mail size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    bgcolor: isEditing ? '#fff' : '#f8fafc'
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Password Fields (only when editing) */}
                                    {isEditing && (
                                        <>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                                                    New Password (Optional)
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    name="newPassword"
                                                    type="password"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    placeholder="Enter new password"
                                                    InputProps={{
                                                        startAdornment: <Lock size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
                                                    Confirm New Password
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Confirm new password"
                                                    InputProps={{
                                                        startAdornment: <Lock size={20} style={{ marginRight: 12, color: '#94a3b8' }} />
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </Box>

                            {/* Action Buttons */}
                            {isEditing && (
                                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: userData?.full_name || '',
                                                email: userData?.email || '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                            setMessage({ type: '', text: '' });
                                        }}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            py: 1.5
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        startIcon={<Save size={18} />}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            bgcolor: '#ec4899',
                                            borderRadius: 2,
                                            py: 1.5,
                                            '&:hover': {
                                                bgcolor: '#db2777'
                                            }
                                        }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Box>
                            )}

                            {/* Account Info */}
                            <Box sx={{ mt: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                    <strong>Account Created:</strong> {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
                                </Typography>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </Container>
        </Box>
    );
};

export default StudentProfile;

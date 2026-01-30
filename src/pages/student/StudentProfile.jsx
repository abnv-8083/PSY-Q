import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
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

const StudentProfile = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setFormData({
                        name: data.name || user.displayName || '',
                        email: data.email || user.email || '',
                        newPassword: '',
                        confirmPassword: ''
                    });
                }
            }
        };
        fetchUserData();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Update display name if changed
            if (formData.name !== user.displayName) {
                await updateProfile(user, { displayName: formData.name });
            }

            // Update Firestore user data
            await updateDoc(doc(db, 'users', user.uid), {
                name: formData.name,
                email: formData.email
            });

            // Update email if changed
            if (formData.email !== user.email) {
                await updateEmail(user, formData.email);
            }

            // Update password if provided
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    setMessage({ type: 'error', text: 'Passwords do not match' });
                    setIsSaving(false);
                    return;
                }
                if (formData.newPassword.length < 6) {
                    setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
                    setIsSaving(false);
                    return;
                }
                await updatePassword(user, formData.newPassword);
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            setFormData({ ...formData, newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.code === 'auth/requires-recent-login'
                    ? 'Please sign out and sign in again to update your profile'
                    : 'Failed to update profile. Please try again.'
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

                {/* Profile Card */}
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
                                            name: userData?.name || user?.displayName || '',
                                            email: userData?.email || user?.email || '',
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
                                <strong>Account Created:</strong> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default StudentProfile;

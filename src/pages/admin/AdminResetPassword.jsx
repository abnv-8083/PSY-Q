import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    Avatar,
    alpha,
    CircularProgress
} from '@mui/material';
import { Lock, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';

const COLORS = {
    primary: '#1e293b',
    accent: '#ca0056',
    background: '#fdf2f8',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981'
};

const AdminResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { adminResetPasswordConfirm } = useSession();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setError('Invalid reset link. Missing token or email.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        try {
            await adminResetPasswordConfirm(email, token, formData.password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: COLORS.background }}>
                <Container maxWidth="sm">
                    <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                        <Avatar sx={{ width: 80, height: 80, margin: '0 auto 20px', bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }}>
                            <CheckCircle2 size={40} />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>Password Reset!</Typography>
                        <Typography variant="body1" sx={{ color: COLORS.textLight, mb: 3 }}>
                            Your password has been updated successfully. Redirecting you to login...
                        </Typography>
                        <CircularProgress size={24} color="inherit" sx={{ color: COLORS.success }} />
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: COLORS.background, py: 4 }}>
            <Container maxWidth="sm">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, bgcolor: 'white', border: `1px solid ${COLORS.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Avatar sx={{ width: 80, height: 80, margin: '0 auto 20px', background: COLORS.primary }}>
                                <ShieldCheck size={40} color="white" />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>Reset Password</Typography>
                            <Typography variant="body1" sx={{ color: COLORS.textLight }}>Set a new secure password for your administrator account.</Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Lock size={20} color={COLORS.textLight} /></InputAdornment>,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><Lock size={20} color={COLORS.textLight} /></InputAdornment>
                                    }}
                                />
                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={loading || !token || !email}
                                    sx={{ py: 1.8, borderRadius: 3, bgcolor: COLORS.primary, fontWeight: 800, textTransform: 'none' }}
                                >
                                    {loading ? 'Updating Password...' : 'Update Password'}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default AdminResetPassword;

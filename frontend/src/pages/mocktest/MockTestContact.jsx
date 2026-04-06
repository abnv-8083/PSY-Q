import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, TextField, Button, MenuItem,
    Paper, Alert, CircularProgress, Stack, Grid, alpha, IconButton
} from '@mui/material';
import { Send, CheckCircle, Mail, MessageSquare, User, AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useSession } from '../../contexts/SessionContext'; // Import session hook

import MockTestNavbar from '../../components/MockTestNavbar';

import Footer from '../../components/Footer';

const COLORS = {
    primary: '#1e293b',
    secondary: '#4b5563',
    accent: '#ca0056',
    accentHover: '#b8003f',
    background: '#fdf2f8',
    cardBg: '#FFFFFF',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444'
};

const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

const CONTACT_TYPES = [
    { value: 'feedback', label: 'Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'general', label: 'General Inquiry' }
];

const MockTestContact = () => {
    const navigate = useNavigate();
    const { user, loading: sessionLoading } = useSession();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactType: 'feedback',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (!sessionLoading && user) {
            setFormData(prev => ({
                ...prev,
                name: user.full_name || '',
                email: user.email || ''
            }));
        }
    }, [user, sessionLoading]);


    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        // Clear uploaded files if changing away from bug report
        if (name === 'contactType' && value !== 'bug') {
            setUploadedFiles([]);
            setUploadError('');
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadError('');
        setUploading(true);

        try {
            // Validate files
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'];

            for (const file of files) {
                if (file.size > maxSize) {
                    setUploadError(`File "${file.name}" is too large. Maximum size is 5MB.`);
                    setUploading(false);
                    return;
                }
                if (!allowedTypes.includes(file.type)) {
                    setUploadError(`File "${file.name}" has an unsupported format. Allowed: images, videos (MP4/WebM), and PDF.`);
                    setUploading(false);
                    return;
                }
            }

            // Upload files to Supabase Storage
            const uploadPromises = files.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { data, error } = await supabase.storage
                    .from('contact-attachments')
                    .upload(filePath, file);

                if (error) {
                    throw error;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('contact-attachments')
                    .getPublicUrl(filePath);

                return {
                    name: file.name,
                    url: publicUrl,
                    path: filePath,
                    type: file.type
                };
            });

            const uploadedFileData = await Promise.all(uploadPromises);
            setUploadedFiles(prev => [...prev, ...uploadedFileData]);

        } catch (err) {
            console.error('Error uploading files:', err);
            setUploadError('Failed to upload files. Please ensure the storage bucket is configured correctly.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = async (fileToRemove) => {
        try {
            // Delete from Supabase Storage
            const { error } = await supabase.storage
                .from('contact-attachments')
                .remove([fileToRemove.path]);

            if (error) {
                console.error('Error deleting file:', error);
            }

            // Remove from state
            setUploadedFiles(prev => prev.filter(file => file.path !== fileToRemove.path));
        } catch (err) {
            console.error('Error removing file:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const submission = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                contact_type: formData.contactType,
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                user_id: user?.id || null,
                user_email: user?.email || null,
                attachment_urls: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.url) : null,
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('contact_submissions')
                .insert([submission]);

            if (insertError) {
                throw insertError;
            }

            setSuccess(true);
            // Reset form
            setFormData({
                name: user?.displayName || '',
                email: user?.email || '',
                contactType: 'feedback',
                subject: '',
                message: ''
            });
            setUploadedFiles([]);
            setUploadError('');

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            console.error('Error submitting contact form:', err);
            setError('Failed to submit your message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'white', fontFamily: FONTS.primary }}>
            <MockTestNavbar />

            {/* Hero Section */}
            <Box sx={{
                bgcolor: COLORS.background,
                pt: { xs: 6, md: 8 },
                pb: { xs: 6, md: 8 },
                borderBottom: `1px solid ${COLORS.border}`
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
                        <Typography variant="overline" sx={{
                            color: COLORS.accent,
                            fontWeight: 800,
                            letterSpacing: '0.15em',
                            mb: 2,
                            display: 'block'
                        }}>
                            GET IN TOUCH
                        </Typography>
                        <Typography variant="h2" sx={{
                            fontSize: { xs: '2rem', md: '3rem' },
                            fontWeight: 900,
                            color: COLORS.primary,
                            lineHeight: 1.2,
                            mb: 3
                        }}>
                            Contact <Box component="span" sx={{ color: COLORS.accent }}>Support</Box>
                        </Typography>
                        <Typography variant="body1" sx={{
                            fontSize: '1.1rem',
                            color: COLORS.secondary,
                            lineHeight: 1.7,
                            maxWidth: '600px',
                            mx: 'auto'
                        }}>
                            Have feedback, found a bug, or need assistance? We're here to help!
                            Fill out the form below and we'll get back to you as soon as possible.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* Contact Form Section */}
            <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
                <Container maxWidth="md">
                    {success && (
                        <Alert
                            severity="success"
                            icon={<CheckCircle size={24} />}
                            sx={{
                                mb: 4,
                                borderRadius: 3,
                                fontSize: '1rem',
                                fontWeight: 600,
                                bgcolor: alpha(COLORS.success, 0.1),
                                color: COLORS.success,
                                border: `1px solid ${alpha(COLORS.success, 0.3)}`
                            }}
                        >
                            Thank you for contacting us! We've received your message and will respond shortly.
                        </Alert>
                    )}

                    {error && (
                        <Alert
                            severity="error"
                            icon={<AlertCircle size={24} />}
                            sx={{
                                mb: 4,
                                borderRadius: 3,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Paper elevation={0} sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        border: `1px solid ${COLORS.border}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Name Field */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: COLORS.primary
                                    }}>
                                        Your Name *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: COLORS.accent
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: COLORS.accent
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Email Field */}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: COLORS.primary
                                    }}>
                                        Email Address *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: COLORS.accent
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: COLORS.accent
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Contact Type */}
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: COLORS.primary
                                    }}>
                                        Type of Inquiry *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        select
                                        name="contactType"
                                        value={formData.contactType}
                                        onChange={handleChange}
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: COLORS.accent
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: COLORS.accent
                                                }
                                            }
                                        }}
                                    >
                                        {CONTACT_TYPES.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                {/* Subject Field */}
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: COLORS.primary
                                    }}>
                                        Subject *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Brief description of your inquiry"
                                        error={!!errors.subject}
                                        helperText={errors.subject}
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: COLORS.accent
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: COLORS.accent
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* Message Field */}
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: COLORS.primary
                                    }}>
                                        Message *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Please provide details about your feedback, bug report, or inquiry..."
                                        error={!!errors.message}
                                        helperText={errors.message}
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: COLORS.accent
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: COLORS.accent
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                {/* File Upload - Only for Bug Reports */}
                                {formData.contactType === 'bug' && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 700,
                                            mb: 1,
                                            color: COLORS.primary
                                        }}>
                                            Attach Screenshots or Media (Optional)
                                        </Typography>
                                        <Typography variant="caption" sx={{
                                            color: COLORS.textLight,
                                            display: 'block',
                                            mb: 2
                                        }}>
                                            Upload images, videos, or PDFs to help us understand the issue better. Max 5MB per file.
                                        </Typography>

                                        <Box sx={{
                                            border: `2px dashed ${COLORS.border}`,
                                            borderRadius: 2,
                                            p: 3,
                                            textAlign: 'center',
                                            bgcolor: alpha(COLORS.background, 0.3),
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                borderColor: uploading ? COLORS.border : COLORS.accent,
                                                bgcolor: uploading ? alpha(COLORS.background, 0.3) : alpha(COLORS.accent, 0.05)
                                            }
                                        }}>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,video/mp4,video/webm,application/pdf"
                                                onChange={handleFileChange}
                                                disabled={uploading || loading}
                                                style={{ display: 'none' }}
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" style={{ cursor: uploading || loading ? 'not-allowed' : 'pointer', display: 'block' }}>
                                                <Upload size={40} color={COLORS.accent} style={{ marginBottom: '8px' }} />
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.primary, mb: 0.5 }}>
                                                    {uploading ? 'Uploading...' : 'Click to upload files'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: COLORS.textLight }}>
                                                    Images, Videos (MP4/WebM), or PDF • Max 5MB each
                                                </Typography>
                                            </label>
                                        </Box>

                                        {uploadError && (
                                            <Alert severity="error" sx={{ mt: 2 }}>
                                                {uploadError}
                                            </Alert>
                                        )}

                                        {uploadedFiles.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: COLORS.primary }}>
                                                    Uploaded Files ({uploadedFiles.length})
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {uploadedFiles.map((file, index) => (
                                                        <Box
                                                            key={index}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                p: 1.5,
                                                                border: `1px solid ${COLORS.border}`,
                                                                borderRadius: 2,
                                                                bgcolor: 'white'
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <ImageIcon size={20} color={COLORS.accent} />
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {file.name}
                                                                </Typography>
                                                            </Box>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemoveFile(file)}
                                                                disabled={loading}
                                                                sx={{
                                                                    color: COLORS.error,
                                                                    '&:hover': { bgcolor: alpha(COLORS.error, 0.1) }
                                                                }}
                                                            >
                                                                <X size={18} />
                                                            </IconButton>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        )}
                                    </Grid>
                                )}

                                {/* Submit Button */}
                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                                        sx={{
                                            bgcolor: COLORS.accent,
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            py: 1.5,
                                            px: 4,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            boxShadow: `0 4px 14px ${alpha(COLORS.accent, 0.3)}`,
                                            '&:hover': {
                                                bgcolor: COLORS.accentHover,
                                                boxShadow: `0 6px 20px ${alpha(COLORS.accent, 0.4)}`
                                            },
                                            '&:disabled': {
                                                bgcolor: COLORS.textLight,
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>

                    {/* Additional Info */}
                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: COLORS.textLight, mb: 2 }}>
                            Need immediate assistance? Check out our{' '}
                            <Box
                                component="span"
                                onClick={() => navigate('/academic/mocktest/features')}
                                sx={{
                                    color: COLORS.accent,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Features
                            </Box>
                            {' '}page or browse our{' '}
                            <Box
                                component="span"
                                onClick={() => navigate('/academic/mocktest/tests')}
                                sx={{
                                    color: COLORS.accent,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Mock Tests
                            </Box>
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

export default MockTestContact;

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f7fa',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.05,
                background: 'radial-gradient(circle at 20% 50%, #E91E63 0%, transparent 50%), radial-gradient(circle at 80% 80%, #00388C 0%, transparent 50%)'
            }} />

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                    {/* 404 Number */}
                    <Typography
                        sx={{
                            fontSize: { xs: '120px', md: '180px' },
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #E91E63 0%, #00388C 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1,
                            mb: 2
                        }}
                    >
                        404
                    </Typography>

                    {/* Message */}
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2 }}>
                        Oops! Page Not Found
                    </Typography>

                    <Typography variant="body1" sx={{ color: '#666', mb: 5, maxWidth: 500, mx: 'auto' }}>
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track!
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Home size={20} />}
                            onClick={() => navigate('/')}
                            sx={{
                                bgcolor: '#E91E63',
                                color: '#fff',
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
                                '&:hover': {
                                    bgcolor: '#C2185B',
                                    boxShadow: '0 6px 20px rgba(233, 30, 99, 0.4)'
                                }
                            }}
                        >
                            Go to Home
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowLeft size={20} />}
                            onClick={() => navigate(-1)}
                            sx={{
                                borderColor: '#00388C',
                                color: '#00388C',
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#00388C',
                                    bgcolor: 'rgba(0, 56, 140, 0.05)'
                                }
                            }}
                        >
                            Go Back
                        </Button>
                    </Box>

                    {/* Helpful Links */}
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
                            Quick Links:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#E91E63',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => navigate('/about')}
                            >
                                About Us
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#E91E63',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => navigate('/therapists')}
                            >
                                Our Therapists
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#E91E63',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => navigate('/academic/mocktest')}
                            >
                                Mock Tests
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#E91E63',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => navigate('/contact')}
                            >
                                Contact
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default NotFound;

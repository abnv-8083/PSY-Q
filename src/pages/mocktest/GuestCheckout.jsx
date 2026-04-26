import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Paper,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    ChevronLeft,
    ShoppingBag,
    CheckCircle2,
    ShieldCheck,
    ArrowLeft,
    Sparkles,
    Send
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';
import { createPurchaseRequest } from '../../api/purchaseRequestsApi';
import MockTestNavbar from '../../components/MockTestNavbar';

const GuestCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile } = useSession();

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [orderData, setOrderData] = useState(location.state || null);

    useEffect(() => {
        // If no purchase data, redirect back
        if (!orderData) {
            navigate('/academic/mocktest');
        }
        // User must be logged in for purchase requests
        if (!user) {
            navigate('/student/signin', { state: { from: location.pathname } });
        }
    }, [orderData, navigate, user]);

    if (!orderData || !user) return null;

    const price = Number(orderData.price) || 0;
    const calculateTax = (p) => Math.round(p * 0.18); // 18% GST example
    const tax = calculateTax(price);
    const total = price + tax;

    const handleSendRequest = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // 1. Create Purchase Request in DB
            const itemType = orderData.type === 'bundle' ? 'bundle' : 'test';
            const itemId = orderData.type === 'bundle' ? orderData.bundleId : orderData.testId;

            // Generate a 10-digit request number
            const requestNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            
            const requestRecord = await createPurchaseRequest(user.id, itemType, itemId, requestNum);

            // 2. Build WhatsApp Message
            const adminPhone = "919961206583"; // Placeholder, can be configured later or in DB
            const userName = profile?.full_name || user.email;

            const message = `Hi Admin!\n\nI want to request access to a ${itemType === 'bundle' ? 'Bundle' : 'Mock Test'}.\n` +
                `\n*Item Name*: ${orderData.name}` +
                `\n*Price*: ₹${total}` +
                `\n\n*Student Details*:` +
                `\nName: ${userName}` +
                `\nEmail: ${user.email}` +
                (user.phone || profile?.phone ? `\nPhone: ${user.phone || profile?.phone}` : '') +
                `\n\n*Request ID*: ${requestNum}` +
                `\n\nPlease approve my request so I can start learning!`;

            const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

            // 3. Open WhatsApp and update UI
            window.open(whatsappUrl, '_blank');
            setSuccess(true);
            setIsProcessing(false);

        } catch (err) {
            console.error('Request error:', err);
            setError('An error occurred while creating the request. Please try again or contact support.');
            setIsProcessing(false);
        }
    };

    const renderSummaryStep = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Request Access</Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                We currently support manual approvals via WhatsApp. Send a request, and our admins will activate your course instantly upon confirmation of payment.
            </Typography>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="textSecondary">{orderData.type === 'bundle' ? 'Bundle' : 'Mock Test'}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{orderData.name}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography color="textSecondary">Price</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{price}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography color="textSecondary">GST (18%)</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{tax}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Amount</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#db2777' }}>₹{total}</Typography>
                </Box>
            </Paper>

            <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#ecfdf5', borderRadius: 3, border: '1px solid #10b98120' }}>
                <ShieldCheck size={24} color="#10b981" />
                <Typography variant="body2" sx={{ color: '#064e3b', fontWeight: 500 }}>
                    Clicking below will redirect you to WhatsApp to send an automated message to our admins.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={handleSendRequest}
                    disabled={isProcessing}
                    endIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <Send size={18} />}
                    sx={{
                        bgcolor: '#25D366', // WhatsApp Green
                        py: 1.5,
                        px: 4,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': { bgcolor: '#128C7E' }
                    }}
                >
                    {isProcessing ? 'Processing...' : `Request Access via WhatsApp`}
                </Button>
            </Box>
        </motion.div>
    );

    const renderSuccessStep = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '40px 0' }}
        >
            <Box sx={{ mb: 3, display: 'inline-flex', p: 3, bgcolor: '#ecfdf5', borderRadius: '50%' }}>
                <CheckCircle2 size={64} color="#10b981" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a2035', mb: 2 }}>Request Sent!</Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 500, mx: 'auto' }}>
                Thank you! Your request is now pending. You should be redirected to WhatsApp. Our admins will approve your access as soon as possible.
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate('/academic/mocktest')}
                sx={{
                    bgcolor: '#ca0056',
                    py: 1.5,
                    px: 6,
                    borderRadius: 3,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#b8003f' }
                }}
            >
                Return to Dashboard
            </Button>
        </motion.div>
    );

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fef2f2 100%)' }}>
            <MockTestNavbar />
            <Box sx={{ pt: { xs: 4, md: 6 }, pb: 8 }}>
            <Container maxWidth="md">
                {/* Header/Breadcrumbs */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowLeft />}
                        onClick={() => navigate('/academic/mocktest')}
                        sx={{ color: '#64748b', textTransform: 'none', mb: 2 }}
                    >
                        Back to Tests
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>
                        Checkout Request
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={success ? 12 : 8}>
                        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                            {!success ? renderSummaryStep() : renderSuccessStep()}
                        </Paper>
                    </Grid>

                    {/* Right Side: Order Details Card (Only visible before success) */}
                    {!success && (
                        <Grid item xs={12} md={4}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Paper sx={{ p: 4, borderRadius: 6, position: 'sticky', top: 120 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                        <ShoppingBag size={24} color="#ca0056" />
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Purchase Info</Typography>
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Item(s)</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.3, mt: 0.5 }}>{orderData.name}</Typography>
                                    </Box>

                                    <Box sx={{ mt: 4, p: 2, bgcolor: '#f1f5f9', borderRadius: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                            <Sparkles size={16} color="#334155" />
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>BENEFITS</Typography>
                                        </Box>
                                        <Typography variant="caption" component="div" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <CheckCircle2 size={12} /> Access directly after approval
                                        </Typography>
                                        <Typography variant="caption" component="div" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CheckCircle2 size={12} /> Lifetime Result Analytics
                                        </Typography>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    </Box>
);
};

export default GuestCheckout;

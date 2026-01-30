import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    Grid,
    Paper,
    Chip,
    Divider,
    useMediaQuery,
    useTheme,
    CircularProgress
} from '@mui/material';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initiateRazorpayPayment } from '../utils/razorpay';

const PaymentDialog = ({ open, onClose, testName, testPrice, onUnlock, user, testId, bundleId, isBundle, subjectId }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            await initiateRazorpayPayment({
                amount: testPrice,
                testName,
                testId,
                bundleId,
                isBundle,
                user,
                onSuccess: (paymentData) => {
                    console.log('Payment successful:', paymentData);
                    setIsProcessing(false);
                    onUnlock(paymentData);
                },
                onFailure: (error) => {
                    console.error('Payment failed:', error);
                    setIsProcessing(false);
                    alert(error || 'Payment failed. Please try again.');
                }
            });
        } catch (error) {
            console.error('Payment error:', error);
            setIsProcessing(false);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 4,
                    overflow: 'hidden',
                    bgcolor: '#fff'
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                bgcolor: isBundle ? '#1e293b' : '#db2777',
                color: '#fff',
                p: 3,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
            }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{isBundle ? 'Upgrade to Prime' : 'Unlock More Retakes'}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{isBundle ? 'Get access to all tests in this bundle' : 'Select a package that works best for your preparation'}</Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <X size={24} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc' }}>
                <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 4, color: '#1e293b' }}>
                    {isBundle ? 'Prime Access Details' : 'Select the package that works best for your mock test journey'}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            elevation={8}
                            sx={{
                                position: 'relative',
                                p: 4,
                                borderRadius: 5,
                                maxWidth: 400,
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: `2px solid ${isBundle ? '#1e293b' : '#db2777'}`,
                                bgcolor: '#fff',
                                boxShadow: isBundle ? '0 20px 40px rgba(30, 41, 59, 0.15)' : '0 20px 40px rgba(219, 39, 119, 0.15)'
                            }}
                        >
                            <Box sx={{
                                mb: 2,
                                bgcolor: isBundle ? '#1e293b10' : '#db277710',
                                p: 1.5,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={32} color={isBundle ? '#1e293b' : '#db2777'} />
                            </Box>

                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a2035', mb: 1 }}>
                                {testName || 'Mock Test Package'}
                            </Typography>

                            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                                {isBundle ? 'Full access to curated series of tests with detailed analytics.' : 'Get an additional attempt with full analytics and feedback.'}
                            </Typography>

                            <Typography variant="h2" sx={{ fontWeight: 900, color: isBundle ? '#1e293b' : '#db2777', mb: 1 }}>
                                ₹{testPrice || '0'}
                            </Typography>

                            <Chip
                                label={isBundle ? "Best Value" : "Limited Time Offer"}
                                size="small"
                                sx={{
                                    bgcolor: isBundle ? '#1e293b15' : '#db277715',
                                    color: isBundle ? '#1e293b' : '#db2777',
                                    fontWeight: 800,
                                    mb: 3
                                }}
                            />

                            <Box sx={{ width: '100%' }}>
                                <Divider sx={{ mb: 3 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CheckCircle2 size={18} color={isBundle ? '#1e293b' : '#db2777'} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Unlimited Retakes</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CheckCircle2 size={18} color={isBundle ? '#1e293b' : '#db2777'} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>Detailed Analytics</Typography>
                                    </Box>
                                    {isBundle && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CheckCircle2 size={18} color={isBundle ? '#1e293b' : '#db2777'} />
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>All Included Tests</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    sx={{
                        bgcolor: isBundle ? '#1e293b' : '#db2777',
                        color: '#fff',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 4,
                        py: 1.2,
                        borderRadius: 3,
                        '&:hover': { bgcolor: isBundle ? '#0f172a' : '#be185d' },
                        '&:disabled': { bgcolor: '#CBD5E1', color: '#94a3b8' }
                    }}
                >
                    {isProcessing ? (
                        <>
                            <CircularProgress size={20} sx={{ color: '#fff', mr: 1 }} />
                            Processing...
                        </>
                    ) : (
                        'Continue to Pay'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export default PaymentDialog;

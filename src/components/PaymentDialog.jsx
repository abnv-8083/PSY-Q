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

const PaymentDialog = ({ open, onClose, testName, testPrice, onUnlock, user, testId, bundleId, isBundle, subjectId, testCount }) => {
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
            maxWidth="sm"
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
                p: 2.5,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5
            }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{isBundle ? 'Upgrade to Prime' : 'Unlock More Retakes'}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>{isBundle ? 'Instant access to premium content' : 'Select a package for your preparation'}</Typography>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <X size={20} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: { xs: 2.5, md: 4 }, bgcolor: '#f8fafc' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Paper
                            elevation={4}
                            sx={{
                                position: 'relative',
                                p: 3,
                                borderRadius: 5,
                                maxWidth: 340,
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: `1.5px solid ${isBundle ? '#1e293b20' : '#db277720'}`,
                                bgcolor: '#fff',
                            }}
                        >
                            <Box sx={{
                                mb: 1.5,
                                bgcolor: isBundle ? '#1e293b10' : '#db277710',
                                p: 1.2,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={24} color={isBundle ? '#1e293b' : '#db2777'} />
                            </Box>

                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a2035', mb: 0.5 }}>
                                {testName || 'Mock Test Package'}
                            </Typography>

                            <Typography variant="h3" sx={{ fontWeight: 900, color: isBundle ? '#1e293b' : '#db2777', mb: 1.5 }}>
                                ₹{testPrice || '0'}
                            </Typography>

                            <Chip
                                label={isBundle ? "Full 1 Year Access" : "Limited Time Offer"}
                                size="small"
                                sx={{
                                    bgcolor: isBundle ? '#1e293b' : '#db277715',
                                    color: isBundle ? '#fff' : '#db2777',
                                    fontWeight: 800,
                                    mb: 2.5,
                                    fontSize: '0.7rem',
                                    px: 1
                                }}
                            />

                            <Box sx={{ width: '100%' }}>
                                <Divider sx={{ mb: 2.5 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, alignItems: 'flex-start', px: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CheckCircle2 size={16} color={isBundle ? '#1e293b' : '#db2777'} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                                            {isBundle ? `Total ${testCount || 'All'} Premium Tests` : '1 Additional Reattempt'}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CheckCircle2 size={16} color={isBundle ? '#1e293b' : '#db2777'} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Detailed Result Analytics</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CheckCircle2 size={16} color={isBundle ? '#1e293b' : '#db2777'} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                                            {isBundle ? '365 Days Validity' : 'Instant Activation'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'center', gap: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        color: '#64748b',
                        borderColor: '#e2e8f0',
                        fontWeight: 700,
                        textTransform: 'none',
                        px: 3,
                        borderRadius: 2.5
                    }}
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
                        py: 1,
                        borderRadius: 2.5,
                        boxShadow: `0 4px 14px 0 ${isBundle ? 'rgba(30, 41, 59, 0.3)' : 'rgba(219, 39, 119, 0.3)'}`,
                        '&:hover': { bgcolor: isBundle ? '#0f172a' : '#be185d' },
                    }}
                >
                    {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


export default PaymentDialog;

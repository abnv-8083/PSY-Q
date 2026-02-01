import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Divider,
    CircularProgress,
    IconButton,
    Alert,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    ChevronRight,
    ChevronLeft,
    CreditCard,
    User,
    MapPin,
    ShoppingBag,
    CheckCircle2,
    ShieldCheck,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { initiateRazorpayPayment } from '../../utils/razorpay';

const steps = ['Identity', 'Address', 'Summary'];

const GuestCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeStep, setActiveStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(location.state || null);

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // If no purchase data, redirect back
        if (!orderData) {
            navigate('/academic/mocktest');
        }
    }, [orderData, navigate]);

    if (!orderData) return null;

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 0) {
            if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
            else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone number';
        } else if (step === 1) {
            if (!formData.address.trim()) newErrors.address = 'Street address is required';
            if (!formData.city.trim()) newErrors.city = 'City is required';
            if (!formData.state.trim()) newErrors.state = 'State is required';
            if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const calculateTax = (price) => Math.round(price * 0.18); // 18% GST example
    const tax = calculateTax(orderData.price);
    const total = orderData.price + tax;

    const handlePayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // Initiate Razorpay
            await initiateRazorpayPayment({
                amount: total,
                testName: orderData.name,
                testId: orderData.testId,
                bundleId: orderData.bundleId,
                isBundle: orderData.type === 'bundle',
                user: {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone
                },
                onSuccess: async (paymentData) => {
                    // Save guest order to Supabase
                    const orderEntries = orderData.type === 'multi'
                        ? orderData.items.map(item => ({
                            full_name: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            postal_code: formData.postalCode,
                            country: formData.country,
                            item_type: item.type,
                            item_id: item.type === 'bundle' ? item.bundleId : item.testId,
                            item_name: item.name,
                            amount: item.price,
                            tax_amount: calculateTax(item.price),
                            total_amount: item.price + calculateTax(item.price),
                            status: 'success',
                            payment_id: paymentData.paymentId
                        }))
                        : [{
                            full_name: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            postal_code: formData.postalCode,
                            country: formData.country,
                            item_type: orderData.type,
                            item_id: orderData.type === 'bundle' ? orderData.bundleId : orderData.testId,
                            item_name: orderData.name,
                            amount: orderData.price,
                            tax_amount: tax,
                            total_amount: total,
                            status: 'success',
                            payment_id: paymentData.paymentId
                        }];

                    const { error: dbError } = await supabase
                        .from('guest_orders')
                        .insert(orderEntries);

                    if (dbError) {
                        console.error('Error saving guest order:', dbError);
                        // Even if it fails to save, the payment happened. We should alert.
                    }

                    setIsProcessing(false);
                    // Redirect to success page or show success message
                    setActiveStep(steps.length); // Show custom success step
                },
                onFailure: (errMsg) => {
                    setError(errMsg || 'Payment failed. Please try again.');
                    setIsProcessing(false);
                }
            });
        } catch (err) {
            console.error('Checkout error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    const renderIdentityStep = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Contact Information</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        error={!!errors.fullName}
                        helperText={errors.fullName}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        helperText={errors.email}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                    />
                </Grid>
            </Grid>
        </motion.div>
    );

    const renderAddressStep = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Billing Address</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Street Address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        error={!!errors.address}
                        helperText={errors.address}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        error={!!errors.city}
                        helperText={errors.city}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="State / Province"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        error={!!errors.state}
                        helperText={errors.state}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Postal Code"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        error={!!errors.postalCode}
                        helperText={errors.postalCode}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Country"
                        name="country"
                        value={formData.country}
                        disabled
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        </motion.div>
    );

    const renderSummaryStep = () => (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Order Summary</Typography>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                {orderData.type === 'multi' ? (
                    orderData.items.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>{item.name}</Typography>
                            <Typography sx={{ fontWeight: 600 }}>₹{item.price}</Typography>
                        </Box>
                    ))
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography color="textSecondary">{orderData.type === 'bundle' ? 'Bundle' : 'Mock Test'}</Typography>
                        <Typography sx={{ fontWeight: 600 }}>{orderData.name}</Typography>
                    </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography color="textSecondary">Price</Typography>
                    <Typography sx={{ fontWeight: 600 }}>₹{orderData.price}</Typography>
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
                    Secure checkout powered by Razorpay. Your payment information is encrypted and safe.
                </Typography>
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
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a2035', mb: 2 }}>Payment Successful!</Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 500, mx: 'auto' }}>
                Thank you for your purchase. A confirmation email has been sent to **{formData.email}**. You can now proceed to take your mock test.
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
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8 0%, #fef2f2 100%)', pt: 4, pb: 8 }}>
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
                        Guest Checkout
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Left Side: Form */}
                    <Grid item xs={12} md={activeStep === steps.length ? 12 : 8}>
                        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                            {activeStep < steps.length && (
                                <>
                                    <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
                                        {steps.map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>

                                    {error && (
                                        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                                            {error}
                                        </Alert>
                                    )}

                                    {activeStep === 0 && renderIdentityStep()}
                                    {activeStep === 1 && renderAddressStep()}
                                    {activeStep === 2 && renderSummaryStep()}

                                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button
                                            disabled={activeStep === 0 || isProcessing}
                                            onClick={handleBack}
                                            startIcon={<ChevronLeft />}
                                            sx={{ fontWeight: 700, textTransform: 'none' }}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={activeStep === steps.length - 1 ? handlePayment : handleNext}
                                            disabled={isProcessing}
                                            endIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : (activeStep === steps.length - 1 ? <CreditCard /> : <ChevronRight />)}
                                            sx={{
                                                bgcolor: '#ca0056',
                                                py: 1.2,
                                                px: 4,
                                                borderRadius: 3,
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: '#b8003f' }
                                            }}
                                        >
                                            {activeStep === steps.length - 1 ? (isProcessing ? 'Processing...' : `Pay ₹${total}`) : 'Continue'}
                                        </Button>
                                    </Box>
                                </>
                            )}

                            {activeStep === steps.length && renderSuccessStep()}
                        </Paper>

                        {activeStep === 0 && (
                            <Paper sx={{ mt: 3, p: 3, borderRadius: 4, bgcolor: 'rgba(202, 0, 86, 0.05)', border: '1px solid rgba(202, 0, 86, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <User size={20} color="#ca0056" />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Already have an account?</Typography>
                                </Box>
                                <Button
                                    onClick={() => navigate('/student/signin')}
                                    sx={{ color: '#ca0056', fontWeight: 700, textTransform: 'none' }}
                                >
                                    Log in for faster checkout
                                </Button>
                            </Paper>
                        )}
                    </Grid>

                    {/* Right Side: Order Details Card (Only visible before success) */}
                    {activeStep < steps.length && (
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
                                        {orderData.type === 'multi' ? (
                                            orderData.items.map((item, idx) => (
                                                <Typography key={idx} variant="body2" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.3, mt: 0.5 }}>• {item.name}</Typography>
                                            ))
                                        ) : (
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{orderData.name}</Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Price Breakdown</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                            <Typography variant="body2">Subtotal</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{orderData.price}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                            <Typography variant="body2">Taxes</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{tax}</Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 3 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Grand Total</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#ca0056' }}>₹{total}</Typography>
                                    </Box>

                                    <Box sx={{ mt: 4, p: 2, bgcolor: '#f1f5f9', borderRadius: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                            <Sparkles size={16} color="#334155" />
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>BENEFITS</Typography>
                                        </Box>
                                        <Typography variant="caption" component="div" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <CheckCircle2 size={12} /> Instant Access after payment
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
    );
};

export default GuestCheckout;

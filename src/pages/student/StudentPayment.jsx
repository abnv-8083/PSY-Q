import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    Box,
    Container,
    Paper,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Stack,
    Divider,
    Breadcrumbs,
    Link
} from '@mui/material';
import { 
    ArrowLeft, CreditCard, CheckCircle, 
    XCircle, Clock, ChevronRight,
    Receipt, Calendar, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../../contexts/SessionContext';

const COLORS = {
    primary: '#1e293b',
    accent: '#ca0056',
    secondary: '#64748b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
};

const StudentPayment = () => {
    const navigate = useNavigate();
    const { studentUser, loading: sessionLoading } = useSession();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!studentUser) return;

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('userId', studentUser.id)
                    .order('createdAt', { ascending: false });

                if (error) {
                    // If the table doesn't exist yet or other error, we'll just set empty
                    console.warn('Payments fetch error (might be missing table):', error.message);
                    setPayments([]);
                } else {
                    setPayments(data || []);
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!sessionLoading) {
            if (!studentUser) {
                navigate('/student/signin');
            } else {
                fetchPayments();
            }
        }
    }, [studentUser, sessionLoading, navigate]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return <CheckCircle size={14} />;
            case 'failed':
                return <XCircle size={14} />;
            case 'pending':
                return <Clock size={14} />;
            default:
                return <AlertCircle size={14} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
                return COLORS.success;
            case 'failed':
                return COLORS.error;
            case 'pending':
                return COLORS.warning;
            default:
                return COLORS.secondary;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalSpent = payments
        .filter(p => p.status?.toLowerCase() === 'success')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    if (sessionLoading) {
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
                        <CreditCard size={14} /> Mock Test
                    </Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Payments</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1 }}>
                        Payment History
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.secondary, mt: 0.5 }}>
                        Manage and track all your mock test bundle transactions
                    </Typography>
                </Box>

                {/* Summary Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(202, 0, 86, 0.1)', color: COLORS.accent }}>
                                    <Receipt size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 700, textTransform: 'uppercase' }}>Total Investment</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>₹{totalSpent}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.1)', color: COLORS.success }}>
                                    <CheckCircle size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 700, textTransform: 'uppercase' }}>Successful Plans</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>
                                        {payments.filter(p => p.status?.toLowerCase() === 'success').length}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(245, 158, 11, 0.1)', color: COLORS.warning }}>
                                    <Calendar size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 700, textTransform: 'uppercase' }}>Last Transaction</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>
                                        {payments.length > 0 ? new Date(payments[0].createdAt).toLocaleDateString() : 'None'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Transactions Table */}
                <Paper elevation={0} sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary }}>
                            Transactions
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <CircularProgress size={30} sx={{ color: COLORS.accent }} />
                        </Box>
                    ) : payments.length === 0 ? (
                        <Box sx={{ py: 10, textAlign: 'center', color: COLORS.secondary }}>
                            <Receipt size={48} strokeWidth={1.5} opacity={0.3} style={{ marginBottom: 16 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No transactions yet</Typography>
                            <Typography variant="body2">Your purchased bundles and tests will appear here.</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Details</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: COLORS.secondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary }}>
                                                    {payment.testName || 'Bundle Subscription'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: COLORS.secondary }}>
                                                    Lifetime Access
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.primary }}>
                                                    ₹{payment.amount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: COLORS.secondary }}>
                                                    {formatDate(payment.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: 1, 
                                                    px: 1.5, 
                                                    py: 0.5, 
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    bgcolor: `${getStatusColor(payment.status)}10`,
                                                    color: getStatusColor(payment.status)
                                                }}>
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status?.toUpperCase()}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: COLORS.secondary }}>
                                                    {payment.paymentId?.substring(0, 12)}...
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default StudentPayment;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
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
    CircularProgress
} from '@mui/material';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentPayment = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user) return;

            try {
                const paymentsRef = collection(db, 'payments');
                const q = query(
                    paymentsRef,
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const paymentData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setPayments(paymentData);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle size={18} color="#10b981" />;
            case 'failed':
                return <XCircle size={18} color="#ef4444" />;
            case 'pending':
                return <Clock size={18} color="#f59e0b" />;
            default:
                return <Clock size={18} color="#94a3b8" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'success';
            case 'failed':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalSpent = payments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)', py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => navigate('/academic/mocktest')} sx={{ mr: 2 }}>
                        <ArrowLeft />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                            Payment History
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                            View all your payment transactions
                        </Typography>
                    </Box>
                </Box>

                {/* Summary Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                                        Total Spent
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 1 }}>
                                        ₹{totalSpent}
                                    </Typography>
                                </Box>
                                <CreditCard size={40} color="rgba(255,255,255,0.8)" />
                            </Box>
                        </Paper>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                Total Transactions
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 800, mt: 1 }}>
                                {payments.length}
                            </Typography>
                        </Paper>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                Successful Payments
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 800, mt: 1 }}>
                                {payments.filter(p => p.status === 'success').length}
                            </Typography>
                        </Paper>
                    </motion.div>
                </Box>

                {/* Payment Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Transaction History
                            </Typography>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#ec4899' }} />
                            </Box>
                        ) : payments.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CreditCard size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
                                <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 600 }}>
                                    No Payment History
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                                    Your payment transactions will appear here
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Test Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Payment ID</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Amount</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {payments.map((payment, index) => (
                                            <TableRow
                                                key={payment.id}
                                                sx={{
                                                    '&:hover': { bgcolor: '#f8fafc' },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                        {formatDate(payment.createdAt)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                                        {payment.testName || 'Mock Test'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#64748b', fontSize: '12px' }}>
                                                        {payment.paymentId || payment.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                        ₹{payment.amount || 0}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={getStatusIcon(payment.status)}
                                                        label={payment.status?.toUpperCase() || 'PENDING'}
                                                        color={getStatusColor(payment.status)}
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </motion.div>

                {/* Help Text */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        For payment issues or refunds, please contact support at{' '}
                        <a href="mailto:support@psy-q.com" style={{ color: '#ec4899', textDecoration: 'none', fontWeight: 600 }}>
                            support@psy-q.com
                        </a>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default StudentPayment;

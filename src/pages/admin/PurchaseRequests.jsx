import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Alert, TextField, InputAdornment, MenuItem,
    Select, FormControl, InputLabel, Grid
} from '@mui/material';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { fetchAllPurchaseRequests, updatePurchaseRequestStatus } from '../../api/purchaseRequestsApi';

const COLORS = {
    primary: '#1e293b',
    secondary: '#4b5563',
    accent: '#ca0056',
    border: '#e2e8f0',
};

const PurchaseRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // Helper to format hex UUID string into 8-digit numeric ID
    const formatRequestId = (rawId, requestNumber) => {
        if (requestNumber) return requestNumber;
        if (!rawId) return 'N/A';
        
        // Take first 8 chars of hex, convert to decimal, take last 8 digits
        const hex = rawId.includes('-') ? rawId.split('-')[0] : rawId.substring(0, 8);
        const num = parseInt(hex, 16);
        return num.toString().slice(-8).padStart(8, '0');
    };
    
    // Search and Filter specific state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const loadRequests = async () => {
        try {
            setLoading(true);
            // 1. Fetch Requests (Now hits the secure Express backend)
            const data = await fetchAllPurchaseRequests();
            
            // 2. Enriched Data (Items mapping)
            // The backend already joined 'students(full_name, email, phone)'. 
            // We just need to map bundle/test names.
            const enrichedData = await Promise.all(data.map(async (req) => {
                let itemName = 'Unknown Item';
                try {
                    if (req.item_type === 'bundle') {
                        const { data: bData } = await supabase.from('bundles').select('name').eq('id', req.item_id).single();
                        if (bData) itemName = bData.name;
                    } else {
                        const { data: tData } = await supabase.from('tests').select('name').eq('id', req.item_id).single();
                        if (tData) itemName = tData.name;
                    }
                } catch (err) { console.error("Item info error", err); }
                
                return { 
                    ...req,
                    id: req.id || req._id, // Map Mongoose _id to id securely
                    item_name: itemName,
                    student: (typeof req.user_id === 'object' ? req.user_id : null) || req.students // DB join injects it as 'user_id' in Mongo
                };
            }));

            setRequests(enrichedData);
            // setFilteredRequests(enrichedData); // This line was in the instruction but setFilteredRequests is not defined.
                                                // Assuming it was a typo or intended for a different state variable.
                                                // Keeping it commented out to avoid runtime errors.
        } catch (err) {
            console.error("Error loading purchase requests:", err);
            setError("Failed to load purchase requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (request) => {
        if (!window.confirm(`Approve access for ${userEmail(request)} to ${request.item_name}?`)) return;
        
        setProcessingId(request.id);
        setError(null);
        try {
            // Backend handles granting access and updating status securely
            await updatePurchaseRequestStatus(request.id, 'approved');
            
            // Reload list
            loadRequests();
        } catch (err) {
            console.error("Error approving request:", err);
            setError("Failed to approve request. Please try again.");
            setProcessingId(null);
        }
    };

    const handleReject = async (request) => {
        if (!window.confirm(`Reject access request from ${userEmail(request)}?`)) return;
        
        setProcessingId(request.id);
        setError(null);
        try {
            await updatePurchaseRequestStatus(request.id, 'rejected');
            loadRequests();
        } catch (err) {
            console.error("Error rejecting request:", err);
            setError("Failed to reject request. Please try again.");
            setProcessingId(null);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'approved': return <Chip size="small" icon={<CheckCircle size={14} />} label="Approved" color="success" />;
            case 'rejected': return <Chip size="small" icon={<XCircle size={14} />} label="Rejected" color="error" />;
            case 'pending':
            default: return <Chip size="small" icon={<Clock size={14} />} label="Pending" color="warning" />;
        }
    };

    const userEmail = (req) => req.student?.email || req.students?.email || (typeof req.user_id === 'string' ? req.user_id : 'Unknown');

    const filteredRequests = requests.filter(req => {
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        const searchLower = searchTerm.toLowerCase();
        const displayId = formatRequestId(req.id, req.request_number);
        const matchesSearch = 
            displayId.includes(searchLower) ||
            (req.student?.full_name || req.students?.full_name || '').toLowerCase().includes(searchLower) ||
            (req.student?.email || '').toLowerCase().includes(searchLower) ||
            req.item_name.toLowerCase().includes(searchLower);
            
        return matchesStatus && matchesSearch;
    });

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 900, color: COLORS.primary }}>
                Purchase Requests
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.secondary, mb: 4 }}>
                Review and approve student course requests generated via WhatsApp.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Filters & Search */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={8} md={9}>
                        <TextField
                            fullWidth
                            placeholder="Search by Request ID, Name, Email or Item..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={20} color={COLORS.secondary} />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: 2 }}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Filter size={18} color={COLORS.secondary} />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Request ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Item Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Item Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6, color: COLORS.secondary }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>No purchase requests found.</Typography>
                                    <Typography variant="body2">Try adjusting your filters or search term.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 0.5, borderRadius: 1, fontWeight: 700, fontSize: '0.85rem', color: COLORS.accent }}>
                                            {formatRequestId(row.id, row.request_number)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: row.student?.email ? COLORS.primary : COLORS.secondary }}>
                                            {row.student?.email || `Student Record Missing`}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            {row.student?.full_name || (typeof row.user_id === 'string' ? `ID: ${row.user_id.substring(0,18)}...` : 'Anonymous User')}
                                        </Typography>
                                        {row.student?.phone && (
                                            <Typography 
                                                variant="caption" 
                                                component="a"
                                                href={`https://wa.me/${row.student.phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ 
                                                    color: COLORS.accent, 
                                                    textDecoration: 'none',
                                                    fontWeight: 600,
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                {row.student.phone}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="small" label={row.item_type.toUpperCase()} variant="outlined" />
                                    </TableCell>
                                    <TableCell>{row.item_name}</TableCell>
                                    <TableCell>{getStatusChip(row.status)}</TableCell>
                                    <TableCell align="right">
                                        {row.status === 'pending' && (
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                {processingId === row.id ? <CircularProgress size={20} /> : (
                                                    <>
                                                        <Button 
                                                            variant="contained" 
                                                            color="success" 
                                                            size="small"
                                                            onClick={() => handleApprove(row)}
                                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            variant="outlined" 
                                                            color="error" 
                                                            size="small"
                                                            onClick={() => handleReject(row)}
                                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default PurchaseRequests;

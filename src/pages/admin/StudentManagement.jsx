import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    Alert,
    alpha,
    CircularProgress,
    Avatar,
    Tooltip
} from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import {
    User, Search, Trash2, UserCheck,
    Calendar, Phone, Mail, Filter, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
    primary: '#1e293b',
    accent: '#ca0056',
    background: '#fdf2f8',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
};

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Modal States

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Config - Matches Edge Function check
    const ADMIN_API_KEY = 'psyq_admin_secret_2024';

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase.functions.invoke('create-admin?type=students', {
                method: 'GET',
                headers: {
                    'x-admin-api-key': ADMIN_API_KEY
                }
            });

            if (fetchError) throw fetchError;
            setStudents(data || []);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Failed to load students. Make sure database RLS and Edge Function are synced.');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };



    const handleDeleteStudent = async (student) => {
        if (!window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY delete student ${student.full_name}? This will remove all their data. This action cannot be undone.`)) return;

        setActionLoading(true);
        try {
            const { error: deleteError } = await supabase.functions.invoke(`create-admin?id=${student.id}&table=students`, {
                method: 'DELETE',
                headers: {
                    'x-admin-api-key': ADMIN_API_KEY
                }
            });

            if (deleteError) throw deleteError;

            setSuccess('Student deleted successfully.');
            fetchStudents();
        } catch (err) {
            console.error('Delete Error:', err);
            setError('Failed to delete student.');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredAndSortedStudents = students
        .filter(s =>
            s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            if (sortConfig.direction === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });

    return (
        <Box sx={{ p: { xs: 3, md: 6 } }}>
            {/* Header Area */}
            <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 3 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>
                        Student Management
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                        View, manage, and monitor all registered students.
                    </Typography>
                </Box>
                <Paper sx={{ p: 1, borderRadius: 3, display: 'flex', alignItems: 'center', bgcolor: 'white', border: `1px solid ${COLORS.border}`, minWidth: 350 }}>
                    <Search size={20} color={COLORS.textLight} style={{ marginLeft: 12 }} />
                    <TextField
                        fullWidth
                        placeholder="Search by name or email..."
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            disableUnderline: true,
                            sx: { px: 2, fontWeight: 600 }
                        }}
                    />
                </Paper>
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 4, border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(COLORS.primary, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Student Detail</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Contact Info</TableCell>
                            <TableCell sx={{ fontWeight: 800, cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Joined Date <ArrowUpDown size={14} />
                                </Box>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress color="inherit" /></TableCell></TableRow>
                        ) : filteredAndSortedStudents.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>No students found</TableCell></TableRow>
                        ) : (
                            filteredAndSortedStudents.map((student) => (
                                <TableRow key={student.id} sx={{ '&:hover': { bgcolor: alpha(COLORS.primary, 0.01) } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent, fontWeight: 900 }}>
                                                {student.full_name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{student.full_name}</Typography>
                                                <Typography variant="caption" sx={{ color: COLORS.textLight, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Mail size={12} /> {student.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Phone size={14} color={COLORS.textLight} /> {student.phone || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                                            {new Date(student.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label="Active"
                                            size="small"
                                            color="success"
                                            icon={<UserCheck size={14} />}
                                            sx={{ fontWeight: 800, px: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <Tooltip title="Permanently Delete">
                                                <IconButton onClick={() => handleDeleteStudent(student)} size="small" color="error">
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
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

export default StudentManagement;

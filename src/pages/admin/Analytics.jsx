import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    alpha,
    Card,
    CardContent,
    Stack,
    Divider,
    Avatar,
    Chip,
    Tooltip,
    Autocomplete,
    TextField as MuiTextField,
    Modal,
    IconButton as MuiIconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Users,
    CreditCard,
    FileText,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Activity,
    Calendar,
    Award,
    X,
    ExternalLink
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

const COLORS = {
    primary: '#0f172a',
    secondary: '#4b5563',
    accent: '#ca0056',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    textLight: '#64748b',
    border: '#e2e8f0',
    chart: ['#ca0056', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
};

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRevenue: 0,
        totalAttempts: 0,
        activeBundles: 0,
        userGrowth: [],
        revenueTrends: [],
        testPopularity: [],
        recentPayments: [],
        recentSignups: []
    });

    // User Analysis State
    const [userSearchText, setUserSearchText] = useState('');
    const [userOptions, setUserOptions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [userLoading, setUserLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            // 1. Total Users
            const { count: userCount } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true });

            // 2. Total Revenue & Recent Payments
            const { data: payments } = await supabase
                .from('payments')
                .select('*')
                .eq('status', 'captured')
                .order('created_at', { ascending: false });

            const totalRev = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

            // 3. Total Attempts
            const { count: attemptCount } = await supabase
                .from('attempts')
                .select('*', { count: 'exact', head: true });

            // 4. Active Bundles
            const { count: bundleCount } = await supabase
                .from('user_bundles')
                .select('*', { count: 'exact', head: true });

            // 5. User Growth (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: recentUsers } = await supabase
                .from('students')
                .select('created_at')
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            const growthData = processGrowthData(recentUsers, 30);

            // 6. Revenue Trends
            const revenueData = processRevenueData(payments, 30);

            // 7. Test Popularity
            const { data: attemptsWithTests } = await supabase
                .from('attempts')
                .select('test_id, tests(id, name)')
                .order('created_at', { ascending: false });

            const popularityData = processPopularityData(attemptsWithTests);

            // 8. Recent Activities
            const { data: latestSignups } = await supabase
                .from('students')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                totalUsers: userCount || 0,
                totalRevenue: totalRev,
                totalAttempts: attemptCount || 0,
                activeBundles: bundleCount || 0,
                userGrowth: growthData,
                revenueTrends: revenueData,
                testPopularity: popularityData,
                recentPayments: payments?.slice(0, 5) || [],
                recentSignups: latestSignups || []
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSearch = async (val) => {
        setUserSearchText(val);
        if (val.length < 2) return;

        try {
            const { data } = await supabase
                .from('students')
                .select('id, full_name, email')
                .or(`full_name.ilike.%${val}%,email.ilike.%${val}%`)
                .limit(5);
            setUserOptions(data || []);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const fetchUserAnalytics = async (user) => {
        setUserLoading(true);
        setSelectedUser(user);
        setModalOpen(true);
        try {
            // 1. Fetch user attempts
            const { data: attempts } = await supabase
                .from('attempts')
                .select('*, tests(name)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            // 2. Fetch user bundles
            const { data: bundles } = await supabase
                .from('user_bundles')
                .select('*, bundles(*)')
                .eq('user_id', user.id);

            // 3. Process attempt trends
            const trends = attempts?.map(a => ({
                date: new Date(a.created_at).toLocaleDateString(),
                score: a.score,
                total: a.total_questions,
                percentage: Math.round((a.score / (a.total_questions || 1)) * 100),
                test: a.tests?.name || 'Unknown'
            })) || [];

            setUserAnalytics({
                attempts: attempts || [],
                bundles: bundles || [],
                trends: trends,
                totalTests: attempts?.length || 0,
                avgScore: attempts?.length ? Math.round(attempts.reduce((sum, a) => sum + ((a.score / (a.total_questions || 1)) * 100), 0) / attempts.length) : 0
            });
        } catch (error) {
            console.error('Error fetching user analytics:', error);
        } finally {
            setUserLoading(false);
        }
    };

    const processGrowthData = (users, days) => {
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const count = users?.filter(u => {
                const uDate = new Date(u.created_at);
                return uDate.toDateString() === date.toDateString();
            }).length || 0;

            data.push({ name: dateStr, users: count });
        }
        return data;
    };

    const processRevenueData = (payments, days) => {
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const amount = payments?.filter(p => {
                const pDate = new Date(p.created_at);
                return pDate.toDateString() === date.toDateString();
            }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

            data.push({ name: dateStr, amount: amount });
        }
        return data;
    };

    const processPopularityData = (attempts) => {
        const counts = {};
        attempts?.forEach(a => {
            const name = a.tests?.name || 'Unknown Test';
            counts[name] = (counts[name] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    };

    const StatCard = ({ title, value, icon: Icon, trend, color }) => (
        <Paper sx={{
            p: 4,
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: `0 20px 40px ${alpha(color, 0.1)}`,
                borderColor: alpha(color, 0.3)
            }
        }}>
            <Box sx={{ position: 'absolute', top: -15, right: -15, opacity: 0.1 }}>
                <Icon size={120} color={color} />
            </Box>
            <Stack spacing={2}>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: alpha(color, 0.1), color: color, width: 'fit-content' }}>
                    <Icon size={28} />
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', mb: 0.5 }}>{title}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                        {typeof value === 'number' && title.includes('Revenue') ? `₹${value.toLocaleString()}` : value.toLocaleString()}
                    </Typography>
                </Box>
                {trend && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{
                        color: trend > 0 ? COLORS.success : COLORS.error,
                        bgcolor: alpha(trend > 0 ? COLORS.success : COLORS.error, 0.1),
                        width: 'fit-content',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2
                    }}>
                        {trend > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{Math.abs(trend)}%</Typography>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress sx={{ color: COLORS.accent }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 3, md: 6 } }}>
            {/* Header */}
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1, mb: 1 }}>
                        Platform <Box component="span" sx={{ color: COLORS.accent }}>Analytics</Box>
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 500 }}>
                        Real-time insights into your platform's growth and performance
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                    <Autocomplete
                        sx={{ width: 300 }}
                        options={userOptions}
                        getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                        onInputChange={(e, val) => handleUserSearch(val)}
                        onChange={(e, user) => user && fetchUserAnalytics(user)}
                        renderInput={(params) => (
                            <MuiTextField
                                {...params}
                                label="Search Students..."
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} color={COLORS.textLight} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3, bgcolor: 'white' }
                                }}
                            />
                        )}
                    />
                    <Chip icon={<Calendar size={14} />} label="Last 30 Days" sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0', height: 40 }} />
                </Stack>
            </Box>

            {/* Stats Overview */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#6366f1" trend={12} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Revenue" value={stats.totalRevenue} icon={CreditCard} color="#10b981" trend={8} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Test Attempts" value={stats.totalAttempts} icon={FileText} color="#f59e0b" trend={24} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Active Subscriptions" value={stats.activeBundles} icon={Activity} color="#ec4899" trend={5} />
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                {/* User Growth Chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 5, borderRadius: 7, border: '1px solid #e2e8f0', minHeight: 550, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>User Signups</Typography>
                                <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>Daily registration metrics</Typography>
                            </Box>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent }}>
                                <TrendingUp size={20} />
                            </Box>
                        </Stack>
                        <Box sx={{ height: 400, width: '100%', mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.userGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={12} fontWeight={600} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={12} fontWeight={600} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke={COLORS.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Popular Tests Chart */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 5, borderRadius: 7, border: '1px solid #e2e8f0', minHeight: 550, boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>Top Performing Tests</Typography>
                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600, display: 'block', mb: 5 }}>Most attempted mock tests</Typography>

                        <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.testPopularity}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.testPopularity.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            <Stack spacing={1.5} sx={{ mt: 3 }}>
                                {stats.testPopularity.map((test, index) => (
                                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.chart[index % COLORS.chart.length] }} />
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.secondary }}>{test.name}</Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.primary }}>{test.value}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>

                {/* Revenue Growth Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 5, borderRadius: 7, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 5 }}>Revenue Trends (₹)</Typography>
                        <Box sx={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.revenueTrends}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" fontSize={11} fontWeight={600} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={11} fontWeight={600} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                    />
                                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Signups Table */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 5, borderRadius: 7, border: '1px solid #e2e8f0', height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 4 }}>Recent User Registrations</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>USER</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }}>DATE</TableCell>
                                        <TableCell sx={{ fontWeight: 800, color: COLORS.textLight }} align="right">SOURCE</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.recentSignups.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.accent, fontSize: '0.8rem', fontWeight: 800 }}>
                                                        {user.full_name?.charAt(0) || 'U'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.full_name || 'Guest User'}</Typography>
                                                        <Typography variant="caption" sx={{ color: COLORS.textLight }}>{user.email || 'No email'}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: COLORS.secondary, fontSize: '0.8rem' }}>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip label="Member" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* User Detail Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
            >
                <Paper sx={{
                    width: '100%',
                    maxWidth: 1000,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: 6,
                    position: 'relative',
                    p: 0,
                    bgcolor: '#f8fafc'
                }}>
                    {userLoading ? (
                        <Box sx={{ p: 10, textAlign: 'center' }}>
                            <CircularProgress sx={{ color: COLORS.accent }} />
                            <Typography sx={{ mt: 2, fontWeight: 700 }}>Loading User Data...</Typography>
                        </Box>
                    ) : userAnalytics && (
                        <>
                            {/* Modal Header */}
                            <Box sx={{ p: 4, bgcolor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Avatar sx={{ width: 64, height: 64, bgcolor: COLORS.accent, fontSize: '1.5rem', fontWeight: 900 }}>
                                            {selectedUser?.full_name?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary }}>{selectedUser?.full_name}</Typography>
                                            <Typography variant="body1" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{selectedUser?.email}</Typography>
                                        </Box>
                                    </Stack>
                                    <MuiIconButton onClick={() => setModalOpen(false)} sx={{ bgcolor: '#f1f5f9' }}>
                                        <X size={20} />
                                    </MuiIconButton>
                                </Stack>
                            </Box>

                            <Box sx={{ p: 4 }}>
                                {/* User Stats */}
                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} sm={4}>
                                        <Paper sx={{ p: 3, borderRadius: 4, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textLight, textTransform: 'uppercase' }}>Total Attempts</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary }}>{userAnalytics.totalTests}</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Paper sx={{ p: 3, borderRadius: 4, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textLight, textTransform: 'uppercase' }}>Average Accuracy</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.success }}>{userAnalytics.avgScore}%</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Paper sx={{ p: 3, borderRadius: 4, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textLight, textTransform: 'uppercase' }}>Active Bundles</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.accent }}>{userAnalytics.bundles.length}</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={4}>
                                    {/* Score Trend */}
                                    <Grid item xs={12} md={7}>
                                        <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', minHeight: 400 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Performance Trend</Typography>
                                            <Box sx={{ height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={userAnalytics.trends}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="date" fontSize={11} fontWeight={600} tick={{ fill: COLORS.textLight }} />
                                                        <YAxis domain={[0, 100]} fontSize={11} fontWeight={600} tick={{ fill: COLORS.textLight }} />
                                                        <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                                        <Line type="monotone" dataKey="percentage" stroke={COLORS.accent} strokeWidth={4} dot={{ r: 6, fill: COLORS.accent, strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    {/* Test History */}
                                    <Grid item xs={12} md={5}>
                                        <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', height: '100%' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Recent Tests</Typography>
                                            <Stack spacing={2}>
                                                {userAnalytics.attempts.slice().reverse().slice(0, 5).map((attempt, i) => (
                                                    <Box key={i} sx={{ p: 2, borderRadius: 3, bgcolor: 'white', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{attempt.tests?.name}</Typography>
                                                            <Typography variant="caption" sx={{ color: COLORS.textLight }}>{new Date(attempt.created_at).toLocaleDateString()}</Typography>
                                                        </Box>
                                                        <Chip
                                                            label={`${Math.round((attempt.score / (attempt.total_questions || 1)) * 100)}%`}
                                                            size="small"
                                                            sx={{ fontWeight: 900, bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent }}
                                                        />
                                                    </Box>
                                                ))}
                                                {userAnalytics.attempts.length === 0 && (
                                                    <Typography variant="body2" sx={{ color: COLORS.textLight, textAlign: 'center', py: 4 }}>No test attempts yet</Typography>
                                                )}
                                            </Stack>
                                        </Paper>
                                    </Grid>

                                    {/* Purchased Bundles */}
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Subscribed Bundles</Typography>
                                            <Grid container spacing={2}>
                                                {userAnalytics.bundles.map((ub, i) => (
                                                    <Grid item xs={12} sm={6} md={4} key={i}>
                                                        <Box sx={{ p: 2, borderRadius: 3, border: `1px solid ${alpha(COLORS.success, 0.2)}`, bgcolor: alpha(COLORS.success, 0.02), display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Award color={COLORS.success} size={24} />
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{ub.bundles?.name}</Typography>
                                                                <Typography variant="caption" sx={{ color: COLORS.textLight }}>Purchased on {new Date(ub.created_at).toLocaleDateString()}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                                {userAnalytics.bundles.length === 0 && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" sx={{ color: COLORS.textLight, textAlign: 'center', py: 2 }}>No active bundles</Typography>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    )}
                </Paper>
            </Modal>
        </Box>
    );
};

export default Analytics;

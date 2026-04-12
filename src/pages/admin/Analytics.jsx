import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Grid, CircularProgress, alpha, Card, CardContent, Stack, Divider,
    Avatar, Chip, Tooltip, Autocomplete, TextField as MuiTextField, Modal,
    IconButton as MuiIconButton, InputAdornment, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tabs, Tab, Button
} from '@mui/material';
import {
    Users, CreditCard, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, Search, 
    Filter, Activity, Calendar, Award, X, ExternalLink, PieChart as PieIcon, 
    BarChart as BarIcon, Target, Zap, LayoutDashboard, Clock, CheckCircle2, 
    AlertCircle, Download, RefreshCw, Layers
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const COLORS = {
    primary: '#0f172a',
    secondary: '#4b5563',
    accent: '#ca0056',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f8fafc',
    textLight: '#64748b',
    border: '#e2e8f0',
    indigo: '#6366f1',
    chart: ['#6366f1', '#ca0056', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']
};

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 2, borderRadius: 3, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(5px)' }}>
                <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, mb: 1, display: 'block' }}>{label}</Typography>
                {payload.map((entry, index) => (
                    <Stack key={index} direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.primary }}>{entry.name}:</Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: entry.color }}>{prefix}{entry.value.toLocaleString()}</Typography>
                    </Stack>
                ))}
            </Paper>
        );
    }
    return null;
};

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRevenue: 0,
        totalAttempts: 0,
        activeBundles: 0,
        userGrowth: [],
        revenueTrends: [],
        testPopularity: [],
        subjectPerformance: [],
        revenueByBundle: [],
        dailyActiveUsers: [],
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
            const res = await fetch(`${API_URL}/admin/analytics/stats`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            const data = json.data;

            // Process Data
            const growthData = processGrowthData(data.recentSignups, 30);
            const revenueData = processRevenueData(data.payments, 30);
            const popularityData = processPopularityData(data.allResults);
            const bundleRevData = processBundleRevenue(data.payments);
            const subjectPerfData = processSubjectPerformance(data.allResults, data.subjectsMap);
            const dauData = processDAU(data.allResults, 30);

            setStats({
                totalUsers: data.totalUsers || 0,
                totalRevenue: data.totalRevenue || 0,
                totalAttempts: data.totalAttempts || 0,
                activeBundles: data.activeBundles || 0,
                userGrowth: growthData,
                revenueTrends: revenueData,
                testPopularity: popularityData,
                revenueByBundle: bundleRevData,
                subjectPerformance: subjectPerfData,
                dailyActiveUsers: dauData,
                recentPayments: data.payments?.slice(0, 5) || [],
                recentSignups: data.recentSignups || []
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const processBundleRevenue = (payments) => {
        const bundles = {};
        payments?.forEach(p => {
            const name = p.bundles?.name || (p.type === 'bundle' ? 'Package Sales' : 'Direct Access');
            bundles[name] = (bundles[name] || 0) + (p.amount || 0);
        });
        return Object.entries(bundles)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    const processSubjectPerformance = (attempts, subjectsMap) => {
        const subjects = {};
        attempts?.forEach(a => {
            const subjectId = a.test_id?.subject_id;
            const name = subjectsMap?.[subjectId] || 'Uncategorized';
            if (!subjects[name]) subjects[name] = { totalScore: 0, totalQuestions: 0, count: 0 };

            subjects[name].totalScore += a.score || 0;
            subjects[name].totalQuestions += a.total_questions || a.answers?.length || 1;
            subjects[name].count += 1;
        });

        return Object.entries(subjects).map(([name, data]) => ({
            subject: name,
            accuracy: Math.round((data.totalScore / (data.totalQuestions || 1)) * 100),
            fullMark: 100
        }));
    };

    const processDAU = (attempts, days) => {
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const count = new Set(attempts?.filter(a => {
                const aDate = new Date(a.created_at);
                return aDate.toDateString() === date.toDateString();
            }).map(a => a.user_id)).size;

            data.push({ name: dateStr, active: count });
        }
        return data;
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
            const name = a.test_id?.name || 'Unknown Test';
            counts[name] = (counts[name] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    };

    const handleUserSearch = async (val) => {
        setUserSearchText(val);
        if (val.length < 2) return;

        try {
            const res = await fetch(`${API_URL}/admin/analytics/search?query=${val}`);
            const json = await res.json();
            setUserOptions(json.data || []);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const fetchUserAnalytics = async (user) => {
        setUserLoading(true);
        setSelectedUser(user);
        setModalOpen(true);
        try {
            const userId = user._id || user.id;
            const res = await fetch(`${API_URL}/admin/analytics/users/${userId}`);
            const json = await res.json();
            const data = json.data;

            const trends = data.attempts?.map(a => ({
                date: new Date(a.created_at).toLocaleDateString(),
                score: a.score,
                total: a.total_questions || a.answers?.length || 1,
                time: Math.round((a.time_spent || 0) / 60), // in minutes
                percentage: Math.round((a.score / (a.total_questions || a.answers?.length || 1)) * 100),
                test: a.test_id?.name || 'Unknown'
            })) || [];

            setUserAnalytics({
                attempts: data.attempts || [],
                bundles: data.bundles || [],
                trends: trends,
                totalTests: data.attempts?.length || 0,
                avgScore: data.attempts?.length ? Math.round(trends.reduce((sum, t) => sum + t.percentage, 0) / trends.length) : 0,
                avgTime: data.attempts?.length ? Math.round(trends.reduce((sum, t) => sum + t.time, 0) / trends.length) : 0
            });
        } catch (error) {
            console.error('Error fetching user analytics:', error);
        } finally {
            setUserLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }) => (
        <Paper sx={{
            p: 4, borderRadius: 7, border: '1px solid #e2e8f0', height: '100%', position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, white 0%, ${alpha(color, 0.05)} 100%)`, 
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: `0 30px 60px ${alpha(color, 0.15)}`,
                borderColor: alpha(color, 0.4)
            }
        }}>
            <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.1, color: color }}>
                <Icon size={120} />
            </Box>
            <Stack spacing={3}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color, width: 'fit-content', boxShadow: `0 8px 16px ${alpha(color, 0.1)}` }}>
                    <Icon size={32} />
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', mb: 1 }}>{title}</Typography>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -1, fontSize: { xs: '2.5rem', md: '2.8rem' } }}>
                        {typeof value === 'number' && (title.includes('Revenue') || title.includes('Price')) ? `₹${value.toLocaleString()}` : value.toLocaleString()}
                    </Typography>
                    {subtitle && <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{subtitle}</Typography>}
                </Box>
                {trend && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{
                        color: trend > 0 ? COLORS.success : COLORS.error,
                        bgcolor: alpha(trend > 0 ? COLORS.success : COLORS.error, 0.1),
                        width: 'fit-content', px: 2, py: 0.8, borderRadius: 3
                    }}>
                        {trend > 0 ? <TrendingUp size={18} /> : <ArrowDownRight size={18} />}
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>{Math.abs(trend)}%</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700 }}>v/s last mo</Typography>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress thickness={5} size={60} sx={{ color: COLORS.accent }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textLight }}>Initializing Intelligence Engine...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 3, md: 6 }, bgcolor: COLORS.background }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                {/* Header */}
                <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 4 }}>
                    <Box>
                        <Typography variant="h2" sx={{ fontWeight: 940, color: COLORS.primary, letterSpacing: -2, mb: 1 }}>
                            Intelligence <Box component="span" sx={{ color: COLORS.accent }}>Matrix</Box>
                        </Typography>
                        <Typography variant="h6" sx={{ color: COLORS.textLight, fontWeight: 600, maxWidth: 600 }}>
                            Predictive insights and real-time behavioral analytics for the Psy-Q ecosystem.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ bgcolor: 'white', p: 1, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                        <Autocomplete
                            sx={{ width: 350 }}
                            options={userOptions}
                            getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                            onInputChange={(e, val) => handleUserSearch(val)}
                            onChange={(e, user) => user && fetchUserAnalytics(user)}
                            popupIcon={null}
                            renderInput={(params) => (
                                <MuiTextField
                                    {...params}
                                    placeholder="Search Student DNA..."
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={20} color={COLORS.accent} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 3, '& fieldset': { border: 'none' }, fontWeight: 700 }
                                    }}
                                />
                            )}
                        />
                        <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
                        <Button startIcon={<RefreshCw size={18} />} onClick={fetchAnalyticsData} sx={{ color: COLORS.primary, fontWeight: 800, textTransform: 'none', px: 3 }}>Refresh</Button>
                    </Stack>
                </Box>

                {/* Navigation Tabs */}
                <Paper sx={{ mb: 6, borderRadius: 5, bgcolor: '#ffffff', p: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, val) => setActiveTab(val)}
                        sx={{
                            '& .MuiTabs-indicator': { display: 'none' },
                            '& .MuiTab-root': {
                                borderRadius: 4, fontWeight: 800, textTransform: 'none', minHeight: 56, transition: 'all 0.3s', p: 3,
                                '&.Mui-selected': { bgcolor: COLORS.primary, color: 'white', boxShadow: `0 12px 24px ${alpha(COLORS.primary, 0.2)}` },
                                '&:hover:not(.Mui-selected)': { bgcolor: alpha(COLORS.primary, 0.05) }
                            }
                        }}
                    >
                        <Tab label="Command Center" icon={<LayoutDashboard size={20} />} iconPosition="start" />
                        <Tab label="Financial Pulse" icon={<CreditCard size={20} />} iconPosition="start" />
                        <Tab label="Academic Velocity" icon={<Activity size={20} />} iconPosition="start" />
                        <Tab label="Recent Activity" icon={<Clock size={20} />} iconPosition="start" />
                    </Tabs>
                </Paper>

                <AnimatePresence mode="wait">
                    {activeTab === 0 && (
                        <motion.div key="overview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }}>
                            {/* Stats Highlights */}
                            <Grid container spacing={4} sx={{ mb: 6 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard title="Global Users" value={stats.totalUsers} icon={Users} color={COLORS.indigo} trend={14.2} subtitle="Verified accounts" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard title="Revenue Flow" value={stats.totalRevenue} icon={CreditCard} color={COLORS.success} trend={8.7} subtitle="Gross merchandise value" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard title="Exam Vol." value={stats.totalAttempts} icon={Zap} color={COLORS.warning} trend={22.5} subtitle="Tests completed" />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <StatCard title="Conversion" value={Math.round((stats.activeBundles / (stats.totalUsers || 1)) * 100)} icon={Target} color={COLORS.accent} trend={-2.1} unit="%" subtitle="Paid user ratio" />
                                </Grid>
                            </Grid>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={8}>
                                    <Paper sx={{ p: 5, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.02)' }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, mb: 1 }}>Acquisition Velocity</Typography>
                                                <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>New student registrations over last 30 days</Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(COLORS.indigo, 0.1), color: COLORS.indigo }}>
                                                <Users size={24} />
                                            </Box>
                                        </Stack>
                                        <Box sx={{ height: 450 }}>
                                            <ResponsiveContainer>
                                                <AreaChart data={stats.userGrowth}>
                                                    <defs>
                                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" fontSize={12} fontWeight={800} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight }} dy={10} />
                                                    <YAxis fontSize={12} fontWeight={800} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight }} dx={-10} />
                                                    <RechartsTooltip content={<CustomTooltip />} />
                                                    <Area type="monotone" dataKey="users" name="Registrations" stroke={COLORS.indigo} strokeWidth={6} fillOpacity={1} fill="url(#colorUsers)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 5, borderRadius: 8, border: '1px solid #e2e8f0', height: '100%', bgcolor: 'white' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <TrendingUp size={24} color={COLORS.accent} /> Market Leaders
                                        </Typography>
                                        <Stack spacing={4}>
                                            {stats.testPopularity.slice(0, 6).map((test, i) => (
                                                <Box key={i}>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.primary }}>{test.name}</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.accent }}>{test.value} attempts</Typography>
                                                    </Stack>
                                                    <Box sx={{ height: 10, bgcolor: alpha(COLORS.accent, 0.05), borderRadius: 5, overflow: 'hidden' }}>
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(test.value / (stats.testPopularity[0]?.value || 1)) * 100}%` }}
                                                            transition={{ duration: 1, delay: i * 0.1 }}
                                                            style={{ height: '100%', backgroundColor: COLORS.chart[i % COLORS.chart.length], borderRadius: 5 }}
                                                        />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                        <Divider sx={{ my: 4 }} />
                                        <Button fullWidth endIcon={<ArrowUpRight size={18} />} sx={{ color: COLORS.textLight, fontWeight: 700, p: 2, borderRadius: 3, '&:hover': { bgcolor: alpha(COLORS.accent, 0.05), color: COLORS.accent } }}>View All Course Performance</Button>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}

                    {activeTab === 1 && (
                        <motion.div key="revenue" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={7}>
                                    <Paper sx={{ p: 5, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 940, mb: 5, color: COLORS.primary }}>Revenue Trajectory (₹)</Typography>
                                        <Box sx={{ height: 450 }}>
                                            <ResponsiveContainer>
                                                <AreaChart data={stats.dailyActiveUsers}>
                                                    <defs>
                                                        <linearGradient id="colorDAU" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" fontSize={11} fontWeight={800} axisLine={false} tickLine={false} />
                                                    <YAxis fontSize={11} fontWeight={800} axisLine={false} tickLine={false} />
                                                    <RechartsTooltip content={<CustomTooltip prefix="₹" />} />
                                                    <Area type="monotone" dataKey="active" name="Earnings" stroke={COLORS.success} strokeWidth={6} fillOpacity={1} fill="url(#colorDAU)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={5}>
                                    <Paper sx={{ p: 5, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 940, mb: 5, color: COLORS.primary }}>Monetization Distribution</Typography>
                                        <Box sx={{ height: 450 }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie
                                                        data={stats.revenueByBundle}
                                                        innerRadius={110}
                                                        outerRadius={160}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {stats.revenueByBundle.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip content={<CustomTooltip prefix="₹" />} />
                                                    <Legend 
                                                        verticalAlign="bottom" 
                                                        align="center" 
                                                        iconType="circle"
                                                        formatter={(value) => <span style={{ color: COLORS.primary, fontWeight: 700, fontSize: '13px' }}>{value}</span>}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}

                    {activeTab === 2 && (
                        <motion.div key="performance" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 5, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 940, mb: 1, color: COLORS.primary }}>Subject Proficiency Radar</Typography>
                                        <Typography variant="body2" sx={{ color: COLORS.textLight, mb: 5, fontWeight: 600 }}>Comparative accuracy analysis across core subjects</Typography>
                                        <Box sx={{ height: 500 }}>
                                            <ResponsiveContainer>
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.subjectPerformance}>
                                                    <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fontWeight: 800, fill: COLORS.primary }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 700 }} />
                                                    <Radar name="Accuracy %" dataKey="accuracy" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.5} strokeWidth={4} />
                                                    <RechartsTooltip content={<CustomTooltip prefix="" />} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 5, borderRadius: 8, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 940, mb: 5, color: COLORS.primary }}>Course Saturation Level</Typography>
                                        <Box sx={{ height: 500 }}>
                                            <ResponsiveContainer>
                                                <BarChart layout="vertical" data={stats.testPopularity}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={140} fontSize={11} fontWeight={800} axisLine={false} tickLine={false} />
                                                    <RechartsTooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="value" name="Active Students" fill={COLORS.indigo} radius={[0, 8, 8, 0]} barSize={32} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}

                    {activeTab === 3 && (
                        <motion.div key="activity" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.4 }}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 0, borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
                                        <Box sx={{ p: 4, borderBottom: '1px solid #e2e8f0', bgcolor: alpha(COLORS.indigo, 0.03) }}>
                                            <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Users size={24} color={COLORS.indigo} /> New Talent Pipeline
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 2 }}>
                                            {stats.recentSignups.map((user, i) => (
                                                <Box key={i} sx={{ p: 2.5, borderRadius: 4, mb: 1, transition: 'all 0.3s', '&:hover': { bgcolor: alpha(COLORS.indigo, 0.05) }, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <Avatar sx={{ width: 56, height: 56, bgcolor: COLORS.chart[i % COLORS.chart.length], fontWeight: 900, fontSize: '1.2rem' }}>
                                                        {user.full_name?.charAt(0)}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 800, color: COLORS.primary }}>{user.full_name}</Typography>
                                                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{user.email}</Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: COLORS.textLight }}>JOINED</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.primary }}>{new Date(user.created_at).toLocaleDateString()}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                        <Button fullWidth sx={{ py: 3, fontWeight: 800, color: COLORS.indigo, bgcolor: alpha(COLORS.indigo, 0.02) }}>Explore All Pipeline Nodes</Button>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 0, borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
                                        <Box sx={{ p: 4, borderBottom: '1px solid #e2e8f0', bgcolor: alpha(COLORS.success, 0.03) }}>
                                            <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <RefreshCw size={24} color={COLORS.success} /> Logistical Streams
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 2 }}>
                                            {stats.recentPayments.map((p, i) => (
                                                <Box key={i} sx={{ p: 2.5, borderRadius: 4, mb: 1, transition: 'all 0.3s', '&:hover': { bgcolor: alpha(COLORS.success, 0.05) }, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <CreditCard size={28} />
                                                    </Box>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 800, color: COLORS.primary }}>{p.type === 'bundle' ? 'Package License' : 'Direct Access'}</Typography>
                                                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{new Date(p.created_at).toLocaleDateString()}</Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: 'right' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 940, color: COLORS.success }}>₹{p.amount?.toLocaleString()}</Typography>
                                                        <Chip label="SETTLED" size="small" sx={{ fontWeight: 900, height: 20, fontSize: '0.65rem', bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                        <Button fullWidth sx={{ py: 3, fontWeight: 800, color: COLORS.success, bgcolor: alpha(COLORS.success, 0.02) }}>Full Financial Ledger</Button>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* User Detail Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, backdropFilter: 'blur(10px)' }}
            >
                <Paper sx={{
                    width: '100%', maxWidth: 1100, maxHeight: '92vh', overflowY: 'auto', borderRadius: 8, position: 'relative', p: 0, bgcolor: '#f8fafc', boxShadow: '0 40px 100px rgba(0,0,0,0.3)'
                }}>
                    {userLoading ? (
                        <Box sx={{ p: 15, textAlign: 'center' }}>
                            <CircularProgress thickness={6} size={70} sx={{ color: COLORS.accent }} />
                            <Typography sx={{ mt: 3, fontWeight: 900, color: COLORS.primary, letterSpacing: -0.5 }}>SYNCHRONIZING PROFILE ANALYTICS...</Typography>
                        </Box>
                    ) : userAnalytics && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            {/* Modal Header */}
                            <Box sx={{ p: 5, bgcolor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={4} alignItems="center">
                                        <Avatar sx={{ width: 80, height: 80, bgcolor: COLORS.accent, fontSize: '2rem', fontWeight: 900, boxShadow: `0 15px 30px ${alpha(COLORS.accent, 0.2)}` }}>
                                            {selectedUser?.full_name?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h3" sx={{ fontWeight: 940, color: COLORS.primary, letterSpacing: -1.5 }}>{selectedUser?.full_name}</Typography>
                                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                                <Typography variant="h6" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{selectedUser?.email}</Typography>
                                                <Chip label="PREMIUM MEMBER" size="small" icon={<Zap size={14} />} sx={{ bgcolor: alpha(COLORS.warning, 0.1), color: '#b45309', fontWeight: 900, borderRadius: 2 }} />
                                            </Stack>
                                        </Box>
                                    </Stack>
                                    <MuiIconButton onClick={() => setModalOpen(false)} sx={{ bgcolor: '#f1f5f9', p: 2, '&:hover': { bgcolor: COLORS.error, color: 'white' } }}>
                                        <X size={24} />
                                    </MuiIconButton>
                                </Stack>
                            </Box>

                            <Box sx={{ p: 6 }}>
                                {/* User Core Stats */}
                                <Grid container spacing={4} sx={{ mb: 6 }}>
                                    {[
                                        { label: 'Total Missions', val: userAnalytics.totalTests, icon: Layers, color: COLORS.primary },
                                        { label: 'Mean Accuracy', val: `${userAnalytics.avgScore}%`, icon: Target, color: COLORS.success },
                                        { label: 'Time Efficiency', val: `${userAnalytics.avgTime}m`, icon: Clock, color: COLORS.indigo },
                                        { label: 'Active Licenses', val: userAnalytics.bundles.length, icon: Award, color: COLORS.warning }
                                    ].map((stat, i) => (
                                        <Grid item xs={12} sm={6} md={3} key={i}>
                                            <Paper sx={{ p: 4, borderRadius: 5, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', overflow: 'hidden' }}>
                                                <Box sx={{ position: 'absolute', top: -5, right: -5, opacity: 0.05, color: stat.color }}>
                                                    <stat.icon size={80} />
                                                </Box>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</Typography>
                                                <Typography variant="h3" sx={{ fontWeight: 940, color: stat.color }}>{stat.val}</Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>

                                <Grid container spacing={5}>
                                    {/* Score Trend */}
                                    <Grid item xs={12} md={8}>
                                        <Paper sx={{ p: 5, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white', minHeight: 450 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <TrendingUp size={24} color={COLORS.accent} /> Performance Arc
                                            </Typography>
                                            <Box sx={{ height: 350 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={userAnalytics.trends}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="date" fontSize={11} fontWeight={800} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                                        <YAxis domain={[0, 100]} fontSize={11} fontWeight={800} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                                        <RechartsTooltip content={<CustomTooltip prefix="" />} />
                                                        <Line type="monotone" dataKey="percentage" name="Accuracy" stroke={COLORS.accent} strokeWidth={6} dot={{ r: 8, fill: COLORS.accent, strokeWidth: 3, stroke: 'white' }} activeDot={{ r: 10, shadow: '0 0 20px rgba(0,0,0,0.2)' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    {/* Test History Feed */}
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 5, borderRadius: 6, border: '1px solid #e2e8f0', height: '100%', bgcolor: 'white' }}>
                                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Activity size={24} color={COLORS.primary} /> Log Stream
                                            </Typography>
                                            <Stack spacing={3}>
                                                {userAnalytics.attempts.slice().reverse().slice(0, 6).map((attempt, i) => (
                                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                                                        <Box sx={{ p: 3, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' } }}>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.primary, mb: 0.5 }}>{attempt.test_id?.name || 'Experimental Test'}</Typography>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Clock size={12} color={COLORS.textLight} />
                                                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700 }}>{new Date(attempt.created_at).toLocaleDateString()}</Typography>
                                                                </Stack>
                                                            </Box>
                                                            <Box sx={{ textAlign: 'right' }}>
                                                                <Typography variant="h6" sx={{ fontWeight: 940, color: COLORS.accent }}>{Math.round((attempt.score / (attempt.total_questions || attempt.answers?.length || 1)) * 100)}%</Typography>
                                                                <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.success }}>PASS</Typography>
                                                            </Box>
                                                        </Box>
                                                    </motion.div>
                                                ))}
                                                {userAnalytics.attempts.length === 0 && (
                                                    <Box sx={{ textAlign: 'center', py: 10 }}>
                                                        <AlertCircle size={40} color={COLORS.textLight} style={{ opacity: 0.3, marginBottom: 16 }} />
                                                        <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 700 }}>NO NEURAL ACTIVITY LOGGED</Typography>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Paper>
                                    </Grid>

                                    {/* Subject Mastery Radar (Within Modal) */}
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 5, borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 6 }}>Behavioral Mastery Profiles</Typography>
                                            <Grid container spacing={4} alignItems="center">
                                                <Grid item xs={12} md={5}>
                                                    <Stack spacing={4}>
                                                        {userAnalytics.bundles.map((ub, i) => (
                                                            <Box key={i} sx={{ p: 4, borderRadius: 4, border: `1px solid ${alpha(COLORS.success, 0.2)}`, bgcolor: alpha(COLORS.success, 0.02), display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.05)' }}>
                                                                <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }}>
                                                                    <Award size={32} />
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary }}>{ub.name}</Typography>
                                                                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 700 }}>Authorized on {new Date(ub.created_at || Date.now()).toLocaleDateString()}</Typography>
                                                                </Box>
                                                            </Box>
                                                        ))}
                                                        {userAnalytics.bundles.length === 0 && (
                                                            <Paper sx={{ p: 4, borderRadius: 4, bgcolor: '#f1f5f9', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                                                                <CreditCard size={32} color={COLORS.textLight} style={{ opacity: 0.3, marginBottom: 16 }} />
                                                                <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 800 }}>NO ACTIVE LICENSES FOUND</Typography>
                                                            </Paper>
                                                        )}
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12} md={7}>
                                                    <Box sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <BarIcon size={64} color={COLORS.border} strokeWidth={1} />
                                                        <Typography variant="body1" sx={{ ml: 3, color: COLORS.textLight, fontWeight: 700, fontStyle: 'italic' }}>Detailed behavioral radar available upon session saturation.</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </motion.div>
                    )}
                </Paper>
            </Modal>
        </Box>
    );
};

export default Analytics;

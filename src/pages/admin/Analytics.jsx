import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, CircularProgress, alpha, Stack, Divider,
    Avatar, Chip, Tooltip, Autocomplete, TextField as MuiTextField, Modal,
    IconButton as MuiIconButton, InputAdornment, Tabs, Tab, Button, Skeleton
} from '@mui/material';
import {
    Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Search,
    Activity, Award, X, Target, Zap, LayoutDashboard, Clock, AlertCircle,
    RefreshCw, Layers, BarChart as BarIcon, PieChart as PieIcon
} from 'lucide-react';
import { COLORS } from '../../theme/adminTheme';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeaderSkeleton } from '../../components/AdminSkeleton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

const ChartCard = ({ title, subtitle, icon: Icon, iconColor, children, height = 400, sx = {} }) => (
    <Paper elevation={0} sx={{
        p: 4, borderRadius: 5, border: '1px solid', borderColor: COLORS.border,
        bgcolor: '#fff', transition: 'all 0.3s',
        '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.06)', borderColor: alpha(iconColor || COLORS.accent, 0.3) },
        ...sx,
    }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {Icon && <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(iconColor || COLORS.accent, 0.1), color: iconColor || COLORS.accent, display: 'flex' }}><Icon size={18} /></Box>}
                    {title}
                </Typography>
                {subtitle && <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600, mt: 0.5, ml: Icon ? 5.5 : 0 }}>{subtitle}</Typography>}
            </Box>
        </Stack>
        <Box sx={{ height }}>{children}</Box>
    </Paper>
);

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [stats, setStats] = useState({
        totalUsers: 0, totalRevenue: 0, totalAttempts: 0, activeBundles: 0,
        userGrowth: [], revenueTrends: [], testPopularity: [], subjectPerformance: [],
        revenueByBundle: [], dailyActiveUsers: [], recentPayments: [], recentSignups: []
    });

    const [userSearchText, setUserSearchText] = useState('');
    const [userOptions, setUserOptions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [userLoading, setUserLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => { fetchAnalyticsData(); }, []);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/analytics/stats`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            const data = json.data;

            const growthData = processGrowthData(data.recentSignups, 30);
            const revenueData = processRevenueData(data.payments, 30);
            const popularityData = processPopularityData(data.allResults);
            const bundleRevData = processBundleRevenue(data.payments);
            const subjectPerfData = processSubjectPerformance(data.allResults, data.subjectsMap);
            const dauData = processDAU(data.allResults, 30);

            if (data) {
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
            }
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
        return Object.entries(bundles).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
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
            const date = new Date(); date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const count = new Set(attempts?.filter(a => new Date(a.created_at).toDateString() === date.toDateString()).map(a => a.user_id)).size;
            data.push({ name: dateStr, active: count });
        }
        return data;
    };

    const processGrowthData = (users, days) => {
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date(); date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const count = users?.filter(u => new Date(u.created_at).toDateString() === date.toDateString()).length || 0;
            data.push({ name: dateStr, users: count });
        }
        return data;
    };

    const processRevenueData = (payments, days) => {
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date(); date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const amount = payments?.filter(p => new Date(p.created_at).toDateString() === date.toDateString()).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
            data.push({ name: dateStr, amount });
        }
        return data;
    };

    const processPopularityData = (attempts) => {
        const counts = {};
        attempts?.forEach(a => { const name = a.test_id?.name || 'Unknown Test'; counts[name] = (counts[name] || 0) + 1; });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    };

    const handleUserSearch = async (val) => {
        setUserSearchText(val);
        if (val.length < 2) return;
        try {
            const res = await fetch(`${API_URL}/admin/analytics/search?query=${val}`);
            const json = await res.json();
            setUserOptions(json.data || []);
        } catch (error) { console.error('Error searching users:', error); }
    };

    const fetchUserAnalytics = async (user) => {
        setUserLoading(true); setSelectedUser(user); setModalOpen(true);
        try {
            const res = await fetch(`${API_URL}/admin/analytics/users/${user._id || user.id}`);
            const json = await res.json();
            const data = json.data;
            const trends = data.attempts?.map(a => ({
                date: new Date(a.created_at).toLocaleDateString(),
                score: a.score,
                total: a.total_questions || a.answers?.length || 1,
                time: Math.round((a.time_spent || 0) / 60),
                percentage: Math.round((a.score / (a.total_questions || a.answers?.length || 1)) * 100),
                test: a.test_id?.name || 'Unknown'
            })) || [];
            setUserAnalytics({
                attempts: data.attempts || [], bundles: data.bundles || [], trends,
                totalTests: data.attempts?.length || 0,
                avgScore: data.attempts?.length ? Math.round(trends.reduce((s, t) => s + t.percentage, 0) / trends.length) : 0,
                avgTime: data.attempts?.length ? Math.round(trends.reduce((s, t) => s + t.time, 0) / trends.length) : 0
            });
        } catch (error) { console.error('Error fetching user analytics:', error); }
        finally { setUserLoading(false); }
    };

    if (loading) {
        return (
            <Box sx={{ p: { xs: 3, md: 5 }, minHeight: '100vh', background: 'linear-gradient(160deg, #fdf2f8 0%, #f8fafc 100%)' }}>
                <PageHeaderSkeleton />
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4].map(i => (
                        <Box key={i} sx={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.7)', border: '1px solid', borderColor: COLORS.border }}>
                            <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 3 }} />
                            <Box><Skeleton variant="text" width={50} height={28} /><Skeleton variant="text" width={70} height={12} /></Box>
                        </Box>
                    ))}
                </Box>
                <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: 3, mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Skeleton variant="rounded" width="65%" height={420} sx={{ borderRadius: 5 }} />
                    <Skeleton variant="rounded" width="35%" height={420} sx={{ borderRadius: 5 }} />
                </Box>
            </Box>
        );
    }

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: COLORS.indigo, subtitle: 'Registered students' },
        { title: 'Revenue', value: stats.totalRevenue, icon: CreditCard, color: COLORS.success, subtitle: 'Gross earnings', isCurrency: true },
        { title: 'Exams Taken', value: stats.totalAttempts, icon: Zap, color: COLORS.warning, subtitle: 'Tests completed' },
        { title: 'Active Bundles', value: stats.activeBundles, icon: Layers, color: COLORS.accent, subtitle: 'Paid subscriptions' },
    ];

    const tabs = [
        { label: 'Overview', icon: LayoutDashboard },
        { label: 'Revenue', icon: CreditCard },
        { label: 'Academics', icon: Activity },
        { label: 'Activity', icon: Clock },
    ];

    return (
        <Box sx={{ p: { xs: 3, md: 5 }, minHeight: '100vh', background: 'linear-gradient(160deg, #fdf2f8 0%, #f8fafc 100%)' }}>

            {/* ── Header ────────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Admin</Typography>
                        <Typography variant="caption" sx={{ color: COLORS.border }}>›</Typography>
                        <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Analytics</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: COLORS.primary, letterSpacing: -0.5, lineHeight: 1 }}>
                        Analytics Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600, mt: 0.5 }}>
                        Insights and behavioral analytics for the Psy-Q platform
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Autocomplete
                        sx={{ width: 280 }}
                        options={userOptions}
                        getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                        onInputChange={(e, val) => handleUserSearch(val)}
                        onChange={(e, user) => user && fetchUserAnalytics(user)}
                        popupIcon={null}
                        renderInput={(params) => (
                            <MuiTextField {...params} placeholder="Search students…" size="small"
                                InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><Search size={16} color={COLORS.textLight} /></InputAdornment> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', fontSize: '0.85rem', height: 38 } }}
                            />
                        )}
                    />
                    <Button startIcon={<RefreshCw size={16} />} onClick={fetchAnalyticsData}
                        sx={{ bgcolor: '#fff', color: COLORS.primary, fontWeight: 700, textTransform: 'none', px: 2.5, height: 38, borderRadius: 2, border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', '&:hover': { bgcolor: '#fff', borderColor: COLORS.accent } }}>
                        Refresh
                    </Button>
                </Stack>
            </Box>

            {/* ── Stats Bar ─────────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {statCards.map(({ title, value, icon: Icon, color, subtitle, isCurrency }) => (
                    <Box key={title} sx={{
                        flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 2.5,
                        px: 3, py: 2.5, borderRadius: 4, background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(12px)', border: `1px solid ${alpha(color, 0.15)}`,
                        boxShadow: `0 2px 12px ${alpha(color, 0.08)}`, transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(color, 0.15)}`, borderColor: alpha(color, 0.3) },
                    }}>
                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.12), color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={20} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.primary, lineHeight: 1 }}>
                                {isCurrency ? `₹${(value || 0).toLocaleString()}` : (value || 0).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{title}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* ── Tabs ──────────────────────────────────────────────────── */}
            <Paper sx={{ mb: 4, borderRadius: 3, bgcolor: '#fff', p: 0.75, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${COLORS.border}` }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{
                    '& .MuiTabs-indicator': { display: 'none' },
                    '& .MuiTab-root': {
                        borderRadius: 2.5, fontWeight: 700, textTransform: 'none', minHeight: 44, fontSize: '0.85rem',
                        transition: 'all 0.2s', gap: 1,
                        '&.Mui-selected': { bgcolor: COLORS.primary, color: 'white', boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.2)}` },
                        '&:hover:not(.Mui-selected)': { bgcolor: alpha(COLORS.primary, 0.05) }
                    }
                }}>
                    {tabs.map(({ label, icon: Icon }) => (
                        <Tab key={label} label={label} icon={<Icon size={16} />} iconPosition="start" />
                    ))}
                </Tabs>
            </Paper>

            {/* ── Tab Content ───────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === 0 && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <ChartCard title="User Growth" subtitle="New registrations over 30 days" icon={Users} iconColor={COLORS.indigo} height={380}>
                                    <ResponsiveContainer>
                                        <AreaChart data={stats.userGrowth}>
                                            <defs>
                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight }} dy={8} />
                                            <YAxis fontSize={11} fontWeight={700} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight }} dx={-8} />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="users" name="Registrations" stroke={COLORS.indigo} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: `1px solid ${COLORS.border}`, height: '100%', bgcolor: '#fff' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent, display: 'flex' }}><TrendingUp size={18} /></Box>
                                        Top Tests
                                    </Typography>
                                    <Stack spacing={2.5}>
                                        {(stats.testPopularity || []).slice(0, 6).map((test, i) => (
                                            <Box key={i}>
                                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{test.name}</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.accent, flexShrink: 0 }}>{test.value}</Typography>
                                                </Stack>
                                                <Box sx={{ height: 6, bgcolor: alpha(COLORS.accent, 0.06), borderRadius: 3, overflow: 'hidden' }}>
                                                    <Box sx={{ height: '100%', width: `${(test.value / ((stats.testPopularity || [])[0]?.value || 1)) * 100}%`, bgcolor: COLORS.chart[i % COLORS.chart.length], borderRadius: 3, transition: 'width 0.8s ease' }} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {activeTab === 1 && (
                    <motion.div key="revenue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={7}>
                                <ChartCard title="Revenue Trajectory" subtitle="Daily earnings over 30 days" icon={CreditCard} iconColor={COLORS.success} height={380}>
                                    <ResponsiveContainer>
                                        <AreaChart data={stats.dailyActiveUsers}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
                                            <YAxis fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
                                            <RechartsTooltip content={<CustomTooltip prefix="₹" />} />
                                            <Area type="monotone" dataKey="active" name="Earnings" stroke={COLORS.success} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <ChartCard title="Revenue by Source" subtitle="Monetization breakdown" icon={PieIcon} iconColor={COLORS.warning} height={380}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={stats.revenueByBundle} innerRadius={90} outerRadius={140} paddingAngle={6} dataKey="value" stroke="none">
                                                {(stats.revenueByBundle || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip content={<CustomTooltip prefix="₹" />} />
                                            <Legend verticalAlign="bottom" align="center" iconType="circle"
                                                formatter={(value) => <span style={{ color: COLORS.primary, fontWeight: 700, fontSize: '12px' }}>{value}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {activeTab === 2 && (
                    <motion.div key="academics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <ChartCard title="Subject Accuracy" subtitle="Performance radar across subjects" icon={Target} iconColor={COLORS.accent} height={420}>
                                    <ResponsiveContainer>
                                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={stats.subjectPerformance}>
                                            <PolarGrid stroke="#e2e8f0" strokeWidth={1.5} />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700, fill: COLORS.primary }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 600 }} />
                                            <Radar name="Accuracy %" dataKey="accuracy" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.4} strokeWidth={2.5} />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <ChartCard title="Test Popularity" subtitle="Most attempted tests" icon={BarIcon} iconColor={COLORS.indigo} height={420}>
                                    <ResponsiveContainer>
                                        <BarChart layout="vertical" data={stats.testPopularity}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={130} fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" name="Attempts" fill={COLORS.indigo} radius={[0, 6, 6, 0]} barSize={28} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {activeTab === 3 && (
                    <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ borderRadius: 5, border: `1px solid ${COLORS.border}`, overflow: 'hidden', bgcolor: '#fff' }}>
                                    <Box sx={{ px: 4, py: 3, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.indigo, 0.1), color: COLORS.indigo, display: 'flex' }}><Users size={18} /></Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>Recent Signups</Typography>
                                        <Chip label={(stats.recentSignups || []).length} size="small" sx={{ ml: 'auto', fontWeight: 700, height: 22, bgcolor: alpha(COLORS.indigo, 0.1), color: COLORS.indigo }} />
                                    </Box>
                                    <Box sx={{ p: 2, maxHeight: 420, overflowY: 'auto' }}>
                                        {(stats.recentSignups || []).length === 0 ? (
                                            <Box sx={{ textAlign: 'center', py: 6 }}><AlertCircle size={32} color={COLORS.border} /><Typography variant="body2" sx={{ color: COLORS.textLight, mt: 1 }}>No signups yet</Typography></Box>
                                        ) : (stats.recentSignups || []).map((user, i) => (
                                            <Box key={i} sx={{ p: 2, borderRadius: 3, mb: 1, display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.2s', '&:hover': { bgcolor: alpha(COLORS.indigo, 0.04) } }}>
                                                <Avatar sx={{ width: 42, height: 42, bgcolor: COLORS.chart[i % COLORS.chart.length], fontSize: '0.85rem', fontWeight: 800 }}>
                                                    {user.full_name?.charAt(0)}
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</Typography>
                                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{user.email}</Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, flexShrink: 0 }}>{new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ borderRadius: 5, border: `1px solid ${COLORS.border}`, overflow: 'hidden', bgcolor: '#fff' }}>
                                    <Box sx={{ px: 4, py: 3, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success, display: 'flex' }}><CreditCard size={18} /></Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>Recent Payments</Typography>
                                        <Chip label={(stats.recentPayments || []).length} size="small" sx={{ ml: 'auto', fontWeight: 700, height: 22, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }} />
                                    </Box>
                                    <Box sx={{ p: 2, maxHeight: 420, overflowY: 'auto' }}>
                                        {(stats.recentPayments || []).length === 0 ? (
                                            <Box sx={{ textAlign: 'center', py: 6 }}><AlertCircle size={32} color={COLORS.border} /><Typography variant="body2" sx={{ color: COLORS.textLight, mt: 1 }}>No payments yet</Typography></Box>
                                        ) : (stats.recentPayments || []).map((p, i) => (
                                            <Box key={i} sx={{ p: 2, borderRadius: 3, mb: 1, display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.2s', '&:hover': { bgcolor: alpha(COLORS.success, 0.04) } }}>
                                                <Box sx={{ width: 42, height: 42, borderRadius: 3, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <CreditCard size={18} />
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary }}>{p.type === 'bundle' ? 'Bundle Purchase' : 'Test Access'}</Typography>
                                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.success }}>₹{(p.amount || 0).toLocaleString()}</Typography>
                                                    <Chip label="Paid" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success }} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── User Detail Modal ─────────────────────────────────────── */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, backdropFilter: 'blur(8px)' }}>
                <Paper sx={{
                    width: '100%', maxWidth: 1000, maxHeight: '90vh', overflowY: 'auto',
                    borderRadius: 6, bgcolor: '#f8fafc', boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
                }}>
                    {userLoading ? (
                        <Box sx={{ p: 12, textAlign: 'center' }}>
                            <CircularProgress thickness={5} size={56} sx={{ color: COLORS.accent }} />
                            <Typography sx={{ mt: 3, fontWeight: 800, color: COLORS.primary, fontSize: '0.9rem' }}>Loading student analytics…</Typography>
                        </Box>
                    ) : userAnalytics && (
                        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                            {/* Modal Header */}
                            <Box sx={{ p: 4, bgcolor: '#fff', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 10, borderRadius: '24px 24px 0 0' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Avatar sx={{ width: 56, height: 56, bgcolor: COLORS.accent, fontSize: '1.3rem', fontWeight: 900, boxShadow: `0 8px 20px ${alpha(COLORS.accent, 0.2)}` }}>
                                            {selectedUser?.full_name?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary }}>{selectedUser?.full_name}</Typography>
                                            <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{selectedUser?.email}</Typography>
                                        </Box>
                                    </Stack>
                                    <MuiIconButton onClick={() => setModalOpen(false)}
                                        sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: COLORS.error, color: '#fff' } }}>
                                        <X size={20} />
                                    </MuiIconButton>
                                </Stack>
                            </Box>

                            <Box sx={{ p: 4 }}>
                                {/* User Stats */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'Tests Taken', value: userAnalytics.totalTests, icon: Layers, color: COLORS.primary },
                                        { label: 'Avg Score', value: `${userAnalytics.avgScore}%`, icon: Target, color: COLORS.success },
                                        { label: 'Avg Time', value: `${userAnalytics.avgTime}m`, icon: Clock, color: COLORS.indigo },
                                        { label: 'Bundles', value: (userAnalytics.bundles || []).length, icon: Award, color: COLORS.warning },
                                    ].map(({ label, value, icon: Icon, color }) => (
                                        <Box key={label} sx={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2, borderRadius: 3, bgcolor: '#fff', border: `1px solid ${COLORS.border}` }}>
                                            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(color, 0.1), color, display: 'flex' }}><Icon size={18} /></Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: COLORS.primary, lineHeight: 1 }}>{value}</Typography>
                                                <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Score Chart */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: `1px solid ${COLORS.border}`, bgcolor: '#fff', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.1), color: COLORS.accent, display: 'flex' }}><TrendingUp size={16} /></Box>
                                        Score Trend
                                    </Typography>
                                    <Box sx={{ height: 280 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={userAnalytics.trends}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" fontSize={10} fontWeight={700} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                                <YAxis domain={[0, 100]} fontSize={10} fontWeight={700} tick={{ fill: COLORS.textLight }} axisLine={false} tickLine={false} />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Line type="monotone" dataKey="percentage" name="Accuracy %" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 5, fill: COLORS.accent, strokeWidth: 2, stroke: '#fff' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Paper>

                                {/* Test History */}
                                <Paper elevation={0} sx={{ p: 4, borderRadius: 5, border: `1px solid ${COLORS.border}`, bgcolor: '#fff' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, display: 'flex' }}><Activity size={16} /></Box>
                                        Test History
                                    </Typography>
                                    <Stack spacing={1.5}>
                                        {userAnalytics.attempts.slice().reverse().slice(0, 8).map((attempt, i) => (
                                            <Box key={i} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', border: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', '&:hover': { bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary }}>{attempt.test_id?.name || 'Unknown Test'}</Typography>
                                                    <Typography variant="caption" sx={{ color: COLORS.textLight, fontWeight: 600 }}>{new Date(attempt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.accent }}>
                                                        {Math.round((attempt.score / (attempt.total_questions || attempt.answers?.length || 1)) * 100)}%
                                                    </Typography>
                                                    <Chip label={Math.round((attempt.score / (attempt.total_questions || attempt.answers?.length || 1)) * 100) >= 40 ? 'Pass' : 'Fail'} size="small"
                                                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: Math.round((attempt.score / (attempt.total_questions || attempt.answers?.length || 1)) * 100) >= 40 ? alpha(COLORS.success, 0.1) : alpha(COLORS.error, 0.1), color: Math.round((attempt.score / (attempt.total_questions || attempt.answers?.length || 1)) * 100) >= 40 ? COLORS.success : COLORS.error }} />
                                                </Box>
                                            </Box>
                                        ))}
                                        {userAnalytics.attempts.length === 0 && (
                                            <Box sx={{ textAlign: 'center', py: 6 }}><AlertCircle size={32} color={COLORS.border} /><Typography variant="body2" sx={{ color: COLORS.textLight, mt: 1 }}>No test attempts yet</Typography></Box>
                                        )}
                                    </Stack>
                                </Paper>
                            </Box>
                        </motion.div>
                    )}
                </Paper>
            </Modal>
        </Box>
    );
};

export default Analytics;

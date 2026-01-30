import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, Menu, MenuItem } from '@mui/material';
import { db, auth, firebaseConfig } from '../../lib/firebase';
import { supabase } from '../../lib/supabaseClient';
import { collection, getDocs, query, orderBy, limit, deleteDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Settings, Users, BookOpen, Database, Trash2, ExternalLink, Edit, Ban, CheckCircle, LogOut, UserPlus, User, ChevronDown, Package } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
import ContentManagement from './ContentManagement';
import BundleManagement from './BundleManagement';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [stats, setStats] = useState({ subjects: 0, tests: 0, attempts: 0 });
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [subAdmins, setSubAdmins] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState(null);
    const [subjectsWithTests, setSubjectsWithTests] = useState([]);
    const [editAdmin, setEditAdmin] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'sub-admin' });
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    const allowedSubjects = ['Psychology'];

    const isSubjectAllowed = (s) => {
        const name = s?.name || '';
        const visible = s?.visible;
        const allowedByName = allowedSubjects.includes(name);
        const allowedByFlag = visible !== false;
        return allowedByName && allowedByFlag;
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Fetch Admin Profile (Still in Firebase for now)
                if (auth.currentUser) {
                    const adminDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (adminDoc.exists()) {
                        setCurrentUserProfile(adminDoc.data());
                    }
                }

                // 2. Fetch Subjects and Test Counts from Supabase
                const { data: subjectsData, error: subjectsError } = await supabase
                    .from('subjects')
                    .select('*, tests(id)');

                if (subjectsError) throw subjectsError;

                const filteredSubjects = subjectsData.filter(isSubjectAllowed);
                setSubjects(filteredSubjects);

                // Set Psychology as active
                const psych = filteredSubjects.find(s => s.name === 'Psychology');
                if (psych) {
                    setActiveSubject(psych);
                } else if (filteredSubjects.length > 0 && !activeSubject) {
                    setActiveSubject(filteredSubjects[0]);
                }

                // Format subjects for table view
                const subjectsWithCounts = filteredSubjects.map(s => ({
                    ...s,
                    testCount: s.tests?.length || 0
                }));
                setSubjectsWithTests(subjectsWithCounts);

                // 3. Fetch Attempts stats from Supabase
                const { count: attemptCount, error: attemptError } = await supabase
                    .from('attempts')
                    .select('*', { count: 'exact', head: true });

                if (attemptError) throw attemptError;

                setStats({
                    subjects: filteredSubjects.length,
                    tests: subjectsWithCounts.reduce((acc, s) => acc + s.testCount, 0),
                    attempts: attemptCount || 0
                });

                // 4. Fetch Recent Attempts with Joins
                const { data: recentData, error: recentError } = await supabase
                    .from('attempts')
                    .select('*, tests(name)')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (recentError) throw recentError;

                // Sync with Firebase Usernames for now
                const augmentedAttempts = await Promise.all(recentData.map(async (attempt) => {
                    let userName = 'Unknown User';
                    try {
                        if (attempt.user_id) {
                            const userDoc = await getDoc(doc(db, 'users', attempt.user_id));
                            if (userDoc.exists()) {
                                userName = userDoc.data().name || userDoc.data().email || 'Unnamed User';
                            }
                        }
                    } catch (e) { }
                    return {
                        ...attempt,
                        userName,
                        testName: attempt.tests?.name || 'Unnamed Test',
                        timestamp: { toDate: () => new Date(attempt.created_at) } // Compatibility
                    };
                }));

                setRecentAttempts(augmentedAttempts);

                // 5. Fetch Sub-admins (Still Firebase for now)
                const userSnap = await getDocs(collection(db, 'users'));
                setSubAdmins(userSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => u.role === 'admin' || u.role === 'sub-admin')
                );
            } catch (error) {
                console.error("Error fetching admin data from Supabase:", error);
            }
        };
        fetchStats();
    }, [tab]);

    const handleSubjectClick = (subject) => {
        setActiveSubject(subject);
        if (tab !== 1 && tab !== 2) {
            setTab(1); // Switch to Content Management tab by default
        }
    };

    const handleDeleteSubject = async (e, subjectId, subjectName) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the subject "${subjectName}" and all its tests?`)) {
            try {
                const { error } = await supabase
                    .from('subjects')
                    .delete()
                    .eq('id', subjectId);

                if (error) throw error;

                setSubjects(prev => prev.filter(s => s.id !== subjectId));
                if (activeSubject?.id === subjectId) {
                    setActiveSubject(null);
                }
                alert("Subject deleted successfully.");
            } catch (error) {
                console.error("Error deleting subject from Supabase:", error);
                alert("Failed to delete subject: " + error.message);
            }
        }
    };

    const handleDeleteSubAdmin = async (id) => {
        if (window.confirm("Remove this admin from the list? \n\nNote: This removes their dashboard access, but to completely delete their account and reuse the email, you must also remove them from the Firebase Console -> Authentication tab.")) {
            await deleteDoc(doc(db, 'users', id));
            setSubAdmins(prev => prev.filter(u => u.id !== id));
        }
    };

    const handleEditAdmin = (admin) => {
        setEditAdmin({ ...admin });
        setOpenEditDialog(true);
    };

    const handleUpdateAdmin = async () => {
        if (!editAdmin) return;
        try {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', editAdmin.id), {
                name: editAdmin.name,
                email: editAdmin.email,
                role: editAdmin.role
            });
            setSubAdmins(prev => prev.map(a => a.id === editAdmin.id ? editAdmin : a));
            setOpenEditDialog(false);
            setEditAdmin(null);
        } catch (error) {
            console.error("Error updating admin:", error);
            alert("Failed to update admin: " + error.message);
        }
    };

    const handleToggleBlock = async (admin) => {
        const newBlockedStatus = !admin.isBlocked;
        const action = newBlockedStatus ? 'block' : 'unblock';

        if (window.confirm(`Are you sure you want to ${action} ${admin.name || admin.email}?`)) {
            try {
                const { updateDoc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'users', admin.id), {
                    isBlocked: newBlockedStatus
                });
                setSubAdmins(prev => prev.map(a =>
                    a.id === admin.id ? { ...a, isBlocked: newBlockedStatus } : a
                ));
            } catch (error) {
                console.error("Error toggling block status:", error);
                alert("Failed to update block status: " + error.message);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/signin');
        } catch (error) {
            console.error("Error logging out:", error);
            alert("Failed to log out: " + error.message);
        }
    };

    const handleAddAdmin = async () => {
        if (!newAdmin.name || !newAdmin.email) {
            alert("Please fill in all fields.");
            return;
        }

        setCreatingAdmin(true);
        try {
            // Generate a temporary password
            const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

            // 1. Create user in Firebase Auth using a secondary instance
            let secondaryApp;
            if (getApps().some(app => app.name === 'Secondary')) {
                secondaryApp = getApp('Secondary');
            } else {
                secondaryApp = initializeApp(firebaseConfig, 'Secondary');
            }
            const secondaryAuth = getAuth(secondaryApp);

            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email, tempPassword);
            const user = userCredential.user;

            // 2. Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                createdAt: serverTimestamp(),
                isBlocked: false,
                permissions: {
                    manageUsers: true,
                    manageContent: true,
                    viewAnalytics: true
                }
            });

            // 3. Send credentials via email using EmailJS
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    to_name: newAdmin.name,
                    to_email: newAdmin.email,
                    admin_name: newAdmin.name,
                    temp_password: tempPassword,
                    role: newAdmin.role,
                    login_link: 'https://psyqlearning.com/signin'
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            // Update local state
            setSubAdmins(prev => [...prev, { id: user.uid, ...newAdmin, isBlocked: false }]);
            setOpenAddDialog(false);
            setNewAdmin({ name: '', email: '', role: 'sub-admin' });
            alert("Admin added successfully and credentials sent to email!");

            // Cleanup secondary auth
            await secondaryAuth.signOut();
        } catch (error) {
            console.error("Error adding admin:", error);
            if (error.code === 'auth/email-already-in-use') {
                alert("This email is already registered in Firebase! \n\nTo re-add this user, you must first delete them from your Firebase Console -> Authentication tab. Deleting them from the dashboard list only removes their profile, not their login account.");
            } else {
                alert("Failed to add admin: " + error.message);
            }
        } finally {
            setCreatingAdmin(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
            {/* Sidebar */}
            <Box sx={{ width: 280, bgcolor: '#1a2035', color: '#fff', p: 3, display: { xs: 'none', md: 'block' }, overflowY: 'auto' }}>
                <Typography variant="h5" sx={{ mb: 6, fontWeight: 800, color: '#E91E63' }}>PSY-Q ADMIN</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <SidebarItem icon={<Settings size={20} />} label="Overview" active={tab === 0} onClick={() => setTab(0)} />
                    <SidebarItem icon={<BookOpen size={20} />} label="Content Management" active={tab === 1} onClick={() => setTab(1)} />
                    <SidebarItem icon={<Package size={20} />} label="Test Bundles" active={tab === 2} onClick={() => setTab(2)} />
                    <SidebarItem icon={<Users size={20} />} label="Admins" active={tab === 3} onClick={() => setTab(3)} />
                </Box>

                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                <Box>
                    <Typography variant="caption" sx={{ color: '#a0acb9', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, mb: 2, display: 'block' }}>
                        Subjects ({subjects.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '300px', overflowY: 'auto' }}>
                        {subjects.length === 0 ? (
                            <Typography variant="body2" sx={{ color: '#a0acb9', fontSize: '0.75rem', fontStyle: 'italic', px: 1.5 }}>
                                No subjects created yet
                            </Typography>
                        ) : (
                            subjects.map((subject) => (
                                <Box
                                    key={subject.id}
                                    onClick={() => handleSubjectClick(subject)}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.08)',
                                            borderColor: '#E91E63',
                                            transform: 'translateX(4px)',
                                            '& .delete-subject-btn': { opacity: 1 }
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', mb: 0.5 }}>
                                            {subject.name}
                                        </Typography>
                                        <IconButton
                                            className="delete-subject-btn"
                                            size="small"
                                            onClick={(e) => handleDeleteSubject(e, subject.id, subject.name)}
                                            sx={{
                                                p: 0.5,
                                                color: 'rgba(255,255,255,0.3)',
                                                opacity: 0,
                                                transition: 'all 0.2s',
                                                '&:hover': { color: '#F44336' }
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </IconButton>
                                    </Box>
                                    {subject.description && (
                                        <Typography variant="caption" sx={{ color: '#a0acb9', fontSize: '0.7rem', display: 'block', lineHeight: 1.3 }}>
                                            {subject.description.length > 50 ? subject.description.substring(0, 50) + '...' : subject.description}
                                        </Typography>
                                    )}
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, p: { xs: 2, md: 5 }, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {tab === 0 ? "Dashboard Overview" : tab === 1 ? "Content Management" : tab === 2 ? "Test Bundles" : "Admins"}
                    </Typography>

                    {/* Admin Profile Section */}
                    <Box
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            cursor: 'pointer',
                            p: 1,
                            px: 2,
                            borderRadius: 3,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a2035', lineHeight: 1.2 }}>
                                {currentUserProfile?.name || 'Administrator'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'capitalize' }}>
                                {currentUserProfile?.role || 'Full Admin'}
                            </Typography>
                        </Box>
                        <Avatar
                            sx={{
                                bgcolor: '#E91E63',
                                width: 40,
                                height: 40,
                                fontWeight: 700,
                                fontSize: '1rem',
                                boxShadow: '0 4px 10px rgba(233, 30, 99, 0.2)'
                            }}
                        >
                            {(currentUserProfile?.name || 'A')[0]}
                        </Avatar>
                        <ChevronDown size={16} color="#64748b" />
                    </Box>

                    {/* Profile Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                borderRadius: 3,
                                minWidth: 180,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                border: '1px solid #edf2f7'
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={() => { setAnchorEl(null); setTab(0); }} sx={{ gap: 1.5, py: 1.5 }}>
                            <Settings size={18} /> Profile Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.5, color: '#f44336' }}>
                            <LogOut size={18} /> Logout
                        </MenuItem>
                    </Menu>
                </Box>

                {tab === 0 && (
                    <Box>
                        {/* Summary Stats */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <StatCard icon={<BookOpen color="#E91E63" />} label="Total Subjects" value={stats.subjects} />
                            <StatCard icon={<Database color="#2196F3" />} label="Mock Tests" value={stats.tests} />
                            <StatCard icon={<Users color="#4CAF50" />} label="Total Attempts" value={stats.attempts} />
                        </Grid>

                        {/* Subjects Overview */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Subjects Overview</Typography>
                            {subjectsWithTests.length === 0 ? (
                                <Paper sx={{ p: 5, textAlign: 'center', border: '1px dashed #ccc' }}>
                                    <BookOpen size={48} color="#ccc" style={{ marginBottom: 16 }} />
                                    <Typography color="textSecondary">No subjects created yet. Go to Content Management to add subjects.</Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={3}>
                                    {subjectsWithTests.map((subject) => (
                                        <Grid item xs={12} sm={6} md={4} key={subject.id}>
                                            <Paper
                                                onClick={() => handleSubjectClick(subject)}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    border: '1px solid #eee',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                        borderColor: '#E91E63'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
                                                            {subject.name}
                                                        </Typography>
                                                        {subject.description && (
                                                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                                                                {subject.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Divider sx={{ my: 2 }} />
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Database size={20} color="#2196F3" />
                                                        <Typography variant="body2" color="textSecondary">Tests</Typography>
                                                    </Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#2196F3' }}>
                                                        {subject.testCount}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>

                        {/* Recent Activity */}
                        <Paper sx={{ p: 4, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Recent Activity</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Mock Test</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentAttempts.length === 0 ? (
                                            <TableRow><TableCell colSpan={4} align="center">No recent attempts found.</TableCell></TableRow>
                                        ) : (
                                            recentAttempts.map((attempt) => (
                                                <TableRow key={attempt.id}>
                                                    <TableCell sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{attempt.userName}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{attempt.testName}</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: '#2E7D32' }}>{attempt.score}/{attempt.total}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.8rem' }}>{attempt.timestamp?.toDate().toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                )}

                {tab === 1 && <ContentManagement initialSubject={activeSubject} onSubjectChange={() => setActiveSubject(null)} />}

                {tab === 2 && <BundleManagement subject={activeSubject} />}

                {tab === 3 && (
                    <Paper sx={{ p: 4, borderRadius: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Admin Accounts</Typography>
                            <Button
                                variant="contained"
                                startIcon={<UserPlus size={18} />}
                                onClick={() => setOpenAddDialog(true)}
                                sx={{ bgcolor: '#E91E63', borderRadius: 2, fontWeight: 700 }}
                            >
                                Add Admin
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {subAdmins.map((admin) => (
                                        <TableRow key={admin.id}>
                                            <TableCell>{admin.name || 'Admin User'}</TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ px: 1, py: 0.5, bgcolor: '#f0f0f0', borderRadius: 1 }}>
                                                    {admin.role}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        px: 1.5,
                                                        py: 0.5,
                                                        bgcolor: admin.isBlocked ? '#ffebee' : '#e8f5e9',
                                                        color: admin.isBlocked ? '#c62828' : '#2e7d32',
                                                        borderRadius: 1,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {admin.isBlocked ? 'Blocked' : 'Active'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditAdmin(admin)}
                                                        sx={{ color: '#2196F3' }}
                                                    >
                                                        <Edit size={18} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleBlock(admin)}
                                                        sx={{ color: admin.isBlocked ? '#4CAF50' : '#FF9800' }}
                                                    >
                                                        {admin.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteSubAdmin(admin.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {subAdmins.length === 0 && (
                                        <TableRow><TableCell colSpan={5} align="center">No admins found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

                {/* Edit Admin Dialog */}
                <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Edit Admin Account</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Name"
                            margin="normal"
                            value={editAdmin?.name || ''}
                            onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            type="email"
                            value={editAdmin?.email || ''}
                            onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Role"
                            margin="normal"
                            value={editAdmin?.role || 'admin'}
                            onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value })}
                            SelectProps={{ native: true }}
                        >
                            <option value="admin">Admin</option>
                            <option value="sub-admin">Sub-admin</option>
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleUpdateAdmin} sx={{ bgcolor: '#E91E63' }}>Update</Button>
                    </DialogActions>
                </Dialog>

                {/* Add Admin Dialog */}
                <Dialog open={openAddDialog} onClose={() => !creatingAdmin && setOpenAddDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ fontWeight: 800 }}>Create New Admin Account</DialogTitle>
                    <DialogContent>
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                A new admin account will be created. Their login credentials will be automatically sent to the email address provided below.
                            </Typography>
                            <TextField
                                fullWidth
                                label="Admin Full Name"
                                margin="normal"
                                value={newAdmin.name}
                                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                placeholder="e.g. Rahul Sharma"
                                disabled={creatingAdmin}
                            />
                            <TextField
                                fullWidth
                                label="Email Address"
                                margin="normal"
                                type="email"
                                value={newAdmin.email}
                                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                placeholder="admin@psyq.com"
                                disabled={creatingAdmin}
                            />
                            <TextField
                                fullWidth
                                select
                                label="Assign Role"
                                margin="normal"
                                value={newAdmin.role}
                                onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                SelectProps={{ native: true }}
                                disabled={creatingAdmin}
                            >
                                <option value="sub-admin">Sub-admin (Content Management)</option>
                                <option value="admin">Full Admin</option>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setOpenAddDialog(false)} disabled={creatingAdmin}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddAdmin}
                            disabled={creatingAdmin}
                            sx={{ bgcolor: '#E91E63', minWidth: 120, position: 'relative' }}
                        >
                            {creatingAdmin ? 'Creating...' : 'Create Account'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, cursor: 'pointer',
            bgcolor: active ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
            color: active ? '#E91E63' : '#a0acb9',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }
        }}
    >
        {icon}
        <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
    </Box>
);

const StatCard = ({ icon, label, value }) => (
    <Grid item xs={12} sm={4}>
        <Paper sx={{ p: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.02)' }}>{icon}</Box>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
                <Typography variant="body2" color="textSecondary">{label}</Typography>
            </Box>
        </Paper>
    </Grid>
);

export default AdminDashboard;

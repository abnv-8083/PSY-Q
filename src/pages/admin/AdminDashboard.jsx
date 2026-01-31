import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, Menu, MenuItem, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
        <Box className="mesh-bg" sx={{ display: 'flex', minHeight: '100vh', color: '#1e293b' }}>
            {/* Sidebar */}
            <Box sx={{
                width: 280,
                bgcolor: '#0f172a',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                p: 3,
                borderRight: '1px solid rgba(255,255,255,0.05)',
                position: 'sticky',
                top: 0,
                height: '100vh',
                zIndex: 1000,
                backdropFilter: 'blur(20px)',
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                display: { xs: 'none', md: 'flex' }
            }}>
                <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 45, height: 45, borderRadius: 3,
                        bgcolor: '#E91E63', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(233, 30, 99, 0.4)'
                    }}>
                        <Settings color="#fff" size={24} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>Psy-Q</Typography>
                        <Typography variant="caption" sx={{ color: '#E91E63', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Admin Portal</Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto', pr: 1 }}>
                    <SidebarItem icon={<Database size={20} />} label="Dashboard" active={tab === 0} onClick={() => setTab(0)} />
                    <SidebarItem icon={<BookOpen size={20} />} label="Content Management" active={tab === 1} onClick={() => setTab(1)} />
                    <SidebarItem icon={<Package size={20} />} label="Bundle Management" active={tab === 2} onClick={() => setTab(2)} />
                    <SidebarItem icon={<Users size={20} />} label="Admin Users" active={tab === 3} onClick={() => setTab(3)} />

                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                    <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 800, mb: 2, px: 1 }}>
                        Subjects ({subjects.length})
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {subjects.map((subject) => (
                            <Box
                                key={subject.id}
                                onClick={() => handleSubjectClick(subject)}
                                sx={{
                                    p: 1.5, borderRadius: 3, cursor: 'pointer',
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.08)',
                                        borderColor: 'rgba(233, 30, 99, 0.4)',
                                        '& .delete-btn': { opacity: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>{subject.name}</Typography>
                                    <IconButton
                                        className="delete-btn"
                                        size="small"
                                        onClick={(e) => handleDeleteSubject(e, subject.id, subject.name)}
                                        sx={{ opacity: 0, p: 0.5, color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#ef4444' } }}
                                    >
                                        <Trash2 size={14} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{
                    mt: 3, p: 2.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex',
                    alignItems: 'center', gap: 2
                }}>
                    <Avatar sx={{ bgcolor: '#E91E63', fontWeight: 700, width: 40, height: 40, fontSize: '0.875rem' }}>
                        {currentUserProfile?.fullName?.charAt(0) || 'A'}
                    </Avatar>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentUserProfile?.fullName || 'Admin User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Administrator</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => navigate('/')} sx={{ color: '#64748b' }}>
                        <LogOut size={16} />
                    </IconButton>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, p: { xs: 3, md: 6 }, overflow: 'auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {tab === 0 && (
                            <>
                                <Box sx={{ mb: 5 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>Dashboard Overview</Typography>
                                    <Typography variant="body1" sx={{ color: '#64748b' }}>Welcome back to the management console.</Typography>
                                </Box>

                                <Grid container spacing={3} sx={{ mb: 6 }}>
                                    <StatCard icon={<Database size={24} color="#E91E63" />} label="Total Subjects" value={stats.subjects} />
                                    <StatCard icon={<BookOpen size={24} color="#E91E63" />} label="Total Mock Tests" value={stats.tests} />
                                    <StatCard icon={<Users size={24} color="#E91E63" />} label="Student Attempts" value={stats.attempts} />
                                </Grid>

                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#0f172a' }}>Recent Activity</Typography>
                                <Paper className="glass-card" sx={{ borderRadius: 5, overflow: 'hidden', mb: 4 }}>
                                    <TableContainer>
                                        <Table>
                                            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>STUDENT</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>MOCK TEST</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>SCORE</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>DATE</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {recentAttempts.length === 0 ? (
                                                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748b' }}>No recent attempts found.</TableCell></TableRow>
                                                ) : (
                                                    recentAttempts.map((attempt) => (
                                                        <TableRow key={attempt.id} sx={{ '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.02)' } }}>
                                                            <TableCell sx={{ fontWeight: 700 }}>{attempt.userName}</TableCell>
                                                            <TableCell>{attempt.testName}</TableCell>
                                                            <TableCell>
                                                                <Typography sx={{ fontWeight: 800, color: '#059669' }}>{attempt.score}/{attempt.total}</Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>{attempt.timestamp?.toDate().toLocaleDateString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </>
                        )}

                        {tab === 1 && <ContentManagement initialSubject={activeSubject} onSubjectChange={() => setActiveSubject(null)} />}
                        {tab === 2 && <BundleManagement subject={activeSubject} />}

                        {tab === 3 && (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: -1 }}>Admin Accounts</Typography>
                                        <Typography variant="body1" sx={{ color: '#64748b' }}>Manage your team and permissions.</Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<UserPlus size={18} />}
                                        onClick={() => setOpenAddDialog(true)}
                                        sx={{
                                            bgcolor: '#E91E63', borderRadius: 3, px: 3, py: 1.5,
                                            fontWeight: 800, textTransform: 'none',
                                            boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                                            '&:hover': { bgcolor: '#D81B60', boxShadow: '0 10px 25px rgba(233, 30, 99, 0.4)' }
                                        }}
                                    >
                                        Add Admin
                                    </Button>
                                </Box>

                                <Paper className="glass-card" sx={{ borderRadius: 5, overflow: 'hidden' }}>
                                    <TableContainer>
                                        <Table>
                                            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>ADMIN</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>EMAIL</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>ROLE</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>STATUS</TableCell>
                                                    <TableCell sx={{ fontWeight: 800, color: '#64748b' }} align="right">ACTIONS</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {subAdmins.map((admin) => (
                                                    <TableRow key={admin.id} sx={{ '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.02)' } }}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ bgcolor: admin.isBlocked ? '#94a3b8' : '#6366f1', width: 32, height: 32, fontSize: '0.75rem' }}>
                                                                    {(admin.name || 'A')[0]}
                                                                </Avatar>
                                                                <Typography sx={{ fontWeight: 700 }}>{admin.name || 'Admin User'}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{admin.email}</TableCell>
                                                        <TableCell>
                                                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 2, display: 'inline-block' }}>
                                                                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>{admin.role}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{
                                                                px: 1.5, py: 0.5, borderRadius: 2, display: 'inline-block',
                                                                bgcolor: admin.isBlocked ? '#fee2e2' : '#dcfce7',
                                                                color: admin.isBlocked ? '#ef4444' : '#059669'
                                                            }}>
                                                                <Typography variant="caption" sx={{ fontWeight: 800 }}>{admin.isBlocked ? 'BLOCKED' : 'ACTIVE'}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                                <IconButton size="small" onClick={() => handleEditAdmin(admin)} sx={{ color: '#6366f1' }}>
                                                                    <Edit size={18} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleToggleBlock(admin)}
                                                                    sx={{ color: admin.isBlocked ? '#059669' : '#f59e0b' }}
                                                                >
                                                                    {admin.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteSubAdmin(admin.id)}>
                                                                    <Trash2 size={18} />
                                                                </IconButton>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {subAdmins.length === 0 && (
                                                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>No admins found.</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* Edit Admin Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 5 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Edit Admin Account</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth label="Name" margin="normal"
                        value={editAdmin?.name || ''}
                        onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <TextField
                        fullWidth label="Email" margin="normal" type="email"
                        value={editAdmin?.email || ''}
                        onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <TextField
                        fullWidth select label="Role" margin="normal"
                        value={editAdmin?.role || 'admin'}
                        onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value })}
                        SelectProps={{ native: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    >
                        <option value="admin">Admin</option>
                        <option value="sub-admin">Sub-admin</option>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditDialog(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained" onClick={handleUpdateAdmin}
                        sx={{ bgcolor: '#E91E63', borderRadius: 3, fontWeight: 800, px: 3 }}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Admin Dialog */}
            <Dialog
                open={openAddDialog}
                onClose={() => !creatingAdmin && setOpenAddDialog(false)}
                fullWidth maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 5 } }}
            >
                <DialogTitle sx={{ fontWeight: 900, pb: 0 }}>Create Admin Account</DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2 }}>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                            A new admin account will be created. Login credentials will be sent to the email address provided.
                        </Typography>
                        <TextField
                            fullWidth label="Admin Full Name" margin="normal"
                            value={newAdmin.name}
                            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            disabled={creatingAdmin}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth label="Email Address" margin="normal" type="email"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            placeholder="admin@psyq.com"
                            disabled={creatingAdmin}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        />
                        <TextField
                            fullWidth select label="Assign Role" margin="normal"
                            value={newAdmin.role}
                            onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                            SelectProps={{ native: true }}
                            disabled={creatingAdmin}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        >
                            <option value="sub-admin">Sub-admin (Content Management)</option>
                            <option value="admin">Full Admin</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenAddDialog(false)} disabled={creatingAdmin} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddAdmin}
                        disabled={creatingAdmin}
                        sx={{
                            bgcolor: '#E91E63', borderRadius: 3, fontWeight: 800, px: 4, py: 1,
                            boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)'
                        }}
                    >
                        {creatingAdmin ? 'Creating...' : 'Create Admin'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 3, cursor: 'pointer',
            bgcolor: active ? 'rgba(233, 30, 99, 0.15)' : 'transparent',
            color: active ? '#fff' : '#94a3b8',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                bgcolor: active ? 'rgba(233, 30, 99, 0.2)' : 'rgba(255,255,255,0.03)',
                color: '#fff',
                transform: 'translateX(4px)'
            },
            ...(active && {
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0, top: '20%', bottom: '20%',
                    width: 3,
                    bgcolor: '#E91E63',
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 10px #E91E63'
                }
            })
        }}
    >
        {icon}
        <Typography sx={{ fontWeight: 700, fontSize: '0.925rem' }}>{label}</Typography>
    </Box>
);

const StatCard = ({ icon, label, value }) => (
    <Grid size={{ xs: 12, sm: 4 }}>
        <Paper className="glass-card" sx={{
            p: 4, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 3,
            transition: 'all 0.3s',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }
        }}>
            <Box sx={{
                p: 2, borderRadius: 4,
                bgcolor: 'rgba(233, 30, 99, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1, mb: 0.5 }}>{value}</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>{label}</Typography>
            </Box>
        </Paper>
    </Grid>
);

export default AdminDashboard;

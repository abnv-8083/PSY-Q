import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user: currentUser } } = await supabase.auth.getUser();

                console.log("🛡️ ProtectedRoute: auth state check", currentUser?.email);

                if (currentUser) {
                    setUser(currentUser);
                    // Fetch user profile from Supabase
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', currentUser.id)
                        .single();

                    if (profile) {
                        // isBlocked is not in the schema yet, defaulting to false or checking if it exists in metadata
                        console.log("🛡️ ProtectedRoute: user data found:", profile.role);
                        setRole(profile.role);
                        setIsBlocked(false); // Defaulting to false as column likely doesn't exist yet
                    } else {
                        console.log("🛡️ ProtectedRoute: user profile not found");
                        // If no profile, assume student role or handle error
                        setRole('student');
                        setIsBlocked(false);
                    }
                } else {
                    console.log("🛡️ ProtectedRoute: no user logged in");
                    setUser(null);
                    setRole(null);
                    setIsBlocked(false);
                }
            } catch (error) {
                console.error("🛡️ ProtectedRoute: Error checking auth:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setRole(null);
            } else if (event === 'SIGNED_IN' && session?.user) {
                // Re-check profile on sign in
                checkAuth();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="inherit" sx={{ color: '#E91E63' }} />
            </Box>
        );
    }

    if (!user) {
        // Redirect to signin, but save the current location they were trying to go to
        console.log("🛡️ ProtectedRoute: Redirecting to /signin (reason: no user)");
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    if (adminOnly && role !== 'admin' && role !== 'sub-admin') {
        // If they are logged in but not an admin, show Access Denied instead of silent redirect
        console.log("🛡️ ProtectedRoute: Access Denied (role:", role, ")");
        return (
            <Box sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: 3,
                bgcolor: '#f8fafc'
            }}>
                <Box sx={{
                    bgcolor: '#fff',
                    p: 4,
                    borderRadius: 4,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    maxWidth: 400
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 2 }}>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                        You do not have administrative privileges to access this area.
                    </Typography>
                    <Box sx={{
                        p: 2,
                        bgcolor: '#f1f5f9',
                        borderRadius: 2,
                        mb: 3,
                        textAlign: 'left'
                    }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                            Debug Info:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontFamily: 'monospace' }}>
                            Email: {user.email}<br />
                            Role: {role || 'none'}
                        </Typography>
                    </Box>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#E91E63' }}>
                        Back to Home
                    </Button>
                </Box>
            </Box>
        );
    }

    if (isBlocked) {
        console.log("🛡️ ProtectedRoute: Account is blocked");
        return (
            <Box sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: 3,
                bgcolor: '#fff1f2'
            }}>
                <Box sx={{
                    bgcolor: '#fff',
                    p: 4,
                    borderRadius: 4,
                    boxShadow: '0 10px 25px -5px rgba(225,29,72,0.1)',
                    border: '1px solid #fecdd3',
                    maxWidth: 400
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#9f1239', mb: 2 }}>
                        Account Blocked
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#be123c', mb: 3 }}>
                        Your administrative access has been revoked. Please contact the super-admin for more information.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#be123c' }}>
                        Back to Home
                    </Button>
                </Box>
            </Box>
        );
    }

    console.log("🛡️ ProtectedRoute: Access granted to", location.pathname);
    return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useSession } from '../contexts/SessionContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading, isAdmin } = useSession();
    const location = useLocation();
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="inherit" sx={{ color: '#E91E63' }} />
            </Box>
        );
    }

    if (!user) {
        // Redirect to signin, but save the current location they were trying to go to
        const redirectPath = adminOnly ? "/signin" : "/student/signin";
        console.log(`🛡️ ProtectedRoute: Redirecting to ${redirectPath} (reason: no user)`);
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // Check for allowed roles if adminOnly
    if (adminOnly && !isAdmin) {
        console.log("🛡️ ProtectedRoute: Access Denied (role:", user.role, ")");
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
                            Role: {user.role || 'none'}
                        </Typography>
                    </Box>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ bgcolor: '#ca0056' }}>
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

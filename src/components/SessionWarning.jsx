import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, LinearProgress } from '@mui/material';
import { AlertTriangle, Clock } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

const SessionWarning = () => {
    const { showWarning, extendSession, timeUntilLogout } = useSession();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (showWarning) {
            const interval = setInterval(() => {
                const remaining = Math.floor(timeUntilLogout / 1000);
                setTimeLeft(remaining);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [showWarning, timeUntilLogout]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (timeLeft / 300) * 100; // 300 seconds = 5 minutes

    return (
        <Dialog
            open={showWarning}
            onClose={() => { }}
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <AlertTriangle size={24} color="#f59e0b" />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            Session Expiring Soon
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Your session will expire due to inactivity
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={18} color="#64748b" />
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                Time Remaining
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                            {formatTime(timeLeft)}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#fef3c7',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#f59e0b',
                                borderRadius: 4
                            }
                        }}
                    />
                </Box>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    You've been inactive for a while. To protect your account, we'll automatically log you out soon.
                    Click "Stay Logged In" to continue your session.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={extendSession}
                    sx={{
                        bgcolor: '#ec4899',
                        color: '#fff',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': {
                            bgcolor: '#db2777'
                        }
                    }}
                >
                    Stay Logged In
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionWarning;

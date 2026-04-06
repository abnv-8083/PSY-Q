import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    HelpCircle,
    ChevronRight
} from 'lucide-react';

const ModernDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    showCancel = true,
    maxWidth = 'xs'
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle2 size={48} color="#22c55e" />,
                    color: '#22c55e',
                    bgColor: 'rgba(34, 197, 94, 0.1)'
                };
            case 'error':
                return {
                    icon: <AlertCircle size={48} color="#ef4444" />,
                    color: '#ef4444',
                    bgColor: 'rgba(239, 68, 68, 0.1)'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={48} color="#f59e0b" />,
                    color: '#f59e0b',
                    bgColor: 'rgba(245, 158, 11, 0.1)'
                };
            case 'confirm':
                return {
                    icon: <HelpCircle size={48} color="#6366f1" />,
                    color: '#6366f1',
                    bgColor: 'rgba(99, 102, 241, 0.1)'
                };
            default:
                return {
                    icon: <Info size={48} color="#06b6d4" />,
                    color: '#06b6d4',
                    bgColor: 'rgba(6, 182, 212, 0.1)'
                };
        }
    };

    const config = getTypeConfig();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    overflow: 'visible',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                }
            }}
        >
            <Box sx={{ position: 'relative', p: 4, pt: 6, textAlign: 'center' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: '#94a3b8',
                        '&:hover': { color: '#64748b', bgcolor: 'rgba(0,0,0,0.05)' }
                    }}
                >
                    <X size={20} />
                </IconButton>

                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                >
                    <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: config.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3
                    }}>
                        {config.icon}
                    </Box>
                </motion.div>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, color: '#0f172a' }}>
                    {title}
                </Typography>

                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {message}
                </Typography>

                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    {(type === 'confirm' || showCancel) && (
                        <Button
                            variant="text"
                            onClick={onClose}
                            sx={{
                                color: '#64748b',
                                fontWeight: 700,
                                px: 4,
                                borderRadius: 3,
                                textTransform: 'none',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                            }}
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={onConfirm || onClose}
                        sx={{
                            bgcolor: config.color,
                            color: '#fff',
                            fontWeight: 800,
                            px: 4,
                            py: 1.2,
                            borderRadius: 3,
                            textTransform: 'none',
                            boxShadow: `0 10px 20px ${config.bgColor}`,
                            '&:hover': {
                                bgcolor: config.color,
                                filter: 'brightness(0.9)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        {confirmText}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default ModernDialog;

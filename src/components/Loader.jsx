import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const COLORS = {
    primary: '#1e293b',
    accent: '#ca0056',
};

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: fullScreen ? '100vh' : '100%',
                minHeight: fullScreen ? '100vh' : '200px',
                width: '100%',
                bgcolor: fullScreen ? '#fdf2f8' : 'transparent',
                color: COLORS.accent
            }}
        >
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            >
                <Brain size={48} color={COLORS.accent} strokeWidth={1.5} />
            </motion.div>
            {text && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Typography 
                        variant="subtitle2" 
                        sx={{ 
                            mt: 2, 
                            fontWeight: 700, 
                            letterSpacing: '1px',
                            color: COLORS.primary 
                        }}
                    >
                        {text}
                    </Typography>
                </motion.div>
            )}
        </Box>
    );
};

export default Loader;

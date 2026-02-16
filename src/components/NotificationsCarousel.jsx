import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications } from '../api/notificationsApi';

const NotificationsCarousel = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for previous

    // Fetch notifications on mount
    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        const { data, error } = await fetchNotifications();
        if (data && !error) {
            setNotifications(data);
        }
        setLoading(false);
    };

    // Auto-rotation effect (5 seconds)
    useEffect(() => {
        if (notifications.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentIndex, notifications.length, isPaused]);

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
    };

    const handlePrevious = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + notifications.length) % notifications.length);
    };

    const handleDotClick = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    // Loading state
    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 300,
                bgcolor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: 5,
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <CircularProgress sx={{ color: '#E91E63' }} />
            </Box>
        );
    }

    // Empty state
    if (notifications.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 300,
                bgcolor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: 5,
                border: '1px solid rgba(0,0,0,0.05)',
                p: 4
            }}>
                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                    No notifications to display. Click "Manage" to add your first notification.
                </Typography>
            </Box>
        );
    }

    const currentNotification = notifications[currentIndex];

    // Animation variants
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    return (
        <Box
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            sx={{
                position: 'relative',
                bgcolor: 'white',
                borderRadius: { xs: 4, md: 6 },
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                transition: 'all 0.3s',
                '&:hover': {
                    boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                },
                mx: 'auto',
                maxWidth: 'lg',
                width: '100%'
            }}
        >
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            handleNext();
                        } else if (swipe > swipeConfidenceThreshold) {
                            handlePrevious();
                        }
                    }}
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    style={{ width: '100%' }}
                >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        gap: { xs: 4, md: 6 },
                        p: { xs: 4, md: 6 },
                        minHeight: { xs: 450, md: 350 }
                    }}>
                        {/* Text Content - Left Side */}
                        <Box sx={{
                            flex: 1.2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                            order: { xs: 2, md: 1 },
                            textAlign: 'left'
                        }}>
                            <Box>
                                <Typography
                                    variant="h3"
                                    component="h3"
                                    sx={{
                                        fontWeight: 900,
                                        color: '#1e293b', // Dark Navy / Primary
                                        letterSpacing: -1,
                                        fontSize: { xs: '1.75rem', md: '2.5rem' },
                                        lineHeight: 1.2,
                                        mb: 1
                                    }}
                                >
                                    {currentNotification.header}
                                </Typography>
                                {currentNotification.created_at && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#ca0056', // Brand Pink / Accent
                                            fontWeight: 700,
                                            letterSpacing: 1,
                                            textTransform: 'uppercase',
                                            display: 'block',
                                            mb: 1
                                        }}
                                    >
                                        Posted on {formatDate(currentNotification.created_at)}
                                    </Typography>
                                )}
                            </Box>
                            <Typography
                                component="p"
                                sx={{
                                    fontSize: { xs: '1rem', md: '1.25rem' },
                                    color: '#4b5563', // Secondary
                                    lineHeight: 1.7,
                                    fontWeight: 500
                                }}
                            >
                                {currentNotification.description}
                            </Typography>
                        </Box>

                        {/* Image - Right Side */}
                        <Box sx={{
                            flex: 0.8,
                            width: '100%',
                            maxWidth: { xs: '100%', md: 450 },
                            order: { xs: 1, md: 2 }
                        }}>
                            <Box
                                component="img"
                                src={currentNotification.image_url}
                                alt={currentNotification.header}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x400/ca0056/FFFFFF?text=Psy-Q+Update';
                                }}
                                sx={{
                                    width: '100%',
                                    height: { xs: 220, md: 280 },
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                    boxShadow: '0 10px 25px rgba(202, 0, 86, 0.15)',
                                    border: '1px solid rgba(202, 0, 86, 0.1)'
                                }}
                                draggable={false}
                            />
                        </Box>
                    </Box>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Only show if more than 1 slide */}
            {notifications.length > 1 && (
                <>
                    <IconButton
                        onClick={handlePrevious}
                        sx={{
                            position: 'absolute',
                            left: { xs: 10, md: 20 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid #e2e8f0',
                            color: '#1e293b',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                bgcolor: '#ca0056',
                                color: '#fff',
                                borderColor: '#ca0056',
                                boxShadow: '0 8px 16px rgba(202, 0, 86, 0.3)'
                            },
                            transition: 'all 0.3s',
                            zIndex: 2,
                            display: { xs: 'none', md: 'flex' }
                        }}
                    >
                        <ChevronLeft size={24} />
                    </IconButton>

                    <IconButton
                        onClick={handleNext}
                        sx={{
                            position: 'absolute',
                            right: { xs: 10, md: 20 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid #e2e8f0',
                            color: '#1e293b',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                bgcolor: '#ca0056',
                                color: '#fff',
                                borderColor: '#ca0056',
                                boxShadow: '0 8px 16px rgba(202, 0, 86, 0.3)'
                            },
                            transition: 'all 0.3s',
                            zIndex: 2,
                            display: { xs: 'none', md: 'flex' }
                        }}
                    >
                        <ChevronRight size={24} />
                    </IconButton>
                </>
            )}

            {/* Dot Indicators - Only show if more than 1 slide */}
            {notifications.length > 1 && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1.2,
                    zIndex: 2
                }}>
                    {notifications.map((_, index) => (
                        <Box
                            key={index}
                            onClick={() => handleDotClick(index)}
                            sx={{
                                width: currentIndex === index ? 28 : 8,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: currentIndex === index ? '#ca0056' : '#e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    bgcolor: currentIndex === index ? '#ca0056' : '#cbd5e1'
                                }
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default NotificationsCarousel;

import React from 'react';
import { Box, Container, Typography, Grid, Paper, Stack } from '@mui/material';
import {
    Zap, Target, BarChart2, Shield, Globe, Smartphone,
    MessageCircle, Clock, Award
} from 'lucide-react';
import MockTestNavbar from '../../components/MockTestNavbar';

const COLORS = {
    primary: '#2C3E50',
    secondary: '#34495E',
    accent: '#3498DB',
    background: '#F8F9FA'
};

const features = [
    {
        icon: <Target size={32} />,
        title: "Precision Targeting",
        description: "Our algorithm adapts to your performance, suggesting questions that target your weak areas.",
        steps: ["Take a diagnostic test", "Get personalized topic suggestions", "Practice targeted questions"]
    },
    {
        icon: <BarChart2 size={32} />,
        title: "Deep Analytics",
        description: "Visualize your progress with detailed charts covering accuracy, speed, and topic mastery.",
        steps: ["Complete a mock test", "View comprehensive report", "Track improvement over time"]
    },
    {
        icon: <Globe size={32} />,
        title: "Real Exam Interface",
        description: "Experience the exact NTA UGC NET exam interface to build familiarity and confidence.",
        steps: ["Select 'Exam Mode'", "Navigate using official controls", "Manage time effectively"]
    },
    {
        icon: <MessageCircle size={32} />,
        title: "Expert Explanations",
        description: "Don't just know the answer, understand the 'why' behind every option.",
        steps: ["Review answers", "Read detailed rationale", "Understand related concepts"]
    },
    {
        icon: <Smartphone size={32} />,
        title: "Mobile Optimized",
        description: "Study on the go with our fully responsive platform that works seamlessly on all devices.",
        steps: ["Login from any device", "Sync progress automatically", "Practice anywhere"]
    },
    {
        icon: <Shield size={32} />,
        title: "Verified Content",
        description: "All questions and explanations are vetted by UGC NET qualified professionals.",
        steps: ["Trust the source", "Report any discrepancies", "Get updated content"]
    }
];

const MockTestFeatures = () => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'white', fontFamily: "'Inter', sans-serif" }}>
            <MockTestNavbar />

            <Box sx={{ bgcolor: COLORS.primary, color: 'white', py: 10, textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Typography variant="overline" sx={{ color: COLORS.accent, fontWeight: 700, letterSpacing: '0.1em' }}>
                        WHY CHOOSE US
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, mt: 2, mb: 3 }}>
                        Features that drive success
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.6 }}>
                        We've built a platform designed to maximize your learning efficiency and exam readiness.
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 10 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 4
                }}>
                    {features.map((feature, index) => (
                        <Paper key={index} elevation={0} sx={{
                            p: 3,
                            height: '100%',
                            minHeight: 380, // Uniform height
                            border: '1px solid #E0E0E0',
                            borderRadius: 4,
                            transition: 'all 0.3s',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                                borderColor: COLORS.accent
                            }
                        }}>
                            <Box sx={{
                                width: 48, height: 48,
                                bgcolor: `${COLORS.accent}15`,
                                color: COLORS.accent,
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mb: 2
                            }}>
                                {React.cloneElement(feature.icon, { size: 24 })}
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: COLORS.primary, fontSize: '1.1rem' }}>
                                {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.secondary, mb: 3, lineHeight: 1.6, fontSize: '0.9rem', flexGrow: 1 }}>
                                {feature.description}
                            </Typography>

                            <Box sx={{ bgcolor: COLORS.background, p: 2, borderRadius: 2, mt: 'auto' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1, display: 'block' }}>
                                    HOW IT WORKS:
                                </Typography>
                                <Stack spacing={1}>
                                    {feature.steps.map((step, i) => (
                                        <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Box sx={{ minWidth: 6, height: 6, borderRadius: '50%', bgcolor: COLORS.accent }} />
                                            <Typography variant="caption" sx={{ color: COLORS.secondary }}>{step}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

export default MockTestFeatures;

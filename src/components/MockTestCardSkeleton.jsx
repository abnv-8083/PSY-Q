import React from 'react';
import { Box, Card, CardContent, Skeleton, Stack, alpha } from '@mui/material';
import { COLORS } from '../theme/mocktestTheme';

/**
 * Reusable skeleton loader that mirrors the gradient mock-test card shape.
 * Accepts a `variant` to switch between layouts:
 *  - "bundle"  – tall pricing-card skeleton (used by MockTestBundles / MockTestHome)
 *  - "test"    – compact test-card skeleton (used by MockTestDashboard / BundleView)
 *  - "myBundle"- flat owned-bundle skeleton (used by MyBundles)
 */
const MockTestCardSkeleton = ({ variant = 'test' }) => {
    const isBundle = variant === 'bundle';

    return (
        <Card sx={{
            width: '100%',
            maxWidth: isBundle ? '400px' : undefined,
            height: '100%',
            minHeight: isBundle ? 480 : 320,
            borderRadius: isBundle ? '48px' : 6,
            border: `1px solid ${COLORS.border}`,
            background: 'white',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
        }}>
            {/* Shimmer overlay */}
            <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                animation: 'shimmer 1.8s ease-in-out infinite',
                '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                zIndex: 1
            }} />

            <CardContent sx={{ p: isBundle ? { xs: 4, md: 5 } : 2.5 }}>
                <Stack spacing={isBundle ? 2.5 : 1.5}>
                    {/* Top row: badge + optional chip */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Skeleton
                            variant="rounded"
                            width={60}
                            height={60}
                            sx={{ borderRadius: isBundle ? '20px' : 3, bgcolor: alpha(COLORS.accent, 0.08) }}
                        />
                        {isBundle && (
                            <Skeleton
                                variant="rounded"
                                width={100}
                                height={28}
                                sx={{ borderRadius: '14px', bgcolor: alpha(COLORS.accent, 0.1) }}
                            />
                        )}
                    </Box>

                    {/* Title */}
                    <Skeleton
                        variant="text"
                        width="75%"
                        height={isBundle ? 36 : 28}
                        sx={{ borderRadius: 1, bgcolor: alpha(COLORS.primary, 0.08) }}
                    />

                    {/* Description lines */}
                    <Skeleton variant="text" width="90%" height={16} sx={{ bgcolor: alpha(COLORS.primary, 0.06) }} />
                    {isBundle && (
                        <Skeleton variant="text" width="65%" height={16} sx={{ bgcolor: alpha(COLORS.primary, 0.06) }} />
                    )}

                    {/* Feature bars */}
                    {!isBundle && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mt: 0.5 }}>
                            {[1, 2, 3].map(j => (
                                <Skeleton key={j} variant="rounded" width="100%" height={32} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.05) }} />
                            ))}
                        </Box>
                    )}

                    {isBundle && (
                        <>
                            {[1, 2, 3].map(j => (
                                <Skeleton key={j} variant="rounded" width="100%" height={40} sx={{ borderRadius: 3.5, bgcolor: alpha(COLORS.primary, 0.05) }} />
                            ))}
                            {/* Price section */}
                            <Box sx={{
                                mt: 1, p: 3, borderRadius: '35px',
                                bgcolor: '#fbfcfd', border: `1px solid ${COLORS.border}`
                            }}>
                                <Skeleton variant="text" width="40%" height={14} sx={{ mb: 1, bgcolor: alpha(COLORS.primary, 0.06) }} />
                                <Skeleton variant="text" width="55%" height={40} sx={{ borderRadius: 1, mb: 2, bgcolor: alpha(COLORS.primary, 0.08) }} />
                                <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: '20px', bgcolor: alpha(COLORS.accent, 0.08) }} />
                            </Box>
                        </>
                    )}

                    {/* CTA button (non-bundle) */}
                    {!isBundle && (
                        <Box sx={{ pt: 0.5 }}>
                            <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.accent, 0.08) }} />
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default MockTestCardSkeleton;

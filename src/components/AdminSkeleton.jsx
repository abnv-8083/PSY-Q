import React from 'react';
import { Box, Skeleton, Paper, Stack, alpha } from '@mui/material';
import { COLORS } from '../theme/adminTheme';

/**
 * Reusable skeleton loaders for admin pages.
 * Variants:
 *  - "cards"    — grid of card skeletons (BundleManagement, ContentManagement)
 *  - "table"    — table row skeletons (StudentManagement, PurchaseRequests, AdminManagement)
 *  - "stats"    — stats bar + content skeleton (Analytics)
 *  - "detail"   — single detail page skeleton (QuestionBank)
 *  - "dashboard"— admin landing page dashboard cards
 */

const shimmerSx = {
    '@keyframes shimmer': {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
    },
};

const ShimmerOverlay = () => (
    <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
        animation: 'shimmer 1.8s ease-in-out infinite',
        zIndex: 1, pointerEvents: 'none',
        ...shimmerSx,
    }} />
);

// ─── Card Grid Skeleton ───────────────────────────────────────────
export const CardGridSkeleton = ({ count = 3, columns = 3 }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: `repeat(${columns}, 1fr)` }, gap: 4 }}>
        {Array.from({ length: count }).map((_, i) => (
            <Paper key={i} elevation={0} sx={{
                borderRadius: 5, border: `1px solid ${COLORS.border}`,
                overflow: 'hidden', position: 'relative', bgcolor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
                <ShimmerOverlay />
                <Box sx={{ height: 4, background: `linear-gradient(90deg, ${alpha(COLORS.accent, 0.3)}, ${alpha('#ec4899', 0.2)})` }} />
                <Box sx={{ p: 3.5 }}>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.accent, 0.08) }} />
                            <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.06) }} />
                        </Box>
                        <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: alpha(COLORS.primary, 0.08) }} />
                        <Skeleton variant="text" width="90%" height={14} sx={{ bgcolor: alpha(COLORS.primary, 0.05) }} />
                        <Skeleton variant="text" width="60%" height={14} sx={{ bgcolor: alpha(COLORS.primary, 0.05) }} />
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.05) }} />
                            <Skeleton variant="rounded" width={60} height={28} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.primary, 0.05) }} />
                        </Box>
                        <Skeleton variant="rounded" width="100%" height={44} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.primary, 0.04) }} />
                    </Stack>
                </Box>
            </Paper>
        ))}
    </Box>
);

// ─── Table Skeleton ───────────────────────────────────────────────
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${COLORS.border}`, overflow: 'hidden', position: 'relative' }}>
        <ShimmerOverlay />
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2, p: 2, bgcolor: alpha(COLORS.primary, 0.02), borderBottom: `1px solid ${COLORS.border}` }}>
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} variant="text" width={i === 0 ? '30%' : `${70 / cols}%`} height={16} sx={{ bgcolor: alpha(COLORS.primary, 0.08) }} />
            ))}
        </Box>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, row) => (
            <Box key={row} sx={{ display: 'flex', gap: 2, p: 2, borderBottom: `1px solid ${alpha(COLORS.border, 0.5)}` }}>
                {Array.from({ length: cols }).map((_, col) => (
                    <Box key={col} sx={{ flex: col === 0 ? 2 : 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {col === 0 && <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: alpha(COLORS.accent, 0.08) }} />}
                        <Skeleton variant="text" width={col === 0 ? '60%' : '80%'} height={16} sx={{ bgcolor: alpha(COLORS.primary, 0.06) }} />
                    </Box>
                ))}
            </Box>
        ))}
    </Paper>
);

// ─── Stats Bar Skeleton ───────────────────────────────────────────
export const StatsBarSkeleton = ({ count = 4 }) => (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        {Array.from({ length: count }).map((_, i) => (
            <Paper key={i} elevation={0} sx={{
                flex: 1, minWidth: 140, p: 2.5, borderRadius: 4,
                border: `1px solid ${COLORS.border}`, position: 'relative', overflow: 'hidden',
            }}>
                <ShimmerOverlay />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.accent, 0.08) }} />
                    <Box>
                        <Skeleton variant="text" width={50} height={28} sx={{ bgcolor: alpha(COLORS.primary, 0.08) }} />
                        <Skeleton variant="text" width={70} height={12} sx={{ bgcolor: alpha(COLORS.primary, 0.05) }} />
                    </Box>
                </Box>
            </Paper>
        ))}
    </Box>
);

// ─── Dashboard Cards Skeleton ─────────────────────────────────────
export const DashboardSkeleton = () => (
    <Box>
        {/* Header skeleton */}
        <Box sx={{ mb: 6 }}>
            <Skeleton variant="text" width={350} height={40} sx={{ bgcolor: alpha(COLORS.primary, 0.08), borderRadius: 1, mb: 1 }} />
            <Skeleton variant="text" width={450} height={24} sx={{ bgcolor: alpha(COLORS.primary, 0.05), borderRadius: 1 }} />
        </Box>
        {/* Cards grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Paper key={i} elevation={0} sx={{
                    borderRadius: 2, border: `2px solid ${COLORS.border}`, overflow: 'hidden', position: 'relative',
                }}>
                    <ShimmerOverlay />
                    <Box sx={{ p: 4, display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                        <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 2, bgcolor: alpha(COLORS.accent, 0.08) }} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={22} sx={{ bgcolor: alpha(COLORS.primary, 0.08), mb: 0.5 }} />
                            <Skeleton variant="text" width="50%" height={14} sx={{ bgcolor: alpha(COLORS.primary, 0.05) }} />
                        </Box>
                    </Box>
                </Paper>
            ))}
        </Box>
    </Box>
);

// ─── Page Header Skeleton ─────────────────────────────────────────
export const PageHeaderSkeleton = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.primary, 0.06) }} />
            <Box>
                <Skeleton variant="text" width={250} height={32} sx={{ bgcolor: alpha(COLORS.primary, 0.08) }} />
                <Skeleton variant="text" width={350} height={16} sx={{ bgcolor: alpha(COLORS.primary, 0.05) }} />
            </Box>
        </Box>
        <Skeleton variant="rounded" width={160} height={44} sx={{ borderRadius: 3, bgcolor: alpha(COLORS.accent, 0.08) }} />
    </Box>
);

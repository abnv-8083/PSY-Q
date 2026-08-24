/**
 * Shared Mock Test Theme
 * Centralizes COLORS, FONTS, and icon-mapper helpers used across all mocktest pages.
 * Import from here instead of redeclaring in each page component.
 */

import {
    Brain, Users, FlaskConical, BarChart3, Library, Activity,
    Heart, BookOpen, Crown, Package, Zap
} from 'lucide-react';

// ─── Color Palette ────────────────────────────────────────────────
export const COLORS = {
    primary: '#1e293b',
    secondary: '#4b5563',
    accent: '#ca0056',
    accentHover: '#b8003f',
    background: '#fdf2f8',
    cardBg: '#FFFFFF',
    textLight: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#F39C12',
};

// ─── Typography ───────────────────────────────────────────────────
export const FONTS = {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
};

// ─── Icon Mappers ─────────────────────────────────────────────────

/** Returns an icon component based on a subject/topic name. */
export const getSubjectIcon = (subjectName) => {
    const name = subjectName?.toLowerCase() || '';
    if (name.includes('psych')) return Brain;
    if (name.includes('socio')) return Users;
    if (name.includes('scien')) return FlaskConical;
    if (name.includes('math') || name.includes('stat')) return BarChart3;
    if (name.includes('hist') || name.includes('cultur')) return Library;
    if (name.includes('clini')) return Activity;
    if (name.includes('counsel')) return Heart;
    return BookOpen;
};

/** Returns an icon component based on a bundle/package name. */
export const getBundleIcon = (bundleName) => {
    const name = bundleName?.toLowerCase() || '';
    if (name.includes('premium') || name.includes('pro') || name.includes('elite')) return Crown;
    if (name.includes('advanced') || name.includes('inter')) return Zap;
    if (name.includes('psych')) return Brain;
    if (name.includes('clinical')) return Activity;
    if (name.includes('counsel')) return Heart;
    return Package;
};

// ─── Shared Motion Variants ───────────────────────────────────────

/** Fade-up entrance used by most page sections. */
export const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

/** Stagger container — pair with `variants` on each child Box. */
export const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08 },
    },
};

/** Individual item variant for stagger children. */
export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

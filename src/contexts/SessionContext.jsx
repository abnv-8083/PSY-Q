import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const SessionContext = createContext();

// Session timeout configuration (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showWarning, setShowWarning] = useState(false);

    // Track user activity
    const updateActivity = () => {
        setLastActivity(Date.now());
        setShowWarning(false);
    };

    // Handle automatic logout
    const handleAutoLogout = async () => {
        try {
            await firebaseSignOut(auth);
            await supabase.auth.signOut();
            setShowWarning(false);
            // Redirect will be handled by auth state change
        } catch (error) {
            console.error('Auto-logout error:', error);
        }
    };

    // Extend session (called when user dismisses warning)
    const extendSession = () => {
        updateActivity();
    };

    // Manual logout
    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Listen to Auth state changes
    useEffect(() => {
        // 1. Firebase Listener
        const unsubscribeFirebase = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                updateActivity();
                setLoading(false);
            } else {
                // Check if Supabase has a user before setting null
                const { data: { user: sbUser } } = await supabase.auth.getUser();
                if (!sbUser) {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        // 2. Supabase Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);
                updateActivity();
                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                // Check if Firebase has a user before setting null
                if (!auth.currentUser) {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            unsubscribeFirebase();
            subscription.unsubscribe();
        };
    }, []);

    // Activity listeners
    useEffect(() => {
        if (!user) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
        };
    }, [user]);

    // Session timeout checker
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const timeSinceActivity = now - lastActivity;

            // Show warning 5 minutes before timeout
            if (timeSinceActivity >= SESSION_TIMEOUT - WARNING_TIME && !showWarning) {
                setShowWarning(true);
            }

            // Auto-logout after timeout
            if (timeSinceActivity >= SESSION_TIMEOUT) {
                handleAutoLogout();
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [user, lastActivity, showWarning]);

    const value = {
        user,
        loading,
        logout,
        extendSession,
        showWarning,
        timeUntilLogout: user ? Math.max(0, SESSION_TIMEOUT - (Date.now() - lastActivity)) : 0
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
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
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showWarning, setShowWarning] = useState(false);

    // Fetch user profile
    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    // Track user activity
    const updateActivity = () => {
        setLastActivity(Date.now());
        setShowWarning(false);
    };

    // Handle automatic logout
    const handleAutoLogout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setShowWarning(false);
            window.location.href = '/signin';
        } catch (error) {
            console.error('Auto-logout error:', error);
        }
    };

    // Manual logout
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            window.location.href = '/signin';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Listen to Auth state changes
    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            }
            setLoading(false);
        });

        // Supabase Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }

            setLoading(false);

            if (event === 'SIGNED_IN') {
                updateActivity();
            }
        });

        return () => {
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
        profile,
        loading,
        logout,
        extendSession: updateActivity,
        showWarning,
        timeUntilLogout: user ? Math.max(0, SESSION_TIMEOUT - (Date.now() - lastActivity)) : 0
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

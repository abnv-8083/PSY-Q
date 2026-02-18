import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SessionContext = createContext();

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

    useEffect(() => {
        // Load session from local storage on mount
        try {
            const storedUser = localStorage.getItem('psyq_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to parse user session:', error);
            localStorage.removeItem('psyq_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password, type = 'student') => {
        const action = type === 'admin' ? 'admin-login' : 'student-login';

        console.log(`Attempting ${action} for ${email}`);

        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action, email, password }
        });

        if (error) {
            console.error('Edge Function Invocation Error:', error);
            // Try to extract body from the error if it's a 4xx error (like 403 suspension)
            let errorMessage = 'Network error or server unavailable';
            try {
                if (error.context && typeof error.context.json === 'function') {
                    const errorJson = await error.context.json();
                    errorMessage = errorJson.error || errorMessage;
                } else if (error.message) {
                    errorMessage = error.message;
                }
            } catch (e) {
                console.warn('Failed to parse error body:', e);
            }
            throw new Error(errorMessage);
        }

        if (data.error) {
            console.warn('Login Logic Error:', data.error);
            throw new Error(data.error);
        }

        console.log('Login successful:', data.user);
        setUser(data.user);
        localStorage.setItem('psyq_user', JSON.stringify(data.user));
        return data.user;
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('psyq_user');
        window.location.href = '/';
    };

    const signup = async (formData) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'student-signup', ...formData }
        });


        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        return data;
    };

    const verifyOtp = async (email, otp) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'student-verify', email, otp }
        });

        if (error) {
            console.error('Verify OTP Invocation Error:', error);
            // Try to extract body from the error if it exists
            let errorMessage = error.message;
            try {
                if (error.context && error.context.json) {
                    errorMessage = error.context.json.error || errorMessage;
                }
            } catch (e) { }
            throw new Error(errorMessage);
        }
        if (data && data.error) {
            console.warn('Verify OTP Logic Error:', data.error);
            throw new Error(data.error);
        }



        setUser(data.user);
        localStorage.setItem('psyq_user', JSON.stringify(data.user));
        return data.user;
    };

    // Admin creation (Protected by Admin Key usually, but here checking existing admin role)
    const createAdmin = async (adminData, currentAdminKey) => {
        // This likely needs a separate flow or sticking to the existing 'create-admin' function 
        // but updated to use the new 'admins' table. 
        // For now, we are focusing on Login/Signup flows.
    };

    // Student Password Reset
    const forgotPassword = async (email) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'student-forgot-password', email }
        });
        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        return data;
    };

    const resetPassword = async (email, token, newPassword) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'student-reset-password', email, token, newPassword }
        });
        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        return data;
    };

    // Admin Password Reset
    const adminResetPasswordRequest = async (email) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'admin-reset-password-request', email }
        });
        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        return data; // returns { token }
    };

    const adminResetPasswordConfirm = async (email, token, newPassword) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'admin-reset-password-confirm', email, token, newPassword }
        });
        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        return data;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        signup,
        verifyOtp,
        forgotPassword,
        resetPassword,
        adminResetPasswordRequest,
        adminResetPasswordConfirm,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin'
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

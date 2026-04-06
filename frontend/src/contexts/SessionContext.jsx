import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';

const SessionContext = createContext();

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [studentUser, setStudentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to check if current path is an admin path
    const isAdminPath = () => {
        const path = window.location.pathname;
        return path.startsWith('/admin') || path.includes('/mocktest/admin');
    };

    useEffect(() => {
        // Load sessions from local storage on mount
        try {
            // Allow both admin and student sessions to coexist
            const storedAdmin = localStorage.getItem('psyq_admin');
            if (storedAdmin) {
                setAdminUser(JSON.parse(storedAdmin));
            }
            const storedStudent = localStorage.getItem('psyq_student');
            if (storedStudent) {
                setStudentUser(JSON.parse(storedStudent));
            }
        } catch (error) {
            console.error('Failed to parse user sessions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password, type = 'student') => {
        const endpoint = type === 'admin' ? '/auth/admin/login' : '/auth/student/login';
        console.log(`Attempting login for ${email} at ${endpoint}`);

        try {
            const response = await apiClient.post(endpoint, { email, password });
            const { user, token } = response.data;

            console.log('Login successful:', user);
            
            if (type === 'admin') {
                setAdminUser(user);
                localStorage.setItem('psyq_admin', JSON.stringify({ ...user, token }));
            } else {
                setStudentUser(user);
                localStorage.setItem('psyq_student', JSON.stringify({ ...user, token }));
            }
            
            return user;
        } catch (error) {
            console.error('Login Error:', error);
            const errorMessage = error.response?.data?.error || 'Login failed';
            throw new Error(errorMessage);
        }
    };

    const logoutAdmin = async () => {
        setAdminUser(null);
        localStorage.removeItem('psyq_admin');
        // Optional: redirect to admin signin if currently in admin area
        if (isAdminPath()) {
            window.location.href = '/admin/signin';
        }
    };

    const logoutStudent = async () => {
        setStudentUser(null);
        localStorage.removeItem('psyq_student');
        // Optional: redirect if currently in student area
        if (window.location.pathname.startsWith('/student')) {
            window.location.href = '/student/signin';
        }
    };

    // Keep generic logout for backward compatibility if needed, but it's better to be specific
    const logout = async () => {
        if (isAdminPath()) {
            await logoutAdmin();
        } else {
            await logoutStudent();
        }
    };

    const signup = async (formData) => {
        try {
            const response = await apiClient.post('/auth/student/signup', formData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Signup failed';
            throw new Error(errorMessage);
        }
    };

    const verifyOtp = async (email, otp, signupData) => {
        try {
            const response = await apiClient.post('/auth/student/verify', { email, otp, signupData });
            const { user, token } = response.data;

            setStudentUser(user);
            localStorage.setItem('psyq_student', JSON.stringify({ ...user, token }));
            return user;
        } catch (error) {
            console.error('Verify OTP Error:', error);
            const errorMessage = error.response?.data?.error || 'Verification failed';
            throw new Error(errorMessage);
        }
    };

    const forgotPassword = async (email) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'student-forgot-password', email }
        });
        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        // Send reset email via backend
        if (data.token) {
            try {
                const resetLink = `${window.location.origin}/student/reset-password?token=${data.token}&email=${email}`;
                const backendUrl = import.meta.env.VITE_API_URL || '';
                await axios.post(`${backendUrl}/api/send-reset-link`, {
                    email,
                    name: data.user?.full_name || 'Student',
                    resetLink
                });
            } catch (emailErr) {
                console.error('Failed to send reset email:', emailErr);
                // We still return data because the token was generated
            }
        }

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

    const adminResetPasswordRequest = async (email) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'admin-reset-password-request', email }
        });
        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        return data;
    };

    const adminResetPasswordConfirm = async (email, token, newPassword) => {
        const { data, error } = await supabase.functions.invoke('auth-service', {
            body: { action: 'admin-reset-password-confirm', email, token, newPassword }
        });
        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        return data;
    };

    // Helper to get the relevant user based on the current route
    const getCurrentUser = () => {
        if (isAdminPath()) {
            return adminUser;
        }
        return studentUser;
    };

    const value = {
        adminUser,
        studentUser,
        user: getCurrentUser(),
        loading,
        login,
        logout,
        logoutAdmin,
        logoutStudent,
        signup,
        verifyOtp,
        forgotPassword,
        resetPassword,
        adminResetPasswordRequest,
        adminResetPasswordConfirm,
        isAdmin: !!adminUser,
        isStudent: !!studentUser
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

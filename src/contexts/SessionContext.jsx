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

    const forgotPassword = async (email, type = 'student') => {
        try {
            const response = await apiClient.post('/auth/forgot-password', { email, type });
            const { token, user: userData } = response.data;
            
            // Send reset email via backend
            if (token) {
                const resetLink = `${window.location.origin}${type === 'admin' ? '/admin' : '/student'}/reset-password?token=${token}&email=${email}`;
                await apiClient.post('/send-reset-link', {
                    email,
                    name: userData.full_name || 'User',
                    resetLink
                });
            }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to request password reset';
            throw new Error(errorMessage);
        }
    };

    const resetPassword = async (email, token, newPassword) => {
        try {
            const response = await apiClient.post('/auth/reset-password', { email, token, newPassword });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Failed to reset password';
            throw new Error(errorMessage);
        }
    };

    const adminResetPasswordRequest = async (email) => {
        return forgotPassword(email, 'admin');
    };

    const adminResetPasswordConfirm = async (email, token, newPassword) => {
        return resetPassword(email, token, newPassword);
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

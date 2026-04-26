import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Student, Admin } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'psyq_secret_key';

export const studentSignup = async (req, res) => {
    try {
        const { email, password, full_name, fullName, phone, otp: providedOtp } = req.body;
        const finalFullName = full_name || fullName;

        const existing = await Student.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const otp = providedOtp || Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // In this implementation, we return the signup data to the frontend
        // so it can pass it back during verification (same as Supabase edge function logic)
        res.json({
            message: 'OTP generated',
            signupData: {
                email,
                password_hash,
                full_name: finalFullName,
                phone,
                otp_code: otp,
                otp_expires_at: expiresAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const studentVerify = async (req, res) => {
    try {
        const { email, otp, signupData } = req.body;

        if (!signupData) return res.status(400).json({ error: 'Missing signup data' });

        const isExpired = new Date() > new Date(signupData.otp_expires_at);
        if (signupData.otp_code !== otp.trim()) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }
        if (isExpired) {
            return res.status(400).json({ error: 'Verification code expired' });
        }

        const newStudent = await Student.create({
            email: signupData.email,
            password_hash: signupData.password_hash,
            full_name: signupData.full_name,
            phone: signupData.phone,
            is_verified: true
        });

        const token = jwt.sign({ id: newStudent._id, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: { id: newStudent._id, email: newStudent.email, full_name: newStudent.full_name, role: 'student' },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const studentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });

        if (!student) return res.status(404).json({ error: 'Create Account' });
        if (!student.is_verified) return res.status(403).json({ error: 'Email not verified' });

        const isMatch = await bcrypt.compare(password, student.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid Password' });

        const token = jwt.sign({ id: student._id, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: { id: student._id, email: student.email, full_name: student.full_name, role: 'student' },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(404).json({ error: 'Admin Not Found' });
        if (admin.is_blocked) return res.status(403).json({ error: 'Account suspended' });

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect Password' });

        const token = jwt.sign({ id: admin._id, role: admin.role, is_admin: true }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            user: {
                id: admin._id,
                email: admin.email,
                role: admin.role,
                is_admin: true,
                full_name: admin.full_name,
                permissions: admin.permissions
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getStudentProfile = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });
        
        const student = await Student.findById(userId).select('-password_hash');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateStudentProfile = async (req, res) => {
    try {
        const { userId, updates, newPassword } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const student = await Student.findById(userId);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        if (updates) {
            if (updates.full_name) student.full_name = updates.full_name;
            if (updates.email) student.email = updates.email;
            if (updates.phone) student.phone = updates.phone;
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            student.password_hash = await bcrypt.hash(newPassword, salt);
        }

        await student.save();
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email, type = 'student' } = req.body;
        const Model = type === 'admin' ? Admin : Student;
        const user = await Model.findOne({ email });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate a short-lived reset token (15 mins)
        const token = jwt.sign({ id: user._id, email: user.email, type }, JWT_SECRET, { expiresIn: '15m' });

        res.json({
            success: true,
            token,
            user: {
                full_name: user.full_name || 'User',
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired reset token' });
        }

        if (decoded.email !== email) {
            return res.status(400).json({ error: 'Token email mismatch' });
        }

        const Model = decoded.type === 'admin' ? Admin : Student;
        const user = await Model.findById(decoded.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

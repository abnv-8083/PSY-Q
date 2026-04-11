import bcrypt from 'bcryptjs';
import { Admin } from '../models/index.js';

export const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password_hash');
        res.json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { email, password, full_name, role, permissions } = req.body;
        
        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Admin already exists' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const admin = new Admin({
            email,
            password_hash,
            full_name,
            role,
            permissions
        });

        await admin.save();
        res.json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password_hash = await bcrypt.hash(updates.password, salt);
            delete updates.password;
        }

        const admin = await Admin.findByIdAndUpdate(id, updates, { new: true }).select('-password_hash');
        res.json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Admin deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import { Payment } from '../models/index.js';

export const getStudentPayments = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, message: 'User ID required' });
        
        const payments = await Payment.find({ user_id: userId }).sort({ created_at: -1 });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPayment = async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();
        res.json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import { Student, Payment, Result, Bundle, Subject, Test } from '../models/index.js';

export const getDashboardStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Total Counts
        const [userCount, attemptCount, bundleCount] = await Promise.all([
            Student.countDocuments(),
            Result.countDocuments(),
            Payment.countDocuments({ type: 'bundle', status: 'success' }) // Simple proxy for active bundles
        ]);

        // 2. Payments / Revenue
        const payments = await Payment.find({ status: 'success' })
            .populate('item_id') // Might need better population if it's dynamic
            .sort({ created_at: -1 });
        
        const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // 3. Recent Activites
        const [recentSignups, allResults] = await Promise.all([
            Student.find().sort({ created_at: -1 }).limit(5),
            Result.find()
                .populate('test_id', 'name subject_id')
                .sort({ created_at: -1 })
        ]);

        // 4. Subjects for performance mapping
        const subjects = await Subject.find();
        const subjectsMap = {};
        subjects.forEach(s => subjectsMap[s._id.toString()] = s.name);

        res.json({
            success: true,
            data: {
                totalUsers: userCount,
                totalRevenue,
                totalAttempts: attemptCount,
                activeBundles: bundleCount,
                recentSignups,
                payments,
                allResults,
                subjectsMap,
                thirtyDaysAgo
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        const [attempts, payments] = await Promise.all([
            Result.find({ user_id: userId }).populate('test_id', 'name').sort({ created_at: 1 }),
            Payment.find({ user_id: userId, status: 'success' }).sort({ created_at: -1 })
        ]);

        // Fetch Bundle Info for payments if they are bundles
        const bundleIds = payments.filter(p => p.type === 'bundle').map(p => p.item_id);
        const bundles = await Bundle.find({ _id: { $in: bundleIds } });

        res.json({
            success: true,
            data: {
                attempts,
                payments,
                bundles
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ success: true, data: [] });

        const students = await Student.find({
            $or: [
                { full_name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);

        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

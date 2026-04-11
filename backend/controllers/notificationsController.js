import { Notification } from '../models/index.js';

export const getNotifications = async (req, res) => {
    try {
        const { activeOnly } = req.query;
        const filter = activeOnly === 'true' ? { is_active: true } : {};
        const notifications = await Notification.find(filter).sort({ display_order: 1 });
        res.json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reorderNotifications = async (req, res) => {
    try {
        const { notifications } = req.body;
        const updates = notifications.map((n, index) => 
            Notification.findByIdAndUpdate(n.id || n._id, { display_order: index })
        );
        await Promise.all(updates);
        res.json({ success: true, message: 'Reordered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

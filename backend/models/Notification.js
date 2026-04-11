import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    image_url: { type: String },
    header: { type: String, required: true },
    description: { type: String },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

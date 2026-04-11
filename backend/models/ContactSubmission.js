import mongoose from 'mongoose';

const contactSubmissionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact_type: { type: String, enum: ['bug', 'feedback', 'general', 'business'], default: 'general' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    attachment_urls: [{ type: String }],
    created_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' }
});

const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);
export default ContactSubmission;

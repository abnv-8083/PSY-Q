import { ContactSubmission } from '../models/index.js';

export const getSubmissions = async (req, res) => {
    try {
        const submissions = await ContactSubmission.find().sort({ created_at: -1 });
        res.json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createSubmission = async (req, res) => {
    try {
        const submission = new ContactSubmission(req.body);
        await submission.save();
        res.json({ success: true, data: submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSubmission = async (req, res) => {
    try {
        await ContactSubmission.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

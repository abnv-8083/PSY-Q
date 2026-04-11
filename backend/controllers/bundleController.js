import { Bundle } from '../models/index.js';

export const getBundles = async (req, res) => {
    try {
        const bundles = await Bundle.find().populate('tests').sort({ display_order: 1 });
        res.json({ success: true, data: bundles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBundleById = async (req, res) => {
    try {
        const bundle = await Bundle.findById(req.params.id).populate('tests');
        res.json({ success: true, data: bundle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBundle = async (req, res) => {
    try {
        const bundle = new Bundle(req.body);
        await bundle.save();
        res.json({ success: true, data: bundle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBundle = async (req, res) => {
    try {
        const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: bundle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBundle = async (req, res) => {
    try {
        await Bundle.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Bundle deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reorderBundles = async (req, res) => {
    try {
        const { bundles } = req.body;
        const updates = bundles.map((b, index) => 
            Bundle.findByIdAndUpdate(b.id || b._id, { display_order: index })
        );
        await Promise.all(updates);
        res.json({ success: true, message: 'Reordered' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

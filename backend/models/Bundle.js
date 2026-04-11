import mongoose from 'mongoose';

const bundleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  regular_price: { type: Number, default: 0 },
  offer_price: { type: Number, default: 0 },
  bundle_type: { type: String, default: 'BASIC' }, // e.g., 'BASIC', 'ADVANCED', 'PREMIUM'
  features: [{ type: String }],
  subjects: [{ type: String }], // Array of subject names or IDs
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
  display_order: { type: Number, default: 0 },
  is_best_seller: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Bundle = mongoose.model('Bundle', bundleSchema);
export default Bundle;

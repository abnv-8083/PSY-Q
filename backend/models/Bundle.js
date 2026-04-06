import mongoose from 'mongoose';

const bundleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  original_price: { type: Number },
  subjects: [{ type: String }], // Array of subject names or IDs
  is_active: { type: Boolean, default: true },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Bundle = mongoose.model('Bundle', bundleSchema);
export default Bundle;

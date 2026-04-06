import mongoose from 'mongoose';

const purchaseRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  item_type: { type: String, enum: ['bundle', 'test'], required: true },
  item_id: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  request_number: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);
export default PurchaseRequest;

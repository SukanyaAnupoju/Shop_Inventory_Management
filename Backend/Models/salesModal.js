import mongoose from 'mongoose';

const salesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cust_name: { type: String, required: true, trim: true },
    cust_email: { type: String, required: true, trim: true, lowercase: true },
    cust_contact: { type: String, trim: true },
    cartItems: { type: Array, default: [] },
  },
  { timestamps: true }
);

// If you need reporting per customer quickly:
// salesSchema.index({ userId: 1, cust_email: 1 });

const Sale = mongoose.model('Sale', salesSchema);
export default Sale;

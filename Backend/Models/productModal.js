import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    p_name: { type: String, required: true, trim: true },
    p_price: { type: Number, required: true },
    p_stock: { type: Number, required: true },
    p_thumbnail: { type: String },
  },
  { timestamps: true }
);

// Speed up queries for a user's products by name
productSchema.index({ userId: 1, p_name: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;

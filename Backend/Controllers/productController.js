import Product from "../Models/productModal.js";
import User from "../Models/userModel.js";

// Get all products of logged-in user (stock > 0)
export const getProductsController = async (req, res) => {
    try {
        const products = await Product.find({ 
            p_stock: { $gt: 0 },
            userId: req.user.userId
        });

        return res.status(200).json({ status: true, data: products });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to fetch products", error });
    }
};

// Insert new product (only logged-in user)
export const insertProductController = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ status: false, message: "Unauthorized user" });

        const product = await Product.create({ ...req.body, userId: req.user.userId });
        user.products.push(product._id);
        await user.save();

        return res.status(200).json({ status: true, message: "Product inserted", data: product });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to insert product", error });
    }
};

// Update product (only owner)
export const updateProductController = async (req, res) => {
    const { productId, newdata } = req.body;
    try {
        const product = await Product.findOne({ _id: productId, userId: req.user.userId });
        if (!product) return res.status(404).json({ status: false, message: "Product not found or not yours" });

        await Product.findByIdAndUpdate(productId, newdata, { new: true });
        return res.status(200).json({ status: true, message: "Product updated" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to update product", error });
    }
};

// Delete product (only owner)
export const deleteProductController = async (req, res) => {
    const { productId } = req.body;
    try {
        const product = await Product.findOne({ _id: productId, userId: req.user.userId });
        if (!product) return res.status(404).json({ status: false, message: "Product not found or not yours" });

        await Product.deleteOne({ _id: productId });

        const user = await User.findById(req.user.userId);
        user.products = user.products.filter(id => id.toString() !== productId.toString());
        await user.save();

        return res.status(200).json({ status: true, message: "Product deleted" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to delete product", error });
    }
};

// Sell product (decrease stock) - only owner can sell their product
export const sellProductController = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const product = await Product.findOne({ _id: productId, userId: req.user.userId });
        if (!product) return res.status(404).json({ status: false, message: "Product not found or not yours" });

        if (product.p_stock < quantity) {
            return res.status(400).json({ status: false, message: "Insufficient stock" });
        }

        product.p_stock -= quantity;
        await product.save();

        return res.status(200).json({ status: true, message: "Product sold", data: product });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to sell product", error });
    }
};

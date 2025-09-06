import User from "../Models/userModel.js";
import Sale from "../Models/salesModal.js";
import Product from "../Models/productModal.js";

// Get all sales of logged-in user
export const getSalesController = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate("sales");
        if (!user) {
            return res.status(404).json({ status: false, message: "Unauthorized user" });
        }

        return res.status(200).json({ status: true, data: user.sales });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to fetch sales data", error: error.message });
    }
};

// Create new sale (only for logged-in user's products)
export const createNewSaleController = async (req, res) => {
    try {
        const { cust_name, cust_email, cust_contact, cartItems } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ status: false, message: "Unauthorized user" });
        }

        // Check ownership and stock
        for (const item of cartItems) {
            const product = await Product.findOne({ _id: item.c_id, userId: req.user.userId });
            if (!product) {
                return res.status(403).json({ status: false, message: "You can only sell your own products" });
            }
            if (product.p_stock < item.c_quantity) {
                return res.status(400).json({ status: false, message: `Insufficient stock for ${product.p_name}` });
            }
        }

        // Create sale
        const sale = await Sale.create({
            cust_name,
            cust_email,
            cust_contact,
            cartItems,
            userId: req.user.userId
        });

        user.sales.push(sale._id);
        await user.save();

        // Reduce stock
        for (const item of cartItems) {
            const product = await Product.findOne({ _id: item.c_id, userId: req.user.userId });
            product.p_stock -= item.c_quantity;
            await product.save();
        }

        // Return updated products of this user only
        const updatedProducts = await Product.find({ p_stock: { $gt: 0 }, userId: req.user.userId });

        return res.status(200).json({
            status: true,
            message: "Sale created successfully",
            products: updatedProducts
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to create sale", error: error.message });
    }
};

// Delete sale (only user's own sale)
export const deleteSaleController = async (req, res) => {
    try {
        const { salesId } = req.body;
        const sale = await Sale.findOne({ _id: salesId, userId: req.user.userId });
        if (!sale) {
            return res.status(404).json({ status: false, message: "Sale not found or not yours" });
        }

        await Sale.deleteOne({ _id: salesId });

        const user = await User.findById(req.user.userId);
        user.sales = user.sales.filter(s => s.toString() !== salesId);
        await user.save();

        return res.status(200).json({ status: true, message: "Sale deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to delete sale", error: error.message });
    }
};

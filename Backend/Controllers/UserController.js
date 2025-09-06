import User from "../Models/userModel.js";
import Product from "../Models/productModal.js";
import Sale from "../Models/salesModal.js"; // only if tracking sales

export const getProfileController = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("email");
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        const totalProducts = await Product.countDocuments({ userId: req.user.userId });
        const totalSales = await Sale.countDocuments({ userId: req.user.userId });

        return res.status(200).json({
            status: true,
            data: {
                email: user.email,
                totalProducts,
                totalSales
            }
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Failed to load profile", error });
    }
};

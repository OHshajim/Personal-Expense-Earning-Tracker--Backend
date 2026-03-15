import History from "../models/historyModel.js";

export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await History.findAll({
            where: { UserId: userId },
            order: [["createdAt", "DESC"]], // latest first
        });

        res.json({
            success: true,
            history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        await sequelize.sync();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Unable to start server:", error);
        process.exit(1);
    }
};

startServer();

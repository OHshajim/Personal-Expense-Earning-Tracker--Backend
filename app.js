import express from "express";

import { initSocket } from "./socket/socketHandler.js";
import { startNotificationScheduler } from "./utils/notificationScheduler.js";

import notificationRoutes from "./routes/notificationRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import depositRoutes from "./routes/depositRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"; 
import historyRoutes from "./routes/historyRoutes.js";
import supportRoutes from "./routes/supportRoute.js";

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`));

initSocket(server);

startNotificationScheduler();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);


export default app;

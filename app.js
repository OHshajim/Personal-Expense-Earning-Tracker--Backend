import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
// import expenseRoutes from "./routes/expenseRoutes.js";
// import depositRoutes from "./routes/depositRoutes.js";
// import borrowRoutes from "./routes/borrowRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/expenses", expenseRoutes);
// app.use("/api/deposits", depositRoutes);
// app.use("/api/borrow", borrowRoutes);

export default app;

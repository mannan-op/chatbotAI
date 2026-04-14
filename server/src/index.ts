import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { db } from "./db/index.js";
import { clerk } from "./middleware/auth.js";
import productsRouter from "./routes/products.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(clerk); // Clerk on every request — non-blocking, just attaches auth state

// Routes
app.use("/api/products", productsRouter);
app.use("/api/chat", chatRouter);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

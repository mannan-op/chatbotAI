import { Router } from "express";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/products — list all products
router.get("/", async (_req, res) => {
  try {
    const result = await db.select().from(products).orderBy(products.createdAt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, req.params.id));

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/products — create (protected, admin only for now)
router.post("/", requireAuth, async (req, res) => {
  try {
    const [product] = await db.insert(products).values(req.body).returning();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

export default router;

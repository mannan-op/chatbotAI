import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    category: text("category").notNull(),
    tags: text("tags").array().default([]),
    imageUrl: text("image_url"),
    inStock: boolean("in_stock").default(true).notNull(),
    metadata: jsonb("metadata").default({}), // flexible extras, no migration needed
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("products_category_idx").on(t.category),
    index("products_name_idx").on(t.name),
  ],
);

// ─── FAQ entries ─────────────────────────────────────────────────────────────

export const faqs = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Chat sessions ────────────────────────────────────────────────────────────

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID
    messages: jsonb("messages").default([]).notNull(),
    totalTokens: integer("total_tokens").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

// ─── Per-user token budgets ───────────────────────────────────────────────────

export const userBudgets = pgTable("user_budgets", {
  userId: text("user_id").primaryKey(), // Clerk user ID
  tokensUsed: integer("tokens_used").default(0).notNull(),
  tokensLimit: integer("tokens_limit").default(50000).notNull(),
  resetAt: timestamp("reset_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Inferred types (use these everywhere in your app) ───────────────────────

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type UserBudget = typeof userBudgets.$inferSelect;

import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { ilike, lte, eq, or, and } from "drizzle-orm";

export const searchProductsTool = {
  type: "function" as const,
  function: {
    name: "search_products",
    description:
      "Search the product catalog. Use when user asks for product recommendations or mentions a product type.",
  },
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: 'Search term, e.g. "wireless headphones"',
      },
      category: {
        type: "string",
        description:
          "Filter by category: electronics, office, accessories, lifestyle",
      },
      maxPrice: { type: "number", description: "Maximum price in USD" },
      inStock: { type: "boolean", description: "Only show in-stock items" },
    },
    required: [],
  },
};

export async function executeSearchProducts(args: {
  query?: string;
  category?: string;
  maxPrice?: number;
  inStock?: boolean;
}) {
  const conditions = [];

  if (args.query) {
    conditions.push(
      or(
        ilike(products.name, `%${args.query}%`),
        ilike(products.description, `%${args.query}%`),
      ),
    );
  }
  if (args.category) {
    conditions.push(eq(products.category, args.category));
  }

  if (args.maxPrice) {
    conditions.push(lte(products.price, String(args.maxPrice)));
  }

  if (args.inStock !== undefined) {
    conditions.push(eq(products.inStock, args.inStock));
  }

  const results = await db
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(5);

  return results.length
    ? results
    : { message: "No products found matching your criteria." };
}

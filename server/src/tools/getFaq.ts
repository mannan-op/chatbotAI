import { db } from "../db/index.js";
import { faqs } from "../db/schema.js";
import { ilike, eq, or } from "drizzle-orm";

export const getFaqTool = {
  type: "function" as const,
  function: {
    name: "get_faq",
    description:
      "Get answers to common questions about shipping, returns, orders, and warranties.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The question to search for" },
        category: {
          type: "string",
          description: "FAQ category: returns, shipping, orders, warranty",
        },
      },
      required: ["query"],
    },
  },
};

export async function executeGetFaq(args: {
  query: string;
  category?: string;
}) {
  const conditions = [
    or(
      ilike(faqs.question, `%${args.query}%`),
      ilike(faqs.answer, `%${args.query}%`),
    )!,
  ];

  if (args.category) {
    conditions.push(eq(faqs.category, args.category));
  }

  const results = await db.select().from(faqs).limit(3);

  return results.length
    ? results
    : { message: "No FAQ entries found for that query." };
}

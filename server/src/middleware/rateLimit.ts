import { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { userBudgets } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getUserId } from "./auth.js";

const TOKEN_LIMIT = 50_000; // 50k tokens per day

export async function checkTokenBudget(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = getUserId(req);

  const [budget] = await db
    .insert(userBudgets)
    .values({ userId, tokensUsed: 0, tokensLimit: TOKEN_LIMIT })
    .onConflictDoUpdate({
      target: userBudgets.userId,
      set: {
        updatedAt: new Date(),
      },
    })
    .returning();

  if (budget.tokensUsed >= budget.tokensLimit) {
    return res.status(429).json({
      error: "Rate limit exceeded. Try again later.",
      used: budget.tokensUsed,
      limit: budget.tokensLimit,
    });
    return;
  }
  next();
}

export async function incrementTokenUsage(userId: string, tokens: number) {
  await db
    .update(userBudgets)
    .set({ tokensUsed: tokens, updatedAt: new Date() });

  await db.execute(
    `UPDATE user_budgets 
     SET tokens_used = tokens_used + ${tokens}
     WHERE user_id = '${userId}'`,
  );
}

import { Router } from "express";
import { groq, MODEL } from "../lib/groq.js";
import { SYSTEM_PROMPT } from "../lib/prompt.js";
import { ChatRequestSchema } from "../lib/schemas.js";
import { requireAuth, getUserId } from "../middleware/auth.js";
import {
  checkTokenBudget,
  incrementTokenUsage,
} from "../middleware/rateLimit.js";
import {
  searchProductsTool,
  executeSearchProducts,
} from "../tools/searchProducts.js";
import { getFaqTool, executeGetFaq } from "../tools/getFaq.js";
import { db } from "../db/index.js";
import { chatSessions } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", requireAuth, checkTokenBudget, async (req, res) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { messages, sessionId } = parsed.data;
  const userId = getUserId(req);

  // SSE headers — this is what enables streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    let totalTokens = 0;
    const allMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Tool loop — keeps running until model stops calling tools
    while (true) {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: allMessages,
        tools: [searchProductsTool, getFaqTool],
        tool_choice: "auto",
        stream: false, // we stream manually after tool resolution
        max_tokens: 1024,
      });

      const message = completion.choices[0].message;
      totalTokens += completion.usage?.total_tokens ?? 0;
      allMessages.push(message);

      // No tool calls — model is done, stream the final response
      if (!message.tool_calls?.length) {
        const content = message.content ?? "";

        // Stream word by word for natural feel
        const words = content.split(" ");
        for (const word of words) {
          send("delta", { content: word + " " });
          await new Promise((r) => setTimeout(r, 20));
        }

        send("done", { totalTokens });
        break;
      }

      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        let result: unknown;

        if (toolCall.function.name === "search_products") {
          result = await executeSearchProducts(args);
          send("tool", { name: "search_products", result }); // send to client for UI
        } else if (toolCall.function.name === "get_faq") {
          result = await executeGetFaq(args);
          send("tool", { name: "get_faq", result });
        }

        // Feed tool result back into conversation
        allMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      // Loop continues — model will now respond with tool results in context
    }

    // Persist session
    await incrementTokenUsage(userId, totalTokens);
    if (sessionId) {
      await db
        .update(chatSessions)
        .set({ messages: allMessages, totalTokens, updatedAt: new Date() })
        .where(eq(chatSessions.id, sessionId));
    } else {
      await db.insert(chatSessions).values({
        userId,
        messages: allMessages,
        totalTokens,
      });
    }
  } catch (err) {
    console.error("Chat error:", err);
    send("error", { message: "Something went wrong" });
  } finally {
    res.end();
  }
});

export default router;

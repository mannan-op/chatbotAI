import { z } from "zod";

export const ProductResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  inStock: z.boolean(),
  tags: z.array(z.string()),
});

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string(),
  toolCallId: z.string().optional(),
  name: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  sessionId: z.string().optional(),
});

export type ProductResult = z.infer<typeof ProductResultSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

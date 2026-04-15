import { useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { streamChat } from "../lib/api";
import type { ChatMessage, Product, ToolEvent } from "../types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const sessionId = useRef<string | undefined>(undefined);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        // Build history for the API (exclude the empty assistant placeholder)
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const stream = await streamChat(history, token, sessionId.current);
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let pendingProducts: Product[] = [];
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events come as "event: name\ndata: {...}\n\n"
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? ""; // keep incomplete last chunk

          for (const raw of events) {
            if (!raw.trim()) continue;

            const eventLine = raw
              .split("\n")
              .find((l) => l.startsWith("event:"));
            const dataLine = raw.split("\n").find((l) => l.startsWith("data:"));
            if (!eventLine || !dataLine) continue;

            const eventName = eventLine.replace("event: ", "").trim();
            const data = JSON.parse(dataLine.replace("data: ", "").trim());

            if (eventName === "delta") {
              // Append streamed token to the assistant message
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: m.content + data.content }
                    : m,
                ),
              );
            }

            if (eventName === "tool") {
              const toolEvent = data as ToolEvent;
              if (
                toolEvent.name === "search_products" &&
                Array.isArray(toolEvent.result)
              ) {
                pendingProducts = toolEvent.result;
              }
            }

            if (eventName === "done") {
              // Attach any product results to the final message
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? {
                        ...m,
                        isStreaming: false,
                        products: pendingProducts.length
                          ? pendingProducts
                          : undefined,
                      }
                    : m,
                ),
              );
            }

            if (eventName === "error") {
              throw new Error(data.message);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, getToken],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionId.current = undefined;
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}

export interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  description: string | null;
  inStock: boolean;
  tags: string[];
  imageUrl: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[]; // populated when a tool result arrives
  isStreaming?: boolean;
}

export interface ToolEvent {
  name: "search_products" | "get_faq";
  result: Product[] | { message: string };
}

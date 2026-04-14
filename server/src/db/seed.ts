import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products, faqs } from "./schema.js";
import dotenv from "dotenv";

dotenv.config();

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const sampleProducts = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Over-ear headphones with 30hr battery and ANC. Perfect for travel and focus work.",
    price: "149.99",
    category: "electronics",
    tags: ["audio", "wireless", "noise-cancelling", "travel"],
    inStock: true,
  },
  {
    name: "Mechanical Keyboard TKL",
    description:
      "Tenkeyless mechanical keyboard with Cherry MX Brown switches. RGB backlit.",
    price: "89.99",
    category: "electronics",
    tags: ["keyboard", "mechanical", "gaming", "productivity"],
    inStock: true,
  },
  {
    name: "Standing Desk Mat",
    description:
      "Anti-fatigue comfort mat for standing desks. Non-slip base, 3/4 inch thick.",
    price: "39.99",
    category: "office",
    tags: ["ergonomic", "standing-desk", "comfort"],
    inStock: true,
  },
  {
    name: "USB-C Hub 7-in-1",
    description:
      "Multiport adapter with 4K HDMI, 3x USB-A, SD card reader, 100W PD charging.",
    price: "49.99",
    category: "electronics",
    tags: ["usb-c", "hub", "adapter", "macbook"],
    inStock: true,
  },
  {
    name: "Minimalist Leather Wallet",
    description:
      "Slim bifold wallet. Holds 6 cards and cash. Full-grain vegetable tanned leather.",
    price: "34.99",
    category: "accessories",
    tags: ["wallet", "leather", "minimalist", "gift"],
    inStock: true,
  },
  {
    name: "Insulated Water Bottle 32oz",
    description:
      "Double-wall vacuum insulated. Keeps drinks cold 24hr, hot 12hr. BPA free.",
    price: "27.99",
    category: "lifestyle",
    tags: ["water-bottle", "insulated", "eco-friendly"],
    inStock: false,
  },
];

const sampleFaqs = [
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day hassle-free return policy. Items must be in original condition. Refunds are processed within 5-7 business days.",
    category: "returns",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout. Free standard shipping on orders over $50.",
    category: "shipping",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to over 40 countries. International shipping takes 7-14 business days. Customs fees may apply depending on your country.",
    category: "shipping",
  },
  {
    question: "How do I track my order?",
    answer:
      "Once your order ships, you will receive a tracking email with a link to monitor delivery status in real time.",
    category: "orders",
  },
  {
    question: "Are your products covered by warranty?",
    answer:
      "Electronics come with a 1-year manufacturer warranty. Other products have a 90-day warranty against defects.",
    category: "warranty",
  },
];

async function seed() {
  console.log("Seeding database...");

  await db.insert(products).values(sampleProducts).onConflictDoNothing();
  console.log(`Inserted ${sampleProducts.length} products`);

  await db.insert(faqs).values(sampleFaqs).onConflictDoNothing();
  console.log(`Inserted ${sampleFaqs.length} FAQs`);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

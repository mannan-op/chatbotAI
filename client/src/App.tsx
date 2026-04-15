import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { ChatWidget } from "./components/ChatWidget";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.43 3h13.32a.75.75 0 0 1 .74.873l-1.5 7.5a.75.75 0 0 1-.74.627h-10a.75.75 0 0 1-.74-.627L5.5 5.5H4.56l-.55-2.49A.25.25 0 0 0 3.758 2.5H1.75A.75.75 0 0 1 1 1.75ZM6 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">ShopBot</span>
        </div>

        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your AI Shopping Assistant
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Ask about products, get recommendations, or track your orders.
        </p>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Get started — it's free
            </button>
          </SignInButton>
        </SignedOut>
      </main>

      {/* Chat widget — only when signed in */}
      <SignedIn>
        <ChatWidget />
      </SignedIn>
    </div>
  );
}

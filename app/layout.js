import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ChatBot from "@/components/chat-bot";
import { SignedIn } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin", "vietnamese"], // Specify the subset(s)
  preload: false, // Preloading enabled
});

export const metadata = {
  title: "Welth ",
  description: "One stop finance solution",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with ❤️ by Ashutosh</p>
            </div>
          </footer>
          <SignedIn>
            <ChatBot />
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}

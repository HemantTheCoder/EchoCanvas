import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import StickyPlayer from "@/components/layout/StickyPlayer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EchoCanvas",
  description: "An immersive music search, playback, and visualization platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col pb-24">
            {children}
          </main>
          <StickyPlayer />
        </AuthProvider>
      </body>
    </html>
  );
}

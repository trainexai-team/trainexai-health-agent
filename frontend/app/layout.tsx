import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "TrainexAI Health Agent — Your Daily Health Decision Engine",
  description:
    "TrainexAI Health Agent helps you stay consistent with fitness and nutrition by converting daily health data into simple personalized decisions.",
  keywords: ["health", "fitness", "AI", "nutrition", "wellness", "tracking"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

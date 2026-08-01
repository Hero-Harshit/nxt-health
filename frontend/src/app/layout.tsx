import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { PamBlob } from "@/components/PamBlob";
import InstallAppModal from "@/components/InstallAppModal";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Ensures app feels like a solid native mobile UI
};

export const metadata: Metadata = {
  title: "NxtHealth",
  description: "Explainable healthcare decision-support guidance for everyday choices.",
  icons: {
    icon: "/logo.png.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">
        <Navbar />
        <main>{children}</main>
        <PamBlob />
        <InstallAppModal />
      </body>
    </html>
  );
}

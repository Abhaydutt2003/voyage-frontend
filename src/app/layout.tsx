import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://master.d3qoia8hz89za5.amplifyapp.com/"),
  title: "Voyage | Discover Your Next Home",
  description:
    "Voyage helps you find, apply, and manage your next rental property with ease.",
  openGraph: {
    title: "Voyage | Discover Your Next Home",
    description:
      "Voyage helps you find, apply, and manage your next rental property with ease.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png", // Path relative to the public directory
        width: 1200,
        height: 630,
        alt: "Voyage - Discover Your Next Home",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voyage | Discover Your Next Home",
    description:
      "Voyage helps you find, apply, and manage your next rental property with ease.",
    images: ["/voyage.png"],
    creator: "@yourtwitterhandle", // Optional: replace with your Twitter handle
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster closeButton />
      </body>
    </html>
  );
}

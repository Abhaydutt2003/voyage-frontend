import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorited Properties | Voyage Tenant Dashboard",
  description:
    "Browse and manage your saved property listings. View all your favorited properties in one convenient location.",
  openGraph: {
    title: "Favorited Properties | Voyage Tenant Dashboard",
    description:
      "Browse and manage your saved property listings. View all your favorited properties in one convenient location.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - Favorited Properties",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Favorited Properties | Voyage Tenant Dashboard",
    description:
      "Browse and manage your saved property listings. View all your favorited properties in one convenient location.",
    images: ["/voyage.png"],
  },
};

export default function TenantFavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

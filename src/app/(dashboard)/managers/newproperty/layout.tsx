import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Property | Voyage Manager Dashboard",
  description:
    "Create a new property listing with detailed information including amenities, photos, and location.",
  openGraph: {
    title: "Add New Property | Voyage Manager Dashboard",
    description:
      "Create a new property listing with detailed information including amenities, photos, and location.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - Add New Property",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add New Property | Voyage Manager Dashboard",
    description:
      "Create a new property listing with detailed information including amenities, photos, and location.",
    images: ["/voyage.png"],
  },
};

export default function NewPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

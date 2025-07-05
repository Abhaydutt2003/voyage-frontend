import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Properties | Voyage Manager Dashboard",
  description:
    "View and manage your property listings. Access detailed information about your rental properties and their performance.",
  openGraph: {
    title: "My Properties | Voyage Manager Dashboard",
    description:
      "View and manage your property listings. Access detailed information about your rental properties and their performance.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - My Properties",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Properties | Voyage Manager Dashboard",
    description:
      "View and manage your property listings. Access detailed information about your rental properties and their performance.",
    images: ["/voyage.png"],
  },
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

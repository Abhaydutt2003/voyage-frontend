import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications | Voyage Manager Dashboard",
  description:
    "View and manage rental applications for your properties. Review, approve, or deny tenant applications with ease.",
  openGraph: {
    title: "Applications | Voyage Manager Dashboard",
    description:
      "View and manage rental applications for your properties. Review, approve, or deny tenant applications with ease.",
    siteName: "Voyage",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - Add New Property",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Applications | Voyage Manager Dashboard",
    description: "View and manage rental applications for your properties.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

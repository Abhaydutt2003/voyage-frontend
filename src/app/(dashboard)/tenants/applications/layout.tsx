import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Applications | Voyage Tenant Dashboard",
  description:
    "Track and manage your property rental applications. View pending, approved, and denied applications with lease agreements and review options.",
  openGraph: {
    title: "Applications | Voyage Tenant Dashboard",
    description:
      "Track and manage your property rental applications. View pending, approved, and denied applications with lease agreements and review options.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - Tenant Applications",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Applications | Voyage Tenant Dashboard",
    description:
      "Track and manage your property rental applications. View pending, approved, and denied applications with lease agreements and review options.",
    images: ["/voyage.png"],
  },
};

export default function TenantApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Current Residences | Voyage Tenant Dashboard",
  description:
    "View and manage your current living spaces. Access detailed information about properties you currently reside in.",
  openGraph: {
    title: "Current Residences | Voyage Tenant Dashboard",
    description:
      "View and manage your current living spaces. Access detailed information about properties you currently reside in.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - Current Residences",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Current Residences | Voyage Tenant Dashboard",
    description:
      "View and manage your current living spaces. Access detailed information about properties you currently reside in.",
    images: ["/voyage.png"],
  },
};

export default function TenantResidencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

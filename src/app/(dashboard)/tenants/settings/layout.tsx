import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Voyage Tenant Dashboard",
  description:
    "Manage your account settings, update your profile information, and customize your tenant preferences.",
  openGraph: {
    title: "Settings | Voyage Tenant Dashboard",
    description:
      "Manage your account settings, update your profile information, and customize your tenant preferences.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - Tenant Settings",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings | Voyage Tenant Dashboard",
    description:
      "Manage your account settings, update your profile information, and customize your tenant preferences.",
    images: ["/voyage.png"],
  },
};

export default function TenantSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

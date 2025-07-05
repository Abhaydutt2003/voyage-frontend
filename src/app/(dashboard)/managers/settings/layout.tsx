import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Voyage Manager Dashboard",
  description:
    "Manage your account settings, update your profile information, and customize your manager preferences.",
  openGraph: {
    title: "Settings | Voyage Manager Dashboard",
    description:
      "Manage your account settings, update your profile information, and customize your manager preferences.",
    siteName: "Voyage",
    images: [
      {
        url: "/voyage.png",
        width: 1200,
        height: 630,
        alt: "Voyage - Manager Settings",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings | Voyage Manager Dashboard",
    description:
      "Manage your account settings, update your profile information, and customize your manager preferences.",
    images: ["/voyage.png"],
  },
};

export default function ManagerSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

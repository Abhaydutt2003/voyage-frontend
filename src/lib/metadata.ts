import type { Metadata } from "next";

interface DashboardMetadataOptions {
  title: string;
  description: string;
  userType: "Manager" | "Tenant";
  pageName: string;
}

export function generateDashboardMetadata({
  title,
  description,
  userType,
  pageName,
}: DashboardMetadataOptions): Metadata {
  const fullTitle = `${title} | Voyage ${userType} Dashboard`;
  const fullDescription = `${description}`;
  const imageAlt = `Voyage - ${pageName}`;

  return {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      siteName: "Voyage",
      images: [
        {
          url: "/voyage.png",
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: ["/voyage.png"],
    },
  };
}

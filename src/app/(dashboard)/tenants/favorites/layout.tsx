import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "Favorited Properties",
  description:
    "Browse and manage your saved property listings. View all your favorited properties in one convenient location.",
  userType: "Tenant",
  pageName: "Favorited Properties",
});

export default function TenantFavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "My Properties",
  description:
    "View and manage your property listings. Access detailed information about your rental properties and their performance.",
  userType: "Manager",
  pageName: "My Properties",
});

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

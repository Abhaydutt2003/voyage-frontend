import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "Add New Property",
  description:
    "Create a new property listing with detailed information including amenities, photos, and location.",
  userType: "Manager",
  pageName: "Add New Property",
});

export default function NewPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

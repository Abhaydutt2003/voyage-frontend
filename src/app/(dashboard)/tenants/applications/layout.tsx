import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "Applications",
  description:
    "Track and manage your property rental applications. View pending, approved, and denied applications with lease agreements and review options.",
  userType: "Tenant",
  pageName: "Applications",
});

export default function TenantApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

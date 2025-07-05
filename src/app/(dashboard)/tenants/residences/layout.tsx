import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "Current Residences",
  description:
    "View and manage your current living spaces. Access detailed information about properties you currently reside in.",
  userType: "Tenant",
  pageName: "Current Residences",
});

export default function TenantResidencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "Settings",
  description:
    "Manage your account settings, update your profile information, and customize your tenant preferences.",
  userType: "Tenant",
  pageName: "Settings",
});

export default function TenantSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "Settings",
  description:
    "Manage your account settings, update your profile information, and customize your manager preferences.",
  userType: "Manager",
  pageName: "Settings",
});

export default function ManagerSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

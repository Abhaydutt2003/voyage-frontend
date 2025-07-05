import { generateDashboardMetadata } from "@/lib/metadata";

export const metadata = generateDashboardMetadata({
  title: "Applications",
  description:
    "View and manage rental applications for your properties. Review, approve, or deny tenant applications with ease.",
  userType: "Manager",
  pageName: "Applications",
});

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from "next";
import { getPropertyMeta } from "../../../lib/propertyMetaCache";

type Props = {
  params: Promise<{ id: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const propertyMeta = await getPropertyMeta(id);
  return {
    title: propertyMeta.seoTitle,
    description: propertyMeta.metaDescription,
    openGraph: {
      title: propertyMeta.name,
      description: `Voyage | ${propertyMeta.description}`,
      images: propertyMeta.photoUrlsBaseKeys,
      type: "website",
    },
  };
}

const SinglePropertyLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default SinglePropertyLayout;

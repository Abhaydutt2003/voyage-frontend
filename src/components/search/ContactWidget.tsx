import { Button } from "@/components/ui/button";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useGetPropertyQuery } from "@/state/api/propertyEndpoints";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import Loading from "../Loading";

const ContactWidget = ({ propertyId, onOpenModal }: ContactWidgetProps) => {
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();

  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  const handleButtonClick = () => {
    if (authUser) {
      onOpenModal();
    } else {
      router.push("/signin");
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <>Failed to fetch manager contact</>;

  return (
    <div className="bg-white border border-primary-200 rounded-2xl p-7 h-fit min-w-[300px]">
      {/* Contact Property */}
      <div className="flex items-center gap-5 mb-4 border border-primary-200 p-4 rounded-xl">
        <div className="flex items-center p-4 bg-primary-900 rounded-full">
          <Phone className="text-primary-50" size={15} />
        </div>
        <div>
          <p>Contact This Property</p>
          <div
            className="text-lg font-bold text-primary-800 cursor-pointer"
            title="Manager phone number"
          >
            {property?.manager?.phoneNumber}
          </div>
        </div>
      </div>
      <Button
        className="w-full bg-primary-700 text-white hover:bg-primary-600"
        onClick={handleButtonClick}
      >
        {authUser ? "Submit Application" : "Sign In to Apply"}
      </Button>
    </div>
  );
};

export default ContactWidget;

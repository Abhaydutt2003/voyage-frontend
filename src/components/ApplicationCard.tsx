import { Mail, MapPin, PhoneCall, Download } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";

const ApplicationCard = ({
  application,
  userType,
  children,
}: ApplicationCardProps) => {
  const [imgSrc, setImgSrc] = useState(
    application.property.photoUrlsBaseKeys?.[0] || "/placeholder.jpg"
  );

  const statusColor =
    application.status === "Approved"
      ? "bg-green-500"
      : application.status === "Denied"
      ? "bg-red-500"
      : "bg-yellow-500";

  const contactPerson =
    userType === "manager" ? application.tenant : application.property.manager;

  const handleDownloadPaymentProofs = async () => {
    const results = await Promise.allSettled(
      application.paymentProofsBaseKeys.map(async (singleUrl, index) => {
        try {
          const response = await fetch(singleUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `payment-proof-${application.id}-${
            index + index
          }.${getFileExtension(singleUrl)}`;
          document.body.appendChild(link);
          link.click();

          // Cleanup
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);

          return { success: true, url: singleUrl, index: index };
        } catch (error) {
          console.error(`Failed to download file ${index + 1}`, error);
          return { success: false, url: singleUrl, index };
        }
      })
    );
    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    const failed = results.filter(
      (result) =>
        result.status === "rejected" ||
        (result.status === "fulfilled" && !result.value.success)
    ).length;

    if (successful > 0) {
      toast.success(
        `Successfully downloaded ${successful} file${successful > 1 ? "s" : ""}`
      );
    }
    if (failed > 0) {
      toast.error(`Failed to download ${failed} file${failed > 1 ? "s" : ""}`);
    }
    if (successful === 0 && failed > 0) {
      toast.error("Failed to download all payment proof files");
    }
  };

  const getFileExtension = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    return extension || "pdf";
  };

  const hasPaymentProofs =
    application.paymentProofsBaseKeys &&
    application.paymentProofsBaseKeys.length > 0;

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white mb-4">
      <div className="flex flex-col lg:flex-row  items-start lg:items-center justify-between px-6 md:px-4 py-6 gap-6 lg:gap-4">
        {/* Property Info Section */}
        <div className="flex flex-col lg:flex-row gap-5 w-full lg:w-auto">
          <Image
            src={imgSrc}
            alt={application.property.name}
            width={200}
            height={150}
            className="rounded-xl object-cover w-full lg:w-[200px] h-[150px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold my-2">
                {application.property.name}
              </h2>
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 mr-1" />
                <span>{`${application.property.location.city}, ${application.property.location.country}`}</span>
              </div>
            </div>
            <div className="text-xl font-semibold">
              ${application.property.pricePerNight.toFixed(2)}{" "}
              <span className="text-sm font-normal">/ night</span>
            </div>
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />

        {/* Status Section */}
        <div className="flex flex-col justify-between w-full lg:basis-2/12 lg:h-48 py-2 gap-3 lg:gap-0">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status:</span>
              <span
                className={`px-2 py-1 ${statusColor} text-white rounded-full text-sm`}
              >
                {application.status}
              </span>
            </div>
            <hr className="mt-3" />
          </div>
          {application?.lease?.startDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Start Date:</span>{" "}
              {new Date(application.lease?.startDate).toLocaleDateString()}
            </div>
          )}
          {application?.lease?.endDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">End Date:</span>{" "}
              {new Date(application.lease?.endDate).toLocaleDateString()}
            </div>
          )}

          {/* Payment Proof Download Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-500">
                Payment Proofs:{" "}
                <span className="text-neutral-950 ">
                  {hasPaymentProofs
                    ? application.paymentProofsBaseKeys.length
                    : 0}
                </span>
              </p>
              <div
                title="Click to download"
                onClick={handleDownloadPaymentProofs}
              >
                <Download className="w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />
        {/* Contact Person Section */}
        <div className="flex flex-col justify-start gap-5 w-full lg:basis-3/12 lg:h-48 py-2">
          <div>
            <div className="text-lg font-semibold">
              {userType === "manager" ? "Tenant" : "Manager"}
            </div>
            <hr className="mt-3" />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <div className="font-semibold">
                {contactPerson ? contactPerson.name : application.name}
              </div>
              <div className="text-sm flex items-center text-primary-600">
                <PhoneCall className="w-5 h-5 mr-2" />
                {contactPerson
                  ? contactPerson.phoneNumber
                  : application.phoneNumber}
              </div>
              <div className="text-sm flex items-center text-primary-600">
                <Mail className="w-5 h-5 mr-2" />
                {contactPerson ? contactPerson.email : application.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />
      {children}
    </div>
  );
};

export default ApplicationCard;

import { Mail, MapPin, PhoneCall, Download } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ApplicationCard = ({
  application,
  userType,
  children,
}: ApplicationCardProps) => {
  const [imgSrc, setImgSrc] = useState(
    application.property.photoUrls?.[0] || "/placeholder.jpg"
  );

  if (application.status === "Pending") {
    console.log(application);
  }

  const statusColor =
    application.status === "Approved"
      ? "bg-green-500"
      : application.status === "Denied"
      ? "bg-red-500"
      : "bg-yellow-500";

  const contactPerson =
    userType === "manager" ? application.tenant : application.property.manager;

  const handleDownloadPaymentProof = async (
    proofUrl: string,
    index: number
  ) => {
    try {
      // If no payment proof exists, download a placeholder from assets
      const downloadUrl = proofUrl || "/assets/sample-payment-proof.pdf";

      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payment-proof-${application.id}-${
        index + 1
      }.${getFileExtension(downloadUrl)}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading payment proof:", error);
      // Fallback: download placeholder file
      //TODO Remove this
      const link = document.createElement("a");
      link.href = "/assets/sample-payment-proof.pdf";
      link.download = `payment-proof-${application.id}-placeholder.pdf`;
      link.click();
    }
  };

  const getFileExtension = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    return extension || "pdf";
  };

  const hasPaymentProofs =
    application.lease?.paymentProof &&
    application.lease.paymentProof.length > 0;

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
              ${application.property.pricePerMonth}{" "}
              <span className="text-sm font-normal">/ month</span>
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
          {application.lease && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Proofs:</span>
                <span className="text-sm text-gray-600">
                  {hasPaymentProofs ? application.lease.paymentProof.length : 0}
                </span>
              </div>

              {hasPaymentProofs ? (
                <div className="flex flex-col gap-1">
                  {application.lease.paymentProof.map((proofUrl, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleDownloadPaymentProof(proofUrl, index)
                      }
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm p-1 rounded hover:bg-primary-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Proof {index + 1}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => handleDownloadPaymentProof("", 0)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm p-1 rounded hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Payment Proof
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider - visible only on desktop */}
        <div className="hidden lg:block border-[0.5px] border-primary-200 h-48" />
        {/* Contact Person Section */}
        {contactPerson && (
          <div className="flex flex-col justify-start gap-5 w-full lg:basis-3/12 lg:h-48 py-2">
            <div>
              <div className="text-lg font-semibold">
                {userType === "manager" ? "Tenant" : "Manager"}
              </div>
              <hr className="mt-3" />
            </div>

            <div className="flex gap-4">
              <div>
                <Image
                  src="/landing-i1.png"
                  alt={contactPerson.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-2 min-w-[40px] min-h-[40px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-semibold">{contactPerson.name}</div>
                <div className="text-sm flex items-center text-primary-600">
                  <PhoneCall className="w-5 h-5 mr-2" />
                  {contactPerson.phoneNumber}
                </div>
                <div className="text-sm flex items-center text-primary-600">
                  <Mail className="w-5 h-5 mr-2" />
                  {contactPerson.email}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="my-4" />
      {children}
    </div>
  );
};

export default ApplicationCard;

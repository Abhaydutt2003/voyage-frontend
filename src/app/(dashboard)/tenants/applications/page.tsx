"use client";
import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useDownloadAgreementMutation,
  useGetApplicationsQuery,
} from "@/state/api/applicationEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { CircleCheckBig, Clock, Download, XCircle } from "lucide-react";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Applications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery({
    userId: authUser?.cognitoInfo?.userId,
    userType: "tenant",
  });

  const [downloadAgreement] = useDownloadAgreementMutation();

  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  // Filter applications based on active tab
  const filteredApplications = applications.filter((application) => {
    if (activeTab === "all") return true;
    return application.status.toLowerCase() === activeTab;
  });

  const handleAgreementDownload = async (applicationId: number) => {
    if (!authUser) {
      return;
    }
    await downloadAgreement({
      id: applicationId,
      userId: authUser?.cognitoInfo.userId,
      userType: authUser?.userRole,
    }).unwrap();
  };

  return (
    <div className="pt-8 pb-5 px-8">
      <Header
        title="Applications"
        subtitle="Track and manage your property rental applications"
      />
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full my-5"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="denied">Denied</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-5">
          <div className="w-full">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                userType="renter"
              >
                <div className="flex justify-between gap-5 w-full pb-4 px-4">
                  {application.status === "Approved" && application.lease ? (
                    <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                      <CircleCheckBig className="w-5 h-5 mr-2" />
                      The property is being rented by you until{" "}
                      {new Date(
                        application.lease?.endDate
                      ).toLocaleDateString()}
                    </div>
                  ) : application.status === "Pending" ? (
                    <div className="bg-yellow-100 p-4 text-yellow-700 grow flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Your application is pending approval
                    </div>
                  ) : (
                    <div className="bg-red-100 p-4 text-red-700 grow flex items-center">
                      <XCircle className="w-5 h-5 mr-2" />
                      Your application has been denied
                    </div>
                  )}
                  {application.status == "Approved" && (
                    <button
                      className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                              rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50 cursor-pointer`}
                      onClick={() => handleAgreementDownload(application.id)}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Agreement
                    </button>
                  )}
                </div>
              </ApplicationCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Applications;

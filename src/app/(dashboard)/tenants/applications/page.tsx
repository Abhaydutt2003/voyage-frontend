// @/components/Applications.tsx (Tenant Version)

"use client";
import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useDownloadAgreementMutation,
  useGetApplicationsQuery,
} from "@/state/api/applicationEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { CircleCheckBig, Clock, Download, Star, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Application } from "@/types/prismaTypes";

const Applications = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: paginatedApplications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "tenant",
      status: activeTab,
      limit: 5,
      afterCursor: afterCursor,
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  const [downloadAgreement] = useDownloadAgreementMutation();

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

  const loadMore = () => {
    if (paginatedApplications?.hasMore && paginatedApplications?.nextCursor) {
      setAfterCursor(paginatedApplications.nextCursor);
    }
  };

  useEffect(() => {
    if (paginatedApplications?.applications) {
      setApplications((prev: Application[]) => {
        if (!afterCursor) return paginatedApplications.applications;
        const prevIds = new Set(prev.map((a) => a.id));
        const newApps = paginatedApplications.applications.filter(
          (a) => !prevIds.has(a.id)
        );
        return [...prev, ...newApps];
      });
    }
  }, [paginatedApplications, afterCursor]);

  if (isLoading) return <Loading />;
  if (isError || !applications)
    return <div>Error fetching applications. Please try again.</div>;

  return (
    <div className="pt-8 pb-5 px-8">
      <Header
        title="Applications"
        subtitle="Track and manage your property rental applications"
      />
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setAfterCursor(null); // Reset cursor when tab changes
        }}
        className="w-full my-5"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Pending">Pending</TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Denied">Denied</TabsTrigger>
        </TabsList>
        {["Pending", "Approved", "Denied"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5 w-full">
            {applications.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No {tab} applications found.
              </div>
            ) : (
              <>
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    userType="renter"
                  >
                    <div className="flex justify-between gap-5 w-full pb-4 px-4">
                      {application.status === "Approved" &&
                      application.lease ? (
                        <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                          <CircleCheckBig className="w-5 h-5 mr-2" />
                          {new Date(application.lease?.endDate) < new Date()
                            ? `This property was rented by you till ${new Date(
                                application.lease?.endDate
                              ).toLocaleDateString()}`
                            : `The property is being rented by you until ${new Date(
                                application.lease?.endDate
                              ).toLocaleDateString()}`}
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
                        <>
                          <button
                            className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                              rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50 cursor-pointer`}
                            onClick={() =>
                              handleAgreementDownload(application.id)
                            }
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Agreement
                          </button>
                          <Link
                            href={`/tenants/residences/${application.property.id}`}
                            className={`border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center hover:text-primary-50 cursor-pointer text-white bg-blue-600 hover:bg-blue-500`}
                          >
                            <Star className="w-5 h-5 mr-2" />
                            Add Review
                          </Link>
                        </>
                      )}
                    </div>
                  </ApplicationCard>
                ))}
                {paginatedApplications?.hasMore && (
                  <div className="text-center mt-4">
                    <button
                      onClick={loadMore}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Applications;

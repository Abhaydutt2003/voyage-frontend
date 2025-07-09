// @/components/Applications.tsx

"use client";
import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDownloadAgreementMutation,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api/applicationEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import {
  CircleCheckBig,
  Download,
  Hospital,
  File,
  CircleX,
  CircleAlert,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import type { Application } from "@/types/prismaTypes";

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [activeTab, setActiveTab] = useState("Pending");
  const [limit] = useState(5);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const {
    data: paginatedApplications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "manager",
      status: activeTab,
      limit: limit,
      afterCursor: afterCursor,
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();
  const [downloadAgreement] = useDownloadAgreementMutation();

  useEffect(() => {
    if (paginatedApplications?.applications) {
      setApplications((prev) => {
        if (afterCursor === null) {
          return [...paginatedApplications.applications];
        } else {
          return [...prev, ...paginatedApplications.applications];
        }
      });
    }
  }, [paginatedApplications]);

  const handleStatusChange = async (id: number, status: string) => {
    await updateApplicationStatus({ id, status });
  };

  const handleAgreementDownload = async (applicationId: number) => {
    if (!authUser) {
      return;
    }
    await downloadAgreement({
      id: applicationId,
    }).unwrap();
  };

  const loadMore = () => {
    if (paginatedApplications?.hasMore && paginatedApplications?.nextCursor) {
      setAfterCursor(paginatedApplications.nextCursor);
    }
  };

  if (isLoading) return <Loading />;
  if (isError || !applications)
    return <div>Error fetching applications. Please try again.</div>;

  return (
    <div className="pt-8 pb-5 px-8">
      <Header
        title="Applications"
        subtitle="View and manage applications for your properties"
      />
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setAfterCursor(null);
        }}
        className="w-full my-5"
      >
        <TabsList className="grid w-full grid-cols-3">
          {" "}
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
                    userType="manager"
                  >
                    <div className="flex justify-between gap-5 w-full pb-4 px-4">
                      {/* Colored Section Status */}
                      <div
                        className={`p-4 text-green-700 grow flex flex-col gap-2 ${
                          application.status === "Approved"
                            ? "bg-green-100"
                            : application.status === "Denied"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        {application.message && (
                          <div className="text-neutral-950">
                            <span>Tenant Message: {application.message}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center">
                          <File className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="mr-2">
                            Application submitted on{" "}
                            {new Date(
                              application.applicationDate
                            ).toLocaleDateString()}
                            .
                          </span>
                          <div
                            className={`font-semibold ${
                              application.status === "Approved"
                                ? "text-green-800"
                                : application.status === "Denied"
                                ? "text-red-800"
                                : "text-yellow-800"
                            }`}
                          >
                            <div className="flex items-center">
                              {application.status === "Approved" && (
                                <>
                                  <CircleCheckBig className="w-5 h-5 mr-2 flex-shrink-0" />
                                  <span>
                                    This application has been approved.
                                  </span>
                                </>
                              )}
                              {application.status === "Denied" && (
                                <>
                                  <CircleX className="w-5 h-5 mr-2 flex-shrink-0" />
                                  <span>This application has been denied.</span>
                                </>
                              )}
                              {application.status === "Pending" && (
                                <>
                                  <CircleAlert className="w-5 h-5 mr-2 flex-shrink-0" />
                                  <span>
                                    This application is pending review.
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/managers/properties/${application.property.id}`}
                          className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                            rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                          scroll={false}
                        >
                          <Hospital className="w-5 h-5 mr-2" />
                          Property Details
                        </Link>
                        {application.status === "Approved" && (
                          <button
                            className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                            rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                            onClick={() =>
                              handleAgreementDownload(application.id)
                            }
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Agreement
                          </button>
                        )}
                        {application.status === "Pending" && (
                          <>
                            <button
                              className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-500"
                              onClick={() =>
                                handleStatusChange(application.id, "Approved")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-500"
                              onClick={() =>
                                handleStatusChange(application.id, "Denied")
                              }
                            >
                              Deny
                            </button>
                          </>
                        )}
                      </div>
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

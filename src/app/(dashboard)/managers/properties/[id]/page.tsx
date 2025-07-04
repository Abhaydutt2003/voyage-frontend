"use client";

import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownToLine, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import {
  useDownloadAgreementMutation,
  useGetApplicationsQuery,
  useDownloadPropertyAgreementsMutation,
} from "@/state/api/applicationEndpoints";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ApplicationWithLease } from "@/types/prismaTypes";
import PropertyOverview from "@/components/PropertyOverview";

const PropertyTenants = () => {
  const { id } = useParams();
  const { data: authUser } = useGetAuthUserQuery();
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationWithLease[]>([]);

  const [downloadAgreement] = useDownloadAgreementMutation();
  const [downloadAllAgreements] = useDownloadPropertyAgreementsMutation();

  const {
    data: paginatedApplications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "manager",
      status: "Approved",
      limit: 5,
      afterCursor: afterCursor,
      ...(id && { propertyId: id.toString() }),
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

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

  const isLeaseActive = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return today >= start && today <= end;
  };

  const loadMore = () => {
    if (paginatedApplications?.hasMore && paginatedApplications?.nextCursor) {
      setAfterCursor(paginatedApplications.nextCursor);
    }
  };

  const handleAgreementsDownload = async () => {
    await downloadAllAgreements({
      propertyId: Number(id?.toString()),
    });
  };

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

  if (isLoading) return <Loading></Loading>;

  if (isError) return <>Failed to load tenants...</>;

  return (
    <div className="pt-8 pb-5 px-8">
      {/* Back to properties page */}
      <Link
        href="/managers/properties"
        className="flex items-center mb-4 hover:text-primary-500"
        scroll={false}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Back to Properties</span>
      </Link>
      <PropertyOverview />
      <div className="w-full space-y-6">
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Tenants Overview</h2>
              <p className="text-sm text-gray-500">
                Manage and view all tenants for this property.
              </p>
            </div>
            <div>
              <button
                className={`bg-white border border-gray-300 text-gray-700 py-2
              px-4 rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                onClick={handleAgreementsDownload}
              >
                <Download className="w-5 h-5 mr-2" />
                <span>Download All</span>
              </button>
            </div>
          </div>
          <hr className="mt-4 mb-1" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((singleApplication) => {
                  const isActive = singleApplication.lease
                    ? isLeaseActive(
                        singleApplication.lease.startDate,
                        singleApplication.lease.endDate
                      )
                    : false;
                  return (
                    <TableRow key={singleApplication.id} className="h-24">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-semibold">
                              {singleApplication.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {singleApplication.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {new Date(
                            singleApplication.lease.startDate
                          ).toLocaleDateString()}{" "}
                          -
                        </div>
                        <div>
                          {new Date(
                            singleApplication.lease.endDate
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{singleApplication.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant={isActive ? "default" : "secondary"}
                          className={
                            isActive
                              ? "bg-green-500 hover:bg-green-600 text-neutral-100"
                              : "bg-gray-500 hover:bg-gray-600 text-neutral-100"
                          }
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            handleAgreementDownload(singleApplication.id)
                          }
                          className={`border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex
                      items-center cursor-pointer justify-center font-semibold hover:bg-primary-700 hover:text-primary-50`}
                        >
                          <ArrowDownToLine className="w-4 h-4 mr-1" />
                          Download Agreement
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {paginatedApplications?.hasMore && (
            <div className="text-center mt-4" onClick={loadMore}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyTenants;

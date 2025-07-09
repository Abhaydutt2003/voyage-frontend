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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDownloadAgreementMutation,
  useGetApplicationsQuery,
} from "@/state/api/applicationEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { ApplicationWithLease } from "@/types/prismaTypes";
import { ArrowDownToLine, Star, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useReviewLeasePropertyMutation } from "@/state/api/propertyEndpoints";
import PropertyOverview from "@/components/PropertyOverview";

const ReviewModal = ({
  leaseId,
  isOpen,
  onClose,
  onReviewSuccess,
}: {
  leaseId: number;
  isOpen: boolean;
  onClose: () => void;
  onReviewSuccess: (leaseId: number) => void;
}) => {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewLeaseProperty] = useReviewLeasePropertyMutation();

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    setRating(0);
    await reviewLeaseProperty({
      leaseId,
      propertyId: parseInt(id?.toString() || ""),
      reviewRating: rating,
    });
    onReviewSuccess(leaseId);
    onClose();
    setIsSubmitting(false);
  };

  const getRatingText = () => {
    const displayRating = hoveredRating || rating;
    switch (displayRating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Rate your experience";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Review Your Lease Experience
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {getRatingText()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Residence = () => {
  const { id } = useParams();

  const { data: authUser } = useGetAuthUserQuery();
  const [downloadAgreement] = useDownloadAgreementMutation();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | null>(null);
  const [applications, setApplications] = useState<ApplicationWithLease[]>([]);

  const {
    data: paginatedApplications,
    isLoading,
    isError,
  } = useGetApplicationsQuery(
    {
      userId: authUser?.cognitoInfo?.userId,
      userType: "tenant",
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

  const loadMore = () => {
    if (paginatedApplications?.hasMore && paginatedApplications?.nextCursor) {
      setAfterCursor(paginatedApplications.nextCursor);
    }
  };

  const isLeaseActive = (startDate: string, endDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return today >= start && today <= end;
  };

  const handleAgreementDownload = async (applicationId: number) => {
    if (!authUser) {
      return;
    }
    await downloadAgreement({
      id: applicationId,
    }).unwrap();
  };

  const openReviewModal = (leaseId: number, startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    if (today < start) {
      toast.error("You cannot add a reivew for a lease in the future.");
      return;
    }
    setSelectedLeaseId(leaseId);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedLeaseId(null);
  };

  const handleReviewSuccess = (leaseId: number) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.lease && app.lease.id === leaseId
          ? {
              ...app,
              lease: {
                ...app.lease,
                reviewAdded: true,
              },
            }
          : app
      )
    );
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading applications</div>;

  return (
    <div className="pt-8 pb-5 px-8">
      <div className="flex gap-8 mb-6">
        <PropertyOverview />
      </div>
      <div className="w-full space-y-6">
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Leases Overview</h2>
              <p className="text-sm text-gray-500">
                Access and download your property leases.
              </p>
            </div>
          </div>
          <hr className="mt-4 mb-1" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((singleApplication) => {
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
                        <div className="flex gap-2">
                          <button
                            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex 
                              items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50"
                            onClick={() =>
                              handleAgreementDownload(singleApplication.id)
                            }
                          >
                            <ArrowDownToLine className="w-4 h-4 mr-1" />
                            Download Agreement
                          </button>

                          {singleApplication.lease && (
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() =>
                                openReviewModal(
                                  singleApplication.lease.id,
                                  singleApplication.lease.startDate
                                )
                              }
                              disabled={singleApplication.lease.reviewAdded}
                              className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex 
                              items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50"
                            >
                              <MessageSquare className="w-4 h-4" />
                              {singleApplication.lease.reviewAdded
                                ? "Reviewed"
                                : "Review"}
                            </Button>
                          )}
                        </div>
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

      {/* Review Modal */}
      {selectedLeaseId && (
        <ReviewModal
          leaseId={selectedLeaseId}
          isOpen={reviewModalOpen}
          onClose={closeReviewModal}
          onReviewSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default Residence;

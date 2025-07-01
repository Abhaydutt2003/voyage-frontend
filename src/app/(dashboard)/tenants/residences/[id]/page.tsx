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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useDownloadAgreementMutation,
  useGetApplicationsQuery,
} from "@/state/api/applicationEndpoints";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";
import { useGetPropertyQuery } from "@/state/api/propertyEndpoints";
import { ApplicationWithLease } from "@/types/prismaTypes";
import {
  ArrowDownToLine,
  MapPin,
  Bed,
  Bath,
  Users,
  Home,
  Star,
  MessageSquare,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

// Star Rating Component
const StarRating = ({
  rating,
  onRatingChange,
  hoveredRating,
  onHover,
  onLeave,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  hoveredRating: number;
  onHover: (rating: number) => void;
  onLeave: () => void;
}) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
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
  );
};

const ReviewModal = ({
  leaseId,
  isOpen,
  onClose,
}: {
  leaseId: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      setRating(0);
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
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
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                hoveredRating={hoveredRating}
                onHover={setHoveredRating}
                onLeave={() => setHoveredRating(0)}
              />
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
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationWithLease[]>([]);
  const [downloadAgreement] = useDownloadAgreementMutation();
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | null>(null);

  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetPropertyQuery(Number(id));

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
    },
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  const [imgSrc, setImgSrc] = useState(
    property?.photoUrlsBaseKeys?.[0] || "/placeholder.jpg"
  );

  //TODO look into what this does.
  useEffect(() => {
    if (paginatedApplications?.applications) {
      setApplications((prev: ApplicationWithLease[]) => {
        if (!afterCursor) return paginatedApplications.applications;
        const prevIds = new Set(prev.map((a) => a.id));
        const newApps = paginatedApplications.applications.filter(
          (a) => !prevIds.has(a.id)
        );
        return [...prev, ...newApps];
      });
    }
  }, [paginatedApplications, afterCursor]);

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
      userId: authUser?.cognitoInfo.userId,
      userType: authUser?.userRole,
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

  if (propertyLoading || isLoading) return <Loading />;
  if (propertyError || isError || !property)
    return <div>Error loading property</div>;

  return (
    <div className="pt-8 pb-5 px-8">
      <div className="flex gap-8 mb-6">
        {/* Property Information */}
        <div className="flex gap-5 flex-1">
          <Image
            src={property.photoUrlsBaseKeys[0]}
            alt={property.name}
            width={500}
            height={250}
            className="rounded-xl object-cover w-full lg:w-[500px] h-[250px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
          {/* <div className="w-64 h-32 object-cover bg-slate-500 rounded-xl" /> */}
          <div className="flex flex-col justify-between flex-1">
            <div>
              <h2 className="text-2xl font-bold my-2">{property.name}</h2>
              <div className="flex items-center mb-2 text-gray-600">
                <MapPin className="w-5 h-5 mr-1" />
                <span>
                  {property.location.city}, {property.location.state},{" "}
                  {property.location.country}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{property.description}</p>
              <div className="flex flex-wrap gap-4 mb-3">
                <div className="flex items-center text-gray-600">
                  <Home className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.propertyType}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bed className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.beds} beds</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bath className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.baths} baths</span>
                </div>
                {property.squareFeet && (
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="text-sm">{property.squareFeet} sq ft</span>
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-green-600">
                ${property.pricePerNight}{" "}
                <span className="text-gray-500 text-sm font-normal">
                  / night
                </span>
              </div>
            </div>
          </div>
        </div>
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
                            Download
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
        />
      )}
    </div>
  );
};

export default Residence;

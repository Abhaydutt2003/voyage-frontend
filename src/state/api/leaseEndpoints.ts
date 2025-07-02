import { Lease } from "@/types/prismaTypes";
import { baseApi } from "./api";
import { withToast } from "@/lib/utils";

export const leaseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Leases" as const, id })),
              { type: "Leases", id: "LIST" },
            ]
          : [{ type: "Leases", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch property leases.",
        });
      },
    }),
    getAcceptedLease: build.query<
      Pick<Lease, "startDate" | "endDate">[],
      Pick<Lease, "propertyId">
    >({
      query: (params) => ({
        url: "leases/getAcceptedLeases",
        method: "GET",
        params: {
          propertyId: params.propertyId,
        },
      }),
    }),
    reviewLeaseProperty: build.mutation<
      void,
      { leaseId: number; propertyId: number; reviewRating: number }
    >({
      query: (reviewBody) => ({
        url: "leases/reviewLeaseProperty",
        method: "POST",
        body: reviewBody,
      }),
      invalidatesTags: (_result, _error, { leaseId }) => [
        { type: "Leases", id: leaseId },
        { type: "Leases", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Lease reviewed successfully!",
          error: "Failed to review lease.",
        });
      },
    }),
  }),
});

export const {
  useGetPropertyLeasesQuery,
  useGetAcceptedLeaseQuery,
  useReviewLeasePropertyMutation,
} = leaseApi;

import { Lease, Payment } from "@/types/prismaTypes";
import { baseApi } from "./api";
import { withToast } from "@/lib/utils";

export const leaseApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLeases: build.query<Lease[], void>({
      query: () => "leases",
      providesTags: [{ type: "Leases", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),
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
    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Payments" as const, id })),
              { type: "Payments", id: "LIST" },
            ]
          : [{ type: "Payments", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch property leases.",
        });
      },
    }),
  }),
});

export const {
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
} = leaseApi;

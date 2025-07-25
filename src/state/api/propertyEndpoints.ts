import { Lease, Property } from "@/types/prismaTypes";
import { FiltersState } from "..";
import { cleanParams, withToast } from "@/lib/utils";
import { baseApi } from "./api";
import { PropertyFormData, PropertyLocationData } from "@/lib/schemas";

export type PropertyCreationData = Omit<
  PropertyFormData,
  "propertyImages" | "amenities" | "highlights"
> &
  PropertyLocationData & {
    photoUrlsBaseKeys: string[];
    managerCognitoId: string;
    highlights: string;
    amenities: string;
    longitude: string;
    latitude: string;
  };

export const propertyApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });
        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],

      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),
    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load property details.",
        });
      },
    }),
    createProperty: build.mutation<Property, PropertyCreationData>({
      query: (newProperty) => ({
        url: `properties`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        { type: "Managers", id: result?.manager?.id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),
    // getPropertyLeases: build.query<Lease[], number>({
    //   query: (propertyId) => `properties/${propertyId}/leases`,
    //   providesTags: (result) =>
    //     result
    //       ? [
    //           ...result.map(({ id }) => ({ type: "Leases" as const, id })),
    //           { type: "Leases", id: "LIST" },
    //         ]
    //       : [{ type: "Leases", id: "LIST" }],
    //   async onQueryStarted(_, { queryFulfilled }) {
    //     await withToast(queryFulfilled, {
    //       error: "Failed to fetch property leases.",
    //     });
    //   },
    // })
    getAcceptedLease: build.query<
      Pick<Lease, "startDate" | "endDate">[],
      Pick<Lease, "propertyId">
    >({
      query: (params) => ({
        url: `properties/${params.propertyId}/leases/times?status=Approved`,
        method: "GET",
      }),
    }),
    reviewLeaseProperty: build.mutation<
      void,
      { leaseId: number; propertyId: number; reviewRating: number }
    >({
      query: (reviewBody) => ({
        url: `properties/${reviewBody.propertyId}/${reviewBody.leaseId}/reviews`,
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

  overrideExisting: false,
});

export const {
  useGetPropertiesQuery,
  useCreatePropertyMutation,
  useGetPropertyQuery,
  useGetAcceptedLeaseQuery,
  useReviewLeasePropertyMutation,
} = propertyApi;

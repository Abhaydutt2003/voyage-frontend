import { Application, ApplicationWithLease, Lease } from "@/types/prismaTypes";
import { baseApi } from "./api";
import { withToast } from "@/lib/utils";

export type CreateApplicationData = Pick<
  Application,
  | "applicationDate"
  | "status"
  | "tenantCognitoId"
  | "name"
  | "email"
  | "phoneNumber"
  | "paymentProofsBaseKeys"
> &
  Pick<Lease, "startDate" | "endDate"> & {
    propertyId: string;
  };

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getApplications: build.query<
      {
        applications: ApplicationWithLease[];
        hasMore: boolean;
        nextCursor: string | null;
      },
      {
        status: string;
        userId?: string;
        userType?: string;
        limit?: number;
        afterCursor?: string | null;
        propertyId?: string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) {
          queryParams.append("status", params.status.toString());
        }
        if (params.userId) {
          queryParams.append("userId", params.userId.toString());
        }
        if (params.userType) {
          queryParams.append("userType", params.userType.toString());
        }
        if (params.limit) {
          queryParams.append("limit", params.limit.toString());
        }
        if (params.afterCursor) {
          queryParams.append("afterCursor", params.afterCursor);
        }
        if (params.propertyId) {
          queryParams.append("propertyId", params.propertyId);
        }
        return `applications?${queryParams.toString()}`;
      },
      providesTags: (result, _error, { status }) => {
        return result
          ? [
              ...result.applications.map(({ id }) => ({
                type: "Applications" as const,
                id,
              })),
              { type: "Applications", id: `LIST-${status.toUpperCase()}` },
            ]
          : [{ type: "Applications", id: `LIST-${status.toUpperCase()}` }];
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),
    updateApplicationStatus: build.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => {
        const tagsToInvalidate: Array<
          { type: "Applications"; id?: string | number } | "Leases"
        > = [
          { type: "Applications", id }, // Invalidate the specific application
          "Leases", // Invalidate leases as a new lease might be created on approval
        ];

        // If the application was previously in a different status, invalidate that list too.
        // This requires knowing the old status, which RTK Query doesn't provide directly in invalidatesTags.
        // A common pattern for this is to use `onQueryStarted` with `patchQueryData` or fetch the old data.
        // For simplicity and effectiveness, i'll invalidate all relevant list types.
        // This is a more robust approach if the old status isn't easily accessible.
        tagsToInvalidate.push({ type: "Applications", id: `LIST-PENDING` });
        tagsToInvalidate.push({ type: "Applications", id: `LIST-APPROVED` });
        tagsToInvalidate.push({ type: "Applications", id: `LIST-DENIED` });

        return tagsToInvalidate;
      },
      async onQueryStarted({ status }, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: `${
            status == "Approved"
              ? "Appplication approved successfully"
              : "Application denied."
          }`,
          error: "Failed to update application status",
        });
      },
    }),
    createApplication: build.mutation<
      Application,
      Partial<CreateApplicationData>
    >({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: "Applications", id: "LIST-PENDING" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application created successfully!",
          error: "Failed to create applications.",
          conditionalErrors: {
            409: "You already have an application overlapping with these dates!",
          },
        });
      },
    }),
    downloadAgreement: build.mutation<
      string,
      { id: number; userId: string; userType: string }
    >({
      queryFn: async (
        { id, userId, userType },
        _queryApi,
        _extraOptions,
        baseQuery
      ) => {
        const result = await baseQuery({
          url: `applications/${id}/agreement?userCognitoId=${userId}&userType=${userType}`,
          method: "GET",
          responseHandler: (response) => response.blob(), // Function that returns a Promise<Blob>
        });

        const blob = result.data as Blob;

        // Trigger download immediately
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `agreement-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        // a.remove();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { data: "download initiated" }; //rtk query throws error when we try to return only undefined, so returning string for the sake of it.
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Agreement download initiated!",
          error:
            "Failed to download agreement. Please try again or contact support.",
        });
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetApplicationsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationStatusMutation,
  useDownloadAgreementMutation,
} = applicationApi;

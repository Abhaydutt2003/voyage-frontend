import { Application, Lease } from "@/types/prismaTypes";
import { baseApi } from "./api";
import { withToast } from "@/lib/utils";

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getApplications: build.query<
      Application[],
      { userId?: string; userType?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) {
          queryParams.append("userId", params.userId.toString());
        }
        if (params.userType) {
          queryParams.append("userType", params.userType.toString());
        }
        return `applications?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Applications" as const,
                id,
              })),
              { type: "Applications", id: "LIST" },
            ]
          : [],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
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
      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),
    createApplication: build.mutation<Application, FormData>({
      //need FormData to construct a req body that contains both file data and regular from data.
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Applications"],
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

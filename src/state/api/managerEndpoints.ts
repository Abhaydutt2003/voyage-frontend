import { Manager } from "@/types/prismaTypes";
import baseApi from "./api";
import { withToast } from "@/lib/utils";

const managerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Managers", id: result.id }] : [],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),
  }),
});

export const { useUpdateManagerSettingsMutation } = managerApi;

import { Tenant } from "@/types/prismaTypes";
import baseApi from "./api";
import { withToast } from "@/lib/utils";

const tenantApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Tenants", id: result.id }] : [],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),
  }),
});

export const {useUpdateTenantSettingsMutation} = tenantApi;
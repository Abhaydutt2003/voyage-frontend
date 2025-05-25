import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { createNewUserInDatabase } from "@/lib/utils";
import { Manager, Tenant } from "@/types/prismaTypes";
import { baseApi } from "./api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const cognitoUser = await getCurrentUser();
          if (!cognitoUser || !cognitoUser.userId) {
            return { error: "User not found in Cognito." };
          }
          const userRole = idToken?.payload["custom:role"] as string; //JWT, contains claims by the user.
          const endpoint =
            userRole == "manager"
              ? `/managers/${cognitoUser.userId}`
              : `/tenants/${cognitoUser.userId}`;
          let userDetailsResponse = await fetchWithBQ(endpoint);
          if (
            userDetailsResponse &&
            userDetailsResponse.error?.status === 404
          ) {
            //make new user
            if (!idToken) {
              return { error: "ID token not available for new user creation." };
            }
            userDetailsResponse = await createNewUserInDatabase(
              cognitoUser,
              idToken,
              userRole,
              fetchWithBQ
            );
          }
          return {
            data: {
              cognitoInfo: { ...cognitoUser },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.log(error);
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuthUserQuery } = authApi;

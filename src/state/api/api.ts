import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession } from "aws-amplify/auth";

export const TAG_TYPES = [
  "Managers",
  "Tenants",
  "Properties",
  "PropertyDetails",
  "Leases",
  "Payments",
  "Applications",
] as const;

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      //add auth header with every outgoing api request.
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: TAG_TYPES,
  endpoints: () => ({}), //Initially empty, endpoints will be injected.
});

import { withToast } from "@/lib/utils";
import { baseApi } from "./api";

export type UploadType = "paymentProof" | "propertyImage";

export interface GetPresignedPutUrlsBody {
  filesInformation: FileInformation[];
  uploadType: UploadType;
}

export interface GetPresignedPutUrlsResult {
  index: number;
  result: {
    s3Key: string;
    url: string;
  };
}

export interface FileInformation {
  fileName: string;
  fileType: string;
}

export const filesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPresignedPutUrls: build.mutation<
      GetPresignedPutUrlsResult[],
      GetPresignedPutUrlsBody
    >({
      query: (bodyData) => ({
        url: `files/uploads/${bodyData.uploadType}/presigned-urls`,
        method: "POST",
        body: {
          filesInformation: bodyData.filesInformation,
        },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to upload files.",
        });
      },
    }),
  }),
});

export const { useGetPresignedPutUrlsMutation } = filesApi;

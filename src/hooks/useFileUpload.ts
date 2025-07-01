import {
  FileInformation,
  UploadType,
  useGetPresignedPutUrlsMutation,
} from "@/state/api/filesEndpoints";

interface UploadFileProps {
  files: File[];
  uploadType: UploadType;
}

const useUploadFile = () => {
  const [getPresignedPutUrls] = useGetPresignedPutUrlsMutation();

  const uploadFiles = async ({ files, uploadType }: UploadFileProps) => {
    const filesInformation: FileInformation[] = [];
    files.map((singleFile) => {
      filesInformation.push({
        fileName: singleFile.name,
        fileType: singleFile.type,
      });
    });
    const { data: presignedUrls } = await getPresignedPutUrls({
      filesInformation,
      uploadType,
    });
    if (!presignedUrls) {
      return [];
    }

    try {
      const uploadPromises = files.map(async (singleFile, index) => {
        const presignedUrlData = presignedUrls[index];
        const response = await fetch(presignedUrlData.result.url, {
          method: "PUT",
          body: singleFile,
          headers: {
            "Content-Type": singleFile.type,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to upload ${singleFile.name}`);
        }
      });
      await Promise.all(uploadPromises);
    } catch (error) {
      console.error(error);
      return [];
    }
    return presignedUrls.map((p) => p.result.s3Key);
  };
  return { uploadFiles };
};

export default useUploadFile;

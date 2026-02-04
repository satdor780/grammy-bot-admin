import { api } from "./axios";

export interface UploadImageResponse {
  success: boolean;
  url: string;
  links: string[];
}

export async function uploadImage(
  imageFile: Blob | File,
  initData: string,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("initData", initData);

  const { data } = await api.post<UploadImageResponse>(
    "/api/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

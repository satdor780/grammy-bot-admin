import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { uploadImage, type UploadImageResponse } from "../api/uploadImage";

export interface UploadImageParams {
  imageFile: Blob | File;
  initData: string;
}

export function useUploadImage(
  options?: Omit<
    UseMutationOptions<UploadImageResponse, Error, UploadImageParams>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: ({ imageFile, initData }: UploadImageParams) =>
      uploadImage(imageFile, initData),
    ...options,
  });
}

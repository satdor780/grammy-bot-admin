import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  createProduct,
  type CreateProductRequest,
  type CreateProductResponse,
} from "../api/createProduct";

export function useCreateProduct(
  options?: Omit<
    UseMutationOptions<CreateProductResponse, Error, CreateProductRequest>,
    "mutationFn"
  >,
) {
  return useMutation({
    mutationFn: (payload: CreateProductRequest) => createProduct(payload),
    ...options,
  });
}

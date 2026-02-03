import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { init } from "../api/init";
import type { InitResponse } from "../api/types";

export function useInit(
  options?: Omit<UseMutationOptions<InitResponse, Error, string>, "mutationFn">,
) {
  return useMutation({
    mutationFn: (initData: string) => init(initData),
    ...options,
  });
}

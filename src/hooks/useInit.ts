import { useMutation } from "@tanstack/react-query";
import { init } from "../api/init";

export function useInit() {
  return useMutation({
    mutationFn: (initData: string) => init(initData),
  });
}

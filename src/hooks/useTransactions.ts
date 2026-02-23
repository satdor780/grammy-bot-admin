// src/hooks/useTransactions.ts

import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import type { ITransactionsResponse } from "@/api";

const LIMIT = 20;

export const useTransactions = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ITransactionsResponse) => void;
  onError?: (err: Error) => void;
} = {}) => {
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<ITransactionsResponse | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      initData,
      offset,
    }: {
      initData: string;
      offset: number;
    }) => {
      const res = await axios.post<ITransactionsResponse>("/api/transactions", {
        initData,
        limit: LIMIT,
        offset,
      });
      return res.data;
    },
    onSuccess: (res) => {
      setData(res);
      onSuccess?.(res);
    },
    onError: (err: Error) => {
      onError?.(err);
    },
  });

  const fetchPage = (initData: string, newOffset: number) => {
    setOffset(newOffset);
    mutate({ initData, offset: newOffset });
  };

  return {
    data,
    isPending,
    offset,
    limit: LIMIT,
    fetchPage,
  };
};

import type { Product } from "../types/";

export interface InitResponse {
  success: boolean;
  user: User;
  products: Product[];
}

export interface User {
  _id: string;
  telegramId: number;
  userName: string;
  firstName: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// types/transactions.ts

export interface ITransactionResponse {
  _id: string;
  userId: number;
  basketOrderId: string;
  totalAmount: number;
  commissionAmount: number;
  sellerAmount: number;
  commissionRate: number;
  status: "success" | "failed";
  createdAt: string;
}

export interface IPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ITransactionsResponse {
  success: boolean;
  seller_balance: number;
  transactions: ITransactionResponse[];
  pagination: IPagination;
}

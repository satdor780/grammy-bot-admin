// src/components/modules/Home/index.tsx

import { useEffect } from "react";
import { format } from "date-fns";
import {

  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { useTelegramStore } from "../../../store/telegramStore";
import { useDebugStore } from "../../../store/debugStore";
import { useTransactions } from "../../../hooks/useTransactions";
import type { ITransactionResponse } from "@/api";
import { Badge } from "@/components/shadcn/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/ui/table";
import { Button } from "@/components/shadcn/ui/button";


// ── Колонки таблицы ────────────────────────────────────────────────────────
const columns: ColumnDef<ITransactionResponse>[] = [
  {
    accessorKey: "createdAt",
    header: "Дата",
    cell: ({ row }) =>
      format(new Date(row.getValue("createdAt")), "dd.MM.yy HH:mm"),
  },
  {
    accessorKey: "totalAmount",
    header: "Сумма",
    cell: ({ row }) => `$${(row.getValue("totalAmount") as number).toFixed(2)}`,
  },
  {
    accessorKey: "commissionAmount",
    header: "Комиссия",
    cell: ({ row }) =>
      `$${(row.getValue("commissionAmount") as number).toFixed(2)}`,
  },
  {
    accessorKey: "sellerAmount",
    header: "Продавцу",
    cell: ({ row }) =>
      `$${(row.getValue("sellerAmount") as number).toFixed(2)}`,
  },
  {
    accessorKey: "commissionRate",
    header: "%",
    cell: ({ row }) =>
      `${((row.getValue("commissionRate") as number) * 100).toFixed(0)}%`,
  },
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "success" ? "default" : "destructive"}>
          {status === "success" ? "✓" : "✗"}
        </Badge>
      );
    },
  },
];

// ── Компонент ──────────────────────────────────────────────────────────────
export const Transactions = () => {
  const initData = useTelegramStore((s) => s.initData);
  const addResponse = useDebugStore((s) => s.addResponse);
  const addError = useDebugStore((s) => s.addError);

  const { data, isPending, offset, limit, fetchPage } = useTransactions({
    onSuccess: (res) => addResponse("Transactions loaded", res, "transactions"),
    onError: (err) => addError(err.message, err, "transactions"),
  });

  // Загружаем первую страницу при монтировании
  useEffect(() => {
    if (initData) {
      fetchPage(initData, 0);
    }
  }, [initData]);

  const table = useReactTable({
    data: data?.transactions ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pagination = data?.pagination;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = pagination ? Math.ceil(pagination.total / limit) : 1;

  const handlePrev = () => {
    if (!initData || offset === 0) return;
    fetchPage(initData, offset - limit);
  };

  const handleNext = () => {
    if (!initData || !pagination?.hasMore) return;
    fetchPage(initData, offset + limit);
  };

  return (
    <div className="w-[360px] mx-auto py-4 space-y-4">

      {/* ── Баланс ── */}
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <p className="text-sm text-muted-foreground">Баланс продавца</p>
        <p className="text-2xl font-bold">
          ${data?.seller_balance?.toFixed(2) ?? "—"}
        </p>
      </div>

      {/* ── Таблица ── */}
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-2 border-b flex items-center justify-between">
          <p className="text-sm font-medium">Транзакции</p>
          {pagination && (
            <p className="text-xs text-muted-foreground">
              Всего: {pagination.total}
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs px-2 whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isPending ? (
                // Скелетон загрузки
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j} className="px-2">
                        <div className="h-4 w-full rounded bg-muted animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-sm text-muted-foreground py-6"
                  >
                    Транзакций нет
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-xs px-2 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Пагинация ── */}
        {pagination && pagination.total > limit && (
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={offset === 0 || isPending}
            >
              ←
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!pagination.hasMore || isPending}
            >
              →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTransactions, TransactionResponse } from "@/lib/api/payments";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";

export function Transactions() {
  const role = useAuthStore((s) => s.role);
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const columns: ColumnDef<TransactionResponse>[] = [
    {
      accessorKey: "booking_id",
      header: "Booking Ref",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.booking_id.slice(-6).toUpperCase()}</span>,
    },
    {
      accessorKey: "amount",
      header: role === "purohit" ? "Earnings (95%)" : "Amount Paid",
      cell: ({ row }) => {
        const amount = role === "purohit" ? row.original.purohit_amount : row.original.total_amount;
        return <span className="font-medium">₹{amount.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: role === "purohit" ? "Payout Status" : "Payment Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        let label = status;
        
        if (status === "PAYOUT_SUCCESS" || status === "PAID") variant = "default";
        else if (status === "PAYOUT_PROCESSING") { variant = "secondary"; label = "PROCESSING"; }
        else if (status === "REFUNDED") variant = "outline";
        else if (status === "PENDING") variant = "secondary";
        
        return <Badge variant={variant}>{label}</Badge>;
      },
    }
  ];

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-saffron-500" /></div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

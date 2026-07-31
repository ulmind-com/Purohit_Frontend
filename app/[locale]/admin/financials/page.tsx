"use client";

import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminFinancialsPage() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin_transactions"],
    queryFn: getTransactions,
  });

  const columns: ColumnDef<TransactionResponse>[] = [
    {
      accessorKey: "_id",
      header: "Txn ID",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original._id.slice(-6).toUpperCase()}</span>,
    },
    {
      accessorKey: "booking_id",
      header: "Booking",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.booking_id.slice(-6).toUpperCase()}</span>,
    },
    {
      accessorKey: "total_amount",
      header: "Paid (User)",
      cell: ({ row }) => <span className="font-medium text-green-600">₹{row.original.total_amount.toFixed(2)}</span>,
    },
    {
      accessorKey: "platform_fee",
      header: "Fee (5%)",
      cell: ({ row }) => <span className="font-medium text-blue-600">₹{row.original.platform_fee.toFixed(2)}</span>,
    },
    {
      accessorKey: "purohit_amount",
      header: "Payout (95%)",
      cell: ({ row }) => <span className="font-medium text-orange-600">₹{row.original.purohit_amount.toFixed(2)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        
        if (status === "PAYOUT_SUCCESS" || status === "PAID") variant = "default";
        else if (status === "PAYOUT_PROCESSING") variant = "secondary";
        else if (status === "REFUNDED") variant = "outline";
        else if (status === "PENDING") variant = "secondary";
        
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
  ];

  const table = useReactTable({
    data: transactions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRevenue = transactions?.reduce((acc, tx) => {
    if (tx.status === "PAID" || tx.status === "PAYOUT_SUCCESS" || tx.status === "PAYOUT_PROCESSING") {
      return acc + tx.platform_fee;
    }
    return acc;
  }, 0) || 0;

  const totalPayouts = transactions?.reduce((acc, tx) => {
    if (tx.status === "PAYOUT_SUCCESS") {
      return acc + tx.purohit_amount;
    }
    return acc;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Ledger</h2>
        <p className="text-muted-foreground mt-2">
          Global overview of payments, platform fees, and automated Purohit payouts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue (5%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts Settled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalPayouts.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {transactions?.filter(tx => tx.status === "PAYOUT_PROCESSING").length || 0} Txns
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Comprehensive ledger of all system transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-saffron-500" /></div>
          ) : (
            <div className="space-y-4">
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
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

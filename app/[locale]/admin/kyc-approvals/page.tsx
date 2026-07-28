"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { api } from "@/lib/api/axios";

interface PendingPurohit {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  kyc_document_url: string;
}

export default function KycApprovalsPage() {
  const [data, setData] = useState<PendingPurohit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurohit, setSelectedPurohit] = useState<PendingPurohit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/purohits/kyc-pending");
      setData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (status: "VERIFIED" | "REJECTED") => {
    if (!selectedPurohit) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/purohits/${selectedPurohit.id}/verify`, {
        status,
        reason: status === "REJECTED" ? "Document invalid or unclear." : undefined
      });
      setSelectedPurohit(null);
      await fetchData(); // Refresh list
    } catch (err) {
      console.error("Failed to verify", err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<PendingPurohit>[] = [
    {
      accessorKey: "name",
      header: "Purohit Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "mobile_number",
      header: "Mobile Number",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const purohit = row.original;
        return (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setSelectedPurohit(purohit)}
            className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          >
            Review Document
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <ShieldCheck className="text-amber-500" />
          KYC Approvals Queue
        </h1>
        <p className="text-slate-400 mt-2">Review and verify pending Aadhaar/Voter IDs.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
             <Loader2 className="size-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left text-slate-300">
              <thead className="bg-slate-800/50 [&_tr]:border-b [&_tr]:border-slate-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th key={header.id} className="h-12 px-4 align-middle font-medium text-slate-400">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="h-24 text-center">
                      No pending KYCs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedPurohit} onOpenChange={(open) => !open && setSelectedPurohit(null)}>
        <DialogContent className="sm:max-w-[700px] bg-slate-950 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Review KYC Document</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPurohit?.name} • {selectedPurohit?.mobile_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4 aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative">
            {selectedPurohit?.kyc_document_url ? (
               // If it's a PDF or image, iframe handles it well enough for MVP
              <iframe 
                src={selectedPurohit.kyc_document_url} 
                className="w-full h-full object-contain"
                title="KYC Document"
              />
            ) : (
              <span className="text-slate-500">No document uploaded</span>
            )}
          </div>

          <div className="flex gap-4 justify-end">
            <Button 
              variant="destructive" 
              onClick={() => handleAction("REJECTED")}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin size-4" /> : <XCircle className="size-4" />}
              Reject Request
            </Button>
            <Button 
              onClick={() => handleAction("VERIFIED")}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {actionLoading ? <Loader2 className="animate-spin size-4" /> : <ShieldCheck className="size-4" />}
              Approve Verification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

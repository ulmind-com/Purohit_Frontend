"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Filter } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="size-8 text-amber-500" />
            Users & Purohits
          </h1>
          <p className="text-slate-400 mt-2">Manage all registered accounts across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Filter className="size-4" />
            <span>Filter</span>
          </button>
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, email..."
              className="bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">User Directory</CardTitle>
          <CardDescription className="text-slate-400">View and manage system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Users className="size-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-300">User Directory Coming Soon</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              The God View user management interface is currently being integrated with the global database. Soon you'll be able to view, suspend, and manage all accounts from this portal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

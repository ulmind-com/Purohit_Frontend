"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, FileText, Wallet } from "lucide-react";
import { api } from "@/lib/api/axios";

interface DashboardStats {
  total_revenue: number;
  total_users: number;
  active_purohits: number;
  pending_kycs: number;
  revenue_chart: { date: string; revenue: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/analytics/overview");
        setStats(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard statistics. Are you logged in as an Admin?");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="size-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-red-500 text-lg font-medium">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.total_revenue.toLocaleString()}`,
      icon: Wallet,
      trend: "+12% from last week",
      trendUp: true,
    },
    {
      title: "Total Users",
      value: stats.total_users.toLocaleString(),
      icon: Users,
      trend: "+4% from last week",
      trendUp: true,
    },
    {
      title: "Active Purohits",
      value: stats.active_purohits.toLocaleString(),
      icon: TrendingUp,
      trend: "Fully Verified",
      trendUp: true,
    },
    {
      title: "Pending KYCs",
      value: stats.pending_kycs.toString(),
      icon: FileText,
      trend: stats.pending_kycs > 0 ? "Requires attention" : "All clear",
      trendUp: stats.pending_kycs === 0,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Welcome to the God View command center.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <card.icon className="size-16" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
              <CardTitle className="text-sm font-medium text-slate-400">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="z-10 relative">
              <div className="text-3xl font-bold text-white">{card.value}</div>
              <p className={`text-xs mt-2 font-medium ${card.trendUp ? "text-emerald-500" : "text-red-500"}`}>
                {card.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenue_chart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f59e0b' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Dummy recent activity log */}
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-white">New Booking Request</p>
                  <p className="text-sm text-slate-400">Someone requested a Marriage Ceremony</p>
                </div>
                <div className="ml-auto font-medium text-xs text-slate-500">Just now</div>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mr-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-white">KYC Approved</p>
                  <p className="text-sm text-slate-400">Pandit Ram Sharma is now verified</p>
                </div>
                <div className="ml-auto font-medium text-xs text-slate-500">2h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

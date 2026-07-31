"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Shield, Bell, Key, Database, Server } from "lucide-react";

export default function AdminSettingsPage() {
  const settingSections = [
    {
      title: "Security & Access",
      description: "Manage global security policies and admin roles.",
      icon: Shield,
      comingSoon: true,
    },
    {
      title: "Notifications",
      description: "Configure system-wide push and email notifications.",
      icon: Bell,
      comingSoon: true,
    },
    {
      title: "API Keys",
      description: "Manage third-party API keys (Razorpay, Firebase).",
      icon: Key,
      comingSoon: true,
    },
    {
      title: "Database Backup",
      description: "Schedule and manage MongoDB backups.",
      icon: Database,
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Settings className="size-8 text-amber-500" />
          System Settings
        </h1>
        <p className="text-slate-400 mt-2">Configure core system parameters and God View preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {settingSections.map((section, idx) => (
          <Card key={idx} className="bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:bg-slate-900/80 transition-colors group">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="p-3 bg-slate-800/50 rounded-xl group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors text-slate-400">
                <section.icon className="size-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-slate-200 flex items-center justify-between">
                  {section.title}
                  {section.comingSoon && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  {section.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <Card className="bg-slate-900/50 border-amber-900/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
            <Server className="size-5 text-amber-500" />
            System Status
          </CardTitle>
          <CardDescription className="text-slate-400">Current God View operational status</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="size-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-slate-300 font-medium">All Systems Operational</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            The Purohit Booking backend, payments engine, and map services are running normally.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from "@/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Assuming authOptions is exported from here
import { LayoutDashboard, Map, ShieldCheck, Users, Settings } from "lucide-react";
import { Link } from "@/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "God View Map", href: "/admin/live-map", icon: Map },
    { name: "KYC Approvals", href: "/admin/kyc-approvals", icon: ShieldCheck },
    { name: "Users & Purohits", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Premium Dark Sidebar */}
      <aside className="w-64 flex flex-col bg-slate-900 border-r border-slate-800 shadow-xl z-20 sticky top-0 h-screen">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight text-amber-500 flex items-center gap-2">
            <ShieldCheck className="size-6" />
            God View
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Command Center</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
            >
              <item.icon className="size-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="size-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-500 font-bold">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">System Admin</span>
              <span className="text-xs text-slate-500">admin@purohit.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-slate-950">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
        <div className="relative z-10 p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

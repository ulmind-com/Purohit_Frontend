import { Navbar } from "@/components/shared/navbar";
import { cookies } from "next/headers";
import { ROLE_COOKIE_NAME } from "@/lib/constants";
import type { Role } from "@/types";

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const roleValue = cookieStore.get(ROLE_COOKIE_NAME)?.value;
  // Fallback to "user" if no role or invalid role, though usually they are logged in
  const role = (roleValue === "purohit" ? "purohit" : "user") as Role;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role={role} />
      <main className="flex-1">{children}</main>
    </div>
  );
}

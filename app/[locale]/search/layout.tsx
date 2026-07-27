import { Navbar } from "@/components/shared/navbar";

export default function SearchFeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar role="user" />
      <main className="flex-1">{children}</main>
    </div>
  );
}

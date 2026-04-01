import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background w-full">
      <Sidebar />
      <div className="flex-1 lg:ml-64 relative flex flex-col h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

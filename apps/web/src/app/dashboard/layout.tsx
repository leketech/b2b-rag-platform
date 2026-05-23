import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGate } from "@/components/auth/AuthGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-zinc-50">
        <div className="flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <Header />
            {children}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}

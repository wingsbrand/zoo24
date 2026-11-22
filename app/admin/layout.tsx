import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { adminEnabled, isLoopbackHost } from "@/lib/site";
import { AdminNav } from "./nav";

export const metadata = { title: "Panel ZOO24", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Brak dostępu poza lokalnym środowiskiem = 404 (nie ujawniamy istnienia panelu). Logowanie: F2 (Supabase Auth).
  if (!adminEnabled() || !isLoopbackHost((await headers()).get("host"))) notFound();
  return (
    <div className="mx-auto grid w-full max-w-[88rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_1fr]">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

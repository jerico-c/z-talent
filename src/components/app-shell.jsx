import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  GraduationCap,
  FileUser,
  Briefcase,
  Settings,
  Bell,
  Menu,
  Megaphone,
  ShieldCheck,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useUserProfile } from "@/lib/user-profile";
import { useAdminAccess } from "@/lib/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
/** Menu sidebar — mencerminkan 3 pilar plus area akun. */
const navItems = [
  { label: "Dasbor", to: "/dashboard", icon: LayoutDashboard },
  { label: "Asesmen Keterampilan", to: "/assessment", icon: Sparkles },
  { label: "Kursus Saya", to: "/courses", icon: GraduationCap },
  { label: "CV & Portofolio", to: "/cv", icon: FileUser },
  { label: "Siap Kerja", to: "/siap-kerja", icon: Briefcase },
  { label: "Promosi Usaha", to: "/promosi", icon: Megaphone },
  { label: "Pengaturan", to: "/settings", icon: Settings },
];
/**
 * Kerangka aplikasi: sidebar yang bisa disembunyikan + header menempel.
 * Dipakai semua halaman setelah masuk agar navigasi tetap konsisten.
 */
export function AppShell({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  const { profile } = useUserProfile();
  const { isAdmin } = useAdminAccess();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const visibleNavItems = isAdmin
    ? [...navItems, { label: "Admin", to: "/admin", icon: ShieldCheck }]
    : navItems;
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Mobile overlay */}
      {open && (
        <button
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* BAGIAN LOGO Z-TALENT */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src="/logo.png" alt="Z-Talent Logo" className="h-10 w-auto object-contain" />
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map(({ label, to, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white shadow-md" // Aksen Navy Blue untuk menu aktif
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tombol keluar dari dasbor */}
        <div className="px-3">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start gap-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Link to="/" onClick={() => setOpen(false)}>
              <LogOut className="size-4 shrink-0" />
              Keluar
            </Link>
          </Button>
        </div>

        <div className="m-3 rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-500">XP Keterampilan</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {profile.points} poin · {profile.progress}% menuju level berikutnya
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            {/* Aksen Orange untuk Progress XP */}
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${profile.progress}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-border lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Buka menu"
              >
                <Menu className="size-4" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">{title}</h1>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* Badge Level dengan aksen Navy/Orange ringan */}
              <Badge
                variant="secondary"
                className="hidden bg-slate-100 text-slate-900 border border-slate-200 sm:inline-flex"
              >
                {profile.label}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl text-slate-600"
                aria-label="Notifikasi"
              >
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm">
                  {profile.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div className="hidden min-w-0 leading-tight sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900">{profile.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {profile.city || "Lengkapi profil"}
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50"
                aria-label="Keluar"
                title="Keluar"
              >
                <Link to="/">
                  <LogOut className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

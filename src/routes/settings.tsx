import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { currentUser } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Z-Talent Nexus" },
      { name: "description", content: "Kelola profil, kota, dan preferensi notifikasi Z-Talent Nexus kamu." },
      { property: "og:title", content: "Pengaturan akun" },
      { property: "og:description", content: "Perbarui profil dan preferensi notifikasi kamu." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Pengaturan" subtitle="Profil dan preferensi">
      <div className="grid max-w-3xl gap-6">
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama lengkap</Label>
              <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Kota</Label>
              <Input id="city" defaultValue={currentUser.city} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="johndoe@ztalent.id" />
            </div>
            <Button className="rounded-xl sm:col-span-2 sm:w-fit">Simpan perubahan</Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "gigs", label: "Lowongan baru yang cocok", hint: "Beri tahu saya saat kecocokan lowongan di atas 80%" },
              { id: "courses", label: "Pengingat kursus", hint: "Ingatkan saya jika berhenti belajar 3 hari" },
              { id: "certs", label: "Pembaruan sertifikat", hint: "Beri tahu saya saat kredensial terverifikasi" },
            ].map((n) => (
              <div key={n.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <div className="min-w-0">
                  <Label htmlFor={n.id} className="text-sm font-semibold">
                    {n.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{n.hint}</p>
                </div>
                <Switch id={n.id} defaultChecked className="shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

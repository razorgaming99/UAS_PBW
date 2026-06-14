// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "participant" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mendaftar, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Buat Akun</CardTitle>
          <CardDescription>Daftar untuk menggunakan CEMS</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                placeholder="Budi Santoso"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@kampus.ac.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Daftar sebagai</Label>
              <Select
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Mahasiswa (Peserta)</SelectItem>
                  <SelectItem value="organizer">Panitia (Organizer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mendaftar..." : "Buat Akun"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

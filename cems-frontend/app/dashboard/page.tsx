// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  quota: number;
  organizer: { name: string };
}

interface Registration {
  id: string;
  status: string;
  registered_at: string;
  event: Event;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegs, setMyRegs] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(true);

  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data.data || []));
    api.get("/registrations/me")
      .then((res) => setMyRegs(res.data.data || []))
      .finally(() => setLoadingRegs(false));
  }, []);

  const handleRegister = async (eventId: string) => {
    try {
      await api.post("/registrations", { event_id: eventId });
      // Refresh riwayat
      const res = await api.get("/registrations/me");
      setMyRegs(res.data.data || []);
      alert("Berhasil mendaftar event!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal mendaftar");
    }
  };

  const handleCancel = async (regId: string) => {
    if (!confirm("Yakin ingin membatalkan pendaftaran?")) return;
    try {
      await api.delete(`/registrations/${regId}`);
      setMyRegs((prev) => prev.filter((r) => r.id !== regId));
    } catch {
      alert("Gagal membatalkan pendaftaran");
    }
  };

  const registeredEventIds = new Set(myRegs.map((r) => r.event?.id));

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-blue-600">CEMS</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Halo, {user?.name}</span>
          <Badge variant="secondary">{user?.role}</Badge>
          <Button variant="outline" size="sm" onClick={logout}>Keluar</Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Riwayat Pendaftaran */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Pendaftaran Saya</h2>
          {loadingRegs ? (
            <p className="text-gray-500 text-sm">Memuat...</p>
          ) : myRegs.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada event yang kamu daftarkan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRegs.map((reg) => (
                <Card key={reg.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{reg.event?.title}</CardTitle>
                    <CardDescription>{formatDate(reg.event?.start_date)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600">📍 {reg.event?.location}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700">{reg.status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleCancel(reg.id)}
                    >
                      Batalkan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Daftar Semua Event */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Event Tersedia</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada event.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => {
                const alreadyRegistered = registeredEventIds.has(event.id);
                return (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <CardDescription>{formatDate(event.start_date)}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 space-y-1">
                      <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      <p className="text-sm text-gray-500">📍 {event.location}</p>
                      <p className="text-sm text-gray-500">👥 Kuota: {event.quota} orang</p>
                    </CardContent>
                    <CardFooter>
                      {alreadyRegistered ? (
                        <Badge className="bg-green-100 text-green-700">Sudah terdaftar</Badge>
                      ) : (
                        <Button size="sm" onClick={() => handleRegister(event.id)}>
                          Daftar
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

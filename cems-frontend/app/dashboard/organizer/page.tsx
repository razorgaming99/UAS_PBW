// app/dashboard/organizer/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  quota: number;
}

const emptyForm = {
  title: "", description: "", location: "",
  start_date: "", end_date: "", quota: 0,
};

export default function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [partOpen, setPartOpen] = useState(false);

  const fetchEvents = () =>
    api.get("/my-events").then((res) => setEvents(res.data.data || []));

  useEffect(() => { fetchEvents(); }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const toInputDatetime = (d: string) =>
    d ? new Date(d).toISOString().slice(0, 16) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert datetime-local ke RFC3339
    const payload = {
      ...form,
      quota: Number(form.quota),
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
    };

    try {
      if (editId) {
        await api.put(`/events/${editId}`, payload);
      } else {
        await api.post("/events", payload);
      }
      setForm(emptyForm);
      setEditId(null);
      setOpen(false);
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal menyimpan event");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      start_date: toInputDatetime(event.start_date),
      end_date: toInputDatetime(event.end_date),
      quota: event.quota,
    });
    setEditId(event.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus event ini?")) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch {
      alert("Gagal menghapus event");
    }
  };

  const handleViewParticipants = async (event: Event) => {
    setSelectedEvent(event);
    const res = await api.get(`/events/${event.id}/participants`);
    setParticipants(res.data.data || []);
    setPartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-blue-600">CEMS — Organizer</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <Badge variant="secondary">organizer</Badge>
          <Button variant="outline" size="sm" onClick={logout}>Keluar</Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Event Saya</h2>

          {/* Form Buat/Edit Event */}
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(emptyForm); setEditId(null); } }}>
            <DialogTrigger asChild>
              <Button>+ Buat Event</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Event" : "Buat Event Baru"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Judul Event</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Selesai</Label>
                    <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kuota Peserta</Label>
                  <Input type="number" min={1} value={form.quota} onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Buat Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada event. Klik "Buat Event" untuk mulai.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  <p className="text-sm text-gray-500">{formatDate(event.start_date)} · {event.location}</p>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  <p className="text-sm text-gray-500 mt-1">👥 Kuota: {event.quota}</p>
                </CardContent>
                <CardFooter className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handleViewParticipants(event)}>
                    Lihat Peserta
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(event.id)}>
                    Hapus
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Peserta */}
      <Dialog open={partOpen} onOpenChange={setPartOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Peserta: {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {participants.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">Belum ada peserta terdaftar.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {participants.map((reg, i) => (
                <div key={reg.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-sm text-gray-400 w-5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{reg.user?.name}</p>
                    <p className="text-xs text-gray-500">{reg.user?.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <nav className="px-8 py-5 flex items-center justify-between border-b bg-white/80 backdrop-blur">
        <span className="text-xl font-bold text-blue-600">CEMS</span>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="outline">Masuk</Button></Link>
          <Link href="/register"><Button>Daftar</Button></Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Kelola Acara Kampus<br />
          <span className="text-blue-600">Dalam Satu Platform</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mb-8">
          CEMS memudahkan panitia membuat acara dan mahasiswa mendaftar secara online.
          Tidak perlu Google Form lagi.
        </p>
        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg">Mulai Sekarang</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Masuk</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl">
          {[
            { icon: "🎯", title: "Satu Platform", desc: "Semua acara kampus terpusat" },
            { icon: "⚡", title: "Pendaftaran Cepat", desc: "Daftar event dalam hitungan detik" },
            { icon: "📊", title: "Monitor Real-time", desc: "Pantau peserta langsung" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

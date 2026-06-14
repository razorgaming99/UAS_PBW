Campus Event Management System (CEMS)

Deskripsi Aplikasi

Campus Event Management System (CEMS) adalah aplikasi berbasis web yang digunakan untuk mengelola acara kampus dalam satu platform terpusat. Sistem ini memungkinkan organizer membuat dan mengelola event, sementara mahasiswa dapat melihat informasi event serta melakukan pendaftaran secara online.

Tujuan Pengembangan Aplikasi

- Mempermudah pengelolaan acara kampus secara digital.
- Menyediakan sistem pendaftaran event secara online.
- Memudahkan mahasiswa dalam mencari dan mengikuti event kampus.
- Membantu organizer memantau peserta dan kuota event.
- Mengurangi penggunaan formulir pendaftaran manual.

Fitur Aplikasi

Fitur Participant

- Registrasi akun.
- Login ke sistem.
- Melihat daftar event yang tersedia.
- Melihat detail event.
- Mendaftar ke event.
- Melihat event yang telah diikuti.

Fitur Organizer

- Login sebagai organizer.
- Membuat event baru.
- Mengelola informasi event.
- Menentukan lokasi dan jadwal event.
- Mengatur kuota peserta.
- Melihat daftar event yang dibuat.

Teknologi yang Digunakan

Frontend

- Next.js
- React.js
- TypeScript
- Tailwind CSS

Backend

- Golang (Go)
- REST API

Database & Authentication

- Supabase
- PostgreSQL

Tools

- Git
- GitHub
- Node.js
- NPM

Struktur Database

Aplikasi menggunakan Supabase sebagai Backend-as-a-Service (BaaS) dengan database PostgreSQL.

Tabel utama yang digunakan meliputi:

users

Menyimpan data pengguna aplikasi.

Field| Tipe Data
id| UUID
name| VARCHAR
email| VARCHAR
role| VARCHAR

events

Menyimpan data acara yang dibuat oleh organizer.

Field| Tipe Data
id| UUID
title| VARCHAR
description| TEXT
location| VARCHAR
start_date| TIMESTAMP
end_date| TIMESTAMP
quota| INTEGER

registrations

Menyimpan data pendaftaran peserta pada event.

Field| Tipe Data
id| UUID
user_id| UUID
event_id| UUID
registered_at| TIMESTAMP

Struktur Project

cems-project/
│
├── backend/
│   ├── database/
│   ├── handler/
│   ├── middleware/
│   ├── model/
│   ├── main.go
│   ├── go.mod
│   └── go.sum
│
├── cems-frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
└── schema.sql

Cara Instalasi dan Menjalankan Aplikasi

1. Clone Repository

git clone https://github.com/razorgaming99/UAS_PBW.git
cd UAS_PBW

2. Konfigurasi Supabase

Buat project Supabase kemudian sesuaikan file environment.

Frontend (".env.local")

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Backend (".env")

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

3. Menjalankan Backend

Masuk ke folder backend:

cd backend

Install dependency:

go mod tidy

Jalankan server:

go run main.go

4. Menjalankan Frontend

Masuk ke folder frontend:

cd cems-frontend

Install dependency:

npm install

Jalankan aplikasi:

npm run dev

Aplikasi dapat diakses melalui:

http://localhost:3000

screenshot akan berada pada UAS_PBW/screenshot

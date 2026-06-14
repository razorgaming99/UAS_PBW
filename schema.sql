-- ============================================
-- CEMS - Campus Event Management System
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Hapus tabel lama kalau ada (urutan penting karena FK)
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- ============================================
-- Tabel users
-- ============================================
CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(50)  NOT NULL DEFAULT 'participant',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================
-- Tabel events
-- ============================================
CREATE TABLE events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    location     VARCHAR(255),
    start_date   TIMESTAMP    NOT NULL,
    end_date     TIMESTAMP    NOT NULL,
    quota        INTEGER      NOT NULL DEFAULT 0,
    organizer_id UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================
-- Tabel registrations
-- ============================================
CREATE TABLE registrations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id      UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status        VARCHAR(50) NOT NULL DEFAULT 'registered',
    registered_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ============================================
-- Seed data (opsional, untuk testing)
-- ============================================
-- Password untuk semua user di bawah adalah: "password123"
-- Hash bcrypt dari "password123":
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (name, email, password, role) VALUES
('Admin CEMS',      'admin@cems.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('Panitia BEM',     'organizer@cems.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'organizer'),
('Budi Mahasiswa',  'budi@cems.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'participant');

-- Seed events (organizer_id dari user Panitia BEM di atas)
-- Jalankan ini SETELAH insert users, atau ganti organizer_id manual
INSERT INTO events (title, description, location, start_date, end_date, quota, organizer_id)
SELECT
    'Seminar Nasional Teknologi 2025',
    'Seminar membahas perkembangan AI dan teknologi terkini di Indonesia.',
    'Aula Utama Gedung A',
    '2025-08-10 08:00:00',
    '2025-08-10 17:00:00',
    100,
    id
FROM users WHERE email = 'organizer@cems.com';

INSERT INTO events (title, description, location, start_date, end_date, quota, organizer_id)
SELECT
    'Workshop Web Development',
    'Belajar Next.js dan Go dari dasar hingga deployment.',
    'Lab Komputer Lantai 3',
    '2025-08-15 09:00:00',
    '2025-08-15 16:00:00',
    30,
    id
FROM users WHERE email = 'organizer@cems.com';

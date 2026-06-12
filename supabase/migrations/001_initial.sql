-- Books table
create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text not null default '',
  status text not null default '책장속'
    check (status in ('책장속', '책상위', '가방안', '완독완료')),
  cover_image text,
  rating smallint check (rating between 1 and 5),
  started_at date,
  finished_at date,
  review text,
  created_at timestamptz not null default now()
);

-- Notes table
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  page integer not null default 0,
  content text not null,
  created_at timestamptz not null default now()
);

-- Index for note lookups by book
create index if not exists notes_book_id_idx on notes(book_id);

-- Row Level Security (personal app: anon key, no auth)
alter table books enable row level security;
alter table notes enable row level security;

create policy "Allow all on books"
  on books for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow all on notes"
  on notes for all
  to anon, authenticated
  using (true)
  with check (true);

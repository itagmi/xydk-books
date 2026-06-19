alter table notes
  add column if not exists note_kind text not null default '기록'
  check (note_kind in ('기록', '독후감'));

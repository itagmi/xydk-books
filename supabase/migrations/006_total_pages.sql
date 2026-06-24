alter table books
  add column if not exists total_pages integer check (total_pages > 0);

create or replace function get_book_max_pages(p_book_ids uuid[])
returns table (book_id uuid, max_page integer)
language sql
security invoker
stable
as $$
  select n.book_id, max(n.page)::integer
  from notes n
  where n.book_id = any(p_book_ids)
  group by n.book_id;
$$;

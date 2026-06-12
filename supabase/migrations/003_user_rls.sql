-- books 테이블에 user_id 추가
alter table books
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 기존 허용 정책 제거
drop policy if exists "Allow all on books" on books;
drop policy if exists "allow all" on books;
drop policy if exists "Allow all on notes" on notes;
drop policy if exists "allow all" on notes;

-- books: 본인 데이터만 접근
create policy "books_owner"
  on books for all
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- notes: 본인 책에 속한 메모만 접근
create policy "notes_owner"
  on notes for all
  to authenticated
  using (
    exists (
      select 1 from books
      where books.id = notes.book_id
        and books.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from books
      where books.id = notes.book_id
        and books.user_id = auth.uid()
    )
  );

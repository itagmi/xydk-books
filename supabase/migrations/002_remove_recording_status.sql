-- Migrate existing "기록중" books to "완독완료"
update books set status = '완독완료' where status = '기록중';

alter table books drop constraint if exists books_status_check;
alter table books add constraint books_status_check
  check (status in ('책장속', '책상위', '가방안', '완독완료'));

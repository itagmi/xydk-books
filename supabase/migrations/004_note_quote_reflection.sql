-- 글귀 / 느낀점 분리
alter table notes
  add column if not exists quote text not null default '',
  add column if not exists reflection text not null default '';

-- 기존 content → reflection으로 이전
update notes
set reflection = content
where reflection = '' and content is not null and content != '';

alter table notes alter column content drop not null;
alter table notes alter column content set default '';

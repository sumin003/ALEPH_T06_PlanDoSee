-- Supabase SQL Editor에서 실행. T06 공개 자료용 단일 데이터 문서.
create table if not exists public.pds_state (
 id text primary key,
 data jsonb not null,
 updated_at timestamptz not null default now()
);
alter table public.pds_state enable row level security;
revoke all on table public.pds_state from anon, authenticated;
-- 서비스 키는 Vercel 서버 환경변수에만 설정합니다.

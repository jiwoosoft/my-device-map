-- 수정된 스키마 스크립트 (PostgreSQL 문법에 맞게 수정)
-- Supabase SQL Editor에서 실행하세요

-- 1. devices 테이블에 folderId 컬럼 추가
ALTER TABLE devices ADD COLUMN IF NOT EXISTS folderId TEXT DEFAULT 'default';

-- 2. 기존 장비들의 folderId를 'default'로 설정
UPDATE devices SET folderId = 'default' WHERE folderId IS NULL;

-- 3. folders 테이블 생성
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_expanded BOOLEAN DEFAULT true
);

-- 4. 기본 폴더 생성
INSERT INTO folders (id, name, created_at, is_expanded) 
VALUES ('default', '기본 폴더', NOW(), true)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS 정책 설정
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- 6. 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Enable read access for all users" ON devices;
DROP POLICY IF EXISTS "Enable write access for all users" ON devices;
DROP POLICY IF EXISTS "Enable read access for all users" ON folders;
DROP POLICY IF EXISTS "Enable write access for all users" ON folders;

-- 7. 새로운 정책 생성
CREATE POLICY "Enable read access for all users" ON devices FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON devices FOR ALL USING (true);
CREATE POLICY "Enable read access for all users" ON folders FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON folders FOR ALL USING (true);

-- 8. 완료 메시지
SELECT 'Schema fixed successfully!' as status; 
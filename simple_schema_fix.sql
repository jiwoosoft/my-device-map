-- 간단한 스키마 수정 스크립트
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

-- 6. 모든 사용자에게 권한 부여
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON devices FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable write access for all users" ON devices FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON folders FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable write access for all users" ON folders FOR ALL USING (true);

-- 7. 완료 메시지
SELECT 'Schema fixed successfully!' as status; 
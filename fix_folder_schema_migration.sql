-- 폴더 스키마 문제 해결을 위한 마이그레이션
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. devices 테이블에 folderId 컬럼 추가 (이미 존재하면 무시)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'devices' AND column_name = 'folderId'
    ) THEN
        ALTER TABLE devices ADD COLUMN folderId TEXT DEFAULT 'default';
    END IF;
END $$;

-- 2. 기존 장비들의 folderId를 'default'로 설정
UPDATE devices SET folderId = 'default' WHERE folderId IS NULL;

-- 3. folders 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_expanded BOOLEAN DEFAULT true
);

-- 4. 기본 폴더가 없으면 생성
INSERT INTO folders (id, name, created_at, is_expanded) 
VALUES ('default', '기본 폴더', NOW(), true)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS 정책 설정 (필요한 경우)
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- 6. 모든 사용자에게 읽기/쓰기 권한 부여 (개발용)
DROP POLICY IF EXISTS "Enable read access for all users" ON devices;
DROP POLICY IF EXISTS "Enable write access for all users" ON devices;
DROP POLICY IF EXISTS "Enable read access for all users" ON folders;
DROP POLICY IF EXISTS "Enable write access for all users" ON folders;

CREATE POLICY "Enable read access for all users" ON devices FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON devices FOR ALL USING (true);
CREATE POLICY "Enable read access for all users" ON folders FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON folders FOR ALL USING (true);

-- 7. 스키마 캐시 새로고침을 위한 더미 쿼리
SELECT 'Schema updated successfully' as status; 
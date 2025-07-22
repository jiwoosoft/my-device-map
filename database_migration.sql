-- 폴더 기능을 위한 데이터베이스 마이그레이션
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. devices 테이블에 folderId 컬럼 추가
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS folderId TEXT DEFAULT 'default';

-- 2. folderId 컬럼에 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_devices_folder_id ON devices(folderId);

-- 3. folders 테이블 생성 (폴더 정보 저장용)
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_expanded BOOLEAN DEFAULT true
);

-- 4. 기본 폴더 데이터 삽입
INSERT INTO folders (id, name, created_at, is_expanded) 
VALUES ('default', '기본 폴더', NOW(), true)
ON CONFLICT (id) DO NOTHING;

-- 5. 기존 장비 데이터의 folderId를 'default'로 설정
UPDATE devices 
SET folderId = 'default' 
WHERE folderId IS NULL;

-- 6. RLS (Row Level Security) 정책 설정
-- devices 테이블에 대한 정책
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Enable read access for all users" ON devices
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON devices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON devices
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON devices
    FOR DELETE USING (true);

-- folders 테이블에 대한 정책
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON folders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON folders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON folders
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON folders
    FOR DELETE USING (true);

-- 7. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'devices' 
ORDER BY ordinal_position;

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'folders' 
ORDER BY ordinal_position; 
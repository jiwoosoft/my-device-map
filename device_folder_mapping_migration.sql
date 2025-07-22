-- 장비-폴더 매핑 테이블 생성
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. device_folder_mapping 테이블 생성
CREATE TABLE IF NOT EXISTS device_folder_mapping (
    id SERIAL PRIMARY KEY,
    deviceId TEXT NOT NULL,
    folderId TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_device_folder_mapping_device_id ON device_folder_mapping(deviceId);
CREATE INDEX IF NOT EXISTS idx_device_folder_mapping_folder_id ON device_folder_mapping(folderId);

-- 3. RLS (Row Level Security) 정책 설정
ALTER TABLE device_folder_mapping ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정
CREATE POLICY "Enable read access for all users" ON device_folder_mapping
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON device_folder_mapping
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON device_folder_mapping
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON device_folder_mapping
    FOR DELETE USING (true);

-- 4. 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'device_folder_mapping' 
ORDER BY ordinal_position; 
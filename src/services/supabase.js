import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정을 가져옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://prtjnukbuubeckxxgnuk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGpudWtidXViZWNreHhnbnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjIxMzIsImV4cCI6MjA2ODQ5ODEzMn0.mPFuIdEIKqjSnggh-D3AebgG5mE5w9PeIzqQgtIngajo';

console.log('🔧 Supabase 설정 확인:');
console.log('  URL:', supabaseUrl);
console.log('  Key 길이:', supabaseAnonKey ? supabaseAnonKey.length : 0);

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 클라우드 동기화가 활성화되어 있는지 확인하는 함수
export const isCloudSyncEnabled = () => {
  // 환경 변수가 없으면 기본값으로 활성화
  const cloudSyncEnabled = import.meta.env.VITE_ENABLE_CLOUD_SYNC === 'true' || true;
  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseAnonKey;
  
  console.log('🔍 클라우드 동기화 상태 확인:');
  console.log('  VITE_ENABLE_CLOUD_SYNC:', import.meta.env.VITE_ENABLE_CLOUD_SYNC);
  console.log('  supabaseUrl 존재:', hasUrl);
  console.log('  supabaseAnonKey 존재:', hasKey);
  console.log('  최종 결과:', cloudSyncEnabled && hasUrl && hasKey);
  
  return cloudSyncEnabled && hasUrl && hasKey;
};

// 장비 데이터를 Supabase에 저장하는 함수
export const saveDevicesToCloud = async (devices) => {
  try {
    if (!isCloudSyncEnabled()) {
      console.log('클라우드 동기화가 비활성화되어 있습니다.');
      return { success: false, error: 'Cloud sync disabled' };
    }

    if (!supabase) {
      console.log('Supabase 클라이언트가 초기화되지 않았습니다.');
      return { success: false, error: 'Supabase client not initialized' };
    }

    // 먼저 테이블 존재 여부 확인
    const { data: tableCheck, error: tableError } = await supabase
      .from('devices')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('테이블 접근 오류:', tableError);
      return { 
        success: false, 
        error: `테이블 접근 실패: ${tableError.message}. Supabase 대시보드에서 'devices' 테이블을 생성해주세요.` 
      };
    }

    // 기존 데이터 삭제 후 새 데이터 삽입
    const { error: deleteError } = await supabase
      .from('devices')
      .delete()
      .neq('id', 0); // 모든 데이터 삭제

    if (deleteError) {
      console.error('기존 데이터 삭제 오류:', deleteError);
      return { success: false, error: deleteError };
    }

    // 새 데이터 삽입
    const { error: insertError } = await supabase
      .from('devices')
      .insert(devices);

    if (insertError) {
      console.error('데이터 삽입 오류:', insertError);
      return { success: false, error: insertError };
    }

    console.log('클라우드 동기화 성공:', devices.length, '개 장비');
    return { success: true };
  } catch (error) {
    console.error('클라우드 동기화 오류:', error);
    return { success: false, error };
  }
};

// Supabase에서 장비 데이터를 가져오는 함수
export const loadDevicesFromCloud = async () => {
  try {
    if (!isCloudSyncEnabled()) {
      console.log('클라우드 동기화가 비활성화되어 있습니다.');
      return { success: false, data: [], error: 'Cloud sync disabled' };
    }

    if (!supabase) {
      console.log('Supabase 클라이언트가 초기화되지 않았습니다.');
      return { success: false, data: [], error: 'Supabase client not initialized' };
    }

    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('클라우드 데이터 로드 오류:', error);
      return { success: false, data: [], error };
    }

    console.log('클라우드에서 데이터 로드 성공:', data.length, '개 장비');
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('클라우드 데이터 로드 오류:', error);
    return { success: false, data: [], error };
  }
}; 
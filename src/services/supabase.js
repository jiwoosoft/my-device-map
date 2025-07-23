import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정을 가져옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://prtjnukbuubeckxxgnuk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydGpudWtidXViZWNreHhnbnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjIxMzIsImV4cCI6MjA2ODQ5ODEzMn0.mPFuIdEIKqjSngh-D3AebgG5mE5w9PeIzqQgtIngajo';

console.log('🔧 Supabase 설정 확인:');
console.log('  URL:', supabaseUrl);
console.log('  Key 길이:', supabaseAnonKey ? supabaseAnonKey.length : 0);

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 클라우드 동기화가 활성화되어 있는지 확인하는 함수
export const isCloudSyncEnabled = () => {
  // 테이블 생성 완료로 클라우드 동기화 재활성화
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
export const saveDevicesToCloud = async (devices, folders = []) => {
  if (!isCloudSyncEnabled()) {
    return { success: false, error: '클라우드 동기화가 비활성화되어 있습니다.' };
  }

  try {
    // 테이블 존재 여부 확인
    const { data: tableExists, error: tableError } = await supabase
      .from('devices')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.error('devices 테이블이 존재하지 않습니다.');
      return { success: false, error: 'devices 테이블이 존재하지 않습니다.' };
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

    // folderId를 제거한 데이터로 변환 (스키마 문제 해결 전 임시 해결책)
    const devicesWithoutFolderId = devices.map(device => {
      const { folderId, ...deviceWithoutFolderId } = device;
      return deviceWithoutFolderId;
    });

    // 변환된 데이터 삽입
    const { error: insertError } = await supabase
      .from('devices')
      .insert(devicesWithoutFolderId);

    if (insertError) {
      console.error('데이터 삽입 오류:', insertError);
      return { success: false, error: insertError };
    }

    // 폴더 동기화는 임시로 비활성화 (스키마 문제 해결 후 재활성화)
    console.log('⚠️ 폴더 동기화는 임시로 비활성화되었습니다. 스키마 문제 해결 후 재활성화됩니다.');

    console.log('클라우드 동기화 성공:', devices.length, '개 장비');
    return { success: true };
  } catch (error) {
    console.error('클라우드 동기화 오류:', error);
    return { success: false, error };
  }
};

// 클라우드에서 장비 데이터를 로드하는 함수
export const loadDevicesFromCloud = async () => {
  if (!isCloudSyncEnabled()) {
    return { success: false, error: '클라우드 동기화가 비활성화되어 있습니다.' };
  }

  try {
    // 장비 데이터 로드
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (devicesError) {
      console.error('장비 데이터 로드 오류:', devicesError);
      return { success: false, error: devicesError };
    }

    // 폴더 동기화는 임시로 비활성화 (스키마 문제 해결 후 재활성화)
    console.log('⚠️ 폴더 동기화는 임시로 비활성화되었습니다. 스키마 문제 해결 후 재활성화됩니다.');
    
    // 기본 폴더만 제공
    const folders = [{
      id: 'default',
      name: '기본 폴더',
      created_at: new Date().toISOString(),
      is_expanded: true
    }];

    // 모든 장비를 기본 폴더로 설정
    const processedDevices = devices.map(device => ({
      ...device,
      folderId: 'default'
    }));

    console.log('클라우드 데이터 로드 성공:', processedDevices.length, '개 장비');
    return { 
      success: true, 
      data: processedDevices,
      folders: folders
    };
  } catch (error) {
    console.error('클라우드 데이터 로드 오류:', error);
    return { success: false, error };
  }
}; 
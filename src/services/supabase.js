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
      
      // API 키 오류인지 확인
      if (tableError.message && tableError.message.includes('Invalid API key')) {
        return { 
          success: false, 
          error: `API 키 오류: ${tableError.message}. Supabase 대시보드에서 올바른 API 키를 확인해주세요.` 
        };
      }
      
      // 테이블이 없는 경우
      if (tableError.code === 'PGRST116') {
        return { 
          success: false, 
          error: `테이블이 존재하지 않습니다. Supabase 대시보드에서 'devices' 테이블을 생성해주세요.` 
        };
      }
      
      return { 
        success: false, 
        error: `테이블 접근 실패: ${tableError.message}` 
      };
    }

    // 새 데이터 삽입 (folderId 포함)
    const { error: insertError } = await supabase
      .from('devices')
      .insert(devices);

    if (insertError) {
      console.error('데이터 삽입 오류:', insertError);
      return { success: false, error: insertError };
    }

    // 폴더 데이터도 저장 (folders 테이블이 있는 경우)
    if (folders && folders.length > 0) {
      try {
        // 기존 폴더 데이터 삭제
        const { error: deleteFoldersError } = await supabase
          .from('folders')
          .delete()
          .neq('id', ''); // 모든 폴더 데이터 삭제

        if (deleteFoldersError) {
          console.warn('기존 폴더 데이터 삭제 오류:', deleteFoldersError);
        }

        // 새 폴더 데이터 삽입
        const { error: insertFoldersError } = await supabase
          .from('folders')
          .insert(folders);

        if (insertFoldersError) {
          console.warn('폴더 데이터 삽입 오류:', insertFoldersError);
        }
      } catch (folderError) {
        console.warn('폴더 동기화 중 오류 (무시됨):', folderError);
      }
    }

    console.log('클라우드 동기화 성공:', devices.length, '개 장비,', folders.length, '개 폴더');
    return { success: true };
  } catch (error) {
    console.error('클라우드 동기화 오류:', error);
    return { success: false, error };
  }
};

// 클라우드에서 장비 데이터를 로드하는 함수
export const loadDevicesFromCloud = async () => {
  try {
    if (!isCloudSyncEnabled()) {
      console.log('클라우드 동기화가 비활성화되어 있습니다.');
      return { success: false, error: 'Cloud sync disabled' };
    }

    if (!supabase) {
      console.log('Supabase 클라이언트가 초기화되지 않았습니다.');
      return { success: false, error: 'Supabase client not initialized' };
    }

    // 장비 데이터 로드
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (devicesError) {
      console.error('장비 데이터 로드 오류:', devicesError);
      return { success: false, error: devicesError };
    }

    // 폴더 데이터 로드 (folders 테이블이 있는 경우)
    let folders = [];
    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: true });

      if (foldersError) {
        console.warn('폴더 데이터 로드 오류 (무시됨):', foldersError);
      } else {
        folders = foldersData || [];
      }
    } catch (folderError) {
      console.warn('폴더 테이블 접근 오류 (무시됨):', folderError);
    }

    // 기본 폴더가 없으면 생성
    if (!folders.find(f => f.id === 'default')) {
      folders.unshift({
        id: 'default',
        name: '기본 폴더',
        created_at: new Date().toISOString(),
        is_expanded: true
      });
    }

    // folderId가 없는 장비들을 기본 폴더로 설정
    const processedDevices = devices.map(device => ({
      ...device,
      folderId: device.folderId || 'default'
    }));

    console.log('클라우드 데이터 로드 성공:', processedDevices.length, '개 장비,', folders.length, '개 폴더');
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
import React from 'react';
import useCloudSync from '../hooks/useCloudSync';

/**
 * 클라우드 동기화 설정 컴포넌트
 * @param {Array} devices 현재 장비 목록
 * @param {Function} setDevices 장비 목록 업데이트 함수
 * @param {Array} folders 현재 폴더 목록
 * @param {Function} setFolders 폴더 목록 업데이트 함수
 */
function CloudSyncSettings({ devices, setDevices, folders = [], setFolders = null }) {
  const {
    cloudSyncEnabled,
    isSyncing,
    lastSyncTime,
    uploadToCloud,
    downloadFromCloud,
    syncWithCloud
  } = useCloudSync(devices, setDevices, folders, setFolders);

  // 마지막 동기화 시간을 포맷팅하는 함수
  const formatLastSyncTime = (time) => {
    if (!time) return '동기화 기록 없음';
    return new Date(time).toLocaleString('ko-KR');
  };

  if (!cloudSyncEnabled) {
    return (
      <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg border border-yellow-300 dark:border-yellow-700">
        <div className="flex items-center">
          <span className="text-yellow-800 dark:text-yellow-200 text-sm">
            ⚠️ 클라우드 동기화가 비활성화되어 있습니다.
          </span>
        </div>
        <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
          환경 변수 VITE_ENABLE_CLOUD_SYNC=true로 설정하세요.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
      {/* 제목과 토글을 한 줄에 배치하고 토글을 오른쪽 끝으로 정렬 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
          ☁️ 클라우드 동기화
        </h3>
        {/* 토글 버튼을 사이드바 오른쪽 끝으로 정렬 */}
        <div className="flex items-center space-x-1 ml-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-blue-600 dark:text-blue-300">활성화</span>
        </div>
      </div>

      {/* 마지막 동기화 시간 */}
      <div className="mb-3 text-xs text-blue-700 dark:text-blue-300">
        마지막 동기화: {formatLastSyncTime(lastSyncTime)}
      </div>

      {/* 동기화 버튼들 */}
      <div className="space-y-2">
        {/* 전체 동기화 버튼 */}
        <button
          onClick={syncWithCloud}
          disabled={isSyncing}
          className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-semibold rounded-md transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isSyncing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>동기화 중...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>전체 동기화</span>
            </>
          )}
        </button>

        {/* 개별 버튼들 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={uploadToCloud}
            disabled={isSyncing}
            className="px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <span>📤</span>
            <span>업로드</span>
          </button>
          
          <button
            onClick={downloadFromCloud}
            disabled={isSyncing}
            className="px-2 py-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <span>📥</span>
            <span>다운로드</span>
          </button>
        </div>
      </div>

      {/* 현재 상태 정보 */}
      <div className="mt-3 text-xs text-blue-600 dark:text-blue-300">
        현재 {devices.length}개 장비, {folders.length}개 폴더가 로컬에 저장되어 있습니다.
      </div>
    </div>
  );
}

export default CloudSyncSettings; 
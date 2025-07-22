import { useState, useCallback } from 'react';
import { saveDevicesToCloud, loadDevicesFromCloud, isCloudSyncEnabled } from '../services/supabase';
import { toast } from 'react-toastify';

/**
 * 클라우드 동기화를 위한 커스텀 훅
 * @param {Array} devices 현재 장비 목록
 * @param {Function} setDevices 장비 목록 업데이트 함수
 * @param {Array} folders 현재 폴더 목록
 * @param {Function} setFolders 폴더 목록 업데이트 함수
 * @returns {Object} 클라우드 동기화 관련 함수들과 상태
 */
function useCloudSync(devices, setDevices, folders = [], setFolders = null) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // 클라우드 동기화가 활성화되어 있는지 확인
  const cloudSyncEnabled = isCloudSyncEnabled();

  // 로컬 데이터를 클라우드에 업로드
  const uploadToCloud = useCallback(async () => {
    if (!cloudSyncEnabled) {
      toast.warning('클라우드 동기화가 비활성화되어 있습니다.');
      return { success: false };
    }

    setIsSyncing(true);
    try {
      const result = await saveDevicesToCloud(devices, folders);
      
      if (result.success) {
        setLastSyncTime(new Date());
        toast.success(`클라우드 업로드 성공! (${devices.length}개 장비, ${folders.length}개 폴더)`);
        return { success: true };
      } else {
        toast.error('클라우드 업로드 실패: ' + (result.error?.message || '알 수 없는 오류'));
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('클라우드 업로드 중 오류 발생: ' + error.message);
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [devices, folders, cloudSyncEnabled]);

  // 클라우드에서 데이터 다운로드
  const downloadFromCloud = useCallback(async () => {
    if (!cloudSyncEnabled) {
      toast.warning('클라우드 동기화가 비활성화되어 있습니다.');
      return { success: false };
    }

    setIsSyncing(true);
    try {
      const result = await loadDevicesFromCloud();
      
      if (result.success) {
        setDevices(result.data);
        if (setFolders && result.folders) {
          setFolders(result.folders);
        }
        setLastSyncTime(new Date());
        toast.success(`클라우드 다운로드 성공! (${result.data.length}개 장비, ${result.folders?.length || 0}개 폴더)`);
        return { success: true, data: result.data, folders: result.folders };
      } else {
        toast.error('클라우드 다운로드 실패: ' + (result.error?.message || '알 수 없는 오류'));
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('클라우드 다운로드 중 오류 발생: ' + error.message);
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [setDevices, setFolders, cloudSyncEnabled]);

  // 클라우드와 로컬 데이터 동기화 (업로드 + 다운로드)
  const syncWithCloud = useCallback(async () => {
    if (!cloudSyncEnabled) {
      toast.warning('클라우드 동기화가 비활성화되어 있습니다.');
      return { success: false };
    }

    setIsSyncing(true);
    try {
      // 먼저 업로드
      const uploadResult = await uploadToCloud();
      if (!uploadResult.success) {
        return uploadResult;
      }

      // 그 다음 다운로드
      const downloadResult = await downloadFromCloud();
      if (!downloadResult.success) {
        return downloadResult;
      }

      toast.success('클라우드 동기화 완료!');
      return { success: true };
    } catch (error) {
      toast.error('동기화 중 오류 발생: ' + error.message);
      return { success: false, error };
    } finally {
      setIsSyncing(false);
    }
  }, [cloudSyncEnabled, uploadToCloud, downloadFromCloud]);

  return {
    cloudSyncEnabled,
    isSyncing,
    lastSyncTime,
    uploadToCloud,
    downloadFromCloud,
    syncWithCloud
  };
}

export default useCloudSync; 
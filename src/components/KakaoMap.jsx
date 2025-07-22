import React, { useEffect, useRef } from 'react';

// 카카오맵 API 키 (JavaScript 키)
const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY || '18c928214d853fa807cccb53eba66924';

// 카카오맵 컴포넌트
const KakaoMap = ({
  devices,
  initialPosition,
  onMapClick,
  onMarkerClick,
  selectedDevice,
  editingDevice,
  onMarkerDragEnd
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // 지도 인스턴스 저장
  const markersRef = useRef({}); // 마커 인스턴스 저장

  useEffect(() => {
    // 지도 및 마커 초기화 함수
    function initMap() {
      if (!mapRef.current) return;

      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(initialPosition[0], initialPosition[1]),
        level: 3
      });
      mapInstanceRef.current = map;

      // 지도 클릭 이벤트 등록
      window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        if (onMapClick) onMapClick([latlng.getLat(), latlng.getLng()]);
      });

      // 기존 마커 제거
      Object.values(markersRef.current).forEach(marker => marker.setMap(null));
      markersRef.current = {};

      // 장비별 마커 생성
      devices.forEach(device => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(device.latitude, device.longitude),
          map
        });
        markersRef.current[device.id] = marker;

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          if (onMarkerClick) onMarkerClick(device);
        });

        // 드래그 가능 마커 (수정 모드)
        if (editingDevice?.id === device.id) {
          marker.setDraggable(true);
          window.kakao.maps.event.addListener(marker, 'dragend', (mouseEvent) => {
            const latlng = mouseEvent.latLng;
            if (onMarkerDragEnd) onMarkerDragEnd(device.id, [latlng.getLat(), latlng.getLng()]);
          });
        }
      });
    }

    // SDK가 이미 로드되어 있으면 바로 load 콜백 실행
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    } else {
      // SDK 동적 로드 (autoload=false)
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(initMap);
      };
      document.head.appendChild(script);
      return () => {
        if (document.head.contains(script)) document.head.removeChild(script);
      };
    }
    // eslint-disable-next-line
  }, [devices, initialPosition, editingDevice]);

  return (
    <div className="w-full h-full relative">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {/* 선택된 장비 팝업 */}
      {selectedDevice && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3 z-10">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selectedDevice.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {selectedDevice.installed_at}
          </div>
          {selectedDevice.note && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {selectedDevice.note}
            </div>
          )}
          {/* 길안내 버튼들 */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => onMarkerClick({ ...selectedDevice, navigation: 'naver' })}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              네이버
            </button>
            <button
              onClick={() => onMarkerClick({ ...selectedDevice, navigation: 'kakao' })}
              className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              카카오
            </button>
            <button
              onClick={() => onMarkerClick({ ...selectedDevice, navigation: 'tmap' })}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              TMAP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KakaoMap; 
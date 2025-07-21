import React, { useEffect, useRef, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

// 카카오맵 API 키 설정
const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY || '2a10a60806e32faa3e0ac48417c68259';

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
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});

  // 지도 초기화
  useEffect(() => {
    if (map) {
      // 지도 크기 재조정 (사이드바 토글 시)
      const resizeMap = () => {
        if (mapRef.current) {
          mapRef.current.relayout();
        }
      };

      // 지도 크기 재조정을 위한 타이머
      const timer = setTimeout(resizeMap, 300);
      return () => clearTimeout(timer);
    }
  }, [map]);

  // 지도 클릭 이벤트
  const handleMapClick = (map, mouseEvent) => {
    const latlng = mouseEvent.latLng;
    onMapClick([latlng.getLat(), latlng.getLng()]);
  };

  // 마커 클릭 이벤트
  const handleMarkerClick = (device) => {
    onMarkerClick(device);
  };

  // 마커 드래그 종료 이벤트
  const handleMarkerDragEnd = (marker, mouseEvent) => {
    const latlng = mouseEvent.latLng;
    onMarkerDragEnd(device.id, [latlng.getLat(), latlng.getLng()]);
  };

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        center={{ lat: initialPosition[0], lng: initialPosition[1] }}
        style={{ width: "100%", height: "100%" }}
        level={3}
        onClick={handleMapClick}
        onLoad={setMap}
        apiKey={KAKAO_API_KEY}
        onError={(error) => {
          console.error('카카오맵 로드 오류:', error);
        }}
      >
        {/* 장비 마커들 */}
        {devices.map((device) => (
          <MapMarker
            key={device.id}
            position={{ lat: device.latitude, lng: device.longitude }}
            onClick={() => handleMarkerClick(device)}
            onDragEnd={(marker, mouseEvent) => handleMarkerDragEnd(device, mouseEvent)}
            draggable={editingDevice?.id === device.id}
            image={{
              src: editingDevice?.id === device.id 
                ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png"
                : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_black.png",
              size: { width: 24, height: 35 }
            }}
          >
            {/* 마커 클릭 시 팝업 */}
            {selectedDevice?.id === device.id && (
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {device.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {device.installed_at}
                </div>
                {device.note && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {device.note}
                  </div>
                )}
                
                {/* 길안내 버튼들 */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => onMarkerClick({ ...device, navigation: 'naver' })}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    네이버
                  </button>
                  <button
                    onClick={() => onMarkerClick({ ...device, navigation: 'kakao' })}
                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    카카오
                  </button>
                  <button
                    onClick={() => onMarkerClick({ ...device, navigation: 'tmap' })}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    TMAP
                  </button>
                </div>
              </div>
            )}
          </MapMarker>
        ))}
      </Map>
    </div>
  );
};

export default KakaoMap; 
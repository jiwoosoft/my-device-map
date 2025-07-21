import React, { useEffect, useRef, useState } from 'react';

// 네이버맵 컴포넌트
const NaverMap = ({ 
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

  // 네이버맵 초기화
  useEffect(() => {
    // 네이버맵 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${import.meta.env.VITE_NAVER_CLIENT_ID || 'kqcolemxuh'}`;
    script.async = true;
    script.onload = initializeMap;
    script.onerror = (error) => {
      console.error('네이버맵 스크립트 로드 오류:', error);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 네이버맵 초기화 함수
  const initializeMap = () => {
    if (window.naver && mapRef.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(initialPosition[0], initialPosition[1]),
        zoom: 13,
        zoomControl: true,
        zoomControlOptions: {
          position: window.naver.maps.Position.TOP_RIGHT
        }
      };

      const mapInstance = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(mapInstance);

      // 지도 클릭 이벤트
      window.naver.maps.Event.addListener(mapInstance, 'click', (e) => {
        const latlng = e.coord;
        onMapClick([latlng.lat(), latlng.lng()]);
      });

      // 마커 생성
      createMarkers(mapInstance);
    }
  };

  // 마커 생성 함수
  const createMarkers = (mapInstance) => {
    const newMarkers = {};
    
    devices.forEach((device) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(device.latitude, device.longitude),
        map: mapInstance,
        icon: {
          content: `<div style="width: 24px; height: 35px; background: ${
            editingDevice?.id === device.id ? '#ff0000' : '#000000'
          }; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); margin: -17px -12px;"></div>`,
          size: new window.naver.maps.Size(24, 35),
          anchor: new window.naver.maps.Point(12, 35)
        }
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        onMarkerClick(device);
      });

      // 마커 드래그 이벤트 (수정 모드일 때만)
      if (editingDevice?.id === device.id) {
        marker.setDraggable(true);
        window.naver.maps.Event.addListener(marker, 'dragend', (e) => {
          const latlng = e.coord;
          onMarkerDragEnd(device.id, [latlng.lat(), latlng.lng()]);
        });
      }

      newMarkers[device.id] = marker;
    });

    setMarkers(newMarkers);
  };

  // 마커 업데이트 (devices 변경 시)
  useEffect(() => {
    if (map) {
      // 기존 마커 제거
      Object.values(markers).forEach(marker => {
        marker.setMap(null);
      });
      
      // 새 마커 생성
      createMarkers(map);
    }
  }, [devices, editingDevice]);

  // 지도 크기 재조정 (사이드바 토글 시)
  useEffect(() => {
    if (map) {
      const resizeMap = () => {
        map.refresh();
      };
      
      const timer = setTimeout(resizeMap, 300);
      return () => clearTimeout(timer);
    }
  }, [map]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      
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

export default NaverMap; 
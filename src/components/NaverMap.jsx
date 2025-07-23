import React, { useEffect, useRef, useState } from 'react';

// 네이버맵 컴포넌트
const NaverMap = ({
  devices,
  initialPosition,
  onMapClick,
  onMarkerClick,
  selectedDevice,
  editingDevice,
  onMarkerDragEnd,
  shouldMaxZoom // 추가된 prop
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});
  const [localSelectedDevice, setLocalSelectedDevice] = useState(null); // 로컬 선택된 장비 상태
  const [currentCenter, setCurrentCenter] = useState(initialPosition); // 현재 지도 중심 위치

  // 네이버맵 초기화
  useEffect(() => {
    console.log('네이버맵 스크립트 로드 시작');
    // 네이버맵 스크립트 로드 (새로운 API 방식)
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_CLIENT_ID || 'kqcolemxuh'}`;
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
    console.log('네이버맵 초기화 함수 실행');
    if (window.naver && mapRef.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(currentCenter[0], currentCenter[1]),
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
        // 지도 클릭 시 정보창 닫기
        setLocalSelectedDevice(null);
      });

      // 지도 중심 변경 이벤트 등록
      window.naver.maps.Event.addListener(mapInstance, 'center_changed', () => {
        const center = mapInstance.getCenter();
        setCurrentCenter([center.lat(), center.lng()]);
      });

      // 마커 생성
      createMarkers(mapInstance);
      console.log('네이버맵 초기화 완료');
    }
  };

  // 마커 생성 함수
  const createMarkers = (mapInstance) => {
    console.log('네이버맵 마커 생성 시작, devices:', devices);
    const newMarkers = {};

    devices.forEach((device) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(device.latitude, device.longitude),
        map: mapInstance,
        icon: {
          content: `<svg width="24" height="35" viewBox="0 0 24 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 8.5 12 23 12 23s12-14.5 12-23c0-6.63-5.37-12-12-12z" fill="${editingDevice?.id === device.id ? '#ff0000' : '#3b82f6'}"/>
            <circle cx="12" cy="12" r="6" fill="white"/>
          </svg>`,
          size: new window.naver.maps.Size(24, 35),
          anchor: new window.naver.maps.Point(12, 35)
        }
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        console.log('네이버맵 마커 클릭됨:', device);
        // 로컬 상태 업데이트
        setLocalSelectedDevice(device);
        // 부모 컴포넌트에도 알림
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
    console.log('네이버맵 마커 생성 완료');
  };

  // 마커 업데이트 (devices 변경 시)
  useEffect(() => {
    if (map) {
      console.log('네이버맵 마커 업데이트');
      // 기존 마커 제거
      Object.values(markers).forEach(marker => {
        marker.setMap(null);
      });

      // 새 마커 생성
      createMarkers(map);
    }
  }, [devices, editingDevice]);

  // 선택된 장비가 변경될 때 지도를 해당 위치로 이동
  useEffect(() => {
    if (selectedDevice && map) {
      console.log('네이버맵 선택된 장비로 이동:', selectedDevice);
      const newPosition = new window.naver.maps.LatLng(
        selectedDevice.latitude,
        selectedDevice.longitude
      );

      // shouldMaxZoom 값에 따라 줌 레벨 결정 (21이 최대 확대)
      const zoomLevel = shouldMaxZoom ? 21 : map.getZoom();

      // 지도 이동 및 줌 레벨 설정
      map.morph(newPosition, zoomLevel, {
        duration: 800,
        easing: 'easeOutCubic'
      });

      setCurrentCenter([selectedDevice.latitude, selectedDevice.longitude]);
      setLocalSelectedDevice(selectedDevice);

      console.log(`네이버맵 이동 완료 - 줌 레벨: ${zoomLevel}`);

    }
  }, [selectedDevice, map, shouldMaxZoom]); // 의존성 배열에 shouldMaxZoom 추가

  // 지도 크기 재조정 (사이드바 토글 시) - 현재 위치 유지
  useEffect(() => {
    if (map) {
      const resizeMap = () => {
        // 지도 리사이즈 후 현재 중심 위치로 복원
        const center = new window.naver.maps.LatLng(currentCenter[0], currentCenter[1]);
        map.setCenter(center);
        console.log('네이버맵 리사이즈 후 위치 복원:', currentCenter);
      };

      const timer = setTimeout(resizeMap, 300);
      return () => clearTimeout(timer);
    }
  }, [map, currentCenter]);

  // 정보창 닫기 함수
  const closeInfoWindow = () => {
    console.log('네이버맵 정보창 닫기');
    setLocalSelectedDevice(null);
    // 부모 컴포넌트에도 선택 해제 알림
    if (onMarkerClick) {
      onMarkerClick(null);
    }
  };

  // 표시할 장비 결정 (로컬 상태 우선, 없으면 부모 상태 사용)
  const displayDevice = localSelectedDevice || selectedDevice;

  console.log('네이버맵 렌더링 - displayDevice:', displayDevice);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* 선택된 장비 팝업 */}
      {displayDevice && (
        <div
          className="absolute bg-gray-200 dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-500 dark:border-gray-600 p-4 max-w-xs"
          style={{
            zIndex: 10000,
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(229, 231, 235, 0.9)', // 밝은 회색, 90% 불투명
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.3)',
            border: '3px solid #6b7280',
            minWidth: '280px'
          }}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeInfoWindow}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg font-bold"
            aria-label="닫기"
          >
            ×
          </button>

          <div className="text-sm font-bold text-gray-900 mb-2" style={{ color: '#ff0000 !important' }}>
            {displayDevice.name}
          </div>
          <div className="text-xs text-gray-900 mb-1 font-semibold" style={{ color: '#ff0000 !important' }}>
            설치일: {displayDevice.installed_at}
          </div>
          {displayDevice.note && (
            <div className="text-xs text-gray-900 mb-3 font-medium" style={{ color: '#ff0000 !important' }}>
              비고: {displayDevice.note}
            </div>
          )}

          {/* 길안내 버튼들 */}
          <div className="border-t border-gray-400 dark:border-gray-500 pt-2">
            <div className="text-xs font-bold text-gray-900 mb-2" style={{ color: '#ff0000 !important' }}>길안내</div>
            <div className="flex space-x-2">
              <button
                onClick={() => onMarkerClick({ ...displayDevice, navigation: 'naver' })}
                className="px-3 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                네이버
              </button>
              <button
                onClick={() => onMarkerClick({ ...displayDevice, navigation: 'kakao' })}
                className="px-3 py-2 text-xs font-bold bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-md"
              >
                카카오
              </button>
              <button
                onClick={() => onMarkerClick({ ...displayDevice, navigation: 'tmap' })}
                className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                TMAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaverMap; 
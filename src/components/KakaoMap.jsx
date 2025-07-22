import React, { useEffect, useRef, useState, useCallback } from 'react';

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
  const [localSelectedDevice, setLocalSelectedDevice] = useState(null); // 로컬 선택된 장비 상태
  const [currentCenter, setCurrentCenter] = useState(initialPosition); // 현재 지도 중심 위치
  const [currentLevel, setCurrentLevel] = useState(7); // 현재 줌 레벨 (7로 조정 - 더 축소)
  const [isMapInitialized, setIsMapInitialized] = useState(false); // 지도 초기화 상태
  const [isProcessingClick, setIsProcessingClick] = useState(false); // 클릭 처리 중 상태
  const [isMapLoading, setIsMapLoading] = useState(true); // 지도 로딩 상태

  // 마커 클릭 핸들러 (useCallback으로 최적화)
  const handleMarkerClick = useCallback((device) => {
    if (isProcessingClick || !isMapInitialized) return; // 이미 처리 중이거나 지도가 초기화되지 않았으면 무시
    
    try {
      setIsProcessingClick(true);
      console.log('카카오맵 마커 클릭됨:', device);
      
      // 로컬 상태 업데이트
      setLocalSelectedDevice(device);
      
      // 부모 컴포넌트에도 알림
      if (onMarkerClick) {
        onMarkerClick(device);
      }
      
      // 클릭 처리 완료 후 상태 초기화
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 200); // 시간을 늘려서 안정성 향상
    } catch (error) {
      console.error('마커 클릭 처리 중 오류:', error);
      setIsProcessingClick(false);
    }
  }, [onMarkerClick, isProcessingClick, isMapInitialized]);

  // 지도 클릭 핸들러 (useCallback으로 최적화)
  const handleMapClick = useCallback((mouseEvent) => {
    if (isProcessingClick || !isMapInitialized) return; // 이미 처리 중이거나 지도가 초기화되지 않았으면 무시
    
    try {
      const latlng = mouseEvent.latLng;
      if (onMapClick) onMapClick([latlng.getLat(), latlng.getLng()]);
      // 지도 클릭 시 정보창 닫기
      setLocalSelectedDevice(null);
    } catch (error) {
      console.error('지도 클릭 처리 중 오류:', error);
    }
  }, [onMapClick, isProcessingClick, isMapInitialized]);

  useEffect(() => {
    // 지도 및 마커 초기화 함수
    function initMap() {
      if (!mapRef.current) {
        console.log('카카오맵 컨테이너가 없습니다.');
        return;
      }

      console.log('카카오맵 초기화 시작');

      try {
        // 기존 지도 인스턴스 정리
        if (mapInstanceRef.current) {
          try {
            // 기존 이벤트 리스너 제거
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'click');
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'center_changed');
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'zoom_changed');
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'tilesloaded');
            mapInstanceRef.current = null;
          } catch (error) {
            console.error('기존 지도 정리 중 오류:', error);
          }
        }

        // 기존 마커들 정리
        Object.values(markersRef.current).forEach(marker => {
          if (marker) {
            try {
              window.kakao.maps.event.clearListeners(marker, 'click');
              window.kakao.maps.event.clearListeners(marker, 'dragend');
              marker.setMap(null);
            } catch (error) {
              console.error('마커 정리 중 오류:', error);
            }
          }
        });
        markersRef.current = {};

        // 지도 생성 - 현재 중심 위치와 줌 레벨 사용
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(currentCenter[0], currentCenter[1]),
          level: currentLevel,
          scrollwheel: true, // 마우스 휠 줌 활성화
          draggable: true,   // 드래그 활성화
          zoomable: true,    // 줌 활성화
          keyboardShortcuts: false // 키보드 단축키 비활성화 (충돌 방지)
        });
        mapInstanceRef.current = map;

        // 지도 클릭 이벤트 등록
        window.kakao.maps.event.addListener(map, 'click', handleMapClick);

        // 지도 중심 변경 이벤트 등록
        window.kakao.maps.event.addListener(map, 'center_changed', () => {
          try {
            const center = map.getCenter();
            setCurrentCenter([center.getLat(), center.getLng()]);
          } catch (error) {
            console.error('중심 변경 이벤트 처리 중 오류:', error);
          }
        });

        // 지도 줌 레벨 변경 이벤트 등록
        window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
          try {
            const level = map.getLevel();
            setCurrentLevel(level);
            console.log('카카오맵 줌 레벨 변경:', level);
          } catch (error) {
            console.error('줌 변경 이벤트 처리 중 오류:', error);
          }
        });

        // 지도 로드 완료 이벤트 등록
        window.kakao.maps.event.addListener(map, 'tilesloaded', () => {
          console.log('카카오맵 타일 로드 완료');
          setIsMapInitialized(true);
          setIsMapLoading(false);
        });

        console.log('마커 생성 시작, devices:', devices);

        // 장비별 마커 생성
        devices.forEach(device => {
          try {
            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(device.latitude, device.longitude),
              map
            });
            markersRef.current[device.id] = marker;

            // 마커 클릭 이벤트
            window.kakao.maps.event.addListener(marker, 'click', () => {
              handleMarkerClick(device);
            });

            // 드래그 가능 마커 (수정 모드)
            if (editingDevice?.id === device.id) {
              marker.setDraggable(true);
              window.kakao.maps.event.addListener(marker, 'dragend', (mouseEvent) => {
                try {
                  const latlng = mouseEvent.latLng;
                  if (onMarkerDragEnd) onMarkerDragEnd(device.id, [latlng.getLat(), latlng.getLng()]);
                } catch (error) {
                  console.error('마커 드래그 처리 중 오류:', error);
                }
              });
            }
          } catch (error) {
            console.error('마커 생성 중 오류:', error, device);
          }
        });

        console.log('카카오맵 초기화 완료');
      } catch (error) {
        console.error('카카오맵 초기화 중 오류:', error);
        setIsMapLoading(false);
      }
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
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(initMap);
        } else {
          console.error('카카오맵 SDK 로드 실패');
          setIsMapLoading(false);
        }
      };
      script.onerror = () => {
        console.error('카카오맵 SDK 로드 중 오류');
        setIsMapLoading(false);
      };
      document.head.appendChild(script);
      return () => {
        if (document.head.contains(script)) document.head.removeChild(script);
      };
    }
    // eslint-disable-next-line
  }, [devices, currentCenter, currentLevel, editingDevice, handleMapClick, handleMarkerClick]);

  // 선택된 장비가 변경될 때 지도를 해당 위치로 이동
  useEffect(() => {
    if (selectedDevice && mapInstanceRef.current && isMapInitialized) {
      try {
        console.log('카카오맵 선택된 장비로 이동:', selectedDevice);
        const newPosition = new window.kakao.maps.LatLng(
          selectedDevice.latitude, 
          selectedDevice.longitude
        );
        
        // 부드러운 이동 애니메이션으로 해당 위치로 이동 (줌 레벨 7로 조정 - 더 축소)
        mapInstanceRef.current.panTo(newPosition);
        mapInstanceRef.current.setLevel(7);
        // 현재 중심 위치와 줌 레벨 업데이트
        setCurrentCenter([selectedDevice.latitude, selectedDevice.longitude]);
        setCurrentLevel(7);
        // 로컬 상태도 업데이트
        setLocalSelectedDevice(selectedDevice);
      } catch (error) {
        console.error('장비 선택 이동 중 오류:', error);
      }
    }
  }, [selectedDevice, isMapInitialized]);

  // 지도 크기 재조정 (사이드바 토글 시) - 현재 위치와 줌 레벨 유지
  useEffect(() => {
    if (mapInstanceRef.current && isMapInitialized) {
      const resizeMap = () => {
        try {
          // 지도 리사이즈 후 현재 중심 위치와 줌 레벨로 복원
          const center = new window.kakao.maps.LatLng(currentCenter[0], currentCenter[1]);
          mapInstanceRef.current.setCenter(center);
          mapInstanceRef.current.setLevel(currentLevel);
          console.log('카카오맵 리사이즈 후 위치/줌 복원:', currentCenter, currentLevel);
        } catch (error) {
          console.error('지도 리사이즈 중 오류:', error);
        }
      };
      
      const timer = setTimeout(resizeMap, 300);
      return () => clearTimeout(timer);
    }
  }, [currentCenter, currentLevel, isMapInitialized]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      try {
        // 마커들 정리
        Object.values(markersRef.current).forEach(marker => {
          if (marker) {
            try {
              window.kakao.maps.event.clearListeners(marker, 'click');
              window.kakao.maps.event.clearListeners(marker, 'dragend');
              marker.setMap(null);
            } catch (error) {
              console.error('마커 정리 중 오류:', error);
            }
          }
        });
        markersRef.current = {};

        // 지도 인스턴스 정리
        if (mapInstanceRef.current) {
          try {
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'click');
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'center_changed');
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'zoom_changed');
            window.kakao.maps.event.clearListeners(mapInstanceRef.current, 'tilesloaded');
            mapInstanceRef.current = null;
          } catch (error) {
            console.error('지도 정리 중 오류:', error);
          }
        }
      } catch (error) {
        console.error('컴포넌트 정리 중 오류:', error);
      }
    };
  }, []);

  // 정보창 닫기 함수
  const closeInfoWindow = () => {
    console.log('카카오맵 정보창 닫기');
    setLocalSelectedDevice(null);
  };

  // 표시할 장비 결정 (로컬 상태 우선, 없으면 부모 상태 사용)
  const displayDevice = localSelectedDevice || selectedDevice;

  console.log('카카오맵 렌더링 - displayDevice:', displayDevice);

  return (
    <div className="w-full h-full relative kakao-map-container">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} className="kakao-map" />
      
      {/* 로딩 인디케이터 */}
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-600">지도를 불러오는 중...</div>
          </div>
        </div>
      )}
      
      {/* 선택된 장비 팝업 */}
      {displayDevice && (
        <div 
          className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3 max-w-xs"
          style={{ 
            zIndex: 10000, 
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            border: '1px solid #e5e7eb',
            minWidth: '250px'
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
          
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {displayDevice.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            설치일: {displayDevice.installed_at}
          </div>
          {displayDevice.note && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              비고: {displayDevice.note}
            </div>
          )}
          {/* 길안내 버튼들 */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">길안내</div>
            <div className="flex space-x-2">
              <button
                onClick={() => onMarkerClick({ ...displayDevice, navigation: 'naver' })}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                네이버
              </button>
              <button
                onClick={() => onMarkerClick({ ...displayDevice, navigation: 'kakao' })}
                className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                카카오
              </button>
              <button
                onClick={() => onMarkerClick({ ...displayDevice, navigation: 'tmap' })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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

export default KakaoMap; 
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';

import DeviceList from './components/DeviceList';
import dummyData from './data/dummyData.json';
import useLocalStorage from './hooks/useLocalStorage';
import DeviceFormModal from './components/DeviceFormModal';
import CloudSyncSettings from './components/CloudSyncSettings';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 새로운 지도 컴포넌트들
import MapTypeSelector from './components/MapTypeSelector';
import AddressSearch from './components/AddressSearch';
import KakaoMap from './components/KakaoMap';
import NaverMap from './components/NaverMap';

// Leaflet 아이콘 경로 문제 해결
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


// 지도 이동을 처리하는 컴포넌트
function MapFlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15); // zoom 레벨 15로 부드럽게 이동
    }
  }, [position, map]);
  return null;
}

function App() {
  // 로컬 스토리지를 사용하여 장비 목록을 관리합니다.
  const [devices, setDevices] = useLocalStorage('devices', []);
  // 현재 위치 상태를 관리합니다.
  const [currentPosition, setCurrentPosition] = useState(null);
  // 모달 창의 표시 여부를 관리합니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 수정할 장비의 상태를 관리합니다.
  const [editingDevice, setEditingDevice] = useState(null);
  // 사이드바의 열림/닫힘 상태를 관리합니다. (모바일 뷰)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // 로딩 상태를 관리합니다.
  const [loading, setLoading] = useState(true);
  // 테마 상태를 관리합니다. (다크 모드/라이트 모드)
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  // 맵 인스턴스를 저장하기 위한 ref
  const mapRef = useRef();
  // 모든 마커의 참조를 저장하기 위한 ref
  const markerRefs = useRef({});

  // --- 추가된 상태 변수들 ---
  // 선택된 장비 상태
  const [selectedDevice, setSelectedDevice] = useState(null);
  // 새로운 장비 위치 상태
  const [newDevicePosition, setNewDevicePosition] = useState(null);
  // 초기 지도 위치
  const initialPosition = [35.63, 126.88];
  // --- 여기까지 ---
  // 수정 중인 마커의 임시 위치를 저장하는 상태
  const [updatedPosition, setUpdatedPosition] = useState(null);

  // 새로운 지도 관련 상태
  const [mapType, setMapType] = useLocalStorage('mapType', 'leaflet'); // 지도 타입 (leaflet, kakao, naver)
  const [searchLocation, setSearchLocation] = useState(null); // 주소 검색으로 선택된 위치

  // 테마 변경 시 HTML 루트 요소에 'dark' 클래스를 토글합니다.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 수정 모드가 변경될 때마다 마커의 드래그 상태를 직접 제어
  useEffect(() => {
    // 모든 마커를 일단 드래그 불가능 상태로 리셋
    Object.values(markerRefs.current).forEach(marker => {
      if (marker) {
        marker.dragging.disable(); // 올바른 함수 이름으로 수정
      }
    });

    // 수정 모드인 장비가 있다면, 해당 마커만 드래그 가능하게 만듦
    if (editingDevice) {
      const markerRef = markerRefs.current[editingDevice.id];
      if (markerRef) {
        markerRef.dragging.enable(); // 올바른 함수 이름으로 수정
      }
    }
  }, [editingDevice]);

  // 지도 로드 후 왼쪽 줌 컨트롤 제거
  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        // 왼쪽 상단의 기본 줌 컨트롤을 찾아서 제거
        const defaultZoomControl = document.querySelector('.leaflet-control-zoom:not(.leaflet-control-zoom-topright)');
        if (defaultZoomControl) {
          defaultZoomControl.remove();
        }
      }, 1000); // 지도가 완전히 로드될 때까지 기다림
      
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // mapRef.current 에 지도 인스턴스가 할당되면 invalidateSize 실행
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]); // mapRef는 의존성 배열에서 제외

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
  };

  const handleMapClick = (coordinates) => {
    setEditingDevice(null); // 지도 클릭 시에는 '추가' 모드
    
    // 지도 클릭 시 정보창 닫기 (모바일에서 팝업 가림 방지)
    setSelectedDevice(null);
    
    // 좌표 데이터 형태에 따라 처리
    let position;
    if (Array.isArray(coordinates)) {
      // 카카오맵, 네이버맵에서 전달되는 형태: [latitude, longitude]
      position = { lat: coordinates[0], lng: coordinates[1] };
    } else if (coordinates.latlng) {
      // Leaflet에서 전달되는 형태: { latlng: { lat, lng } }
      position = coordinates.latlng;
    } else {
      console.error('지도 클릭 좌표 처리 오류:', coordinates);
      return;
    }
    
    setNewDevicePosition(position);
    setIsModalOpen(true);
    console.log('지도 클릭 - 새 장비 등록 모달 열기:', position);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
    setUpdatedPosition(null); // 수정 시작 시 임시 위치 초기화
  };

  const handleSaveDevice = (deviceData) => {
    if (editingDevice) {
      // 수정 로직
      const finalPosition = updatedPosition 
        ? { latitude: updatedPosition.lat, longitude: updatedPosition.lng }
        : { latitude: editingDevice.latitude, longitude: editingDevice.longitude };

      setDevices(devices.map(d => 
        d.id === editingDevice.id 
          ? { ...d, ...deviceData, ...finalPosition } 
          : d
      ));
      toast.success("장비 정보가 성공적으로 수정되었습니다.");
    } else {
      // 추가 로직
      const newDevice = {
        id: Date.now().toString(),
        ...deviceData,
        latitude: newDevicePosition.lat,
        longitude: newDevicePosition.lng,
      };
      setDevices([...devices, newDevice]);
      toast.success("새로운 장비가 성공적으로 등록되었습니다.");
    }
    closeModal();
  };

  const handleDeleteDevice = (deviceId) => {
    if (window.confirm('정말로 이 장비를 삭제하시겠습니까?')) {
      setDevices(devices.filter(device => device.id !== deviceId));
      toast.success("장비가 삭제되었습니다.");
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
    setNewDevicePosition(null);
    setUpdatedPosition(null); // 모달 닫을 때 임시 위치 초기화
  }

  const handleNavigationClick = (url) => {
    console.log('길안내 URL 실행:', url);
    
    try {
      // 네이버맵의 경우 여러 URL 스키마 시도
      if (url.includes('nmap://')) {
        // 네이버맵 앱 실행 시도 (여러 스키마)
        const naverUrls = [
          url, // 원본 URL
          url.replace('nmap://route?', 'nmap://route/car?'), // car 모드
          url.replace('nmap://route?', 'nmap://route/walk?'), // walk 모드
          url.replace('nmap://route?', 'nmap://route/transit?') // 대중교통 모드
        ];
        
        // 순차적으로 시도
        naverUrls.forEach((naverUrl, index) => {
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = naverUrl;
            link.click();
          }, index * 500); // 0.5초 간격으로 시도
        });
        
        // 4초 후 웹 버전으로 폴백
        setTimeout(() => {
          const fallbackUrl = `https://map.naver.com/v5/entry/route?dlat=${url.match(/dlat=([^&]+)/)?.[1]}&dlng=${url.match(/dlng=([^&]+)/)?.[1]}&dname=${url.match(/dname=([^&]+)/)?.[1] || ''}&mode=car`;
          window.open(fallbackUrl, '_blank');
        }, 4000);
        
      } else {
        // 카카오맵, TMAP은 기존 방식
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        
        // 3초 후 웹 버전으로 폴백
        setTimeout(() => {
          if (url.includes('kakaomap://')) {
            const fallbackUrl = `https://map.kakao.com/link/to/${url.match(/ep=([^&]+)/)?.[1] || ''}`;
            window.open(fallbackUrl, '_blank');
          } else if (url.includes('tmap://')) {
            const fallbackUrl = `https://tmap.co.kr/route?goalx=${url.match(/goalx=([^&]+)/)?.[1]}&goaly=${url.match(/goaly=([^&]+)/)?.[1]}`;
            window.open(fallbackUrl, '_blank');
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('길안내 실행 중 오류:', error);
      // 오류 발생 시 웹 버전으로 리다이렉트
      if (url.includes('nmap://')) {
        window.open(`https://map.naver.com/v5/entry/route`, '_blank');
      } else if (url.includes('kakaomap://')) {
        window.open('https://map.kakao.com', '_blank');
      } else if (url.includes('tmap://')) {
        window.open('https://tmap.co.kr', '_blank');
      }
    }
  };

  // 지도 타입 변경 핸들러
  const handleMapTypeChange = (newMapType) => {
    setMapType(newMapType);
    toast.info(`${newMapType === 'leaflet' ? 'Leaflet' : newMapType === 'kakao' ? '카카오맵' : '네이버맵'}으로 변경되었습니다.`);
  };

  // 주소 검색으로 위치 선택 핸들러
  const handleLocationSelect = (location) => {
    setSearchLocation(location);
    setNewDevicePosition({ lat: location.latitude, lng: location.longitude });
    setIsModalOpen(true);
    toast.success(`${location.name} 위치가 선택되었습니다.`);
  };

  // 마커 클릭 핸들러 (새로운 지도용)
  const handleMarkerClick = (device) => {
    if (device === null) {
      // 정보창 닫기 요청
      setSelectedDevice(null);
      return;
    }
    
    if (device.navigation) {
      // 길안내 처리 - 모바일에서 더 안정적인 URL 스키마 사용
      const urls = {
        naver: `nmap://route?dlat=${device.latitude}&dlng=${device.longitude}&dname=${encodeURIComponent(device.name)}&mode=car`,
        kakao: `kakaomap://route?ep=${device.latitude},${device.longitude}&by=CAR`,
        tmap: `tmap://route?goalname=${encodeURIComponent(device.name)}&goalx=${device.longitude}&goaly=${device.latitude}`
      };
      
      console.log(`${device.navigation} 길안내 실행:`, urls[device.navigation]);
      handleNavigationClick(urls[device.navigation]);
    } else {
      // 일반 마커 클릭
      setSelectedDevice(device);
    }
  };

  // 마커 드래그 종료 핸들러 (새로운 지도용)
  const handleMarkerDragEnd = (deviceId, newPosition) => {
    setUpdatedPosition({ lat: newPosition[0], lng: newPosition[1] });
    toast.info('마커 위치가 변경되었습니다. 저장 버튼을 클릭하여 저장하세요.');
  };

  const selectedPosition = selectedDevice
    ? [selectedDevice.latitude, selectedDevice.longitude]
    : null;
    
  // MapContainer 자식으로 들어갈 이벤트 핸들러 컴포넌트
  function MapClickHandler() {
    useMap().on('click', (e) => {
      // Leaflet의 경우 e 객체를 그대로 전달
      handleMapClick(e);
    });
    return null;
  }

  return (
    <>
      {/* 부모 컨테이너에 relative 속성 추가 */}
      <div className="relative flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* 토글 버튼을 사이드바 외부로 이동 - 반응형 위치 조정 */}
        <button 
          onClick={toggleSidebar}
          className={`absolute top-16 z-[1005] p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-md shadow-lg transition-all duration-300 ease-in-out sidebar-toggle-external ${isSidebarOpen ? 'left-44 md:left-64 lg:left-80' : 'left-4'}`}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>

        {/* 사이드바 (반응형 적용) - PC에서는 넓게, 모바일에서는 좁게 */}
        <div className={`absolute top-0 left-0 h-full z-[1001] w-40 md:w-64 lg:w-80 bg-white dark:bg-gray-800 p-4 pt-32 overflow-y-auto shadow-lg transition-transform duration-300 ease-in-out sidebar-mobile ${isSidebarOpen ? 'translate-x-0 open' : '-translate-x-full'}`}>
          {/* 주소 검색을 사이드바 내부로 이동 (지도 타입이 leaflet이 아닐 때만 표시) */}
          {mapType !== 'leaflet' && (
            <div className="mb-4">
              <AddressSearch onLocationSelect={handleLocationSelect} />
            </div>
          )}

          {/* 개발자 정보 카드 */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md developer-card-mobile">
            <div className="text-center">
              <div className="text-white text-xs font-semibold mb-1">개발자</div>
              <div className="text-white text-xs font-bold leading-tight">CHOI HYUN MIN</div>
            </div>
          </div>
          
          {/* 맵선택 메뉴를 사이드바 내부로 이동 */}
          <div className="mb-4">
            <MapTypeSelector 
              mapType={mapType} 
              onMapTypeChange={handleMapTypeChange} 
            />
          </div>
          
          {/* 제목의 상단 마진 제거, 중앙 정렬을 위해 부모에 relative 추가 */}
          <div className="relative flex justify-start items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">장비목록</h2>
            {/* 테마 토글 버튼 (오른쪽으로 절대 위치) */}
            <button onClick={toggleTheme} className="absolute right-0 p-2 rounded-full bg-gray-200 dark:bg-gray-700">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          
          {/* 클라우드 동기화 설정 */}
          <div className="cloud-sync-mobile" style={{display: 'block', visibility: 'visible', opacity: 1}}>
            <CloudSyncSettings devices={devices} setDevices={setDevices} />
          </div>
          
          <div className="device-list-mobile">
            <DeviceList
              devices={devices}
              selectedDevice={selectedDevice}
              onDeviceSelect={handleDeviceSelect}
              onDeleteDevice={handleDeleteDevice}
              onEditDevice={handleEditDevice}
            />
          </div>
        </div>

        {/* 지도 영역 (모바일 반응형 적용) */}
        <div className="w-full h-full map-container-mobile relative">
          {/* MapTypeSelector 컴포넌트가 이미 사이드바에 포함되어 있으므로 여기서는 제거 */}
          {/* 주소 검색도 사이드바로 이동했으므로 여기서는 제거 */}

          {/* 지도 렌더링 */}
          {mapType === 'leaflet' && (
            <MapContainer
              ref={mapRef}
              center={initialPosition}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <ZoomControl position="topright" />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {devices.map(device => {
                const isEditing = editingDevice && editingDevice.id === device.id;
                const currentMarkerPosition = isEditing && updatedPosition 
                  ? [updatedPosition.lat, updatedPosition.lng] 
                  : [device.latitude, device.longitude];

                return (
                  <Marker 
                    ref={el => (markerRefs.current[device.id] = el)}
                    key={device.id}
                    position={currentMarkerPosition}
                    eventHandlers={{
                      dragend: (e) => {
                        if (editingDevice && editingDevice.id === device.id) {
                          setUpdatedPosition(e.target.getLatLng());
                        }
                      },
                    }}
                  >
                    <Popup>
                      <div className="space-y-2">
                        <p className="font-bold text-lg">{device.name}</p>
                        <p><b>설치일:</b> {device.installed_at}</p>
                        {device.note && <p><b>비고:</b> {device.note}</p>}
                        <hr className="my-2"/>
                        <p className="font-semibold">길안내</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleNavigationClick(`nmap://route/car?dlat=${device.latitude}&dlng=${device.longitude}&dname=${encodeURIComponent(device.name)}`)}
                            className="text-blue-600 hover:underline"
                          >
                            네이버
                          </button>
                          <button
                            onClick={() => handleNavigationClick(`kakaomap://route?ep=${device.latitude},${device.longitude}&by=CAR`)}
                            className="text-blue-600 hover:underline"
                          >
                            카카오
                          </button>
                          <button
                            onClick={() => handleNavigationClick(`tmap://route?goalname=${encodeURIComponent(device.name)}&goalx=${device.longitude}&goaly=${device.latitude}`)}
                            className="text-blue-600 hover:underline"
                          >
                            TMAP
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
              <MapFlyTo position={selectedPosition} />
              <MapClickHandler />
            </MapContainer>
          )}

          {/* 카카오맵 */}
          {mapType === 'kakao' && (
            <KakaoMap
              devices={devices}
              initialPosition={initialPosition}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              selectedDevice={selectedDevice}
              editingDevice={editingDevice}
              onMarkerDragEnd={handleMarkerDragEnd}
            />
          )}

          {/* 네이버맵 */}
          {mapType === 'naver' && (
            <NaverMap
              devices={devices}
              initialPosition={initialPosition}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              selectedDevice={selectedDevice}
              editingDevice={editingDevice}
              onMarkerDragEnd={handleMarkerDragEnd}
            />
          )}
        </div>
      </div>

      {/* 모달은 메인 레이아웃 컨테이너 외부에 렌더링 */}
      {isModalOpen && (
        <DeviceFormModal
          device={editingDevice}
          onClose={closeModal}
          onSave={handleSaveDevice}
        />
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />
    </>
  );
}

export default App; 
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';

import DeviceList from './components/DeviceList';
import dummyData from './data/dummyData.json';
import useLocalStorage from './hooks/useLocalStorage';
import DeviceFormModal from './components/DeviceFormModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const handleMapClick = (e) => {
    setEditingDevice(null); // 지도 클릭 시에는 '추가' 모드
    setNewDevicePosition(e.latlng);
    setIsModalOpen(true);
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
    window.open(url, '_blank');
  };

  const selectedPosition = selectedDevice
    ? [selectedDevice.latitude, selectedDevice.longitude]
    : null;
    
  // MapContainer 자식으로 들어갈 이벤트 핸들러 컴포넌트
  function MapClickHandler() {
    useMap().on('click', handleMapClick);
    return null;
  }

  return (
    <>
      {/* 부모 컨테이너에 relative 속성 추가 */}
      <div className="relative flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* 사이드바 토글 버튼 */}
        <button 
          onClick={toggleSidebar}
          className={`absolute top-8 z-[1001] p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-md shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-40' : 'left-4'}`}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>

        {/* 사이드바 (너비 고정 및 클래스 변경) */}
        <div className={`absolute top-0 left-0 h-full z-[1000] w-40 bg-white dark:bg-gray-800 p-4 overflow-y-auto shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* 개발자 정보 카드 */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md">
            <div className="text-center">
              <div className="text-white text-xs font-semibold mb-1">개발자</div>
              <div className="text-white text-xs font-bold leading-tight">CHOI HYUN MIN</div>
            </div>
          </div>
          
          {/* 제목의 상단 마진 제거, 중앙 정렬을 위해 부모에 relative 추가 */}
          <div className="relative flex justify-start items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">장비목록</h2>
            {/* 테마 토글 버튼 (오른쪽으로 절대 위치) */}
            <button onClick={toggleTheme} className="absolute right-0 p-2 rounded-full bg-gray-200 dark:bg-gray-700">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          <DeviceList
            devices={devices}
            selectedDevice={selectedDevice}
            onDeviceSelect={handleDeviceSelect}
            onDeleteDevice={handleDeleteDevice}
            onEditDevice={handleEditDevice}
          />
        </div>

        {/* 지도 영역 (이제 항상 전체 너비를 차지) */}
        <div className="w-full h-full">
          <MapContainer
            ref={mapRef} // ref prop을 사용하여 인스턴스 할당
            center={initialPosition}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false} // 기본 줌 컨트롤 비활성화
          >
            <ZoomControl position="topright" /> {/* 줌 컨트롤을 우측 상단에 추가 */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {devices.map(device => {
              const isEditing = editingDevice && editingDevice.id === device.id;
              // 수정 중일 때 updatedPosition 값이 있으면 그 위치를, 아니면 원래 위치를 사용
              const currentMarkerPosition = isEditing && updatedPosition 
                ? [updatedPosition.lat, updatedPosition.lng] 
                : [device.latitude, device.longitude];

              return (
                <Marker 
                  ref={el => (markerRefs.current[device.id] = el)}
                  key={device.id} // key를 원래대로 되돌림
                  position={currentMarkerPosition}
                  // draggable prop은 useEffect에서 직접 제어하므로 제거
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
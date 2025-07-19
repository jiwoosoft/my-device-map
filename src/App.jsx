import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
  const [devices, setDevices] = useLocalStorage('devices', dummyData);
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDevicePosition, setNewDevicePosition] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null); // 수정할 장비 상태
  const initialPosition = [37.5665, 126.9780]; // 초기 지도 중심: 서울

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
  };

  const handleSaveDevice = (deviceData) => {
    if (editingDevice) {
      // 수정 로직
      setDevices(devices.map(d => 
        d.id === editingDevice.id ? { ...d, ...deviceData } : d
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
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">장비 목록</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                // Moon Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                // Sun Icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
          <DeviceList 
            devices={devices}
            selectedDevice={selectedDevice} // 선택된 장비 정보 전달
            onDeviceSelect={handleDeviceSelect}
            onDeleteDevice={handleDeleteDevice}
            onEditDevice={handleEditDevice}
          />
        </div>

        {/* Map Area */}
        <div className="w-2/3">
          <MapContainer center={initialPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {devices.map(device => (
              <Marker key={device.id} position={[device.latitude, device.longitude]}>
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
            ))}
            <MapFlyTo position={selectedPosition} />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {/* Modal is now rendered outside the main layout container */}
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
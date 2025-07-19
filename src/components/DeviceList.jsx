import React from 'react';

const DeviceList = ({ devices, selectedDevice, onDeviceSelect, onDeleteDevice, onEditDevice }) => {
  const handleDeleteClick = (e, deviceId) => {
    e.stopPropagation(); 
    onDeleteDevice(deviceId);
  };

  const handleEditClick = (e, device) => {
    e.stopPropagation();
    onEditDevice(device);
  };

  return (
    <ul>
      {devices.map((device) => {
        const isSelected = selectedDevice && selectedDevice.id === device.id;
        return (
          <li
            key={device.id}
            className={`p-3 mb-2 rounded-md cursor-pointer transition-colors device-item-mobile
              ${isSelected 
                ? 'bg-blue-200 dark:bg-blue-800' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`
            }
            onClick={() => onDeviceSelect(device)}
          >
            {/* ====================================================== */}
            {/* 수정된 부분: flex-col로 수직 구조 명시 */}
            {/* ====================================================== */}
            <div className="flex flex-col w-full">
              {/* 장비 이름 (길면 ...으로 표시) */}
              <h3 className="font-bold truncate">{device.name}</h3>
              
              {/* 수정/삭제 버튼 (이름 아래, 오른쪽 정렬) */}
              <div className="flex justify-end items-center mt-2 space-x-2">
                <button
                  onClick={(e) => handleEditClick(e, device)}
                  className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none"
                  aria-label="Edit device"
                >
                  {/* Pencil Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, device.id)}
                  className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none"
                  aria-label="Delete device"
                >
                  {/* Trash Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default DeviceList;
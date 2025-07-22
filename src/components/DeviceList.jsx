import React, { useState, useMemo } from 'react';

// 초성 매핑 함수
const getChoseong = (text) => {
  const choseongMap = {
    'ㄱ': ['가', '깋'], 'ㄲ': ['까', '낗'], 'ㄴ': ['나', '닣'], 'ㄷ': ['다', '딯'],
    'ㄸ': ['따', '띻'], 'ㄹ': ['라', '맇'], 'ㅁ': ['마', '밓'], 'ㅂ': ['바', '빟'],
    'ㅃ': ['빠', '삫'], 'ㅅ': ['사', '싷'], 'ㅆ': ['싸', '앃'], 'ㅇ': ['아', '잏'],
    'ㅈ': ['자', '짛'], 'ㅉ': ['짜', '찧'], 'ㅊ': ['차', '칳'], 'ㅋ': ['카', '킿'],
    'ㅌ': ['타', '팋'], 'ㅍ': ['파', '핏'], 'ㅎ': ['하', '힣']
  };
  
  return choseongMap[text] || null;
};

// 초성 검색 함수
const isChoseongMatch = (searchText, targetText) => {
  if (!searchText || !targetText) return false;
  
  const searchLower = searchText.toLowerCase();
  const targetLower = targetText.toLowerCase();
  
  // 일반 검색 먼저 시도
  if (targetLower.includes(searchLower)) return true;
  
  // 초성 검색 시도
  for (let i = 0; i < searchText.length; i++) {
    const choseong = searchText[i];
    const range = getChoseong(choseong);
    
    if (range && i < targetText.length) {
      const targetChar = targetText[i];
      const targetCode = targetChar.charCodeAt(0);
      const startCode = range[0].charCodeAt(0);
      const endCode = range[1].charCodeAt(0);
      
      if (targetCode < startCode || targetCode > endCode) {
        return false;
      }
    } else if (!range) {
      // 초성이 아닌 경우 일반 문자로 검색
      if (i < targetText.length && targetText[i].toLowerCase() !== choseong.toLowerCase()) {
        return false;
      }
    }
  }
  
  return true;
};

const DeviceList = ({ devices, selectedDevice, onDeviceSelect, onDeleteDevice, onEditDevice }) => {
  const [searchText, setSearchText] = useState('');
  
  // 검색된 장비 목록 필터링
  const filteredDevices = useMemo(() => {
    if (!searchText.trim()) return devices;
    
    return devices.filter(device => 
      isChoseongMatch(searchText, device.name) ||
      (device.note && isChoseongMatch(searchText, device.note))
    );
  }, [devices, searchText]);

  const handleDeleteClick = (e, deviceId) => {
    e.stopPropagation(); 
    onDeleteDevice(deviceId);
  };

  const handleEditClick = (e, device) => {
    e.stopPropagation();
    onEditDevice(device);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const clearSearch = () => {
    setSearchText('');
  };

  return (
    <div className="w-full">
      {/* 검색 입력창 */}
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="장비명 또는 초성으로 검색 (예: ㄴㅇ, 남양)"
            className="w-full px-3 py-2 pl-10 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 dark:placeholder-gray-400"
          />
          {/* 검색 아이콘 */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* 검색어 지우기 버튼 */}
          {searchText && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* 검색 결과 개수 표시 */}
        {searchText && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {filteredDevices.length}개 중 {devices.length}개 장비
          </div>
        )}
      </div>

      {/* 장비 목록 */}
      <ul className="space-y-2">
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device) => {
            const isSelected = selectedDevice && selectedDevice.id === device.id;
            return (
              <li
                key={device.id}
                className={`p-3 rounded-md cursor-pointer transition-colors device-item-mobile
                  ${isSelected 
                    ? 'bg-blue-200 dark:bg-blue-800' 
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`
                }
                onClick={() => onDeviceSelect(device)}
              >
                <div className="flex flex-col w-full">
                  {/* 장비 이름 (길면 ...으로 표시) */}
                  <h3 className="font-bold truncate">{device.name}</h3>
                  
                  {/* 설치일 표시 */}
                  {device.installed_at && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      설치일: {device.installed_at}
                    </p>
                  )}
                  
                  {/* 비고 표시 */}
                  {device.note && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                      비고: {device.note}
                    </p>
                  )}
                  
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
          })
        ) : (
          <li className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchText ? '검색 결과가 없습니다.' : '등록된 장비가 없습니다.'}
          </li>
        )}
      </ul>
    </div>
  );
};

export default DeviceList;
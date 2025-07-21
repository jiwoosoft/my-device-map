import React from 'react';

// 지도 타입 선택 컴포넌트
const MapTypeSelector = ({ mapType, onMapTypeChange }) => {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
      <div className="flex flex-col space-y-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          지도 종류
        </label>
        <select
          value={mapType}
          onChange={(e) => onMapTypeChange(e.target.value)}
          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="leaflet">Leaflet (기본)</option>
          <option value="kakao">카카오맵</option>
          <option value="naver">네이버맵</option>
        </select>
      </div>
    </div>
  );
};

export default MapTypeSelector; 
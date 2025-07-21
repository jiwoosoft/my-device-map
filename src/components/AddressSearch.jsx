import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// 주소 검색 컴포넌트
const AddressSearch = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 카카오 주소 검색 API 호출
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // 카카오 로컬 API 키 (환경변수에서 가져오기)
      const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || 'YOUR_KAKAO_REST_API_KEY';
      
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('주소 검색에 실패했습니다.');
      }

      const data = await response.json();
      setSearchResults(data.documents || []);
      setShowResults(true);
    } catch (error) {
      console.error('주소 검색 오류:', error);
      // 임시 더미 데이터 (API 키가 없을 때)
      setSearchResults([
        {
          id: '1',
          place_name: '정읍북면농공단지',
          address_name: '전라북도 정읍시 북면 농공단지',
          x: '126.88',
          y: '35.63'
        },
        {
          id: '2', 
          place_name: '정읍시청',
          address_name: '전라북도 정읍시 시기2길 25',
          x: '126.85',
          y: '35.57'
        }
      ]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 입력 처리
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 디바운싱 (500ms 후 검색)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchAddress(query);
    }, 500);
  };

  // 검색 결과 선택
  const handleResultSelect = (result) => {
    const location = {
      latitude: parseFloat(result.y),
      longitude: parseFloat(result.x),
      name: result.place_name,
      address: result.address_name
    };
    
    onLocationSelect(location);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      {/* 검색 입력창 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="주소 또는 장소를 검색하세요..."
          className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 
                     dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 
                     dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        
        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* 검색 결과 목록 */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 
                        border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg 
                        max-h-60 overflow-y-auto z-50">
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                         border-b border-gray-200 dark:border-gray-600 last:border-b-0
                         transition-colors duration-150"
            >
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {result.place_name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {result.address_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {showResults && searchResults.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 
                        border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 z-50">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            검색 결과가 없습니다.
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSearch; 
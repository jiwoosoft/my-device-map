import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// 주소 검색 컴포넌트
const AddressSearch = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 통합 주소 검색 API 호출 (Netlify Functions 프록시 사용)
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    const allResults = [];

    try {
      // 1. 카카오 검색 (Netlify Functions 프록시)
      try {
        const kakaoResponse = await fetch(`/.netlify/functions/search-address?provider=kakao&query=${encodeURIComponent(query)}`);
        if (kakaoResponse.ok) {
          const kakaoData = await kakaoResponse.json();
          if (kakaoData.success && kakaoData.results) {
            allResults.push(...kakaoData.results.map(item => ({
              id: `kakao_${item.x}_${item.y}`,
              title: item.title,
              address: item.address,
              roadAddress: item.roadAddress,
              latitude: item.y,
              longitude: item.x,
              provider: 'kakao'
            })));
          }
        }
      } catch (error) {
        console.warn('카카오 검색 실패:', error);
      }

      // 2. 네이버 검색 (Netlify Functions 프록시)
      try {
        const naverResponse = await fetch(`/.netlify/functions/search-address?provider=naver&query=${encodeURIComponent(query)}`);
        if (naverResponse.ok) {
          const naverData = await naverResponse.json();
          if (naverData.success && naverData.results) {
            allResults.push(...naverData.results.map(item => ({
              id: `naver_${item.x}_${item.y}`,
              title: item.title,
              address: item.address,
              roadAddress: item.roadAddress,
              latitude: item.y,
              longitude: item.x,
              provider: 'naver'
            })));
          }
        }
      } catch (error) {
        console.warn('네이버 검색 실패:', error);
      }

      // 중복 제거 및 정렬
      const uniqueResults = removeDuplicates(allResults);
      const sortedResults = sortResults(uniqueResults, query);
      
      setSearchResults(sortedResults.slice(0, 20)); // 최대 20개 결과
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
          y: '35.63',
          source: 'kakao',
          searchType: 'keyword'
        },
        {
          id: '2', 
          place_name: '정읍시청',
          address_name: '전라북도 정읍시 시기2길 25',
          x: '126.85',
          y: '35.57',
          source: 'kakao',
          searchType: 'keyword'
        }
      ]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 카카오 키워드 검색
  const searchKakaoKeyword = async (query) => {
    try {
      const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || 'afc269fb7c40333dfbdf3b171aeb6c1d';
      
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return (data.documents || []).map(item => ({
          ...item,
          source: 'kakao',
          searchType: 'keyword'
        }));
      }
    } catch (error) {
      console.error('카카오 키워드 검색 오류:', error);
    }
    return [];
  };

  // 카카오 주소 검색
  const searchKakaoAddress = async (query) => {
    try {
      const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || 'afc269fb7c40333dfbdf3b171aeb6c1d';
      
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=10`,
        {
          headers: {
            'Authorization': `KakaoAK ${KAKAO_API_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return (data.documents || []).map(item => ({
          id: `addr_${item.id}`,
          place_name: item.address_name,
          address_name: item.address_name,
          x: item.x,
          y: item.y,
          source: 'kakao',
          searchType: 'address'
        }));
      }
    } catch (error) {
      console.error('카카오 주소 검색 오류:', error);
    }
    return [];
  };

  // 카카오 카테고리 검색 (업종별 검색)
  const searchKakaoCategory = async (query) => {
    try {
      const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY || 'afc269fb7c40333dfbdf3b171aeb6c1d';
      
      // 일반적인 업종 카테고리들
      const categories = [
        'FD6', // 음식점
        'CE7', // 카페
        'CS2', // 편의점
        'PS3', // 유치원
        'SC4', // 학교
        'HP8', // 병원
        'PM9', // 약국
        'OL7', // 주유소
        'SW8', // 지하철역
        'PK6'  // 주차장
      ];

      const categoryResults = [];
      
      for (const category of categories) {
        try {
          const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${category}&query=${encodeURIComponent(query)}&size=3`,
            {
              headers: {
                'Authorization': `KakaoAK ${KAKAO_API_KEY}`
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            const results = (data.documents || []).map(item => ({
              ...item,
              source: 'kakao',
              searchType: 'category',
              category: category
            }));
            categoryResults.push(...results);
          }
        } catch (error) {
          console.error(`카테고리 ${category} 검색 오류:`, error);
        }
      }

      return categoryResults;
    } catch (error) {
      console.error('카카오 카테고리 검색 오류:', error);
    }
    return [];
  };

  // 네이버 주소 검색 (보조)
  const searchNaverAddress = async (query) => {
    try {
      const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID || 'kqcolemxuh';
      const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET || 'your_secret_key';
      
      const response = await fetch(
        `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5`,
        {
          headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return (data.items || []).map((item, index) => ({
          id: `naver_${index}`,
          place_name: item.title.replace(/<[^>]*>/g, ''),
          address_name: item.address.replace(/<[^>]*>/g, ''),
          x: item.mapx,
          y: item.mapy,
          source: 'naver',
          searchType: 'local'
        }));
      }
    } catch (error) {
      console.error('네이버 주소 검색 오류:', error);
    }
    return [];
  };

  // 중복 제거
  const removeDuplicates = (results) => {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.place_name}_${result.address_name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // 검색 결과 정렬 (정확도 순)
  const sortResults = (results, query) => {
    return results.sort((a, b) => {
      // 정확한 일치 우선
      const aExactMatch = a.place_name.toLowerCase().includes(query.toLowerCase()) || 
                         a.address_name.toLowerCase().includes(query.toLowerCase());
      const bExactMatch = b.place_name.toLowerCase().includes(query.toLowerCase()) || 
                         b.address_name.toLowerCase().includes(query.toLowerCase());
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // 카카오 결과 우선
      if (a.source === 'kakao' && b.source !== 'kakao') return -1;
      if (a.source !== 'kakao' && b.source === 'kakao') return 1;
      
      return 0;
    });
  };

  // 검색어 입력 처리
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // 디바운싱 (300ms 후 검색 - 더 빠른 응답)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchAddress(query);
    }, 300);
  };

  // 검색 결과 외부 클릭 시 닫기
  const handleClickOutside = (e) => {
    if (!e.target.closest('.address-search-container')) {
      setShowResults(false);
    }
  };

  // 컴포넌트 마운트 시 외부 클릭 이벤트 리스너 추가
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
    <div className="relative address-search-container">
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {result.place_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {result.address_name}
                  </div>
                </div>
                <div className="ml-2 flex items-center">
                  {/* 검색 타입 표시 */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.searchType === 'keyword' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : result.searchType === 'address'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : result.searchType === 'category'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {result.searchType === 'keyword' ? '장소' : 
                     result.searchType === 'address' ? '주소' : 
                     result.searchType === 'category' ? '업종' : '네이버'}
                  </span>
                </div>
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
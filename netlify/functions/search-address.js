// Netlify Functions - 주소검색 프록시 서버
exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { provider, query } = event.queryStringParameters || {};

    if (!provider || !query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'provider(naver|kakao)와 query 파라미터가 필요합니다.' 
        })
      };
    }

    let apiUrl = '';
    let apiHeaders = {};

    // API 제공업체별 설정
    if (provider === 'naver') {
      // 네이버 지역검색 API
      apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&sort=random`;
      apiHeaders = {
        'X-Naver-Client-Id': process.env.VITE_NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.VITE_NAVER_CLIENT_SECRET
      };
    } else if (provider === 'kakao') {
      // 카카오 주소검색 API (키워드로 장소 검색)
      apiUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`;
      apiHeaders = {
        'Authorization': `KakaoAK ${process.env.VITE_KAKAO_REST_API_KEY}`
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'provider는 naver 또는 kakao여야 합니다.' 
        })
      };
    }

    // API 호출
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: apiHeaders
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 응답 데이터 정규화
    let normalizedData = [];

    if (provider === 'naver') {
      // 네이버 응답을 표준 형식으로 변환
      normalizedData = data.items?.map(item => ({
        title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
        address: item.address,
        roadAddress: item.roadAddress,
        x: parseFloat(item.mapx) / 10000000, // 네이버 좌표를 경도로 변환
        y: parseFloat(item.mapy) / 10000000  // 네이버 좌표를 위도로 변환
      })) || [];
    } else if (provider === 'kakao') {
      // 카카오 응답을 표준 형식으로 변환
      normalizedData = data.documents?.map(item => ({
        title: item.place_name,
        address: item.address_name,
        roadAddress: item.road_address_name,
        x: parseFloat(item.x), // 카카오는 이미 경도
        y: parseFloat(item.y)  // 카카오는 이미 위도
      })) || [];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        provider,
        query,
        results: normalizedData
      })
    };

  } catch (error) {
    console.error('주소검색 프록시 오류:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '주소검색 중 오류가 발생했습니다.',
        details: error.message
      })
    };
  }
}; 
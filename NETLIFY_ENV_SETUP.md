# Netlify 환경변수 설정 가이드

## 주소검색 기능을 위한 환경변수 설정

웹 배포 환경에서 주소검색 기능이 정상 작동하려면 다음 환경변수들을 Netlify에 설정해야 합니다.

### 1. Netlify 대시보드 접속
- https://app.netlify.com 접속
- 프로젝트 선택

### 2. 환경변수 설정
**Site Settings > Environment Variables**에서 다음 변수들을 추가:

#### 필수 환경변수:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key
VITE_KAKAO_REST_API_KEY=your_kakao_rest_api_key
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 3. API 키 발급 방법

#### 카카오 API 키:
1. https://developers.kakao.com 접속
2. 내 애플리케이션 > 새 애플리케이션 생성
3. **플랫폼 설정**에서 웹 도메인 추가: `https://your-app.netlify.app`
4. **REST API 키**와 **JavaScript 키** 복사

#### 네이버 API 키:
1. https://developers.naver.com 접속
2. Application 등록
3. **서비스 URL**: `https://your-app.netlify.app`
4. **Client ID**와 **Client Secret** 복사

### 4. 설정 완료 후
환경변수 설정 후 **Deploy** 버튼을 눌러 재배포하면 주소검색 기능이 정상 작동합니다.

### 5. 테스트 방법
- 네이버맵/카카오맵에서 주소검색 시도
- 브라우저 콘솔에서 CORS 오류가 사라졌는지 확인
- 검색 결과가 정상적으로 나타나는지 확인

## 문제 해결

### CORS 오류가 계속 발생하는 경우:
1. 환경변수가 올바르게 설정되었는지 확인
2. API 키의 도메인 설정 확인
3. Netlify Functions가 정상 배포되었는지 확인

### 주소검색 결과가 없는 경우:
1. API 키 유효성 확인
2. API 사용량 제한 확인
3. 브라우저 콘솔에서 오류 메시지 확인 
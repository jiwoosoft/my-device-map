# 🗺️ Equipment Mapper (장비 매퍼)

**위치 기반 장비 관리 웹 애플리케이션**

지도 위에서 장비의 위치를 등록하고 관리할 수 있는 Progressive Web App (PWA)입니다. 직관적인 인터페이스와 강력한 기능으로 장비 관리 업무를 효율적으로 수행할 수 있습니다.

**개발자: CHOI HYUN MIN** 👨‍💻

## ✨ 주요 기능

### 🎯 핵심 기능
- **지도 기반 장비 등록**: 지도를 클릭하여 장비 위치를 직관적으로 등록
- **마커 위치 변경**: 드래그 앤 드롭으로 등록된 장비의 위치를 쉽게 수정
- **장비 정보 관리**: 장비명, 설치일, 비고 등 상세 정보 관리
- **실시간 지도 조작**: 수정 모드에서도 지도를 자유롭게 조작 가능

### 🧭 네비게이션 연동
- **네이버 지도**: 네이버 지도 앱으로 길찾기
- **카카오맵**: 카카오맵 앱으로 길찾기  
- **TMAP**: TMAP 앱으로 길찾기

### ☁️ 클라우드 동기화
- **Supabase 연동**: 클라우드 데이터베이스와 실시간 동기화
- **업로드/다운로드**: 로컬 데이터와 클라우드 데이터 양방향 동기화
- **전체 동기화**: 한 번의 클릭으로 완전한 데이터 동기화
- **동기화 이력**: 마지막 동기화 시간 추적

### 🎨 사용자 경험
- **다크모드 지원**: 기본 다크모드로 눈의 피로도 감소
- **완전 반응형 디자인**: 모든 모바일 브라우저에서 일관된 UI
- **사이드바 토글**: 모바일에서 사이드바 숨김/표시 기능
- **로컬 스토리지**: 브라우저에 데이터 자동 저장
- **PWA 지원**: 모바일 홈 화면에 앱 설치 가능

## 🛠️ 기술 스택

### Frontend
- **React 18**: 사용자 인터페이스 구축
- **Vite**: 빠른 개발 환경 및 빌드 도구
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **React-Leaflet**: React용 지도 라이브러리
- **Leaflet.js**: 오픈소스 지도 라이브러리

### Backend & Cloud
- **Supabase**: 클라우드 데이터베이스 및 인증
- **PostgreSQL**: 관계형 데이터베이스
- **Row Level Security**: 데이터 보안

### 개발 도구
- **React-Toastify**: 사용자 알림 시스템
- **Custom Hooks**: 로컬 스토리지 및 클라우드 동기화 관리
- **Progressive Web App**: 모바일 앱과 같은 경험
- **Git**: 버전 관리 및 협업

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 16.0 이상
- npm 또는 yarn

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/jiwoosoft/my-device-map.git
cd my-device-map
```

2. **환경변수 설정**
```bash
# .env.example 파일을 .env로 복사
cp .env.example .env

# .env 파일을 열어서 실제 API 키들을 입력
# - VITE_SUPABASE_URL: Supabase 프로젝트 URL
# - VITE_SUPABASE_ANON_KEY: Supabase 익명 키
# - VITE_KAKAO_MAP_API_KEY: 카카오맵 API 키
# - VITE_KAKAO_REST_API_KEY: 카카오 REST API 키
# - VITE_NAVER_CLIENT_ID: 네이버 클라이언트 ID
# - VITE_NAVER_CLIENT_SECRET: 네이버 클라이언트 시크릿
```

3. **의존성 설치**
```bash
npm install
```

4. **개발 서버 실행**
```bash
npm run dev
```

4. **브라우저에서 확인**
```
http://localhost:5173
```

### 🔑 API 키 발급 방법

#### Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Settings > API에서 URL과 anon key 복사
3. `.env` 파일에 입력

#### Kakao API 설정
1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션 생성
2. **JavaScript 키**를 `VITE_KAKAO_MAP_API_KEY`에 입력
3. **REST API 키**를 `VITE_KAKAO_REST_API_KEY`에 입력
4. 플랫폼 > Web에서 도메인 등록 (localhost:5173, 배포 URL)

#### Naver API 설정
1. [Naver Cloud Platform](https://www.ncloud.com)에서 애플리케이션 생성
2. **Client ID**를 `VITE_NAVER_CLIENT_ID`에 입력
3. **Client Secret**를 `VITE_NAVER_CLIENT_SECRET`에 입력
4. 서비스 환경 > Web에서 도메인 등록

### ⚠️ 보안 주의사항
- **절대 `.env` 파일을 GitHub에 커밋하지 마세요**
- API 키는 개인적으로 관리하고 공유하지 마세요
- 프로덕션 환경에서는 환경변수를 안전하게 관리하세요

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📱 사용법

### 장비 등록
1. 지도에서 원하는 위치를 클릭
2. 장비명과 설치일을 입력
3. 필요시 비고 사항 추가
4. '저장' 버튼 클릭

### 장비 수정
1. 사이드바에서 수정할 장비의 연필 아이콘 클릭
2. 텍스트 정보 수정
3. **마커를 드래그하여 위치 변경** (새로운 기능!)
4. '저장' 버튼 클릭

### 장비 삭제
1. 사이드바에서 삭제할 장비의 휴지통 아이콘 클릭
2. 확인 메시지에서 '확인' 클릭

### 클라우드 동기화
1. **업로드**: 로컬 데이터를 클라우드에 저장
2. **다운로드**: 클라우드에서 데이터를 로컬로 가져오기
3. **전체 동기화**: 로컬과 클라우드 데이터를 완전히 동기화
4. **동기화 상태**: 마지막 동기화 시간 확인

### 길찾기
1. 지도에서 장비 마커 클릭
2. 팝업에서 원하는 지도 앱 선택 (네이버/카카오/TMAP)

## 🎨 주요 UI 특징

### 다크모드
- 기본 다크모드로 설정되어 눈의 피로도 감소
- 테마 토글 버튼으로 라이트/다크모드 전환 가능

### 완전 반응형 디자인
- **데스크톱**: 사이드바와 지도가 나란히 배치
- **태블릿**: 최적화된 레이아웃과 터치 인터페이스
- **모바일**: 사이드바 토글 버튼으로 공간 효율성 증대
- **모든 브라우저**: Chrome, Safari, Firefox, Edge에서 일관된 UI

### 직관적인 인터페이스
- 지도 확대/축소 버튼을 오른쪽 상단에 배치하여 접근성 향상
- 수정 모드에서 지도 조작 가능하여 사용성 개선
- 개발자 정보 카드로 프로젝트 정보 표시

## 📊 데이터 관리

### 로컬 스토리지
- 모든 장비 데이터는 브라우저 로컬 스토리지에 자동 저장
- 페이지 새로고침 후에도 데이터 유지
- 오프라인 모드 지원

### 클라우드 동기화
- **Supabase PostgreSQL**: 안전한 클라우드 데이터베이스
- **실시간 동기화**: 로컬과 클라우드 데이터 자동 동기화
- **데이터 백업**: 클라우드에 자동 백업으로 데이터 보호
- **멀티 디바이스**: PC와 모바일 간 데이터 공유

### 데이터 구조
```javascript
{
  id: "고유 식별자",
  name: "장비명",
  installed_at: "설치일",
  note: "비고",
  latitude: "위도",
  longitude: "경도"
}
```

## 🔧 개발 정보

### 프로젝트 구조
```
src/
├── components/          # React 컴포넌트
│   ├── DeviceList.jsx  # 장비 목록 컴포넌트
│   └── DeviceFormModal.jsx # 장비 등록/수정 모달
├── hooks/              # 커스텀 훅
│   └── useLocalStorage.js # 로컬 스토리지 관리
├── data/               # 데이터 파일
│   └── dummyData.json  # 샘플 데이터
├── App.jsx             # 메인 애플리케이션 컴포넌트
└── main.jsx            # 애플리케이션 진입점
```

### 주요 컴포넌트

#### App.jsx
- 전체 애플리케이션 상태 관리
- 지도 및 마커 렌더링
- 장비 CRUD 작업 처리
- 테마 및 사이드바 상태 관리

#### DeviceList.jsx
- 장비 목록 표시
- 장비 선택, 수정, 삭제 기능
- 반응형 카드 레이아웃

#### DeviceFormModal.jsx
- 장비 등록/수정 폼
- 다크모드 지원
- 위치 변경 안내 메시지

## 🌐 배포

### Netlify 배포
- GitHub 연동으로 자동 배포
- HTTPS 지원
- 글로벌 CDN으로 빠른 로딩

### 배포 URL
```
https://jiwoo-map.netlify.app
```

## 🔮 향후 계획

### 완성된 기능 ✅
- [x] 주소 검색 기능 (카카오/네이버 API 연동)
- [x] 데이터 백업/복원 기능
- [x] 장비 검색 및 필터링
- [x] Supabase 클라우드 동기화
- [x] 사용자 인증 시스템
- [x] 완전 반응형 디자인
- [x] PWA 지원
- [x] 모바일 최적화

### 향후 개선 사항
- [ ] 성능 최적화
- [ ] 접근성 개선
- [ ] 다국어 지원
- [ ] 오프라인 모드 강화
- [ ] 실시간 협업 기능

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 연락해주세요.

## 📱 PWA 설치 방법

### 모바일에서 앱 설치
1. **Chrome/Safari**에서 https://jiwoo-map.netlify.app 접속
2. **주소창 옆 설치 아이콘** 클릭
3. **홈 화면에 추가** 선택
4. **설치 완료** 후 홈 화면에서 앱 실행

### 데스크톱에서 앱 설치
1. **Chrome/Edge**에서 https://jiwoo-map.netlify.app 접속
2. **주소창 옆 설치 아이콘** 클릭
3. **설치** 버튼 클릭
4. **바탕화면에서 앱 실행**

---

**Equipment Mapper** - 효율적인 장비 관리의 새로운 시작 🚀

**개발자: CHOI HYUN MIN** | **최종 업데이트: 2025년 1월 19일** 
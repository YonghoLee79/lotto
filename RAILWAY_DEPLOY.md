# Railway 배포 가이드 (OpenCV 오류 해결)

## 🚀 빠른 배포 (권장)

### 1단계: Railway 계정 설정
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login
```

### 2단계: 프로젝트 배포
```bash
# 프로젝트 폴더에서
cd /path/to/lotto/lotto

# Railway 프로젝트 초기화
railway init

# 환경 변수 설정
railway variables set FLASK_ENV=production
railway variables set PYTHONPATH=/app
railway variables set PYTHONUNBUFFERED=1

# 배포
railway up
```

## 🔧 해결된 문제들

### OpenCV 의존성 오류 해결
- ✅ `opencv-python-headless` 대신 `Pillow` 사용
- ✅ 조건부 import로 이미지 라이브러리 부재 시 대체 로직
- ✅ 최소 의존성으로 빌드 시간 단축

### 메모리 최적화
- ✅ 단일 워커 프로세스로 메모리 절약
- ✅ Simple API로 무거운 과학 라이브러리 의존성 제거
- ✅ 효율적인 가비지 컬렉션

## 📦 배포된 기능

### 웹 앱 기능
- 모바일 반응형 UI
- 단일/배치 번호 생성
- AI 예측 분석
- 실시간 통계

### API 엔드포인트
- `GET /` - 메인 페이지
- `GET /api/generate-single` - 단일 번호 생성
- `GET /api/generate-batch?count=N` - 배치 생성
- `GET /api/predictions` - AI 예측
- `GET /api/analysis` - 분석 결과
- `GET /health` - 헬스 체크

## 🔍 Railway 배포 후 확인사항

### 배포 확인
```bash
# 로그 확인
railway logs

# 상태 확인
railway status

# 도메인 확인
railway domain
```

### 성능 모니터링
- Railway 대시보드에서 확인:
  - ✅ CPU 사용량 (< 50%)
  - ✅ 메모리 사용량 (< 100MB)
  - ✅ 응답 시간 (< 2초)
  - ✅ 오류율 (< 1%)

## 🛠️ 문제 해결

### 빌드 실패 시
1. `requirements.txt` 확인
2. Python 버전 호환성 체크
3. Railway 빌드 로그 확인

### 실행 실패 시
1. `Procfile` 설정 확인
2. 환경 변수 설정 확인
3. 포트 바인딩 확인

### 성능 이슈 시
1. 워커 수 조정 (기본: 1개)
2. 메모리 제한 증가
3. 타임아웃 설정 조정

## 📱 모바일 접근

Railway 배포 후 제공되는 URL로 모바일에서 바로 접근 가능:
- PWA 설치 지원
- 오프라인 캐싱
- 터치 최적화 UI

## 💡 프로덕션 최적화 팁

### 성능 향상
- CDN 사용 (정적 파일)
- 데이터베이스 연결 풀링
- 캐싱 레이어 추가

### 보안 강화
- HTTPS 강제
- API 속도 제한
- 입력 검증 강화

### 모니터링
- 로그 분석
- 에러 추적
- 사용자 분석

## 🎯 배포 완료!

Railway 배포가 완료되면:
1. 제공된 URL 확인
2. 모바일에서 테스트
3. PWA 설치 테스트
4. 성능 모니터링 설정

문제 발생 시 Railway 로그와 이 가이드를 참조하세요.

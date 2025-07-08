# LOTTO SCIENTIFIC - 모듈식 구조 가이드

이 문서는 LOTTO SCIENTIFIC 웹 애플리케이션의 모듈식 구조에 대한 설명입니다.

## 프로젝트 구조

```
/lotto
├── app.py                          # Flask 서버 및 API 엔드포인트
├── jackson_hwang_rng.py            # 난수 생성 알고리즘
├── entropy_analyzer.py             # 엔트로피 드리프트 분석기
├── statistical_thermodynamics.py   # 통계 열역학 시뮬레이터
├── image_quantum_analyzer.py       # 이미지 기반 양자 분석기
├── subscription_ui.py              # 구독 UI 관리자
├── config.py                       # 구성 파일
├── test_scientific.py              # 과학적 모듈 테스트
├── static/
│   ├── modular_dashboard.html      # 모듈식 대시보드 메인 페이지
│   ├── mobile_dashboard.html       # 모바일 대시보드 (단일 파일 버전)
│   ├── mobile_styles.css           # 모바일 스타일 (분리된 CSS)
│   ├── mobile_lotto.js             # 모바일 로직 (단일 파일 버전)
│   ├── professional_dashboard.html # 프로페셔널 대시보드
│   ├── professional_lotto.js       # 프로페셔널 로직
│   ├── science_visualizations.js   # 과학적 시각화 모듈
│   ├── components/                 # HTML 컴포넌트 디렉토리
│   │   ├── header.html             # 헤더 컴포넌트
│   │   ├── premium-banner.html     # 프리미엄 배너 컴포넌트
│   │   ├── jackpot-banner.html     # 잭팟 배너 컴포넌트
│   │   ├── recent-winners.html     # 최근 당첨자 컴포넌트
│   │   ├── scientific-tech.html    # 과학적 기술 컴포넌트
│   │   ├── simulation.html         # 시뮬레이션 컴포넌트
│   │   ├── statistics.html         # 통계 컴포넌트
│   │   └── footer.html             # 푸터 컴포넌트
│   ├── js/                         # JavaScript 모듈 디렉토리
│   │   ├── main.js                 # 메인 애플리케이션 모듈
│   │   ├── ui-components.js        # UI 컴포넌트 관리자
│   │   ├── simulation-manager.js   # 시뮬레이션 관리자
│   │   ├── api-manager.js          # API 통합 모듈
│   │   ├── subscription-manager.js # 구독 관리 모듈
│   │   └── debug-utilities.js      # 디버깅 유틸리티
```

## 모듈식 구조 설명

이 프로젝트는 다음과 같은 모듈식 구조를 가지고 있습니다:

1. **HTML 컴포넌트**: `static/components/` 디렉토리에 있는 HTML 파일들은 각각 UI의 독립적인 섹션을 나타냅니다. 이들은 메인 대시보드 페이지에서 동적으로 로드됩니다.

2. **JavaScript 모듈**: `static/js/` 디렉토리에 있는 JS 파일들은 각각 특정 기능을 담당하는 클래스 기반 모듈입니다:
   - `main.js`: 앱 초기화 및 모듈 간 통합
   - `ui-components.js`: UI 요소 관리 및 이벤트 처리
   - `simulation-manager.js`: 3D 시뮬레이션 및 분자 운동 시각화
   - `api-manager.js`: 서버 API 통신
   - `subscription-manager.js`: 구독 상태 관리
   - `debug-utilities.js`: 디버깅 및 테스트 도구

3. **CSS**: 스타일은 `mobile_styles.css`에 분리되어 있습니다.

4. **과학적 시각화**: `science_visualizations.js`는 다양한 과학적 기술의 시각화를 담당합니다.

## 모듈 간 통신

모듈 간 통신은 다음 방식으로 이루어집니다:

1. **중앙 앱 객체**: `window.app` 전역 객체는 모든 모듈의 인스턴스를 가지고 있어 상호 참조가 가능합니다.

2. **이벤트 시스템**: 모듈 간 직접적인 의존성을 줄이기 위해 사용자 정의 이벤트를 사용합니다.

3. **로컬 스토리지**: 구독 상태와 같은 일부 정보는 로컬 스토리지를 통해 공유됩니다.

## 사용 방법

1. 메인 진입점은 `modular_dashboard.html`입니다. 이 파일은 모든 컴포넌트를 로드하고 앱을 초기화합니다.

2. 개발 중에는 URL에 `?debug=true` 매개변수를 추가하여 디버그 모드를 활성화할 수 있습니다.

3. 새로운 컴포넌트를 추가하려면:
   - `static/components/`에 HTML 파일 생성
   - `modular_dashboard.html`에 컴포넌트 로드 코드 추가
   - 필요한 경우 관련 JavaScript 모듈 업데이트

## 추가 설명

- **이미지 기반 양자 분석**: 사용자가 로또볼 이미지를 업로드하면, 이미지의 양자 노이즈가 번호 생성 시드로 사용됩니다.

- **구독료 회수 보장**: 연간 프리미엄 구독자는 당첨 시 구독료의 120% 보너스를 받습니다.

- **Three.js 시뮬레이션**: 3D 분자 운동 시뮬레이션은 모바일 환경에 최적화되어 있습니다.

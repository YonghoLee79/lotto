/**
 * Main Application
 * 메인 애플리케이션 모듈
 */

class LottoScientificApp {
    constructor() {
        this.modules = {
            ui: null,
            simulation: null,
            api: null,
            subscription: null,
            scienceViz: null,
            debug: null
        };
        
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        console.log('LOTTO SCIENTIFIC 애플리케이션 초기화 중...');
        
        // 브라우저 호환성 체크
        this.checkBrowserCompatibility();
        
        // 디버그 유틸리티 초기화 (다른 모듈보다 먼저)
        this.modules.debug = new window.DebugUtilities();
        this.modules.debug.init();
        window.debugUtils = this.modules.debug;
        
        // 각 모듈 초기화
        this.modules.ui = new window.UIComponentManager();
        this.modules.simulation = new window.SimulationManager();
        this.modules.api = new window.APIManager();
        this.modules.subscription = new window.SubscriptionManager();
        
        // 전역 참조 설정 (다른 모듈에서 접근 가능하도록)
        window.uiComponentManager = this.modules.ui;
        window.simulationManager = this.modules.simulation;
        window.apiManager = this.modules.api;
        window.subscriptionManager = this.modules.subscription;
        
        // 과학적 시각화 모듈 초기화
        if (window.ScienceVisualizations) {
            this.modules.scienceViz = new window.ScienceVisualizations();
            window.scienceVisualizations = this.modules.scienceViz;
            this.modules.scienceViz.init();
        } else {
            console.warn('과학적 시각화 모듈을 찾을 수 없습니다.');
        }
        
        // 모듈 초기화
        this.modules.ui.init();
        this.modules.simulation.init();
        this.modules.subscription.init();
        
        // 전역 이벤트 리스너 등록
        this.registerGlobalEventListeners();
        
        this.initialized = true;
        console.log('LOTTO SCIENTIFIC 애플리케이션 초기화 완료');
        
        // 디버그 모드일 경우 추가 정보 출력
        if (this.modules.debug.isDebugMode) {
            this.modules.debug.getDeviceInfo();
            this.modules.debug.toggleWebGLInfo();
            this.modules.debug.log('모든 모듈 초기화 완료');
        }
    }
    
    checkBrowserCompatibility() {
        const unsupportedBrowser = 
            !window.fetch ||
            !window.localStorage ||
            !window.requestAnimationFrame ||
            !window.File ||
            !window.FileReader ||
            !window.Blob;
        
        if (unsupportedBrowser) {
            alert('죄송합니다. 최신 웹 브라우저에서만 이 애플리케이션을 사용할 수 있습니다. Chrome, Firefox, Safari 또는 Edge의 최신 버전을 사용해주세요.');
            console.error('지원되지 않는 브라우저 감지됨');
        }
    }
    
    registerGlobalEventListeners() {
        // 창 크기 조절 이벤트
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 오프라인/온라인 상태 변경 이벤트
        window.addEventListener('online', () => {
            console.log('온라인 상태로 전환되었습니다.');
        });
        
        window.addEventListener('offline', () => {
            console.log('오프라인 상태로 전환되었습니다.');
            alert('인터넷 연결이 끊겼습니다. 일부 기능이 제한될 수 있습니다.');
        });
        
        // 앱 종료 시 이벤트
        window.addEventListener('beforeunload', (e) => {
            // 진행 중인 작업이 있는 경우 확인 메시지 표시
            if (this.modules.simulation.simState.running) {
                e.preventDefault();
                e.returnValue = '시뮬레이션이 진행 중입니다. 정말 페이지를 나가시겠습니까?';
                return e.returnValue;
            }
        });
    }
    
    handleResize() {
        // 창 크기 변경 시 필요한 조정
        if (this.modules.simulation) {
            this.modules.simulation.updateCanvasSize();
        }
        
        // 디버그 모드일 경우 크기 정보 출력
        if (this.modules.debug && this.modules.debug.isDebugMode) {
            this.modules.debug.log(`화면 크기 변경: ${window.innerWidth}x${window.innerHeight}`);
        }
    }
}

// 전역 애플리케이션 인스턴스 생성 및 초기화
window.addEventListener('DOMContentLoaded', () => {
    window.app = new LottoScientificApp();
    window.app.init();
});

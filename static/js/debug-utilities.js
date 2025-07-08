/**
 * Debug Utilities
 * 디버깅 유틸리티 모듈
 */

class DebugUtilities {
    constructor() {
        this.isDebugMode = false;
        this.debugMessages = [];
        this.maxMessages = 100;
    }
    
    init() {
        // URL 파라미터에서 디버그 모드 확인
        const urlParams = new URLSearchParams(window.location.search);
        this.isDebugMode = urlParams.has('debug') || urlParams.has('test');
        
        if (this.isDebugMode) {
            this.createDebugUI();
            this.log('디버그 모드 활성화됨');
        }
    }
    
    createDebugUI() {
        // 이미 존재하는 디버그 UI 확인
        if (document.getElementById('debugButton')) {
            return;
        }
        
        // 디버그 버튼 생성
        const debugButton = document.createElement('button');
        debugButton.id = 'debugButton';
        debugButton.className = 'debug-button';
        debugButton.textContent = '🐞';
        debugButton.title = '디버그 패널 열기';
        
        // 디버그 패널 생성
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.className = 'debug-panel';
        
        // 디버그 패널 헤더
        const debugHeader = document.createElement('div');
        debugHeader.className = 'debug-header';
        
        const debugTitle = document.createElement('h3');
        debugTitle.textContent = '디버그 패널';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-btn';
        closeButton.textContent = '×';
        
        debugHeader.appendChild(debugTitle);
        debugHeader.appendChild(closeButton);
        
        // 디버그 도구 영역
        const debugTools = document.createElement('div');
        debugTools.className = 'debug-tools';
        
        const testButtons = document.createElement('div');
        testButtons.className = 'test-buttons';
        
        const loadDemoBtn = document.createElement('button');
        loadDemoBtn.textContent = '데모 이미지 로드';
        loadDemoBtn.className = 'debug-btn';
        
        const simulateAnalysisBtn = document.createElement('button');
        simulateAnalysisBtn.textContent = '이미지 분석 시뮬레이션';
        simulateAnalysisBtn.className = 'debug-btn';
        
        const simulateGenerationBtn = document.createElement('button');
        simulateGenerationBtn.textContent = '번호 생성 시뮬레이션';
        simulateGenerationBtn.className = 'debug-btn';
        
        const resetSimulationBtn = document.createElement('button');
        resetSimulationBtn.textContent = '시뮬레이션 리셋';
        resetSimulationBtn.className = 'debug-btn';
        
        testButtons.appendChild(loadDemoBtn);
        testButtons.appendChild(simulateAnalysisBtn);
        testButtons.appendChild(simulateGenerationBtn);
        testButtons.appendChild(resetSimulationBtn);
        
        // 디버그 로그 영역
        const debugLog = document.createElement('div');
        debugLog.id = 'debugLog';
        debugLog.className = 'debug-log';
        
        // 패널 조립
        debugTools.appendChild(testButtons);
        debugPanel.appendChild(debugHeader);
        debugPanel.appendChild(debugTools);
        debugPanel.appendChild(debugLog);
        
        // DOM에 추가
        document.body.appendChild(debugButton);
        document.body.appendChild(debugPanel);
        
        // 이벤트 리스너 추가
        debugButton.addEventListener('click', () => {
            debugPanel.classList.toggle('active');
        });
        
        closeButton.addEventListener('click', () => {
            debugPanel.classList.remove('active');
        });
        
        // 테스트 버튼 이벤트
        loadDemoBtn.addEventListener('click', () => {
            this.log('데모 이미지 로드 요청');
            if (window.simulationManager) {
                window.simulationManager.loadDemoImage();
            }
        });
        
        simulateAnalysisBtn.addEventListener('click', () => {
            this.log('이미지 분석 시뮬레이션 요청');
            if (window.simulationManager) {
                window.simulationManager.startImageAnalysisAnimation();
            }
        });
        
        simulateGenerationBtn.addEventListener('click', () => {
            this.log('번호 생성 시뮬레이션 요청');
            if (window.simulationManager) {
                window.simulationManager.generateNumbers();
            }
        });
        
        resetSimulationBtn.addEventListener('click', () => {
            this.log('시뮬레이션 리셋 요청');
            if (window.simulationManager) {
                window.simulationManager.resetSimulation();
            }
        });
        
        // CSS 추가
        this.addDebugStyles();
    }
    
    addDebugStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .debug-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #2962ff;
                color: white;
                font-size: 24px;
                border: none;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                z-index: 9999;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .debug-panel {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: #1a1f2e;
                border: 1px solid #2a2f42;
                border-radius: 10px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                z-index: 9998;
                display: flex;
                flex-direction: column;
                transform: translateY(20px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .debug-panel.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                border-bottom: 1px solid #2a2f42;
            }
            
            .debug-header h3 {
                margin: 0;
                color: #ffffff;
                font-size: 16px;
            }
            
            .debug-tools {
                padding: 15px;
                border-bottom: 1px solid #2a2f42;
            }
            
            .test-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .debug-btn {
                background: #262b3f;
                color: #b2b5be;
                border: 1px solid #2a2f42;
                border-radius: 5px;
                padding: 8px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .debug-btn:hover {
                background: #2962ff;
                color: white;
            }
            
            .debug-log {
                flex: 1;
                overflow-y: auto;
                padding: 10px 15px;
                font-family: 'SF Mono', monospace;
                font-size: 12px;
                color: #b2b5be;
            }
            
            .log-entry {
                margin-bottom: 5px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(42, 47, 66, 0.5);
            }
            
            .log-time {
                color: #5d606b;
                margin-right: 5px;
            }
            
            .log-info {
                color: #2196f3;
            }
            
            .log-warn {
                color: #ff9800;
            }
            
            .log-error {
                color: #ef5350;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    log(message, type = 'info') {
        if (!this.isDebugMode) return;
        
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        
        // 콘솔에 로그 출력
        if (type === 'error') {
            console.error(`[DEBUG] ${timeString} - ${message}`);
        } else if (type === 'warn') {
            console.warn(`[DEBUG] ${timeString} - ${message}`);
        } else {
            console.log(`[DEBUG] ${timeString} - ${message}`);
        }
        
        // 로그 메시지 저장
        this.debugMessages.push({
            time: timeString,
            message,
            type
        });
        
        // 최대 메시지 수 제한
        if (this.debugMessages.length > this.maxMessages) {
            this.debugMessages.shift();
        }
        
        // UI 업데이트
        this.updateLogUI();
    }
    
    warn(message) {
        this.log(message, 'warn');
    }
    
    error(message) {
        this.log(message, 'error');
    }
    
    updateLogUI() {
        const debugLog = document.getElementById('debugLog');
        if (!debugLog) return;
        
        debugLog.innerHTML = '';
        
        // 최신 메시지부터 표시
        this.debugMessages.slice().reverse().forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry log-${entry.type}`;
            
            const logTime = document.createElement('span');
            logTime.className = 'log-time';
            logTime.textContent = entry.time;
            
            const logMessage = document.createElement('span');
            logMessage.className = 'log-message';
            logMessage.textContent = entry.message;
            
            logEntry.appendChild(logTime);
            logEntry.appendChild(logMessage);
            
            debugLog.appendChild(logEntry);
        });
    }
    
    getDeviceInfo() {
        const info = {
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            platform: navigator.platform,
            vendor: navigator.vendor,
            language: navigator.language
        };
        
        this.log('디바이스 정보:');
        Object.entries(info).forEach(([key, value]) => {
            this.log(`  ${key}: ${value}`);
        });
        
        return info;
    }
    
    toggleWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                this.warn('WebGL을 지원하지 않는 환경입니다.');
                return;
            }
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                
                this.log('WebGL 정보:');
                this.log(`  Vendor: ${vendor}`);
                this.log(`  Renderer: ${renderer}`);
                this.log(`  Version: ${gl.getParameter(gl.VERSION)}`);
                this.log(`  Shading Language: ${gl.getParameter(gl.SHADING_LANGUAGE_VERSION)}`);
                this.log(`  Max Texture Size: ${gl.getParameter(gl.MAX_TEXTURE_SIZE)}`);
            } else {
                this.warn('WebGL 디버그 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            this.error(`WebGL 정보 가져오기 오류: ${error.message}`);
        }
    }
}

// 전역으로 내보내기
window.DebugUtilities = DebugUtilities;

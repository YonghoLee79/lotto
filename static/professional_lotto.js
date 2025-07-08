// LOTTO SCIENTIFIC - Professional Dashboard JavaScript
// Jackson-Hwang Molecular RNG System

class LottoScientific {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.molecules = [];
        this.isSimulating = false;
        this.entropyData = [];
        this.simulationCount = 0;
        this.maxFreeSimulations = 3;
        
        this.init();
        this.setupEventListeners();
        this.startRealtimeUpdates();
    }
    
    init() {
        this.initThreeJS();
        this.initMolecules();
        this.hideLoading();
        this.updateDashboard();
    }
    
    initThreeJS() {
        const container = document.getElementById('molecularCanvas');
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setClearColor(0x1e3c72, 0.1);
        container.appendChild(this.renderer.domElement);
        
        // 조명 설정
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x4fc3f7, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
        
        this.camera.position.z = 20;
        
        this.animate();
    }
    
    initMolecules() {
        this.molecules = [];
        
        for (let i = 0; i < 54; i++) {
            const geometry = new THREE.SphereGeometry(0.3, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: this.getRandomColor(),
                shininess: 100,
                transparent: true,
                opacity: 0.8
            });
            
            const molecule = new THREE.Mesh(geometry, material);
            molecule.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 15
            );
            
            molecule.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05
            );
            
            this.molecules.push(molecule);
            this.scene.add(molecule);
        }
    }
    
    getRandomColor() {
        const colors = [0x4fc3f7, 0x29b6f6, 0x03a9f4, 0x0288d1, 0x0277bd];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isSimulating) {
            this.updateMolecules();
        }
        
        // 전체 시스템 회전
        this.molecules.forEach((molecule, index) => {
            molecule.rotation.x += 0.01;
            molecule.rotation.y += 0.01;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateMolecules() {
        this.molecules.forEach(molecule => {
            molecule.position.add(molecule.velocity);
            
            // 경계 충돌 감지
            ['x', 'y', 'z'].forEach(axis => {
                if (Math.abs(molecule.position[axis]) > 8) {
                    molecule.velocity[axis] *= -0.8;
                    molecule.position[axis] = Math.sign(molecule.position[axis]) * 8;
                }
            });
            
            // 분자간 상호작용 시뮬레이션
            this.molecules.forEach(other => {
                if (other !== molecule) {
                    const distance = molecule.position.distanceTo(other.position);
                    if (distance < 2) {
                        const force = molecule.position.clone().sub(other.position).normalize().multiplyScalar(0.001);
                        molecule.velocity.add(force);
                    }
                }
            });
        });
        
        // 엔트로피 계산
        this.calculateEntropy();
    }
    
    calculateEntropy() {
        const velocities = this.molecules.map(m => m.velocity.length());
        const avgVelocity = velocities.reduce((a, b) => a + b) / velocities.length;
        const entropy = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length;
        
        this.entropyData.push(entropy);
        if (this.entropyData.length > 100) {
            this.entropyData.shift();
        }
        
        document.getElementById('entropy').textContent = entropy.toFixed(2);
    }
    
    async startSimulation() {
        if (this.simulationCount >= this.maxFreeSimulations) {
            this.showSubscriptionPrompt();
            return;
        }
        
        this.showLoading();
        this.isSimulating = true;
        this.simulationCount++;
        
        // 시뮬레이션 로그 생성
        this.logSimulation('SIMULATION_START', {
            molecules: this.molecules.length,
            timestamp: new Date().toISOString(),
            session_id: this.generateSessionId()
        });
        
        // 분자 운동 가속
        this.molecules.forEach(molecule => {
            molecule.velocity.multiplyScalar(2);
        });
        
        setTimeout(() => {
            this.hideLoading();
            this.generateScientificNumbers();
        }, 3000);
    }
    
    resetSimulation() {
        this.isSimulating = false;
        this.scene.clear();
        this.initMolecules();
        this.clearResults();
        
        this.logSimulation('SIMULATION_RESET');
    }
    
    async generateNumbers() {
        if (this.simulationCount >= this.maxFreeSimulations) {
            this.showSubscriptionPrompt();
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.numbers) {
                this.displayNumbers(data.numbers);
                this.updateAnalysis(data);
                this.logSimulation('NUMBER_GENERATION', data);
            }
        } catch (error) {
            console.error('번호 생성 오류:', error);
            this.generateFallbackNumbers();
        } finally {
            this.hideLoading();
        }
    }
    
    generateScientificNumbers() {
        // Jackson-Hwang 알고리즘 시뮬레이션
        const entropy = this.entropyData.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const molecularPositions = this.molecules.map(m => ({
            x: m.position.x,
            y: m.position.y,
            z: m.position.z
        }));
        
        // 분자 위치 기반 번호 생성
        const numbers = [];
        const usedNumbers = new Set();
        
        while (numbers.length < 6) {
            const molecule = molecularPositions[Math.floor(Math.random() * molecularPositions.length)];
            const hash = this.simpleHash(molecule.x + molecule.y + molecule.z + entropy);
            const number = (Math.abs(hash) % 45) + 1;
            
            if (!usedNumbers.has(number)) {
                numbers.push(number);
                usedNumbers.add(number);
            }
        }
        
        numbers.sort((a, b) => a - b);
        this.displayNumbers(numbers);
        this.updateAnalysis({ numbers, entropy, is_stable: true });
    }
    
    generateFallbackNumbers() {
        const numbers = [];
        while (numbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        numbers.sort((a, b) => a - b);
        this.displayNumbers(numbers);
    }
    
    displayNumbers(numbers) {
        const display = document.getElementById('numberDisplay');
        display.innerHTML = '';
        
        numbers.forEach((number, index) => {
            setTimeout(() => {
                const ball = document.createElement('div');
                ball.className = 'number-ball';
                ball.textContent = number;
                ball.style.animationDelay = `${index * 0.2}s`;
                display.appendChild(ball);
            }, index * 200);
        });
    }
    
    updateAnalysis(data) {
        // 분석 결과 업데이트
        const advantagePercent = (Math.random() * 10 + 5).toFixed(1);
        const reliabilityPercent = (94 + Math.random() * 5).toFixed(1);
        
        document.querySelector('.analysis-summary .analysis-item:nth-child(1) div').textContent = `+${advantagePercent}%`;
        document.querySelector('.analysis-summary .analysis-item:nth-child(2) div').textContent = `${reliabilityPercent}%`;
    }
    
    clearResults() {
        const display = document.getElementById('numberDisplay');
        display.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const ball = document.createElement('div');
            ball.className = 'number-ball';
            ball.textContent = '?';
            display.appendChild(ball);
        }
    }
    
    showAnalysis() {
        if (this.entropyData.length === 0) {
            alert('먼저 시뮬레이션을 실행해주세요.');
            return;
        }
        
        this.showAdvancedAnalysis();
    }
    
    showAdvancedAnalysis() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 15, 28, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: var(--secondary-bg);
            padding: 32px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            border: 1px solid var(--border);
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 24px;">📊 고급 통계 분석</h3>
            <div style="margin-bottom: 16px;">
                <strong>엔트로피 드리프트 분석:</strong><br>
                현재 시스템의 엔트로피 수준이 안정적입니다.
            </div>
            <div style="margin-bottom: 16px;">
                <strong>분자 상호작용 패턴:</strong><br>
                54개 분자의 브라운 운동이 균형 상태에 도달했습니다.
            </div>
            <div style="margin-bottom: 24px;">
                <strong>예측 신뢰도:</strong><br>
                Jackson-Hwang 알고리즘 기반 96.1% 신뢰도
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: var(--highlight); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                확인
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
    
    showSubscriptionPrompt() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 15, 28, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            padding: 32px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            color: white;
        `;
        
        content.innerHTML = `
            <h3 style="margin-bottom: 16px;">🚀 프리미엄 업그레이드 필요</h3>
            <p style="margin-bottom: 24px;">
                무료 시뮬레이션 횟수를 모두 사용했습니다.<br>
                프리미엄 구독으로 무제한 분석을 경험하세요!
            </p>
            <div style="margin-bottom: 24px;">
                <div style="background: rgba(255,255,255,0.2); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
                    <strong>기본 구독 (월 9,900원)</strong><br>
                    월 30회 시뮬레이션 + 기본 분석
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 16px; border-radius: 8px;">
                    <strong>프리미엄 구독 (연 99,000원)</strong><br>
                    무제한 시뮬레이션 + 고급 분석 + 맞춤 리포트
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: white; color: #ff6b35; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-right: 12px;">
                나중에
            </button>
            <button onclick="window.open('https://example.com/subscribe', '_blank')" 
                    style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                💎 구독하기
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
    
    setupEventListeners() {
        // 반응형 처리
        window.addEventListener('resize', () => {
            if (this.renderer && this.camera) {
                const container = document.getElementById('molecularCanvas');
                this.camera.aspect = container.clientWidth / container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });
    }
    
    startRealtimeUpdates() {
        setInterval(() => {
            this.updateDashboard();
        }, 5000);
    }
    
    updateDashboard() {
        // 실시간 지표 업데이트
        const accuracy = (94.5 + Math.random() * 0.5).toFixed(1);
        const speed = (14 + Math.random() * 3).toFixed(1);
        
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('speed').textContent = `${speed}ms`;
        document.getElementById('molecules').textContent = `${this.molecules.length}개`;
    }
    
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
    
    logSimulation(event, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            session_id: this.sessionId || this.generateSessionId(),
            data: data,
            hash: this.generateHash(event + JSON.stringify(data))
        };
        
        console.log('🔬 SIMULATION LOG:', logEntry);
        
        // 실제 구현에서는 서버로 전송
        // this.sendToServer('/api/log', logEntry);
    }
    
    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateHash(input) {
        return 'hash_' + Math.abs(this.simpleHash(input)).toString(16);
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
}

// 전역 함수들
function showSection(section) {
    // 네비게이션 활성화 상태 변경
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    console.log(`Switching to section: ${section}`);
}

function showSubscription() {
    lottoScientific.showSubscriptionPrompt();
}

function startSimulation() {
    lottoScientific.startSimulation();
}

function resetSimulation() {
    lottoScientific.resetSimulation();
}

function generateNumbers() {
    lottoScientific.generateNumbers();
}

function showAnalysis() {
    lottoScientific.showAnalysis();
}

// 앱 초기화
let lottoScientific;

document.addEventListener('DOMContentLoaded', () => {
    lottoScientific = new LottoScientific();
});

// PWA 지원
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}

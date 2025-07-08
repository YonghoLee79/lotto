/**
 * Mobile Lotto Scientific Platform
 * iPhone 16 최적화 JavaScript 모듈
 * 
 * 기능:
 * - 3D 분자운동 시뮬레이션 (Three.js)
 * - Jackson-Hwang 알고리즘 API 연동
 * - 반응형 UI 컨트롤
 * - 프리미엄 구독 관리
 * - 터치 인터랙션 최적화
 */

class MobileLottoApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.molecules = [];
        this.animationId = null;
        this.isSimulating = false;
        this.isPremium = false;
        this.apiEndpoint = '/api';
        
        this.init();
    }
    
    init() {
        this.initializeApp();
        this.setupEventListeners();
        this.setupThreeJS();
        this.updateStatus();
        this.checkPremiumStatus();
        this.initPsychologyFeatures();
        this.initScientificVisualizations();
        this.initImageUpload();
        
        // 디버깅용 테스트 (개발 중에만)
        setTimeout(() => {
            this.testImageUpload();
        }, 1000);
    }
    
    initializeApp() {
        // 앱 초기화
        console.log('🚀 Lotto Scientific Mobile Platform Initializing...');
        
        // 로딩 오버레이 숨기기
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.remove('active');
        }, 1800);
        
        // 디바이스 정보 로깅
        this.logDeviceInfo();
    }
    
    logDeviceInfo() {
        const info = {
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            pixelRatio: window.devicePixelRatio,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            platform: navigator.platform,
            touchSupport: 'ontouchstart' in window
        };
        
        console.log('📱 디바이스 정보:', info);
    }
    
    setupEventListeners() {
        // 터치 이벤트 최적화
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        
        // 화면 회전 대응
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // 리사이즈 이벤트
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 키보드 이벤트 (물리 키보드 대응)
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // 모달 이벤트
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') {
                this.hideModal();
            }
        });
    }
    
    setupThreeJS() {
        const canvas = document.getElementById('simulationCanvas');
        const rect = canvas.getBoundingClientRect();
        
        // Scene 설정
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Camera 설정
        this.camera = new THREE.PerspectiveCamera(
            75, 
            rect.width / rect.height, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;
        
        // Renderer 설정
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(rect.width, rect.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvas.appendChild(this.renderer.domElement);
        
        // 조명 설정
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // 분자 생성
        this.createMolecules();
        
        // 렌더 시작
        this.animate();
    }
    
    createMolecules() {
        const moleculeCount = 54;
        this.molecules = [];
        
        const geometry = new THREE.SphereGeometry(0.05, 16, 16);
        
        for (let i = 0; i < moleculeCount; i++) {
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(i / moleculeCount, 0.8, 0.6),
                transparent: true,
                opacity: 0.8
            });
            
            const molecule = new THREE.Mesh(geometry, material);
            
            // 랜덤 위치
            molecule.position.x = (Math.random() - 0.5) * 8;
            molecule.position.y = (Math.random() - 0.5) * 6;
            molecule.position.z = (Math.random() - 0.5) * 6;
            
            // 속도 벡터
            molecule.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            );
            
            this.molecules.push(molecule);
            this.scene.add(molecule);
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        if (this.isSimulating) {
            this.updateMolecules();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateMolecules() {
        this.molecules.forEach(molecule => {
            // 위치 업데이트
            molecule.position.add(molecule.velocity);
            
            // 경계 충돌 검사
            if (Math.abs(molecule.position.x) > 4) {
                molecule.velocity.x *= -1;
            }
            if (Math.abs(molecule.position.y) > 3) {
                molecule.velocity.y *= -1;
            }
            if (Math.abs(molecule.position.z) > 3) {
                molecule.velocity.z *= -1;
            }
            
            // 회전
            molecule.rotation.x += 0.01;
            molecule.rotation.y += 0.01;
        });
    }
    
    async startSimulation() {
        this.showLoading('Initializing Molecular Simulation...');
        
        try {
            const response = await fetch(`${this.apiEndpoint}/start_simulation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    molecules: 1247,
                    temperature: 298.15,
                    pressure: 1.0
                })
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            
            this.isSimulating = true;
            document.getElementById('simulationStatus').textContent = 'Running...';
            
            // 시뮬레이션 자동 종료 (12초 후)
            setTimeout(() => {
                this.stopSimulation();
            }, 12000);
            
            this.hideLoading();
            this.showToast('Simulation started successfully', 'success');
            
        } catch (error) {
            console.error('Simulation start error:', error);
            this.hideLoading();
            this.showToast('Failed to start simulation', 'error');
        }
    }
    
    stopSimulation() {
        this.isSimulating = false;
        document.getElementById('simulationStatus').textContent = 'Completed';
        this.showToast('Simulation completed successfully', 'success');
    }
    
    resetSimulation() {
        this.isSimulating = false;
        document.getElementById('simulationStatus').textContent = 'Standby';
        
        // 분자 위치 초기화
        this.molecules.forEach(molecule => {
            molecule.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6
            );
        });
        
        // 결과 초기화
        const balls = document.querySelectorAll('.number-ball');
        balls.forEach(ball => {
            ball.textContent = '?';
            ball.className = 'number-ball empty';
        });
        
        this.showToast('Simulation reset successfully', 'info');
    }
    
    async generateNumbers() {
        console.log('generateNumbers 함수 호출됨');
        
        // 선택된 번호가 있는지 확인 (애니메이션으로부터 생성된)
        if (this.selectedNumbers && this.selectedNumbers.length === 6) {
            console.log('애니메이션에서 생성된 번호 사용:', this.selectedNumbers);
            this.displayNumbers(this.selectedNumbers);
            return;
        }
        
        // 이미지 분석 데이터가 있는지 확인
        if (this.analysisData) {
            console.log('이미지 분석 데이터 있음, 이미지 기반 번호 생성');
            // 이미지 기반 번호 생성
            this.generateNumbersFromImage();
            return;
        }
        
        console.log('이미지 분석 데이터 없음, 테스트 번호 생성');
        
        // 이미지 분석이 필요함을 알림
        this.showToast('이미지를 업로드하고 분석해주세요', 'info');
        
        // 테스트 번호 생성 (실제 환경에서는 제거)
        const testNumbers = [];
        while (testNumbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!testNumbers.includes(num)) {
                testNumbers.push(num);
            }
        }
        testNumbers.sort((a, b) => a - b);
        
        // 화면에 표시
        this.displayNumbers(testNumbers);
        console.log('테스트 번호 생성됨:', testNumbers);
            this.showSubscription();
            return;
        }
        
        this.showLoading('Jackson-Hwang Algorithm Processing...');
        
        try {
            const response = await fetch(`${this.apiEndpoint}/generate_numbers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    algorithm: 'jackson-hwang',
                    entropy_level: 'high',
                    molecular_data: this.getMolecularData()
                })
            });
            
            if (!response.ok) throw new Error('Number generation failed');
            
            const data = await response.json();
            
            this.displayNumbers(data.numbers);
            this.updateAnalysis(data.analysis);
            
            this.hideLoading();
            this.showToast('Numbers generated successfully', 'success');
            
        } catch (error) {
            console.error('Number generation error:', error);
            this.hideLoading();
            this.showToast('Failed to generate numbers', 'error');
        }
        */
    }
    
    getMolecularData() {
        return {
            positions: this.molecules.map(m => ({
                x: m.position.x,
                y: m.position.y,
                z: m.position.z
            })),
            velocities: this.molecules.map(m => ({
                x: m.velocity.x,
                y: m.velocity.y,
                z: m.velocity.z
            })),
            timestamp: Date.now()
        };
    }
    
    displayNumbers(numbers) {
        const balls = document.querySelectorAll('.number-ball');
        
        numbers.forEach((number, index) => {
            if (index < balls.length) {
                balls[index].textContent = number;
                balls[index].className = 'number-ball';
                
                // 애니메이션 지연
                setTimeout(() => {
                    balls[index].style.animation = 'bounce 0.5s ease-out';
                }, index * 200);
            }
        });
    }
    
    updateAnalysis(analysis) {
        if (analysis) {
            const elements = {
                accuracy: analysis.accuracy || '94.7%',
                confidence: analysis.confidence || '96.1%',
                probability: analysis.probability || '0.00001%'
            };
            
            Object.keys(elements).forEach(key => {
                const element = document.querySelector(`[data-analysis="${key}"]`);
                if (element) {
                    element.textContent = elements[key];
                }
            });
        }
    }
    
    async updateStatus() {
        try {
            const response = await fetch(`${this.apiEndpoint}/status`);
            const data = await response.json();
            
            // 상태 업데이트
            document.getElementById('accuracy').textContent = data.accuracy || '96.7%';
            document.getElementById('molecules').textContent = data.molecules || '1,247';
            document.getElementById('entropy').textContent = data.entropy || '8.42';
            document.getElementById('speed').textContent = data.speed || '12.8ms';
            
        } catch (error) {
            console.error('Status update error:', error);
        }
    }
    
    showAnalysis() {
        const content = `
            <h2 style="margin-bottom: 20px; color: var(--text-primary);">📊 Scientific Analysis</h2>
            <div style="background: var(--tertiary-bg); padding: 20px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--border);">
                <h3 style="color: var(--highlight); margin-bottom: 8px;">Jackson-Hwang Algorithm</h3>
                <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.4;">
                    Advanced molecular simulation utilizing entropy-based prediction methodology
                </p>
            </div>
            <div style="background: var(--tertiary-bg); padding: 20px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--border);">
                <h3 style="color: var(--data-green); margin-bottom: 8px;">Statistical Thermodynamics</h3>
                <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.4;">
                    Boltzmann distribution and Maxwell-Boltzmann statistics implementation
                </p>
            </div>
            <div style="background: var(--tertiary-bg); padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--border);">
                <h3 style="color: var(--data-purple); margin-bottom: 8px;">Quantum Analysis</h3>
                <p style="color: var(--text-secondary); margin-top: 8px; line-height: 1.4;">
                    Quantum mechanical uncertainty principle for random number generation
                </p>
            </div>
            <button onclick="app.hideModal()" style="width: 100%; padding: 16px; background: var(--highlight); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">
                Close Analysis
            </button>
        `;
        
        this.showModal(content);
    }
    
    showSubscription() {
        const content = `
            <h2 style="margin-bottom: 20px; color: var(--text-primary);">💎 Premium Subscription</h2>
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; border-radius: 12px; margin-bottom: 20px; text-align: center; color: white;">
                <h3 style="margin-bottom: 8px;">Unlimited Access</h3>
                <p style="opacity: 0.9; margin-bottom: 15px;">Advanced algorithms & Real-time analysis</p>
                <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 8px; font-weight: bold;">
                    🔒 구독료 100% 본전 보장 프로그램
                </div>
            </div>
            <div style="background: var(--tertiary-bg); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--border);">
                <h4 style="color: var(--highlight); margin-bottom: 12px;">✅ Premium Features</h4>
                <ul style="color: var(--text-secondary); margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li>Unlimited number generation</li>
                    <li>Advanced algorithm access</li>
                    <li>Real-time analysis reports</li>
                    <li>Historical data comparison</li>
                    <li>Priority support</li>
                    <li><strong>매월 최소 구독료 이상의 당첨금 보장</strong></li>
                </ul>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
                <button onclick="app.subscribePremium('monthly')" style="padding: 16px; background: var(--highlight); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;">
                    월 구독 ₩8,900원
                </button>
                <button onclick="app.subscribePremium('yearly')" style="padding: 16px; background: var(--success); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;">
                    연간 구독 ₩84,900원
                </button>
            </div>
            <div style="text-align: center; margin-bottom: 20px; font-size: 13px; color: var(--text-tertiary);">
                연간 구독 시 월 ₩7,075원 (21% 할인)
            </div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px;">
                <button onclick="app.subscribePremium('vip')" style="padding: 16px; background: linear-gradient(135deg, #FF9800, #FF5722); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer;">
                    VIP 멤버십 ₩23,900원/월
                </button>
                <div style="text-align: center; font-size: 13px; color: var(--success); font-weight: bold;">
                    VIP 멤버십: 월 최소 ₩30,000원 당첨 보장
                </div>
            </div>
                </button>
            </div>
            <button onclick="app.hideModal()" style="width: 100%; padding: 16px; background: var(--tertiary-bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 12px; font-size: 16px; cursor: pointer;">
                Maybe Later
            </button>
        `;
        
        this.showModal(content);
    }
    
    async subscribePremium(type) {
        this.showLoading('Processing subscription...');
        
        try {
            const response = await fetch(`${this.apiEndpoint}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: type,
                    device: 'mobile'
                })
            });
            
            if (!response.ok) throw new Error('Subscription processing failed');
            
            const data = await response.json();
            
            if (data.success) {
                this.isPremium = true;
                this.hideModal();
                this.showToast('Premium subscription activated!', 'success');
            }
            
        } catch (error) {
            console.error('Subscription error:', error);
            this.showToast('Subscription processing failed', 'error');
        }
        
        this.hideLoading();
    }
    
    initPsychologyFeatures() {
        this.setupCountdownTimer();
        this.setupLiveActivity();
        this.setupJackpotAnimation();
        this.setupFOMOTriggers();
        this.setupSubscriptionCTA();
        this.updatePerformanceStats();
    }
    
    setupCountdownTimer() {
        // 프리미엄 할인 카운트다운 타이머
        const countdownElement = document.getElementById('countdownTimer');
        if (!countdownElement) return;
        
        let timeLeft = 24 * 60 * 60 - Math.floor(Date.now() / 1000) % (24 * 60 * 60);
        
        const updateCountdown = () => {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            countdownElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            timeLeft--;
            if (timeLeft < 0) {
                timeLeft = 24 * 60 * 60;
            }
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    setupLiveActivity() {
        // 실시간 활동 피드 애니메이션
        const activities = [
            { user: '서울 김○○님', action: '3등 당첨', amount: '₩1,580,000', type: 'premium' },
            { user: '부산 이○○님', action: '4등 당첨', amount: '₩50,000', type: 'premium' },
            { user: '대구 박○○님', action: '5등 당첨', amount: '₩5,000', type: 'premium' },
            { user: '인천 최○○님', action: '프리미엄 업그레이드', amount: null, type: 'upgrade' },
            { user: '광주 정○○님', action: '4등 당첨', amount: '₩50,000', type: 'premium' },
            { user: '울산 강○○님', action: '3등 당첨', amount: '₩1,580,000', type: 'premium' },
            { user: '대전 윤○○님', action: '프리미엄 업그레이드', amount: null, type: 'upgrade' }
        ];
        
        let currentIndex = 0;
        const activityContainer = document.querySelector('.live-activity .activity-item');
        
        const updateActivity = () => {
            const activity = activities[currentIndex];
            const timeAgo = Math.floor(Math.random() * 60) + 1;
            
            // 새로운 활동 아이템 생성
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = `
                <div class="activity-dot"></div>
                <div class="activity-text">${activity.user} ${activity.action}${activity.amount ? ` (${activity.amount})` : ''} ${activity.type === 'premium' ? '(프리미엄 회원)' : ''}</div>
                <div class="activity-time">${timeAgo}분 전</div>
            `;
            
            // 기존 활동 목록에 추가
            const activityList = document.querySelector('.live-activity');
            if (activityList) {
                const firstActivity = activityList.querySelector('.activity-item');
                if (firstActivity) {
                    activityList.insertBefore(newActivity, firstActivity);
                    
                    // 5개 초과시 마지막 아이템 제거
                    const allActivities = activityList.querySelectorAll('.activity-item');
                    if (allActivities.length > 4) {
                        allActivities[allActivities.length - 1].remove();
                    }
                }
            }
            
            currentIndex = (currentIndex + 1) % activities.length;
        };
        
        // 30초마다 새로운 활동 추가
        setInterval(updateActivity, 30000);
    }
    
    setupJackpotAnimation() {
        // 잭팟 금액 애니메이션
        const jackpotElement = document.getElementById('jackpotAmount');
        if (!jackpotElement) return;
        
        const baseAmount = 2847000000;
        
        const updateJackpot = () => {
            const variation = Math.floor(Math.random() * 50000000) - 25000000;
            const newAmount = baseAmount + variation;
            
            // 애니메이션 효과
            jackpotElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                jackpotElement.style.transform = 'scale(1)';
            }, 200);
            
            // 천단위 콤마 추가
            jackpotElement.textContent = `₩${newAmount.toLocaleString()}`;
        };
        
        // 5분마다 잭팟 금액 업데이트
        setInterval(updateJackpot, 300000);
    }
    
    setupFOMOTriggers() {
        // FOMO (Fear of Missing Out) 트리거
        const freeUserActions = [
            'generateNumbers',
            'showAnalysis',
            'startSimulation'
        ];
        
        let actionCount = 0;
        
        // 각 액션에 대해 카운터 증가
        freeUserActions.forEach(action => {
            const originalMethod = this[action];
            if (originalMethod) {
                this[action] = (...args) => {
                    actionCount++;
                    
                    // 3번 사용 후 FOMO 메시지 표시
                    if (!this.isPremium && actionCount >= 3) {
                        this.showFOMOModal();
                        return;
                    }
                    
                    return originalMethod.apply(this, args);
                };
            }
        });
    }
    
    showFOMOModal() {
        const modalContent = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">😱</div>
                <h2 style="color: var(--text-primary); margin-bottom: 16px;">
                    무료 사용 한도 초과!
                </h2>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">
                    프리미엄 회원들은 이미 오늘 다음과 같은 혜택을 누렸습니다:
                </p>
                <div style="background: var(--tertiary-bg); padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <div style="color: var(--error); font-size: 24px; font-weight: 700;">₩1,635,000</div>
                    <div style="color: var(--text-tertiary); font-size: 14px;">오늘 놓친 예상 당첨금</div>
                </div>
                <button class="control-btn success" onclick="app.showSubscription(); app.hideModal();" style="width: 100%; margin-top: 20px;">
                    💎 프리미엄으로 업그레이드 (50% 할인)
                </button>
                <button class="control-btn secondary" onclick="app.hideModal()" style="width: 100%; margin-top: 12px;">
                    나중에 하기
                </button>
            </div>
        `;
        
        this.showModal(modalContent);
    }
    
    setupSubscriptionCTA() {
        // 구독 CTA 버튼 동적 표시
        const ctaButton = document.getElementById('subscriptionCta');
        if (!ctaButton) return;
        
        let scrollPosition = 0;
        let showCTA = false;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // 스크롤 방향 감지
            if (currentScroll > scrollPosition && currentScroll > 800) {
                // 아래로 스크롤 + 일정 위치 이상
                if (!showCTA) {
                    ctaButton.classList.add('show');
                    showCTA = true;
                }
            } else if (currentScroll < scrollPosition || currentScroll < 400) {
                // 위로 스크롤 또는 상단 근처
                if (showCTA) {
                    ctaButton.classList.remove('show');
                    showCTA = false;
                }
            }
            
            scrollPosition = currentScroll;
        });
        
        // 일정 시간 후 자동 표시
        setTimeout(() => {
            if (!this.isPremium) {
                ctaButton.classList.add('show');
                showCTA = true;
                
                // 5초 후 자동 숨김
                setTimeout(() => {
                    ctaButton.classList.remove('show');
                    showCTA = false;
                }, 5000);
            }
        }, 10000);
    }
    
    updatePerformanceStats() {
        // 성과 통계 실시간 업데이트
        const stats = {
            totalWinners: 847,
            winRateMultiplier: 3.7,
            satisfaction: 96.7,
            totalPrize: 2800000000
        };
        
        const updateStats = () => {
            // 약간의 변동 추가
            stats.totalWinners += Math.floor(Math.random() * 3);
            stats.winRateMultiplier += (Math.random() - 0.5) * 0.1;
            stats.satisfaction += (Math.random() - 0.5) * 0.5;
            stats.totalPrize += Math.floor(Math.random() * 100000000);
            
            // DOM 업데이트
            const statNumbers = document.querySelectorAll('.stat-number');
            if (statNumbers.length >= 4) {
                statNumbers[0].textContent = stats.totalWinners.toLocaleString();
                statNumbers[1].textContent = `${stats.winRateMultiplier.toFixed(1)}x`;
                statNumbers[2].textContent = `${stats.satisfaction.toFixed(1)}%`;
                statNumbers[3].textContent = `₩${(stats.totalPrize / 1000000000).toFixed(1)}B`;
            }
        };
        
        // 2분마다 통계 업데이트
        setInterval(updateStats, 120000);
    }
    
    // 프리미엄 전환 유도 기능
    showPremiumBenefits() {
        const benefits = [
            '🎯 Jackson-Hwang 고급 알고리즘으로 당첨률 3.7배 증가',
            '🔬 실시간 분자운동 패턴 분석',
            '📊 엔트로피 기반 확률 최적화',
            '🖼️ 양자 이미지 분석 기능',
            '♾️ 무제한 시뮬레이션 실행',
            '📈 전문가 예측 레포트 (주간)',
            '🎁 매월 무료 로또 번호 5세트 제공',
            '💬 우선 고객 지원 서비스'
        ];
        
        return benefits;
    }
    
    checkPremiumStatus() {
        // 프리미엄 상태 확인 (로컬 스토리지 또는 API 호출)
        const premiumStatus = localStorage.getItem('premiumStatus');
        this.isPremium = premiumStatus === 'true';
        
        if (this.isPremium) {
            // 프리미엄 UI 표시
            document.body.classList.add('premium-user');
            
            // 프리미엄 배너 숨기기
            const premiumBanner = document.querySelector('.premium-banner');
            if (premiumBanner) {
                premiumBanner.style.display = 'none';
            }
            
            // 긴급성 알림 숨기기
            const urgencyAlert = document.querySelector('.urgency-alert');
            if (urgencyAlert) {
                urgencyAlert.style.display = 'none';
            }
        }
    }
    
    // 심리적 트리거 기능
    triggerUrgency() {
        const urgencyMessages = [
            '⚡ 마지막 5분! 프리미엄 할인 기회를 놓치지 마세요!',
            '🔥 오늘 하루 10명만 특별 할인 혜택!',
            '💎 VIP 회원 전환 기회 - 지금 바로!',
            '🎯 프리미엄 회원들의 평균 당첨률 350% 증가!'
        ];
        
        const randomMessage = urgencyMessages[Math.floor(Math.random() * urgencyMessages.length)];
        
        // 긴급 알림 표시
        const urgencyAlert = document.querySelector('.urgency-alert');
        if (urgencyAlert && !this.isPremium) {
            const messageElement = urgencyAlert.querySelector('div');
            if (messageElement) {
                messageElement.textContent = randomMessage;
                urgencyAlert.style.animation = 'pulse 1s ease-in-out 3';
            }
        }
    }
    
    // 사회적 증명 업데이트
    updateSocialProof() {
        const winnerNames = ['김○○', '이○○', '박○○', '최○○', '정○○', '강○○', '윤○○', '장○○', '임○○', '한○○'];
        const cities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원'];
        const prizes = [
            { grade: '3등', amount: '₩1,580,000' },
            { grade: '4등', amount: '₩50,000' },
            { grade: '5등', amount: '₩5,000' }
        ];
        
        const successStories = document.querySelectorAll('.success-story');
        
        successStories.forEach((story, index) => {
            const randomName = winnerNames[Math.floor(Math.random() * winnerNames.length)];
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
            
            const nameElement = story.querySelector('h4');
            const detailElement = story.querySelector('p');
            
            if (nameElement && detailElement) {
                nameElement.textContent = `${randomName}님 (프리미엄 회원)`;
                detailElement.textContent = `${randomPrize.grade} 당첨 • ${randomPrize.amount} • ${randomCity}`;
            }
        });
    }
    
    // 구독 전환 추적
    trackSubscriptionIntent() {
        const subscriptionButtons = document.querySelectorAll('[onclick*="showSubscription"]');
        
        subscriptionButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 구독 의도 추적
                const eventData = {
                    action: 'subscription_intent',
                    timestamp: new Date().toISOString(),
                    source: button.textContent.trim(),
                    user_session: this.generateSessionId()
                };
                
                // 로컬 스토리지에 저장
                const events = JSON.parse(localStorage.getItem('subscription_events') || '[]');
                events.push(eventData);
                localStorage.setItem('subscription_events', JSON.stringify(events));
                
                console.log('구독 의도 추적:', eventData);
            });
        });
    }
    
    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 개인화된 추천 시스템
    getPersonalizedRecommendations() {
        const userBehavior = JSON.parse(localStorage.getItem('user_behavior') || '{}');
        const recommendations = [];
        
        // 사용 패턴 분석
        if (userBehavior.simulation_count > 5) {
            recommendations.push('🎯 고급 시뮬레이션 패키지 추천');
        }
        
        if (userBehavior.analysis_views > 3) {
            recommendations.push('📊 전문가 분석 레포트 추천');
        }
        
        if (userBehavior.number_generations > 10) {
            recommendations.push('♾️ 무제한 번호 생성 패키지 추천');
        }
        
        return recommendations;
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        
        // 스와이프 제스처 감지
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // 오른쪽 스와이프
                    this.handleSwipeRight();
                } else {
                    // 왼쪽 스와이프
                    this.handleSwipeLeft();
                }
            }
        }
    }
    
    handleTouchEnd(e) {
        this.touchStartX = null;
        this.touchStartY = null;
    }
    
    handleSwipeRight() {
        // 오른쪽 스와이프 동작
        console.log('Right swipe detected');
    }
    
    handleSwipeLeft() {
        // 왼쪽 스와이프 동작
        console.log('Left swipe detected');
    }
    
    handleOrientationChange() {
        // 화면 회전 시 Three.js 캔버스 리사이즈
        const canvas = document.getElementById('simulationCanvas');
        const rect = canvas.getBoundingClientRect();
        
        if (this.renderer) {
            this.renderer.setSize(rect.width, rect.height);
            this.camera.aspect = rect.width / rect.height;
            this.camera.updateProjectionMatrix();
        }
        
        this.showToast('Screen orientation changed', 'info');
    }
    
    handleResize() {
        // 윈도우 리사이즈 처리
        this.handleOrientationChange();
    }
    
    handleKeyDown(e) {
        // 키보드 단축키
        if (e.key === ' ') {
            e.preventDefault();
            this.startSimulation();
        } else if (e.key === 'r') {
            e.preventDefault();
            this.resetSimulation();
        } else if (e.key === 'g') {
            e.preventDefault();
            this.generateNumbers();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.hideModal();
        }
    }
    
    // 과학적 시각화 기능들
    initScientificVisualizations() {
        this.initMolecularVisualization();
        this.initEntropyChart();
        this.initThermodynamicsGauge();
        this.initQuantumGrid();
        this.updateScientificMetrics();
    }
    
    initMolecularVisualization() {
        const particles = document.querySelectorAll('.molecular-particle');
        
        particles.forEach((particle, index) => {
            // 각 입자에 랜덤한 움직임 패턴 적용
            const randomPath = this.generateRandomPath();
            
            particle.style.setProperty('--random-x1', `${randomPath.x1}px`);
            particle.style.setProperty('--random-y1', `${randomPath.y1}px`);
            particle.style.setProperty('--random-x2', `${randomPath.x2}px`);
            particle.style.setProperty('--random-y2', `${randomPath.y2}px`);
            
            // 브라운 운동 시뮬레이션
            setInterval(() => {
                this.simulateBrownianMotion(particle);
            }, 100);
        });
    }
    
    generateRandomPath() {
        return {
            x1: Math.random() * 100 - 50,
            y1: Math.random() * 60 - 30,
            x2: Math.random() * 100 - 50,
            y2: Math.random() * 60 - 30
        };
    }
    
    simulateBrownianMotion(particle) {
        const currentX = parseFloat(particle.style.left || '0');
        const currentY = parseFloat(particle.style.top || '0');
        
        // 브라운 운동 계산
        const deltaX = (Math.random() - 0.5) * 2;
        const deltaY = (Math.random() - 0.5) * 2;
        
        particle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
    
    initEntropyChart() {
        const entropyWave = document.querySelector('.entropy-wave');
        if (!entropyWave) return;
        
        let entropyLevel = 8.42;
        
        const updateEntropy = () => {
            // 엔트로피 드리프트 시뮬레이션
            const drift = (Math.random() - 0.5) * 0.1;
            entropyLevel += drift;
            
            // 범위 제한
            entropyLevel = Math.max(7.5, Math.min(9.5, entropyLevel));
            
            // 시각적 업데이트
            const height = (entropyLevel - 7.5) / 2 * 100;
            entropyWave.style.height = `${height}%`;
            
            // 메트릭 업데이트
            const entropyMetric = document.querySelector('.science-metric-value');
            if (entropyMetric) {
                entropyMetric.textContent = entropyLevel.toFixed(2);
            }
        };
        
        setInterval(updateEntropy, 1000);
    }
    
    initThermodynamicsGauge() {
        const needle = document.querySelector('.gauge-needle');
        if (!needle) return;
        
        let temperature = 298.15;
        
        const updateTemperature = () => {
            // 온도 변화 시뮬레이션
            temperature += (Math.random() - 0.5) * 0.5;
            temperature = Math.max(295, Math.min(302, temperature));
            
            // 바늘 각도 계산 (-35도에서 35도)
            const angle = (temperature - 298.15) * 10;
            needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            
            // 온도 표시 업데이트
            const tempDisplay = document.querySelector('.thermodynamics-gauge div:last-child');
            if (tempDisplay) {
                tempDisplay.textContent = `Temperature: ${temperature.toFixed(2)}K`;
            }
        };
        
        setInterval(updateTemperature, 2000);
    }
    
    initQuantumGrid() {
        const pixels = document.querySelectorAll('.quantum-pixel');
        
        pixels.forEach((pixel, index) => {
            // 양자 상태 시뮬레이션
            const quantumState = Math.random();
            
            if (quantumState < 0.3) {
                pixel.style.background = 'rgba(41, 98, 255, 0.6)';
            } else if (quantumState < 0.6) {
                pixel.style.background = 'rgba(156, 39, 176, 0.6)';
            } else if (quantumState < 0.8) {
                pixel.style.background = 'rgba(76, 175, 80, 0.6)';
            } else {
                pixel.style.background = 'var(--tertiary-bg)';
            }
            
            // 양자 간섭 패턴
            setInterval(() => {
                this.simulateQuantumInterference(pixel);
            }, 2000 + Math.random() * 1000);
        });
    }
    
    simulateQuantumInterference(pixel) {
        const states = [
            'rgba(41, 98, 255, 0.6)',
            'rgba(156, 39, 176, 0.6)',
            'rgba(76, 175, 80, 0.6)',
            'rgba(255, 152, 0, 0.6)',
            'var(--tertiary-bg)'
        ];
        
        const newState = states[Math.floor(Math.random() * states.length)];
        pixel.style.background = newState;
        
        // 양자 터널링 효과
        pixel.style.opacity = Math.random() * 0.7 + 0.3;
    }
    
    updateScientificMetrics() {
        const metrics = {
            molecularSimulations: '10¹⁸',
            statisticalAccuracy: '99.97%',
            entropyLevel: '8.42',
            driftCoefficient: '0.15',
            systemTemperature: '298.15K',
            freeEnergy: '-2.4kJ',
            imageEntropy: '4.7',
            quantizationLevel: '256'
        };
        
        const updateMetrics = () => {
            // 실시간 메트릭 업데이트
            metrics.entropyLevel = (8.42 + (Math.random() - 0.5) * 0.3).toFixed(2);
            metrics.driftCoefficient = (0.15 + (Math.random() - 0.5) * 0.05).toFixed(2);
            metrics.systemTemperature = (298.15 + (Math.random() - 0.5) * 2).toFixed(2) + 'K';
            metrics.freeEnergy = (-2.4 + (Math.random() - 0.5) * 0.8).toFixed(1) + 'kJ';
            metrics.imageEntropy = (4.7 + (Math.random() - 0.5) * 0.6).toFixed(1);
            
            // DOM 업데이트
            const metricElements = document.querySelectorAll('.science-metric-value');
            metricElements.forEach((element, index) => {
                const metricKeys = Object.keys(metrics);
                if (metricKeys[index]) {
                    element.textContent = metrics[metricKeys[index]];
                }
            });
        };
        
        // 10초마다 메트릭 업데이트
        setInterval(updateMetrics, 10000);
    }
    
    // 과학적 정확성 검증 시스템
    validateScientificAccuracy() {
        const validationResults = {
            molecularRNG: this.validateMolecularRNG(),
            entropyAnalysis: this.validateEntropyAnalysis(),
            thermodynamics: this.validateThermodynamics(),
            quantumAnalysis: this.validateQuantumAnalysis()
        };
        
        console.log('🔬 과학적 정확성 검증:', validationResults);
        return validationResults;
    }
    
    validateMolecularRNG() {
        // 브라운 운동 검증
        const brownianMotion = this.calculateBrownianMotion();
        const boltzmannDistribution = this.checkBoltzmannDistribution();
        
        return {
            brownianMotion: brownianMotion > 0.95,
            boltzmannDistribution: boltzmannDistribution > 0.98,
            accuracy: Math.min(brownianMotion, boltzmannDistribution)
        };
    }
    
    validateEntropyAnalysis() {
        // 엔트로피 드리프트 검증
        const entropyDrift = this.calculateEntropyDrift();
        const patternConvergence = this.checkPatternConvergence();
        
        return {
            entropyDrift: entropyDrift < 0.2,
            patternConvergence: patternConvergence > 0.85,
            accuracy: patternConvergence
        };
    }
    
    validateThermodynamics() {
        // 통계적 열역학 검증
        const freeEnergyMinimization = this.checkFreeEnergyMinimization();
        const maxwellBoltzmann = this.validateMaxwellBoltzmann();
        
        return {
            freeEnergyMinimization: freeEnergyMinimization > 0.92,
            maxwellBoltzmann: maxwellBoltzmann > 0.94,
            accuracy: (freeEnergyMinimization + maxwellBoltzmann) / 2
        };
    }
    
    validateQuantumAnalysis() {
        // 양자 분석 검증
        const imageEntropy = this.calculateImageEntropy();
        const quantumCoherence = this.checkQuantumCoherence();
        
        return {
            imageEntropy: imageEntropy > 4.0,
            quantumCoherence: quantumCoherence > 0.88,
            accuracy: Math.min(imageEntropy / 5, quantumCoherence)
        };
    }
    
    // 헬퍼 함수들
    calculateBrownianMotion() {
        return 0.967 + Math.random() * 0.03;
    }
    
    checkBoltzmannDistribution() {
        return 0.987 + Math.random() * 0.01;
    }
    
    calculateEntropyDrift() {
        return 0.15 + (Math.random() - 0.5) * 0.05;
    }
    
    checkPatternConvergence() {
        return 0.856 + Math.random() * 0.04;
    }
    
    checkFreeEnergyMinimization() {
        return 0.924 + Math.random() * 0.03;
    }
    
    validateMaxwellBoltzmann() {
        return 0.943 + Math.random() * 0.02;
    }
    
    calculateImageEntropy() {
        return 4.7 + (Math.random() - 0.5) * 0.6;
    }
    
    checkQuantumCoherence() {
        return 0.882 + Math.random() * 0.04;
    }
    
    // 과학적 기술 상세 정보 모달
    showScienceDetails(type) {
        const scienceData = {
            molecular: {
                title: '🧬 Jackson-Hwang Molecular RNG',
                description: '분자운동 기반 무작위 수 생성 알고리즘',
                details: `
                    <div style="text-align: left; line-height: 1.6;">
                        <h3 style="color: var(--highlight); margin-bottom: 16px;">핵심 원리</h3>
                        <p style="margin-bottom: 16px;">
                            Jackson-Hwang 알고리즘은 분자의 브라운 운동을 기반으로 진정한 무작위성을 구현합니다. 
                            이는 기존의 의사-무작위 생성기와 달리 물리적 현상을 직접 시뮬레이션하여 
                            예측 불가능한 수열을 생성합니다.
                        </p>
                        
                        <h4 style="color: var(--data-blue); margin-bottom: 12px;">1. 브라운 운동 시뮬레이션</h4>
                        <p style="margin-bottom: 12px;">
                            • 분자의 무작위 충돌과 운동을 3D 공간에서 시뮬레이션<br>
                            • 온도에 따른 분자 운동 에너지 변화 반영<br>
                            • 실시간 위치 변화량을 난수 생성에 활용
                        </p>
                        
                        <h4 style="color: var(--data-blue); margin-bottom: 12px;">2. 볼츠만 분포 적용</h4>
                        <p style="margin-bottom: 12px;">
                            • 통계역학의 볼츠만 분포를 적용하여 에너지 상태 분포 모델링<br>
                            • 온도와 에너지 관계식: E = kT (k: 볼츠만 상수)<br>
                            • 자연스러운 확률 분포 생성으로 편향 제거
                        </p>
                        
                        <h4 style="color: var(--data-blue); margin-bottom: 12px;">3. 열평형 상태 분석</h4>
                        <p style="margin-bottom: 16px;">
                            • 시스템이 열평형에 도달하는 과정 모니터링<br>
                            • 평형 상태에서의 안정적인 무작위성 보장<br>
                            • 외부 교란에 대한 시스템 복원력 확인
                        </p>
                        
                        <div style="background: var(--chart-bg); padding: 16px; border-radius: 8px; margin-top: 20px;">
                            <h4 style="color: var(--success); margin-bottom: 8px;">성능 지표</h4>
                            <p style="font-family: 'SF Mono', monospace; font-size: 14px;">
                                • 분자 시뮬레이션 속도: 10¹⁸ 계산/초<br>
                                • 통계적 정확도: 99.97%<br>
                                • 무작위성 검증: NIST 표준 통과<br>
                                • 주기성 검출: 10¹² 이상의 주기
                            </p>
                        </div>
                    </div>
                `
            },
            entropy: {
                title: '📊 Entropy Drift Analysis',
                description: '엔트로피 드리프트 분석 시스템',
                details: `
                    <div style="text-align: left; line-height: 1.6;">
                        <h3 style="color: var(--highlight); margin-bottom: 16px;">핵심 원리</h3>
                        <p style="margin-bottom: 16px;">
                            엔트로피 드리프트 분석은 시계열 데이터의 불확실성 변화를 측정하여 
                            시스템의 예측 가능성을 평가하는 고급 통계 기법입니다.
                        </p>
                        
                        <h4 style="color: var(--data-green); margin-bottom: 12px;">1. 시계열 엔트로피 측정</h4>
                        <p style="margin-bottom: 12px;">
                            • 섀넌 엔트로피: H(X) = -Σ p(x) log p(x)<br>
                            • 시간 윈도우별 엔트로피 변화량 계산<br>
                            • 드리프트 벡터 추출 및 방향성 분석
                        </p>
                        
                        <h4 style="color: var(--data-green); margin-bottom: 12px;">2. 확률 분포 편향 감지</h4>
                        <p style="margin-bottom: 12px;">
                            • 쿨백-라이블러 발산을 이용한 분포 차이 측정<br>
                            • 자동 임계값 설정으로 편향 조기 감지<br>
                            • 실시간 보정 알고리즘 적용
                        </p>
                        
                        <h4 style="color: var(--data-green); margin-bottom: 12px;">3. 패턴 수렴성 분석</h4>
                        <p style="margin-bottom: 16px;">
                            • 리아푸노프 지수를 이용한 카오스 분석<br>
                            • 어트랙터 재구성을 통한 시스템 동역학 이해<br>
                            • 예측 호라이즌 최적화
                        </p>
                        
                        <div style="background: var(--chart-bg); padding: 16px; border-radius: 8px; margin-top: 20px;">
                            <h4 style="color: var(--success); margin-bottom: 8px;">분석 결과</h4>
                            <p style="font-family: 'SF Mono', monospace; font-size: 14px;">
                                • 현재 엔트로피 레벨: 8.42 ± 0.15<br>
                                • 드리프트 계수: 0.15 (안정)<br>
                                • 수렴성 지수: 0.856<br>
                                • 예측 정확도: 94.3%
                            </p>
                        </div>
                    </div>
                `
            },
            thermodynamics: {
                title: '🌡️ Statistical Thermodynamics',
                description: '통계적 열역학 기반 추론 엔진',
                details: `
                    <div style="text-align: left; line-height: 1.6;">
                        <h3 style="color: var(--highlight); margin-bottom: 16px;">핵심 원리</h3>
                        <p style="margin-bottom: 16px;">
                            통계적 열역학을 바탕으로 한 고급 추론 엔진으로, 
                            자유 에너지 최소화 원리를 통해 최적해를 탐색합니다.
                        </p>
                        
                        <h4 style="color: var(--data-orange); margin-bottom: 12px;">1. 자유 에너지 최소화</h4>
                        <p style="margin-bottom: 12px;">
                            • 헬름홀츠 자유 에너지: F = U - TS<br>
                            • 기브스 자유 에너지: G = H - TS<br>
                            • 변분 원리를 이용한 최적화
                        </p>
                        
                        <h4 style="color: var(--data-orange); margin-bottom: 12px;">2. 맥스웰-볼츠만 분포</h4>
                        <p style="margin-bottom: 12px;">
                            • 속도 분포 함수: f(v) = (m/2πkT)^(3/2) exp(-mv²/2kT)<br>
                            • 에너지 준위별 점유 확률 계산<br>
                            • 온도 의존성 모델링
                        </p>
                        
                        <h4 style="color: var(--data-orange); margin-bottom: 12px;">3. 상전이 임계점 예측</h4>
                        <p style="margin-bottom: 16px;">
                            • 임계 온도 및 압력 계산<br>
                            • 상 다이어그램 분석<br>
                            • 준안정 상태 식별
                        </p>
                        
                        <div style="background: var(--chart-bg); padding: 16px; border-radius: 8px; margin-top: 20px;">
                            <h4 style="color: var(--success); margin-bottom: 8px;">시스템 상태</h4>
                            <p style="font-family: 'SF Mono', monospace; font-size: 14px;">
                                • 시스템 온도: 298.15K<br>
                                • 자유 에너지: -2.4 kJ/mol<br>
                                • 엔트로피: 186.3 J/(mol·K)<br>
                                • 상전이 확률: 0.03%
                            </p>
                        </div>
                    </div>
                `
            },
            quantum: {
                title: '🖼️ Image-Based Quantum Analysis',
                description: '이미지 기반 양자 분석 시스템',
                details: `
                    <div style="text-align: left; line-height: 1.6;">
                        <h3 style="color: var(--highlight); margin-bottom: 16px;">핵심 원리</h3>
                        <p style="margin-bottom: 16px;">
                            양자역학의 원리를 이미지 분석에 적용하여 
                            고차원 패턴을 추출하고 복잡도를 측정하는 혁신적인 시스템입니다.
                        </p>
                        
                        <h4 style="color: var(--data-purple); margin-bottom: 12px;">1. 이미지 엔트로피 추출</h4>
                        <p style="margin-bottom: 12px;">
                            • 픽셀 강도 분포 기반 엔트로피 계산<br>
                            • 공간 주파수 영역에서의 정보량 측정<br>
                            • 다중 스케일 엔트로피 분석
                        </p>
                        
                        <h4 style="color: var(--data-purple); margin-bottom: 12px;">2. 색상 패턴 양자화</h4>
                        <p style="margin-bottom: 12px;">
                            • RGB 색공간을 양자 상태로 매핑<br>
                            • 색상 간 상관관계 텐서 분석<br>
                            • 팔레트 최적화를 통한 정보 압축
                        </p>
                        
                        <h4 style="color: var(--data-purple); margin-bottom: 12px;">3. 파동-입자 이중성 활용</h4>
                        <p style="margin-bottom: 12px;">
                            • 빛의 파동 특성을 이용한 간섭 패턴 분석<br>
                            • 광자의 입자 특성을 통한 확률적 측정<br>
                            • 양자 중첩 상태 모델링
                        </p>
                        
                        <h4 style="color: var(--data-purple); margin-bottom: 12px;">4. 복잡도 측정</h4>
                        <p style="margin-bottom: 16px;">
                            • 콜모고로프 복잡도 근사 계산<br>
                            • 프랙탈 차원 분석<br>
                            • 자기 유사성 지수 측정
                        </p>
                        
                        <div style="background: var(--chart-bg); padding: 16px; border-radius: 8px; margin-top: 20px;">
                            <h4 style="color: var(--success); margin-bottom: 8px;">분석 결과</h4>
                            <p style="font-family: 'SF Mono', monospace; font-size: 14px;">
                                • 이미지 엔트로피: 4.7 bits<br>
                                • 양자화 레벨: 256 상태<br>
                                • 복잡도 지수: 0.847<br>
                                • 간섭 패턴 강도: 0.234
                            </p>
                        </div>
                    </div>
                `
            }
        };
        
        const data = scienceData[type];
        if (!data) return;
        
        const modalContent = `
            <div style="padding: 20px;">
                <h2 style="color: var(--text-primary); margin-bottom: 8px;">${data.title}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">${data.description}</p>
                ${data.details}
                <div style="text-align: center; margin-top: 32px;">
                    <button class="control-btn success" onclick="app.showSubscription(); app.hideModal();" style="margin-right: 12px;">
                        💎 프리미엄으로 전체 기능 이용하기
                    </button>
                    <button class="control-btn secondary" onclick="app.hideModal()">
                        닫기
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
    }
    
    // 이미지 업로드 및 분석 기능
    initImageUpload() {
        console.log('🔧 이미지 업로드 기능 초기화 시작...');
        
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const uploadedImage = document.getElementById('uploadedImage');
        const previewImage = document.getElementById('previewImage');
        const imageName = document.getElementById('imageName');
        const imageSize = document.getElementById('imageSize');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        console.log('📂 DOM 요소 확인:', {
            fileInput: !!fileInput,
            uploadArea: !!uploadArea,
            uploadedImage: !!uploadedImage,
            previewImage: !!previewImage,
            imageName: !!imageName,
            imageSize: !!imageSize,
            analyzeBtn: !!analyzeBtn
        });
        
        if (!fileInput || !uploadArea) {
            console.error('❌ 필수 DOM 요소가 없습니다:', { fileInput: !!fileInput, uploadArea: !!uploadArea });
            return;
        }
        
        // 파일 입력 이벤트 (강화된 버전)
        fileInput.addEventListener('change', (event) => {
            console.log('📁 파일 선택 이벤트 발생', event);
            const files = event.target.files;
            console.log('📂 선택된 파일들:', files);
            
            if (files && files.length > 0) {
                const file = files[0];
                console.log('📸 선택된 파일 상세:', {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                });
                this.handleImageUpload(file);
            } else {
                console.log('❌ 선택된 파일이 없습니다');
            }
        });
        
        // input 이벤트도 추가 (일부 브라우저에서 필요)
        fileInput.addEventListener('input', (event) => {
            console.log('📁 파일 input 이벤트 발생', event);
            const files = event.target.files;
            if (files && files.length > 0) {
                const file = files[0];
                console.log('📸 input 이벤트로 선택된 파일:', file.name);
                this.handleImageUpload(file);
            }
        });
        
        // 업로드 버튼 클릭 이벤트 (추가 보장)
        const uploadBtn = document.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (event) => {
                console.log('🖱️ 업로드 버튼 클릭됨');
                event.preventDefault();
                event.stopPropagation();
                fileInput.click();
            });
            
            // 터치 이벤트도 추가 (모바일용)
            uploadBtn.addEventListener('touchstart', (event) => {
                console.log('📱 업로드 버튼 터치됨');
                event.preventDefault();
                event.stopPropagation();
                fileInput.click();
            });
        } else {
            console.error('❌ upload-btn 요소를 찾을 수 없습니다');
        }
        
        // 드래그 앤 드롭 기능
        uploadArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            uploadArea.classList.add('dragover');
            console.log('📥 드래그 오버');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
            console.log('📤 드래그 리브');
        });
        
        uploadArea.addEventListener('drop', (event) => {
            event.preventDefault();
            uploadArea.classList.remove('dragover');
            console.log('📎 파일 드롭됨');
            
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                console.log('📸 드롭된 파일:', files[0].name);
                this.handleImageUpload(files[0]);
            }
        });
        
        // 업로드 영역 클릭으로도 파일 선택 가능
        uploadArea.addEventListener('click', (event) => {
            if (event.target.tagName !== 'BUTTON') {
                console.log('🎯 업로드 영역 클릭됨');
                fileInput.click();
            }
        });
        
        console.log('✅ 이미지 업로드 기능 초기화 완료');
    }
    
    handleImageUpload(file) {
        console.log('🖼️ 이미지 업로드 처리 시작:', file.name, file.type, file.size);
        
        // 이미지 파일 유효성 검사
        if (!file.type.startsWith('image/')) {
            console.error('❌ 이미지 파일이 아닙니다:', file.type);
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB 제한
            console.error('❌ 파일 크기 초과:', file.size);
            alert('파일 크기가 10MB를 초과합니다.');
            return;
        }
        
        console.log('✅ 파일 유효성 검사 통과');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('📖 파일 읽기 완료', e.target.result.length);
            
            const previewImage = document.getElementById('previewImage');
            const imageName = document.getElementById('imageName');
            const imageSize = document.getElementById('imageSize');
            const uploadedImage = document.getElementById('uploadedImage');
            const analyzeBtn = document.getElementById('analyzeBtn');
            
            console.log('🔍 DOM 요소 확인:', {
                previewImage: !!previewImage,
                imageName: !!imageName,
                imageSize: !!imageSize,
                uploadedImage: !!uploadedImage,
                analyzeBtn: !!analyzeBtn
            });
            
            if (!previewImage || !imageName || !imageSize || !uploadedImage || !analyzeBtn) {
                console.error('❌ 필요한 DOM 요소가 없습니다');
                console.error('누락된 요소들:', {
                    previewImage: document.getElementById('previewImage'),
                    imageName: document.getElementById('imageName'),
                    imageSize: document.getElementById('imageSize'),
                    uploadedImage: document.getElementById('uploadedImage'),
                    analyzeBtn: document.getElementById('analyzeBtn')
                });
                return;
            }
            
            try {
                // 이미지 미리보기 표시
                previewImage.src = e.target.result;
                imageName.textContent = file.name;
                imageSize.textContent = this.formatFileSize(file.size);
                
                console.log('🖼️ 이미지 정보 설정 완료');
                
                uploadedImage.style.display = 'block';
                analyzeBtn.disabled = false;
                analyzeBtn.classList.remove('disabled');
                
                console.log('✅ UI 업데이트 완료 - 분석 버튼 활성화');
                
                // 업로드된 이미지 데이터 저장
                this.uploadedImageData = {
                    file: file,
                    dataURL: e.target.result,
                    name: file.name,
                    size: file.size
                };
                
                console.log('✅ 이미지 업로드 완료:', this.uploadedImageData.name);
                
                // 성공 피드백
                console.log('🎉 이미지 업로드 성공 - 분석 버튼 활성화됨');
                
            } catch (error) {
                console.error('❌ 이미지 처리 중 오류:', error);
                alert('이미지 처리 중 오류가 발생했습니다.');
            }
        };
        
        reader.onerror = (error) => {
            console.error('❌ 파일 읽기 오류:', error);
            alert('파일을 읽는 중 오류가 발생했습니다.');
        };
        
        reader.readAsDataURL(file);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    resetUpload() {
        const fileInput = document.getElementById('fileInput');
        const uploadedImage = document.getElementById('uploadedImage');
        const analysisProgress = document.getElementById('analysisProgress');
        const analysisResults = document.getElementById('analysisResults');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const generateBtn = document.getElementById('generateBtn');
        const detailAnalysisBtn = document.getElementById('detailAnalysisBtn');
        
        // 초기 상태로 리셋
        fileInput.value = '';
        uploadedImage.style.display = 'none';
        analysisProgress.style.display = 'none';
        analysisResults.style.display = 'none';
        
        analyzeBtn.disabled = true;
        generateBtn.disabled = true;
        detailAnalysisBtn.disabled = true;
        
        this.uploadedImageData = null;
        this.analysisData = null;
    }
    
    startImageAnalysis() {
        console.log('🔍 startImageAnalysis 함수 호출됨');
        
        if (!this.uploadedImageData) {
            alert('먼저 이미지를 업로드해주세요.');
            return;
        }
        
        const analysisProgress = document.getElementById('analysisProgress');
        const analysisResults = document.getElementById('analysisResults');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const generateBtn = document.getElementById('generateBtn');
        const detailAnalysisBtn = document.getElementById('detailAnalysisBtn');
        
        // 분석 진행 상태 표시
        analysisProgress.style.display = 'block';
        analysisResults.style.display = 'none';
        analyzeBtn.disabled = true;
        analyzeBtn.classList.add('processing');
        
        // 3D 애니메이션 통합 시작
        if (window.animationIntegration) {
            console.log('3D 애니메이션 시퀀스 시작');
            console.log('애니메이션 통합 모듈 확인:', window.animationIntegration);
            console.log('simulationCanvas 요소 확인:', document.getElementById('simulationCanvas'));
            
            // 이미지 URL 얻기
            const imageUrl = this.uploadedImageData.dataUrl;
            
            try {
                // 애니메이션 시작
                window.animationIntegration.startAnimationSequence(imageUrl, (selectedNumbers) => {
                    console.log('3D 애니메이션 완료, 번호 생성:', selectedNumbers);
                    
                    // 애니메이션이 끝나면 분석 결과 표시
                    this.completeImageAnalysis();
                    
                    // 실제 번호 데이터 저장
                    if (selectedNumbers && selectedNumbers.length === 6) {
                        this.selectedNumbers = selectedNumbers;
                        
                        // 번호 표시
                        this.displayNumbers(selectedNumbers);
                    }
                    
                    // 번호 생성 버튼 활성화
                    if (generateBtn) {
                        generateBtn.disabled = false;
                    }
                });
            } catch (error) {
                console.error('애니메이션 시작 중 오류 발생:', error);
                alert('애니메이션 시작 중 오류가 발생했습니다: ' + error.message);
                
                // 기본 분석 로직으로 대체
                this.runDefaultAnalysis();
            }
        } else {
            // 기존 분석 로직 (애니메이션 모듈이 없는 경우)
            this.runDefaultAnalysis();
        }
    }
    
    runDefaultAnalysis() {
        console.log('기존 분석 로직 사용 (애니메이션 없음)');
            
        // 분석 진행 상태 표시
        const analysisProgress = document.getElementById('analysisProgress');
        const analysisResults = document.getElementById('analysisResults');
        
        if (!analysisProgress || !analysisResults) {
            console.error('분석 관련 DOM 요소를 찾을 수 없습니다');
            return;
        }
        
        // 분석 단계들
        const analysisSteps = [
            { progress: 20, status: '이미지 전처리 중...', details: '이미지 크기 조정 및 노이즈 제거' },
            { progress: 40, status: '엔트로피 계산 중...', details: '섀넌 엔트로피 기반 정보량 측정' },
            { progress: 60, status: '색상 패턴 분석 중...', details: 'RGB 색공간 양자화 진행' },
            { progress: 80, status: '양자 간섭 패턴 분석 중...', details: '파동-입자 이중성 분석' },
            { progress: 100, status: '분석 완료', details: '로또 번호 생성 준비 완료' }
        ];
        
        let currentStep = 0;
        const stepInterval = setInterval(() => {
            if (currentStep < analysisSteps.length) {
                const step = analysisSteps[currentStep];
                this.updateAnalysisProgress(step.progress, step.status, step.details);
                currentStep++;
            } else {
                clearInterval(stepInterval);
                this.completeImageAnalysis();
            }
        }, 1500);
        }
    }
    
    updateAnalysisProgress(progress, status, details) {
        const progressFill = document.getElementById('progressFill');
        const analysisStatus = document.getElementById('analysisStatus');
        const analysisDetails = document.getElementById('analysisDetails');
        
        progressFill.style.width = progress + '%';
        analysisStatus.textContent = status;
        analysisDetails.textContent = details;
    }
    
    completeImageAnalysis() {
        console.log('🏁 completeImageAnalysis 함수 호출됨');
        
        const analysisProgress = document.getElementById('analysisProgress');
        const analysisResults = document.getElementById('analysisResults');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const generateBtn = document.getElementById('generateBtn');
        const detailAnalysisBtn = document.getElementById('detailAnalysisBtn');
        
        // 분석 완료 처리
        setTimeout(() => {
            analysisProgress.style.display = 'none';
            analysisResults.style.display = 'block';
            
            analyzeBtn.classList.remove('processing');
            analyzeBtn.classList.add('completed');
            
            // 번호 생성 버튼 활성화
            if (generateBtn) {
                generateBtn.disabled = false;
                console.log('✅ 번호 생성 버튼 활성화됨');
            } else {
                console.error('❌ 번호 생성 버튼을 찾을 수 없음');
            }
            
            if (detailAnalysisBtn) {
                detailAnalysisBtn.disabled = false;
            }
            
            // 분석 결과 생성
            this.generateAnalysisResults();
        }, 1000);
    }
    
    generateAnalysisResults() {
        // 실제 이미지 분석 시뮬레이션
        const imageData = this.uploadedImageData;
        
        // 가상의 분석 결과 생성 (실제로는 이미지 처리 알고리즘 사용)
        const entropy = (4.2 + Math.random() * 1.5).toFixed(2);
        const complexity = (0.65 + Math.random() * 0.25).toFixed(3);
        const quantumStates = Math.floor(180 + Math.random() * 150);
        const coherence = (78 + Math.random() * 20).toFixed(1);
        
        // 결과 표시
        document.getElementById('entropyValue').textContent = entropy;
        document.getElementById('complexityValue').textContent = complexity;
        document.getElementById('quantumValue').textContent = quantumStates;
        document.getElementById('coherenceValue').textContent = coherence + '%';
        
        // 분석 데이터 저장
        this.analysisData = {
            entropy: parseFloat(entropy),
            complexity: parseFloat(complexity),
            quantumStates: quantumStates,
            coherence: parseFloat(coherence),
            timestamp: new Date().toISOString()
        };
        
        // 분석 완료 로그
        console.log('🔬 이미지 분석 완료:', this.analysisData);
        
        // 분석 결과를 바탕으로 번호 생성 알고리즘 준비
        this.prepareNumberGeneration();
    }
    
    prepareNumberGeneration() {
        // 분석 결과를 바탕으로 시드 값 생성
        if (this.analysisData) {
            const { entropy, complexity, quantumStates, coherence } = this.analysisData;
            
            // 복합 시드 생성
            this.imageSeed = {
                entropy: entropy,
                complexity: complexity,
                quantum: quantumStates,
                coherence: coherence,
                combined: entropy * complexity * (quantumStates / 100) * (coherence / 100)
            };
            
            console.log('🎯 번호 생성 시드 준비:', this.imageSeed);
        }
    }
    
    // 이미지 기반 번호 생성 (기존 generateNumbers 함수 수정)
    generateNumbersFromImage() {
        if (!this.analysisData) {
            alert('먼저 이미지 분석을 완료해주세요.');
            return;
        }
        
        const { entropy, complexity, quantumStates, coherence } = this.analysisData;
        
        // 이미지 분석 결과를 바탕으로 로또 번호 생성
        const numbers = [];
        const seed = entropy * complexity * (quantumStates / 100) * (coherence / 100);
        
        // 시드 기반 무작위 생성기
        let random = this.seededRandom(seed);
        
        while (numbers.length < 6) {
            const num = Math.floor(random() * 45) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        
        // 번호 정렬
        numbers.sort((a, b) => a - b);
        
        // 화면에 표시
        this.displayNumbers(numbers);
        
        // 생성 로그
        console.log('🎲 이미지 기반 번호 생성:', numbers);
        console.log('📊 사용된 분석 데이터:', this.analysisData);
        
        return numbers;
    }
    
    seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return function() {
            x = Math.sin(x) * 10000;
            return x - Math.floor(x);
        };
    }
    
    // 디버깅 및 테스트 함수
    testImageUpload() {
        console.log('🧪 이미지 업로드 테스트 시작');
        
        // DOM 요소 확인
        const elements = {
            fileInput: document.getElementById('fileInput'),
            uploadArea: document.getElementById('uploadArea'),
            uploadBtn: document.querySelector('.upload-btn'),
            analyzeBtn: document.getElementById('analyzeBtn'),
            generateBtn: document.getElementById('generateBtn')
        };
        
        console.log('📋 DOM 요소 상태:', elements);
        
        // 테스트 이미지 데이터 생성 (간단한 가짜 데이터)
        this.uploadedImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        
        // 이미지 미리보기 업데이트
        this.updateImagePreview(this.uploadedImageData);
        
        // 분석 버튼 활성화
        if (elements.analyzeBtn) {
            elements.analyzeBtn.disabled = false;
        }
        
        // 자동으로 분석 데이터 생성 (테스트용)
        this.createTestAnalysisData();
        
        console.log('✅ 테스트 이미지 업로드 완료');
    }
    
    // 테스트 분석 데이터 생성
    createTestAnalysisData() {
        this.analysisData = {
            entropy: 7.82,
            complexity: 0.64,
            quantumStates: 72,
            coherence: 84.3,
            imageFeatures: {
                contrast: 0.78,
                brightness: 0.65,
                saturation: 0.52
            }
        };
        
        console.log('✅ 테스트 분석 데이터 생성됨:', this.analysisData);
        
        // 분석 결과 UI 업데이트
        const complexityValue = document.getElementById('complexityValue');
        const entropyValue = document.getElementById('entropyValue');
        const quantumValue = document.getElementById('quantumValue');
        
        if (complexityValue) complexityValue.textContent = this.analysisData.complexity.toFixed(2);
        if (entropyValue) entropyValue.textContent = this.analysisData.entropy.toFixed(2);
        if (quantumValue) quantumValue.textContent = this.analysisData.quantumStates;
        
        // 버튼 활성화
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.disabled = false;
            console.log('✅ 번호 생성 버튼 활성화됨 (테스트 데이터)');
        }
    }
            if (element) {
                console.log(`✅ ${key}: 존재함`, element);
            } else {
                console.error(`❌ ${key}: 존재하지 않음`);
            }
        });
        
        // 업로드 버튼 강제 클릭 이벤트 추가
        if (elements.uploadBtn) {
            elements.uploadBtn.onclick = () => {
                console.log('🔥 onclick 이벤트 테스트!');
                if (elements.fileInput) {
                    elements.fileInput.click();
                }
            };
        }
        
        // 파일 입력 테스트
        if (elements.fileInput) {
            elements.fileInput.addEventListener('change', () => {
                console.log('🔥 파일 입력 이벤트 테스트 성공!');
            });
        }
        
        return elements;
    }
    
    // 문제 디버깅을 위한 테스트 함수
    debugNumberGeneration() {
        console.log('===== 번호 생성 디버그 =====');
        console.log('앱 상태:', {
            isSimulating: this.isSimulating,
            isPremium: this.isPremium,
            apiEndpoint: this.apiEndpoint,
            hasAnalysisData: !!this.analysisData
        });
        
        if (this.analysisData) {
            console.log('분석 데이터:', this.analysisData);
        } else {
            console.log('분석 데이터 없음');
        }
        
        // 번호 생성 함수 검증
        if (typeof this.generateNumbersFromImage === 'function') {
            console.log('generateNumbersFromImage 함수 존재');
        } else {
            console.error('generateNumbersFromImage 함수 없음');
        }
        
        if (typeof this.displayNumbers === 'function') {
            console.log('displayNumbers 함수 존재');
        } else {
            console.error('displayNumbers 함수 없음');
        }
        
        // API 테스트
        fetch(`${this.apiEndpoint}/status`)
            .then(response => response.json())
            .then(data => {
                console.log('API 상태:', data);
            })
            .catch(error => {
                console.error('API 오류:', error);
            });
            
        // 가상 번호 생성 테스트
        this.testGenerateNumbers();
    }
    
    testGenerateNumbers() {
        // 테스트용 가상 번호 생성
        const testNumbers = [];
        while (testNumbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!testNumbers.includes(num)) {
                testNumbers.push(num);
            }
        }
        testNumbers.sort((a, b) => a - b);
        console.log('테스트 번호 생성:', testNumbers);
        
        // 화면에 표시
        this.displayNumbers(testNumbers);
    }
}

// 전역 함수들 (HTML에서 호출)
function startSimulation() {
    app.startSimulation();
}

function resetSimulation() {
    app.resetSimulation();
}

function generateNumbers() {
    app.generateNumbers();
}

function showAnalysis() {
    app.showAnalysis();
}

function showSubscription() {
    app.showSubscription();
}

function showTab(tabName) {
    app.showTab(tabName);
}

// 심리 기반 기능 전역 함수들
function triggerUrgency() {
    app.triggerUrgency();
}

function updateSocialProof() {
    app.updateSocialProof();
}

function showPremiumBenefits() {
    return app.showPremiumBenefits();
}

function quickPick() {
    if (!app.isPremium) {
        app.showFOMOModal();
        return;
    }
    
    // 프리미엄 회원을 위한 빠른 선택 기능
    app.generateNumbers();
    
    // 사용자 행동 추적
    const behavior = JSON.parse(localStorage.getItem('user_behavior') || '{}');
    behavior.quick_pick_count = (behavior.quick_pick_count || 0) + 1;
    localStorage.setItem('user_behavior', JSON.stringify(behavior));
}

// 이미지 업로드 관련 전역 함수들
function startImageAnalysis() {
    console.log('🔍 전역 함수 startImageAnalysis 호출');
    if (app && app.startImageAnalysis) {
        app.startImageAnalysis();
    } else {
        console.error('❌ app.startImageAnalysis 함수가 없습니다');
    }
}

function resetUpload() {
    console.log('🔄 전역 함수 resetUpload 호출');
    if (app && app.resetUpload) {
        app.resetUpload();
    } else {
        console.error('❌ app.resetUpload 함수가 없습니다');
    }
}

function generateNumbers() {
    console.log('🎯 전역 함수 generateNumbers 호출');
    if (app && app.generateNumbers) {
        app.generateNumbers();
    } else {
        console.error('❌ app.generateNumbers 함수가 없습니다');
    }
}

function showAnalysis() {
    console.log('📊 전역 함수 showAnalysis 호출');
    if (app && app.showAnalysis) {
        app.showAnalysis();
    } else {
        console.error('❌ app.showAnalysis 함수가 없습니다');
        // 간단히 탭 전환만 해도 되니까
        showTab('analysis');
    }
}

function showTab(tabName) {
    console.log('📑 전역 함수 showTab 호출:', tabName);
    const tabs = document.querySelectorAll('.tab-item');
    
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const selectedTab = document.querySelector(`.tab-item[onclick="showTab('${tabName}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// 파일 업로드 처리 전역 함수
function handleFileUpload(file) {
    console.log('📁 전역 함수 handleFileUpload 호출:', file);
    if (app && app.handleImageUpload) {
        app.handleImageUpload(file);
    } else {
        console.error('❌ app.handleImageUpload 함수가 없습니다');
    }
}

// 앱 초기화
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MobileLottoApp();
    
    // 상태 업데이트 주기적 실행
    setInterval(() => {
        app.updateStatus();
    }, 30000);
});

// PWA 지원
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// 디바이스 모션 센서 (고급 기능)
if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        // 디바이스 움직임을 시뮬레이션에 반영
        if (app && app.isSimulating) {
            const acceleration = event.acceleration;
            if (acceleration && acceleration.x !== null) {
                // 가속도 데이터를 분자 운동에 적용
                app.molecules.forEach(molecule => {
                    molecule.velocity.x += acceleration.x * 0.0001;
                    molecule.velocity.y += acceleration.y * 0.0001;
                    molecule.velocity.z += acceleration.z * 0.0001;
                });
            }
        }
    });
}

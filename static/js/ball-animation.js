/**
 * Ball Animation Module
 * 로또볼 3D 애니메이션 처리 모듈
 */

// Three.js 로딩 상태 확인 및 대기 함수
function waitForThreeJS(callback, maxAttempts = 50) {
    let attempts = 0;
    
    function checkThree() {
        attempts++;
        
        if (typeof THREE !== 'undefined') {
            console.log('Three.js 로드 완료, 버전:', THREE.REVISION);
            callback(true);
            return;
        }
        
        if (attempts >= maxAttempts) {
            console.error('Three.js 로드 실패 - 최대 시도 횟수 초과');
            callback(false);
            return;
        }
        
        // 100ms 후 다시 시도
        setTimeout(checkThree, 100);
    }
    
    checkThree();
}

// 초기 THREE 객체 확인
if (typeof THREE === 'undefined') {
    console.warn('THREE 객체가 아직 로드되지 않았습니다. 로딩을 기다립니다...');
}

class BallAnimationManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.balls = [];
        this.selectedBall = null;
        this.animationPhase = 0; // 0: 초기화, 1: 클로즈업, 2: 360도 회전, 3: 분자 운동, 4: 결과 표시
        this.animationProgress = 0;
        this.selectedNumbers = [];
        this.isPlaying = false;
        this.canvas = null;
        this.container = null;
        this.animationId = null;
        
        // 사운드 관련 설정
        this.soundEnabled = true;
        this.useReverbByDefault = true;
        this.masterVolume = 0.5;
        
        // 물리 효과 관련
        this.gravity = -0.02;
        this.friction = 0.98;
        this.bounceForce = 0.8;
        
        // 사운드 시스템
        this.audioContext = null;
        this.soundEnabled = true;
        
        // 카메라 연출
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.cameraPosition = new THREE.Vector3(15, 10, 15);
        this.cameraShakeIntensity = 0;
        
        // 파티클 시스템
        this.particleSystems = [];
        
        // 환경 요소
        this.environment = {
            ground: null,
            walls: [],
            lighting: [],
            machine: null
        };
        this.containerId = null; // 컨테이너 ID 저장
        
        // 카메라 애니메이션 관련 변수
        this.cameraTarget = typeof THREE !== 'undefined' ? new THREE.Vector3(0, 0, 0) : null;
        this.cameraRadius = 20;
        this.cameraAngle = 0;
        
        // 공 색상 정의
        this.ballColors = [
            0xFFCC00, // 노란색 (1-10)
            0x3366FF, // 파란색 (11-20)
            0xFF3333, // 빨간색 (21-30)
            0x999999, // 회색 (31-40)
            0x33CC33  // 초록색 (41-45)
        ];
        
        // 전역 인스턴스 저장 (재초기화를 위해)
        window.ballAnimationManager = this;
        
        console.log('BallAnimationManager 생성됨');
    }
    
    init(containerId) {
        console.log('init 함수 호출됨:', containerId);
        
        // 컨테이너 ID 저장 (재초기화를 위해)
        this.containerId = containerId;
        
        // THREE 객체 확인 및 대기
        return new Promise((resolve) => {
            waitForThreeJS((success) => {
                if (!success) {
                    console.error('THREE 객체 로드 실패');
                    this.showErrorMessage('Three.js 라이브러리를 로드할 수 없습니다.');
                    resolve(false);
                    return;
                }
                
                this.container = document.getElementById(containerId);
                if (!this.container) {
                    console.error('애니메이션 컨테이너를 찾을 수 없습니다:', containerId);
                    resolve(false);
                    return;
                }
                
                console.log('컨테이너 찾음:', this.container);
                
                // 기존 캔버스 제거
                while (this.container.firstChild) {
                    this.container.removeChild(this.container.firstChild);
                }
                
                // 캔버스 생성
                this.canvas = document.createElement('canvas');
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                this.container.appendChild(this.canvas);
                
                try {
                    // Three.js 초기화
                    this.scene = new THREE.Scene();
                    this.scene.background = new THREE.Color(0x131722); // 배경색 설정
                    
                    // 카메라 설정
                    const width = this.container.clientWidth;
                    const height = this.container.clientHeight;
                    const aspect = width / height;
                    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
                    this.camera.position.set(0, 0, this.cameraRadius);
                    this.camera.lookAt(this.cameraTarget);
                    
                    // 렌더러 설정
                    this.renderer = new THREE.WebGLRenderer({
                        canvas: this.canvas,
                        antialias: true,
                        alpha: true
                    });
                    
                    // WebGL 지원 확인
                    if (!this.renderer) {
                        throw new Error('WebGL 렌더러를 생성할 수 없습니다. 브라우저가 WebGL을 지원하지 않을 수 있습니다.');
                    }
                    
                    this.renderer.setSize(width, height);
                    this.renderer.setPixelRatio(window.devicePixelRatio);
                    
                    // 조명 설정
                    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
                    this.scene.add(ambientLight);
                    
                    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                    directionalLight.position.set(5, 5, 5);
                    this.scene.add(directionalLight);
                    
                    const pointLight = new THREE.PointLight(0xffffff, 0.5);
                    pointLight.position.set(-5, -5, 5);
                    this.scene.add(pointLight);
                    
                    // 윈도우 리사이즈 이벤트 리스너
                    window.addEventListener('resize', this.handleResize.bind(this));
                    
                    // 간단한 테스트 렌더링 수행 (WebGL 오류 확인)
                    this.renderer.render(this.scene, this.camera);
                    
                    // 성공 메시지 표시
                    this.showSuccessMessage('3D 애니메이션 엔진 초기화 성공!');
                    
                    console.log('Three.js 초기화 성공');
                    resolve(true);
                    
                } catch (error) {
                    console.error('Three.js 초기화 오류:', error);
                    this.showErrorMessage(`WebGL 오류: ${error.message}`);
                    resolve(false);
                }
            });
        });
    }
    
    // 오류 메시지 표시
    showErrorMessage(message) {
        if (!this.container) return;
        
        // 기존 메시지 제거
        const existingMsg = this.container.querySelector('.status-message');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'status-message error-message';
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.background = 'rgba(255, 0, 0, 0.9)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.zIndex = '1000';
        errorDiv.style.maxWidth = '80%';
        errorDiv.innerHTML = `
            <h4 style="margin-top:0;">오류 발생</h4>
            <p>${message}</p>
            <button onclick="window.location.reload()" style="padding:8px 16px; background:#fff; border:none; color:#000; border-radius:4px; margin-top:10px; cursor:pointer;">
                페이지 새로고침
            </button>
        `;
        this.container.appendChild(errorDiv);
    }
    
    // 성공 메시지 표시
    showSuccessMessage(message) {
        if (!this.container) return;
        
        // 기존 메시지 제거
        const existingMsg = this.container.querySelector('.status-message');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        const successDiv = document.createElement('div');
        successDiv.className = 'status-message success-message';
        successDiv.style.position = 'absolute';
        successDiv.style.bottom = '10px';
        successDiv.style.right = '10px';
        successDiv.style.background = 'rgba(0, 255, 0, 0.9)';
        successDiv.style.color = 'white';
        successDiv.style.padding = '10px 15px';
        successDiv.style.borderRadius = '4px';
        successDiv.style.fontSize = '14px';
        successDiv.style.zIndex = '1000';
        successDiv.textContent = message;
        
        this.container.appendChild(successDiv);
        
        // 3초 후 자동으로 제거
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }
    
    // THREE 객체가 후에 로드되었을 때 재초기화 함수
    async reInitialize() {
        if (this.containerId) {
            console.log('애니메이션을 재초기화합니다.');
            return await this.init(this.containerId);
        }
        return false;
    }
    
    handleResize() {
        if (!this.camera || !this.renderer || !this.container) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    // 사용자 이미지에서 공 추출 (이미지 분석)
    processUserImage(imageUrl, callback) {
        // 실제로는 서버 API를 호출하여 이미지 분석 수행
        // 여기서는 데모용으로 임시 로직 구현
        
        console.log('이미지 처리 중:', imageUrl);
        
        // 로딩 메시지 표시
        this.showLoadingMessage('이미지에서 로또볼 감지 중...');
        
        // 분석 시뮬레이션 (실제로는 서버에서 처리)
        setTimeout(() => {
            // 분석 완료 후 애니메이션 시작
            this.prepareAnimation();
            
            if (callback && typeof callback === 'function') {
                callback(true);
            }
        }, 2000);
    }
    
    showLoadingMessage(message) {
        // 로딩 메시지 표시 로직
        const loadingElement = document.createElement('div');
        loadingElement.id = 'animation-loading';
        loadingElement.className = 'animation-loading';
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        
        // 기존 로딩 메시지 제거
        const existingLoading = document.getElementById('animation-loading');
        if (existingLoading) {
            existingLoading.remove();
        }
        
        this.container.appendChild(loadingElement);
    }
    
    hideLoadingMessage() {
        const loadingElement = document.getElementById('animation-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    // 애니메이션 준비
    prepareAnimation() {
        this.hideLoadingMessage();
        this.resetScene();
        
        // 선택된 번호 생성 (실제로는 서버에서 받아옴)
        this.selectedNumbers = [];
        while (this.selectedNumbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!this.selectedNumbers.includes(num)) {
                this.selectedNumbers.push(num);
            }
        }
        this.selectedNumbers.sort((a, b) => a - b);
        
        console.log('선택된 번호:', this.selectedNumbers);
        
        // 첫 번째 클로즈업 공 생성 (분석된 이미지에서 추출한 공)
        this.createFocusBall();
        
        // 애니메이션 시작
        this.animationPhase = 1;
        this.animationProgress = 0;
        this.isPlaying = true;
        
        // 애니메이션 루프 시작
        if (!this.animationId) {
            this.animate();
        }
    }
    
    resetScene() {
        // 기존 공 제거
        this.balls.forEach(ball => {
            this.scene.remove(ball.mesh);
        });
        this.balls = [];
        
        if (this.selectedBall) {
            this.scene.remove(this.selectedBall.mesh);
            this.selectedBall = null;
        }
        
        // 카메라 초기화
        this.camera.position.set(0, 0, this.cameraRadius);
        this.camera.lookAt(this.cameraTarget);
        this.cameraAngle = 0;
    }
    
    createFocusBall() {
        // 메인 공 생성 (클로즈업 대상)
        const geometry = new THREE.SphereGeometry(3, 32, 32);
        
        // 공 텍스처 생성 (실제로는 업로드된 이미지에서 추출)
        const texture = this.createBallTexture(Math.floor(Math.random() * 45) + 1);
        
        const material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 80,
            specular: 0x333333
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);
        
        this.selectedBall = {
            mesh: mesh,
            velocity: new THREE.Vector3(0, 0, 0),
            number: this.selectedNumbers[0] // 첫 번째 선택된 번호
        };
        
        this.scene.add(mesh);
    }
    
    createBallTexture(number) {
        // 실제 로또볼과 동일한 텍스처 생성
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        const centerX = 256;
        const centerY = 256;
        const radius = 240;
        
        // 실제 로또볼 색상 정의 (공식 로또 색상)
        const ballColors = {
            yellow: { bg: '#FFD700', shadow: '#B8860B', text: '#000000' }, // 1-10
            blue: { bg: '#4169E1', shadow: '#191970', text: '#FFFFFF' },   // 11-20
            red: { bg: '#DC143C', shadow: '#8B0000', text: '#FFFFFF' },    // 21-30
            gray: { bg: '#708090', shadow: '#2F4F4F', text: '#FFFFFF' },   // 31-40
            green: { bg: '#32CD32', shadow: '#006400', text: '#FFFFFF' }   // 41-45
        };
        
        // 번호 범위에 따른 색상 선택
        let colorScheme;
        if (number <= 10) colorScheme = ballColors.yellow;
        else if (number <= 20) colorScheme = ballColors.blue;
        else if (number <= 30) colorScheme = ballColors.red;
        else if (number <= 40) colorScheme = ballColors.gray;
        else colorScheme = ballColors.green;
        
        // 배경 그라데이션 (구형 효과)
        const mainGradient = context.createRadialGradient(
            centerX - 60, centerY - 60, 0,
            centerX, centerY, radius
        );
        mainGradient.addColorStop(0, '#FFFFFF');
        mainGradient.addColorStop(0.3, colorScheme.bg);
        mainGradient.addColorStop(0.8, colorScheme.shadow);
        mainGradient.addColorStop(1, '#000000');
        
        // 메인 원 그리기
        context.fillStyle = mainGradient;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fill();
        
        // 하이라이트 효과 (광택)
        const highlightGradient = context.createRadialGradient(
            centerX - 80, centerY - 80, 0,
            centerX - 80, centerY - 80, 120
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = highlightGradient;
        context.beginPath();
        context.arc(centerX - 80, centerY - 80, 120, 0, Math.PI * 2);
        context.fill();
        
        // 그림자 효과
        const shadowGradient = context.createRadialGradient(
            centerX + 60, centerY + 60, 0,
            centerX + 60, centerY + 60, 100
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        context.fillStyle = shadowGradient;
        context.beginPath();
        context.arc(centerX + 60, centerY + 60, 100, 0, Math.PI * 2);
        context.fill();
        
        // 번호 텍스트 그리기
        context.save();
        
        // 텍스트 그림자
        context.shadowColor = 'rgba(0, 0, 0, 0.5)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        
        // 메인 텍스트
        context.fillStyle = colorScheme.text;
        context.font = 'bold 140px "Arial Black", Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 텍스트 아웃라인
        context.strokeStyle = colorScheme.text === '#FFFFFF' ? '#000000' : '#FFFFFF';
        context.lineWidth = 4;
        context.strokeText(number.toString(), centerX, centerY);
        
        // 실제 텍스트
        context.fillText(number.toString(), centerX, centerY);
        
        context.restore();
        
        // 테두리 효과
        context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        context.lineWidth = 3;
        context.beginPath();
        context.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
        context.stroke();
        
        // 추가 광택 효과 (작은 하이라이트)
        const smallHighlight = context.createRadialGradient(
            centerX - 100, centerY - 120, 0,
            centerX - 100, centerY - 120, 40
        );
        smallHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        smallHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = smallHighlight;
        context.beginPath();
        context.arc(centerX - 100, centerY - 120, 40, 0, Math.PI * 2);
        context.fill();
        
        // 캔버스를 텍스처로 변환
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        return texture;
    }
    
    // 색상 밝게 하기
    lightenColor(hex, percent) {
        const num = parseInt(hex.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const r = Math.min(255, (num >> 16) + amt);
        const g = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const b = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    }
    
    // 색상 어둡게 하기
    darkenColor(hex, percent) {
        const num = parseInt(hex.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const r = Math.max(0, (num >> 16) - amt);
        const g = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const b = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    }
    
    // 모든 로또볼 생성 (분자 운동용)
    createAllBalls() {
        // 기존 클로즈업 공 제거
        if (this.selectedBall) {
            this.scene.remove(this.selectedBall.mesh);
            this.selectedBall = null;
        }
        
        // 환경 생성 (바닥, 벽, 조명 등)
        this.createEnvironment();
        
        // 사운드 시스템 초기화
        this.initAudioSystem();
        
        // 45개 공 생성
        for (let i = 1; i <= 45; i++) {
            const geometry = new THREE.SphereGeometry(1, 32, 32);
            const texture = this.createBallTexture(i);
            
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                shininess: 100,
                specular: 0x666666,
                reflectivity: 0.3
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // 무작위 위치 (구체 내부에 랜덤하게 배치)
            const radius = Math.random() * 8 + 4; // 4-12 범위
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
            mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
            mesh.position.z = radius * Math.cos(phi);
            
            // 향상된 물리 속성
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            
            const angularVelocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            );
            
            const isSelected = this.selectedNumbers.includes(i);
            
            this.balls.push({
                mesh: mesh,
                velocity: velocity,
                angularVelocity: angularVelocity,
                number: i,
                isSelected: isSelected,
                mass: 1.0,
                restitution: this.bounceForce,
                lastCollisionTime: 0,
                energy: velocity.length()
            });
            
            this.scene.add(mesh);
        }
        
        // 카메라 흔들림 시작
        this.shakeCamera(0.3);
    }
    
    // 실제 로또 시뮬레이션 시작
    startLottoSimulation() {
        if (!this.scene || !this.renderer) {
            console.error('애니메이션이 초기화되지 않았습니다.');
            return false;
        }
        
        // 기존 씬 리셋
        this.resetScene();
        
        // 로또 시뮬레이션 단계별 실행
        this.showLoadingMessage('로또 시뮬레이션 시작 중...');
        
        setTimeout(() => {
            this.createLottoMachine();
            this.hideLoadingMessage();
            this.startBallSelection();
        }, 1000);
        
        return true;
    }
    
    // 로또 머신 생성 (구체형 공간)
    createLottoMachine() {
        // 투명한 구체 경계 생성 (시각적 가이드)
        const sphereGeometry = new THREE.SphereGeometry(12, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            wireframe: true,
            opacity: 0.3,
            transparent: true
        });
        
        const sphereBoundary = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(sphereBoundary);
        
        // 45개의 로또볼 생성
        this.createAllBalls();
        
        // 카메라를 약간 위에서 내려다보는 각도로 설정
        this.camera.position.set(15, 8, 15);
        this.camera.lookAt(0, 0, 0);
        
        console.log('로또 머신 생성 완료 - 45개 공 생성됨');
    }
    
    // 공 선택 애니메이션 시작
    startBallSelection() {
        // 기계 시작 사운드
        this.playMachineSound();
        
        this.animationPhase = 3; // 분자 운동 단계
        this.animationProgress = 0;
        this.isPlaying = true;
        this.selectionStep = 0; // 현재 선택 단계 (0-5)
        this.selectedBalls = []; // 선택된 공들
        
        // 공들이 굴러다니는 사운드
        this.playRollingSound(3000);
        
        // 애니메이션 루프 시작
        if (!this.animationId) {
            this.animate();
        }
        
        // 첫 번째 공 선택 시작
        setTimeout(() => {
            this.selectNextBall();
        }, 3000); // 3초 후 첫 번째 공 선택
    }
    
    // 다음 공 선택
    selectNextBall() {
        if (this.selectionStep >= 6) {
            // 모든 공 선택 완료
            this.updateProgress(6, 6, '선택 완료');
            this.completeSelection();
            return;
        }
        
        // 진행 상황 업데이트
        this.updateProgress(this.selectionStep + 1, 6, `${this.selectionStep + 1}번째 공 선택 중`);
        
        // 아직 선택되지 않은 공 중에서 무작위 선택
        const availableBalls = this.balls.filter(ball => !ball.isSelected);
        if (availableBalls.length === 0) {
            this.completeSelection();
            return;
        }
        
        const selectedBall = availableBalls[Math.floor(Math.random() * availableBalls.length)];
        selectedBall.isSelected = true;
        selectedBall.selectionOrder = this.selectionStep + 1;
        
        // 선택된 공 하이라이트 효과
        this.highlightSelectedBall(selectedBall);
        
        // 선택된 번호를 배열에 추가
        this.selectedNumbers.push(selectedBall.number);
        this.selectedBalls.push(selectedBall);
        
        console.log(`${this.selectionStep + 1}번째 공 선택: ${selectedBall.number}`);
        
        this.selectionStep++;
        
        // 다음 공 선택 (2초 간격)
        setTimeout(() => {
            this.selectNextBall();
        }, 2000);
    }
    
    // 선택된 공 하이라이트
    highlightSelectedBall(ball) {
        // 공 선택 사운드 재생
        this.playBallSelectSound();
        
        // 화려한 파티클 효과
        this.createParticleSystem(ball.mesh.position.clone(), 0xffd700, 100);
        
        // 카메라를 선택된 공에 집중
        this.setCameraTarget(ball.mesh.position.x, ball.mesh.position.y, ball.mesh.position.z);
        this.setCameraPosition(
            ball.mesh.position.x + 5,
            ball.mesh.position.y + 3,
            ball.mesh.position.z + 5
        );
        
        // 카메라 흔들림 효과
        this.shakeCamera(0.8);
        
        // 공 크기 확대 및 발광 효과
        ball.mesh.scale.set(1.8, 1.8, 1.8);
        ball.mesh.material.emissive.setHex(0x666600);
        
        // 회전 효과 추가
        ball.rotationSpeed = 0.2;
        
        // 선택된 공을 중앙 하단으로 이동
        const targetPosition = this.getSelectedBallPosition(ball.selectionOrder);
        
        // 곡선 경로로 부드러운 이동 애니메이션
        this.animateToPositionWithCurve(ball, targetPosition, 2000);
        
        // 반짝이는 효과
        this.addSparkleEffect(ball);
        
        // 선택 완료 후 카메라를 전체 뷰로 복귀
        setTimeout(() => {
            this.setCameraTarget(0, 0, 0);
            this.setCameraPosition(15, 8, 15);
        }, 1500);
    }
    
    // 곡선 경로로 공 이동
    animateToPositionWithCurve(ball, targetPosition, duration) {
        const startPosition = {
            x: ball.mesh.position.x,
            y: ball.mesh.position.y,
            z: ball.mesh.position.z
        };
        
        // 곡선 경로를 위한 제어점 생성
        const controlPoint = {
            x: (startPosition.x + targetPosition.x) / 2,
            y: Math.max(startPosition.y, targetPosition.y) + 8, // 위로 올라갔다가 내려옴
            z: (startPosition.z + targetPosition.z) / 2
        };
        
        const startTime = Date.now();
        
        const moveAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeInOutCubic 이징 함수
            const easeProgress = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            // 베지어 곡선으로 위치 계산
            const t = easeProgress;
            const oneMinusT = 1 - t;
            
            ball.mesh.position.x = oneMinusT * oneMinusT * startPosition.x + 
                                   2 * oneMinusT * t * controlPoint.x + 
                                   t * t * targetPosition.x;
            ball.mesh.position.y = oneMinusT * oneMinusT * startPosition.y + 
                                   2 * oneMinusT * t * controlPoint.y + 
                                   t * t * targetPosition.y;
            ball.mesh.position.z = oneMinusT * oneMinusT * startPosition.z + 
                                   2 * oneMinusT * t * controlPoint.z + 
                                   t * t * targetPosition.z;
            
            // 공 회전
            if (ball.rotationSpeed) {
                ball.mesh.rotation.x += ball.rotationSpeed;
                ball.mesh.rotation.y += ball.rotationSpeed * 0.7;
                ball.mesh.rotation.z += ball.rotationSpeed * 0.3;
            }
            
            if (progress < 1) {
                requestAnimationFrame(moveAnimation);
            } else {
                // 애니메이션 완료
                ball.rotationSpeed = 0;
                ball.mesh.scale.set(1.2, 1.2, 1.2); // 최종 크기로 조정
            }
        };
        
        moveAnimation();
    }
    
    // 선택된 공의 목표 위치 계산
    getSelectedBallPosition(order) {
        const spacing = 3;
        const startX = -7.5; // 6개 공을 중앙 정렬
        
        return {
            x: startX + (order - 1) * spacing,
            y: -8,
            z: 5
        };
    }
    
    // 공을 특정 위치로 부드럽게 이동
    animateToPosition(ball, targetPosition, duration) {
        const startPosition = {
            x: ball.mesh.position.x,
            y: ball.mesh.position.y,
            z: ball.mesh.position.z
        };
        
        const startTime = Date.now();
        
        const moveAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeOutCubic 이징 함수
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            ball.mesh.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeProgress;
            ball.mesh.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeProgress;
            ball.mesh.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(moveAnimation);
            }
        };
        
        moveAnimation();
    }
    
    // 반짝이는 효과 추가
    addSparkleEffect(ball) {
        // 파티클 시스템 생성
        const particleCount = 20;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = ball.mesh.position.x + (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = ball.mesh.position.y + (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = ball.mesh.position.z + (Math.random() - 0.5) * 4;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        // 파티클 페이드아웃 애니메이션
        let opacity = 0.8;
        const fadeOut = () => {
            opacity -= 0.02;
            particleMaterial.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                this.scene.remove(particleSystem);
            }
        };
        
        fadeOut();
    }
    
    // 선택 완료
    completeSelection() {
        this.animationPhase = 4; // 결과 표시 단계
        this.animationProgress = 0;
        
        // 승리 사운드 재생
        this.playWinSound();
        
        // 선택된 번호들을 정렬
        this.selectedNumbers.sort((a, b) => a - b);
        
        // 화려한 승리 파티클 효과
        this.selectedBalls.forEach((ball, index) => {
            setTimeout(() => {
                this.createParticleSystem(ball.mesh.position.clone(), 0xffd700, 200);
                this.shakeCamera(0.3);
                
                // 공 크기 조절 애니메이션
                let scale = 1.2;
                const scaleAnimation = () => {
                    scale = 1.2 + 0.3 * Math.sin(Date.now() * 0.01);
                    ball.mesh.scale.set(scale, scale, scale);
                    requestAnimationFrame(scaleAnimation);
                };
                scaleAnimation();
                
                // 무지개 색상 효과
                const hue = (index * 60) % 360;
                ball.mesh.material.emissive.setHSL(hue / 360, 0.5, 0.3);
                
            }, index * 200); // 순차적으로 효과 실행
        });
        
        // 배경 조명 효과
        setTimeout(() => {
            const colorCycle = () => {
                const time = Date.now() * 0.005;
                this.scene.background = new THREE.Color().setHSL(Math.sin(time) * 0.5 + 0.5, 0.3, 0.1);
                requestAnimationFrame(colorCycle);
            };
            colorCycle();
        }, 1000);
        
        // 선택되지 않은 공들 서서히 사라지게
        this.balls.forEach(ball => {
            if (!ball.isSelected) {
                setTimeout(() => {
                    let opacity = 1.0;
                    const fadeOut = () => {
                        opacity -= 0.02;
                        ball.mesh.material.opacity = Math.max(opacity, 0);
                        ball.mesh.material.transparent = true;
                        
                        if (opacity > 0) {
                            requestAnimationFrame(fadeOut);
                        } else {
                            ball.mesh.visible = false;
                        }
                    };
                    fadeOut();
                }, Math.random() * 2000);
            }
        });
        
        // 카메라 회전 연출
        let cameraAngle = 0;
        const cameraRotation = () => {
            cameraAngle += 0.01;
            const radius = 20;
            this.camera.position.x = radius * Math.cos(cameraAngle);
            this.camera.position.z = radius * Math.sin(cameraAngle);
            this.camera.position.y = -3 + 3 * Math.sin(cameraAngle * 0.5);
            this.camera.lookAt(0, -8, 5);
            requestAnimationFrame(cameraRotation);
        };
        setTimeout(cameraRotation, 2000);
        
        // 완료 메시지 표시
        setTimeout(() => {
            this.showSuccessMessage(`🎉 로또 번호 선택 완료! 🎉\n당첨 번호: ${this.selectedNumbers.join(', ')}`);
        }, 2000);
        
        console.log('로또 시뮬레이션 완료:', this.selectedNumbers);
        
        // 콜백 함수 호출 (외부에서 결과를 받을 수 있도록)
        if (this.onSelectionComplete) {
            setTimeout(() => {
                this.onSelectionComplete(this.selectedNumbers);
            }, 3000);
        }
    }
    
    // 콜백 함수 설정
    setSelectionCompleteCallback(callback) {
        this.onSelectionComplete = callback;
   }
    
    // 진행 상황 콜백 설정
    setProgressCallback(callback) {
        this.onProgress = callback;
    }
    
    // 진행 상황 업데이트
    updateProgress(step, total, message) {
        if (this.onProgress) {
            this.onProgress(step, total, message);
        }
    }
    
    // 사운드 시스템 초기화
    initAudioSystem() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 마스터 볼륨 노드 생성
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.connect(this.audioContext.destination);
            this.masterGainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            
            // 컨볼버 리버브 노드 생성 (공간감)
            this.reverbNode = this.audioContext.createConvolver();
            this.createImpulseResponse();
            
            // 환경음 초기화
            this.createAmbientSound();
            
            console.log('고급 사운드 시스템 초기화 완료');
        } catch (error) {
            console.warn('사운드 시스템 초기화 실패:', error);
            this.soundEnabled = false;
        }
    }
    
    // 임펄스 응답 생성 (리버브 효과)
    createImpulseResponse() {
        const length = this.audioContext.sampleRate * 2; // 2초 리버브
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.1;
            }
        }
        
        this.reverbNode.buffer = impulse;
        this.reverbNode.connect(this.masterGainNode);
    }
    
    // 환경음 생성
    createAmbientSound() {
        if (!this.soundEnabled) return;
        
        this.ambientGainNode = this.audioContext.createGain();
        this.ambientGainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        this.ambientGainNode.connect(this.masterGainNode);
        
        // 미묘한 환경음 (공기 흐름 시뮬레이션)
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 4, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        this.ambientSource = this.audioContext.createBufferSource();
        this.ambientSource.buffer = noiseBuffer;
        this.ambientSource.loop = true;
        
        // 로우패스 필터로 부드럽게
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        this.ambientSource.connect(filter);
        filter.connect(this.ambientGainNode);
        this.ambientSource.start();
    }
    
    // 고급 사운드 생성 및 재생
    playSound(frequency = 440, duration = 0.1, volume = 0.1, type = 'sine', useReverb = null) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // useReverb가 명시되지 않으면 기본값 사용
        if (useReverb === null) {
            useReverb = this.useReverbByDefault;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            // 오디오 체인 구성
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            
            if (useReverb) {
                gainNode.connect(this.reverbNode);
            } else {
                gainNode.connect(this.masterGainNode);
            }
            
            // 오실레이터 설정
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // 필터 설정 (더 자연스러운 소리)
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);
            
            // 볼륨 엔벨로프 (ADSR) - 마스터 볼륨 적용
            const finalVolume = volume * this.masterVolume;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(finalVolume, this.audioContext.currentTime + 0.01); // Attack
            gainNode.gain.linearRampToValueAtTime(finalVolume * 0.7, this.audioContext.currentTime + 0.05); // Decay
            gainNode.gain.setValueAtTime(finalVolume * 0.7, this.audioContext.currentTime + duration * 0.8); // Sustain
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration); // Release
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('사운드 재생 오류:', error);
        }
    }
    
    // 현실적인 공 튀김 사운드
    playBallBounceSound(intensity = 1) {
        if (!this.soundEnabled) return;
        
        const baseFreq = 150 + Math.random() * 100;
        const volume = Math.min(0.15 * intensity, 0.25);
        
        // 메인 임팩트 사운드
        this.playSound(baseFreq, 0.1, volume, 'square', true);
        
        // 하모닉 오버톤
        setTimeout(() => {
            this.playSound(baseFreq * 1.5, 0.08, volume * 0.6, 'sine', true);
        }, 10);
        
        // 미묘한 금속성 울림
        setTimeout(() => {
            this.playSound(baseFreq * 3, 0.15, volume * 0.3, 'triangle', true);
        }, 20);
        
        // 바닥 공명
        if (intensity > 0.7) {
            setTimeout(() => {
                this.playSound(80 + Math.random() * 40, 0.2, volume * 0.4, 'sine', true);
            }, 30);
        }
    }
    
    // 매혹적인 공 선택 사운드
    playBallSelectSound() {
        if (!this.soundEnabled) return;
        
        // 마법적인 초인종 소리
        const notes = [659, 784, 988, 1175]; // E, G, B, D
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playSound(note, 0.6, 0.15, 'sine', true);
            }, index * 80);
        });
        
        // 반짝임 효과
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.playSound(1500 + Math.random() * 500, 0.1, 0.1, 'sine', true);
                }, i * 40);
            }
        }, 300);
    }
    
    // 웅장한 승리 사운드
    playWinSound() {
        if (!this.soundEnabled) return;
        
        // 팡파르 멜로디
        const fanfare = [
            {note: 523, duration: 0.3}, // C
            {note: 659, duration: 0.3}, // E
            {note: 784, duration: 0.3}, // G
            {note: 1047, duration: 0.6}, // C (옥타브)
            {note: 1175, duration: 0.4}, // D
            {note: 1047, duration: 0.8}  // C (마무리)
        ];
        
        let currentTime = 0;
        fanfare.forEach((tone, index) => {
            setTimeout(() => {
                this.playSound(tone.note, tone.duration, 0.2, 'sine', true);
                // 하모니 추가
                this.playSound(tone.note * 1.25, tone.duration, 0.15, 'triangle', true);
            }, currentTime);
            currentTime += tone.duration * 200;
        });
        
        // 드럼롤 효과
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.playSound(80, 0.05, 0.3, 'square', false);
            }, i * 100);
        }
        
        // 심벌 크래시
        setTimeout(() => {
            this.createNoiseSound(0.5, 0.25);
        }, 1000);
    }
    
    // 기계 작동 사운드
    playMachineSound() {
        if (!this.soundEnabled) return;
        
        // 모터 소리
        const motorDuration = 2000;
        const motorGain = this.audioContext.createGain();
        motorGain.connect(this.masterGainNode);
        motorGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        motorGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.5);
        motorGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + motorDuration / 1000);
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.playSound(120 + Math.random() * 20, 0.1, 0.08, 'sawtooth', false);
            }, i * 100);
        }
    }
    
    // 공 굴리는 소리
    playRollingSound(duration = 1000) {
        if (!this.soundEnabled) return;
        
        const rollingGain = this.audioContext.createGain();
        rollingGain.connect(this.masterGainNode);
        rollingGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        rollingGain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.1);
        rollingGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
        
        const intervals = duration / 50;
        for (let i = 0; i < intervals; i++) {
            setTimeout(() => {
                this.playSound(200 + Math.random() * 100, 0.05, 0.03, 'square', false);
            }, i * 50);
        }
    }
    
    // 노이즈 사운드 생성 (심벌, 바람 등)
    createNoiseSound(duration, volume) {
        if (!this.soundEnabled) return;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        
        noiseSource.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.reverbNode);
        
        noiseSource.start();
        noiseSource.stop(this.audioContext.currentTime + duration);
    }
    
    // 볼륨 조절
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume)); // 0-1 범위로 제한
        
        if (this.masterGainNode) {
            this.masterGainNode.gain.setValueAtTime(
                this.masterVolume, 
                this.audioContext.currentTime
            );
        }
    }
    
    // 사운드 정지
    stopAllSounds() {
        if (this.ambientSource) {
            this.ambientSource.stop();
        }
    }
    
    // 환경 구성 (바닥, 벽, 로또 기계)
    createEnvironment() {
        // 바닥 생성
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2a3f5f,
            transparent: true,
            opacity: 0.7
        });
        this.environment.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.environment.ground.rotation.x = -Math.PI / 2;
        this.environment.ground.position.y = -8;
        this.scene.add(this.environment.ground);
        
        // 로또 기계 틀 생성 (투명한 구형 컨테이너)
        const machineGeometry = new THREE.SphereGeometry(12, 32, 16);
        const machineMaterial = new THREE.MeshPhongMaterial({
            color: 0x4444ff,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        this.environment.machine = new THREE.Mesh(machineGeometry, machineMaterial);
        this.scene.add(this.environment.machine);
        
        // 향상된 조명 설정
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 10, 5);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        const fillLight = new THREE.PointLight(0x4444ff, 0.5);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        const rimLight = new THREE.PointLight(0xffff44, 0.3);
        rimLight.position.set(0, -5, 10);
        this.scene.add(rimLight);
    }
    
    // 파티클 시스템 생성
    createParticleSystem(position, color = 0xffffff, count = 50) {
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;
            
            velocities.push({
                x: (Math.random() - 0.5) * 0.2,
                y: Math.random() * 0.3,
                z: (Math.random() - 0.5) * 0.2
            });
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        this.particleSystems.push({
            system: particleSystem,
            velocities: velocities,
            life: 1.0,
            maxLife: 1.0
        });
        
        return particleSystem;
    }
    
    // 파티클 업데이트
    updateParticles() {
        this.particleSystems.forEach((particleData, index) => {
            const positions = particleData.system.geometry.attributes.position.array;
            
            for (let i = 0; i < particleData.velocities.length; i++) {
                positions[i * 3] += particleData.velocities[i].x;
                positions[i * 3 + 1] += particleData.velocities[i].y;
                positions[i * 3 + 2] += particleData.velocities[i].z;
                
                // 중력 적용
                particleData.velocities[i].y += this.gravity * 0.5;
                
                // 마찰 적용
                particleData.velocities[i].x *= this.friction;
                particleData.velocities[i].z *= this.friction;
            }
            
            particleData.system.geometry.attributes.position.needsUpdate = true;
            
            // 파티클 수명 감소
            particleData.life -= 0.02;
            particleData.system.material.opacity = particleData.life;
            
            // 수명이 다한 파티클 제거
            if (particleData.life <= 0) {
                this.scene.remove(particleData.system);
                this.particleSystems.splice(index, 1);
            }
        });
    }
    
    // 카메라 연출 및 흔들림 효과
    updateCamera() {
        // 카메라 흔들림 효과
        if (this.cameraShakeIntensity > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
            this.cameraShakeIntensity *= 0.95; // 점진적으로 흔들림 감소
        }
        
        // 부드러운 카메라 이동
        this.camera.position.lerp(this.cameraPosition, 0.05);
        this.camera.lookAt(this.cameraTarget);
    }
    
    // 카메라 흔들림 트리거
    shakeCamera(intensity = 0.5) {
        this.cameraShakeIntensity = intensity;
    }
    
    // 동적 카메라 위치 설정
    setCameraPosition(x, y, z, smooth = true) {
        if (smooth) {
            this.cameraPosition.set(x, y, z);
        } else {
            this.camera.position.set(x, y, z);
        }
    }
    
    // 카메라 타겟 설정
    setCameraTarget(x, y, z) {
        this.cameraTarget.set(x, y, z);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        if (!this.isPlaying) return;
        
        // 물리 시뮬레이션 업데이트
        this.updatePhysics();
        
        // 파티클 시스템 업데이트
        this.updateParticles();
        
        // 카메라 업데이트
        this.updateCamera();
        
        // 현재 애니메이션 단계에 따라 다른 업데이트 함수 호출
        switch(this.animationPhase) {
            case 1: // 클로즈업 단계
                this.updateCloseupPhase();
                break;
            case 2: // 360도 회전 단계
                this.update360Phase();
                break;
            case 3: // 분자 운동 단계
                this.updateMolecularPhase();
                break;
            case 4: // 결과 표시 단계
                this.updateResultPhase();
                break;
        }
        
        // 렌더링
        this.renderer.render(this.scene, this.camera);
    }
    
    // 물리 시뮬레이션 업데이트
    updatePhysics() {
        const currentTime = Date.now();
        
        this.balls.forEach((ball, index) => {
            if (ball.isSelected) return; // 선택된 공은 물리 효과 적용 안함
            
            // 중력 적용
            ball.velocity.y += this.gravity;
            
            // 마찰 적용
            ball.velocity.multiplyScalar(this.friction);
            ball.angularVelocity.multiplyScalar(this.friction);
            
            // 위치 업데이트
            ball.mesh.position.add(ball.velocity);
            
            // 회전 업데이트
            ball.mesh.rotation.x += ball.angularVelocity.x;
            ball.mesh.rotation.y += ball.angularVelocity.y;
            ball.mesh.rotation.z += ball.angularVelocity.z;
            
            // 경계 충돌 검사 (구형 경계)
            const boundaryRadius = 11.5;
            const distanceFromCenter = ball.mesh.position.length();
            
            if (distanceFromCenter > boundaryRadius) {
                // 경계와 충돌
                const normal = ball.mesh.position.clone().normalize();
                ball.mesh.position.copy(normal.multiplyScalar(boundaryRadius));
                
                // 반사 벡터 계산
                const dotProduct = ball.velocity.dot(normal);
                ball.velocity.sub(normal.multiplyScalar(2 * dotProduct));
                ball.velocity.multiplyScalar(ball.restitution);
                
                // 회전 추가
                ball.angularVelocity.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ));
                
                // 충돌 사운드 및 파티클 효과
                if (currentTime - ball.lastCollisionTime > 200) { // 200ms 간격으로 제한
                    this.playBallBounceSound(ball.velocity.length());
                    this.createParticleSystem(ball.mesh.position.clone(), 0xffffff, 20);
                    ball.lastCollisionTime = currentTime;
                }
                
                // 카메라 흔들림
                this.shakeCamera(0.1);
            }
            
            // 바닥 충돌 검사
            if (ball.mesh.position.y < -7) {
                ball.mesh.position.y = -7;
                ball.velocity.y = Math.abs(ball.velocity.y) * ball.restitution;
                
                if (currentTime - ball.lastCollisionTime > 200) {
                    this.playBallBounceSound(ball.velocity.length());
                    this.createParticleSystem(ball.mesh.position.clone(), 0x4444ff, 15);
                    ball.lastCollisionTime = currentTime;
                }
            }
            
            // 공간 내 다른 공들과 충돌 검사 (성능을 위해 간소화)
            if (index % 3 === 0) { // 매 3번째 공만 검사하여 성능 최적화
                this.checkBallCollisions(ball, index);
            }
        });
    }
    
    // 공 간 충돌 검사
    checkBallCollisions(ball1, index1) {
        for (let i = index1 + 1; i < this.balls.length; i++) {
            const ball2 = this.balls[i];
            if (ball1.isSelected || ball2.isSelected) continue;
            
            const distance = ball1.mesh.position.distanceTo(ball2.mesh.position);
            const minDistance = 2.1; // 공의 반지름 * 2 + 여유공간
            
            if (distance < minDistance) {
                // 충돌 처리
                const direction = ball1.mesh.position.clone().sub(ball2.mesh.position).normalize();
                const overlap = minDistance - distance;
                
                // 위치 보정
                ball1.mesh.position.add(direction.clone().multiplyScalar(overlap * 0.5));
                ball2.mesh.position.sub(direction.clone().multiplyScalar(overlap * 0.5));
                
                // 속도 교환 (간단한 탄성 충돌)
                const tempVelocity = ball1.velocity.clone();
                ball1.velocity.copy(ball2.velocity);
                ball2.velocity.copy(tempVelocity);
                
                // 반발력 적용
                ball1.velocity.add(direction.multiplyScalar(0.1));
                ball2.velocity.sub(direction.multiplyScalar(0.1));
                
                // 충돌 효과
                const currentTime = Date.now();
                if (currentTime - ball1.lastCollisionTime > 300) {
                    this.playBallBounceSound(0.5);
                    this.createParticleSystem(ball1.mesh.position.clone(), 0xffff00, 10);
                    ball1.lastCollisionTime = currentTime;
                    ball2.lastCollisionTime = currentTime;
                }
            }
        }
    }
    
    // 클로즈업 단계 업데이트
    updateCloseupPhase() {
        this.animationProgress += 0.01;
        
        // 클로즈업 효과: 공이 화면 중앙으로 천천히 확대
        if (this.selectedBall) {
            const scale = Math.min(1 + this.animationProgress * 0.5, 1.5);
            this.selectedBall.mesh.scale.set(scale, scale, scale);
            
            // 공 회전
            this.selectedBall.mesh.rotation.y += 0.01;
            this.selectedBall.mesh.rotation.x += 0.005;
        }
        
        // 클로즈업 단계 완료 후 360도 회전 단계로 전환
        if (this.animationProgress >= 3) {
            this.animationPhase = 2;
            this.animationProgress = 0;
        }
    }
    
    // 360도 회전 단계 업데이트
    update360Phase() {
        this.animationProgress += 0.01;
        
        // 카메라 360도 회전
        this.cameraAngle += 0.02;
        const x = this.cameraRadius * Math.sin(this.cameraAngle);
        const z = this.cameraRadius * Math.cos(this.cameraAngle);
        this.camera.position.set(x, 0, z);
        this.camera.lookAt(this.cameraTarget);
        
        // 공 자체 회전
        if (this.selectedBall) {
            this.selectedBall.mesh.rotation.y += 0.02;
            this.selectedBall.mesh.rotation.x += 0.01;
        }
        
        // 360도 회전 완료 후 분자 운동 단계로 전환
        if (this.animationProgress >= 5) {
            this.animationPhase = 3;
            this.animationProgress = 0;
            
            // 모든 공 생성
            this.createAllBalls();
        }
    }
    
    // 분자 운동 단계 업데이트
    updateMolecularPhase() {
        this.animationProgress += 0.01;
        
        // 모든 공 움직임 업데이트
        this.updateBallsMovement();
        
        // 분자 운동 완료 후 결과 표시 단계로 전환
        if (this.animationProgress >= 5) {
            this.animationPhase = 4;
            this.animationProgress = 0;
        }
    }
    
    // 결과 표시 단계 업데이트
    updateResultPhase() {
        this.animationProgress += 0.01;
        
        // 선택된 공들을 앞으로 정렬
        const selectedBalls = this.balls.filter(ball => ball.isSelected);
        const spacing = 3;
        
        selectedBalls.forEach((ball, index) => {
            const targetX = (index - 2.5) * spacing;
            const targetY = 0;
            const targetZ = -5;
            
            // 선택된 공을 천천히 앞으로 이동
            ball.mesh.position.x += (targetX - ball.mesh.position.x) * 0.05;
            ball.mesh.position.y += (targetY - ball.mesh.position.y) * 0.05;
            ball.mesh.position.z += (targetZ - ball.mesh.position.z) * 0.05;
            
            // 공 크기 키우기
            const scale = 1.5;
            ball.mesh.scale.set(scale, scale, scale);
            
            // 공 회전
            ball.mesh.rotation.y += 0.01;
        });
        
        // 선택되지 않은 공은 뒤로 이동
        const unselectedBalls = this.balls.filter(ball => !ball.isSelected);
        unselectedBalls.forEach(ball => {
            // 공을 뒤로 서서히 이동시키면서 투명하게
            ball.mesh.position.z += 0.1;
            
            // 일정 거리 이상 멀어지면 완전히 투명하게
            if (ball.mesh.position.z > 20) {
                ball.mesh.visible = false;
            }
        });
        
        // 애니메이션 완료 후 정지
        if (this.animationProgress >= 5) {
            // 애니메이션 유지하면서 공만 계속 회전
            selectedBalls.forEach(ball => {
                ball.mesh.rotation.y += 0.01;
            });
        }
    }
    
    // 공 움직임 업데이트 (분자 운동)
    updateBallsMovement() {
        const boundaryRadius = 10;
        
        this.balls.forEach(ball => {
            // 위치 업데이트
            ball.mesh.position.add(ball.velocity);
            
            // 경계 체크 및 충돌 처리 (구체 경계 내에서 움직이도록)
            const distance = ball.mesh.position.length();
            if (distance > boundaryRadius) {
                // 경계에 도달하면 반사
                ball.mesh.position.normalize().multiplyScalar(boundaryRadius);
                
                // 반사 방향 계산 (입사각 = 반사각)
                const normal = ball.mesh.position.clone().normalize();
                ball.velocity.reflect(normal);
                
                // 충돌 시 색상 변경 효과
                ball.mesh.material.emissive.setHex(0x222222);
                setTimeout(() => {
                    ball.mesh.material.emissive.setHex(0x000000);
                }, 100);
            }
            
            // 공 회전 효과
            ball.mesh.rotation.x += ball.velocity.length() * 0.5;
            ball.mesh.rotation.y += ball.velocity.length() * 0.5;
            
            // 선택된 공은 더 빠르게 움직임
            if (ball.isSelected) {
                ball.velocity.multiplyScalar(1.001);
            }
        });
    }
    
    // 애니메이션 시작
    play() {
        this.isPlaying = true;
    }
    
    // 애니메이션 일시 정지
    pause() {
        this.isPlaying = false;
    }
    
    // 애니메이션 정지 및 리소스 해제
    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // 애니메이션 리셋
    reset() {
        this.stop();
        this.resetScene();
        this.animationPhase = 0;
        this.animationProgress = 0;
    }
}

// 전역으로 내보내기
window.BallAnimationManager = BallAnimationManager;

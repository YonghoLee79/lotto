/**
 * Simulation Manager
 * 시뮬레이션 관리 모듈
 */

class SimulationManager {
    constructor() {
        // 캔버스 및 Three.js 관련 속성
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.molecules = [];
        this.animationId = null;
        this.isSimulating = false;
        
        // 시뮬레이션 상태
        this.simState = {
            running: false,
            imageAnalyzed: false,
            generatingNumbers: false,
            numberGenerated: false
        };
        
        // 시뮬레이션 설정
        this.settings = {
            moleculeCount: 45,
            speedFactor: 0.3,
            colorPalette: [
                0x2196f3, // blue
                0x4caf50, // green
                0x9c27b0, // purple
                0xff9800, // orange
                0x2962ff  // bright blue
            ]
        };
    }
    
    init() {
        this.initCanvas();
        this.initThreeJS();
        this.initControls();
        
        // 테스트 모드일 경우 데모 이미지 로드
        if (window.location.search.includes('debug=true') || 
            window.location.search.includes('test=true')) {
            this.loadDemoImage();
        }
    }
    
    initCanvas() {
        this.canvas = document.getElementById('simulationCanvas');
        this.overlay = document.getElementById('simulationOverlay');
        
        if (!this.canvas) {
            console.error('시뮬레이션 캔버스를 찾을 수 없습니다.');
            return;
        }
        
        // 캔버스 크기 조정
        this.updateCanvasSize();
        window.addEventListener('resize', () => this.updateCanvasSize());
    }
    
    updateCanvasSize() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // 렌더러 크기도 업데이트
        if (this.renderer) {
            this.renderer.setSize(this.canvas.width, this.canvas.height);
        }
        
        // 카메라 비율 업데이트
        if (this.camera) {
            this.camera.aspect = this.canvas.width / this.canvas.height;
            this.camera.updateProjectionMatrix();
        }
    }
    
    initThreeJS() {
        if (!this.canvas) return;
        
        // 씬 생성
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x131722); // 차트 배경색과 동일
        
        // 카메라 설정
        const fov = 75;
        const aspect = this.canvas.width / this.canvas.height;
        const near = 0.1;
        const far = 1000;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.z = 20;
        
        // 렌더러 설정
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.width, this.canvas.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // 조명 추가
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);
        
        // 분자 생성 준비
        this.prepareSimulation();
    }
    
    prepareSimulation() {
        // 분자(공) 생성
        for (let i = 0; i < this.settings.moleculeCount; i++) {
            this.createMolecule();
        }
        
        // 초기 애니메이션 (대기 상태)
        this.animate();
    }
    
    createMolecule() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const colorIndex = Math.floor(Math.random() * this.settings.colorPalette.length);
        const material = new THREE.MeshPhongMaterial({
            color: this.settings.colorPalette[colorIndex],
            shininess: 100,
            specular: 0x333333
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        
        // 무작위 위치 (구체 내부에 랜덤하게 배치)
        const radius = 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        sphere.position.x = radius * Math.sin(phi) * Math.cos(theta);
        sphere.position.y = radius * Math.sin(phi) * Math.sin(theta);
        sphere.position.z = radius * Math.cos(phi);
        
        // 무작위 속도 벡터
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * this.settings.speedFactor,
            (Math.random() - 0.5) * this.settings.speedFactor,
            (Math.random() - 0.5) * this.settings.speedFactor
        );
        
        this.scene.add(sphere);
        this.molecules.push({
            mesh: sphere,
            velocity: velocity,
            originalColor: this.settings.colorPalette[colorIndex]
        });
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // 분자 움직임 업데이트
        this.updateMolecules();
        
        // 씬 렌더링
        this.renderer.render(this.scene, this.camera);
        
        // 카메라 약간 회전 (자연스러운 움직임 효과)
        this.camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
        this.camera.position.y = Math.cos(Date.now() * 0.0001) * 2;
        this.camera.lookAt(0, 0, 0);
    }
    
    updateMolecules() {
        const boundaryRadius = 10;
        
        this.molecules.forEach(molecule => {
            // 위치 업데이트
            molecule.mesh.position.add(molecule.velocity);
            
            // 경계 체크 및 충돌 처리 (구체 경계 내에서 움직이도록)
            const distance = molecule.mesh.position.length();
            if (distance > boundaryRadius) {
                // 경계에 도달하면 반사
                molecule.mesh.position.normalize().multiplyScalar(boundaryRadius);
                
                // 반사 방향 계산 (입사각 = 반사각)
                const normal = molecule.mesh.position.clone().normalize();
                molecule.velocity.reflect(normal);
                
                // 충돌 시 색상 변경 효과
                molecule.mesh.material.emissive.setHex(0x333333);
                setTimeout(() => {
                    molecule.mesh.material.emissive.setHex(0x000000);
                }, 100);
            }
            
            // 공 회전 효과
            molecule.mesh.rotation.x += molecule.velocity.length() * 0.1;
            molecule.mesh.rotation.y += molecule.velocity.length() * 0.1;
        });
    }
    
    startImageAnalysisAnimation() {
        // 이미지 분석 중 시각화 효과
        this.simState.running = true;
        
        // 분자 색상 및 속도 변경
        this.molecules.forEach(molecule => {
            // 색상을 분석 모드로 변경
            molecule.mesh.material.color.setHex(0x2962ff);
            molecule.mesh.material.emissive.setHex(0x0a1a3d);
            
            // 속도 증가
            molecule.velocity.multiplyScalar(2);
        });
        
        // 오버레이 상태 업데이트
        if (this.overlay) {
            this.overlay.querySelector('.loading-text').textContent = '이미지 분석 중...';
            this.overlay.querySelector('.loading-icon').textContent = '🔍';
            this.overlay.classList.add('active');
        }
        
        // 분석 진행 표시줄 애니메이션
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = '0%';
            
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 1;
                progressBar.style.width = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // 분석 완료 후 상태 업데이트
                    setTimeout(() => {
                        this.simState.imageAnalyzed = true;
                        this.completeImageAnalysis();
                    }, 500);
                }
            }, 30); // 약 3초 소요
        }
    }
    
    completeImageAnalysis() {
        // 분석 완료 시 UI 업데이트
        const analyzeBtn = document.getElementById('analyzeImageBtn');
        const generateBtn = document.getElementById('generateNumbersBtn');
        
        if (analyzeBtn) {
            analyzeBtn.textContent = '✓ 분석 완료';
            analyzeBtn.classList.add('complete');
        }
        
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.classList.add('ready');
        }
        
        // 오버레이 숨기기
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        // 분자 상태 원복
        this.molecules.forEach(molecule => {
            // 원래 색상으로 복원
            molecule.mesh.material.color.setHex(molecule.originalColor);
            molecule.mesh.material.emissive.setHex(0x000000);
            
            // 속도 정상화
            molecule.velocity.normalize().multiplyScalar(this.settings.speedFactor);
        });
        
        // 결과 분석 표시
        const resultAnalysis = document.getElementById('resultAnalysis');
        if (resultAnalysis) {
            resultAnalysis.innerHTML = `
                <h4>이미지 분석 결과</h4>
                <div class="analysis-details">
                    <div class="analysis-item">
                        <span class="item-label">엔트로피 레벨:</span>
                        <span class="item-value">8.73 / 10</span>
                    </div>
                    <div class="analysis-item">
                        <span class="item-label">양자 노이즈:</span>
                        <span class="item-value">중상위</span>
                    </div>
                    <div class="analysis-item">
                        <span class="item-label">패턴 복잡도:</span>
                        <span class="item-value">복잡함</span>
                    </div>
                </div>
            `;
        }
    }
    
    generateNumbers() {
        if (!this.simState.imageAnalyzed && !window.location.search.includes('debug=true')) {
            console.warn('이미지가 아직 분석되지 않았습니다.');
            return;
        }
        
        this.simState.generatingNumbers = true;
        
        // 번호 생성 중 시각화 효과
        this.molecules.forEach(molecule => {
            // 색상을 생성 모드로 변경
            molecule.mesh.material.color.setHex(0x4caf50);
            molecule.mesh.material.emissive.setHex(0x0a3d0a);
            
            // 속도 증가
            molecule.velocity.multiplyScalar(1.5);
        });
        
        // 오버레이 상태 업데이트
        if (this.overlay) {
            this.overlay.querySelector('.loading-text').textContent = '번호 생성 중...';
            this.overlay.querySelector('.loading-icon').textContent = '🔢';
            this.overlay.classList.add('active');
        }
        
        // 서버에 번호 생성 요청
        setTimeout(() => {
            // 실제로는 API 호출하여 번호 받아오기
            this.displayGeneratedNumbers();
        }, 2000);
    }
    
    displayGeneratedNumbers() {
        // 번호 생성 완료 시 UI 업데이트
        const generateBtn = document.getElementById('generateNumbersBtn');
        if (generateBtn) {
            generateBtn.textContent = '✓ 생성 완료';
            generateBtn.classList.add('complete');
        }
        
        // 오버레이 숨기기
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        // 분자 상태 원복
        this.molecules.forEach(molecule => {
            // 원래 색상으로 복원
            molecule.mesh.material.color.setHex(molecule.originalColor);
            molecule.mesh.material.emissive.setHex(0x000000);
            
            // 속도 정상화
            molecule.velocity.normalize().multiplyScalar(this.settings.speedFactor);
        });
        
        // 생성된 번호 표시
        const resultNumbers = document.getElementById('resultNumbers');
        if (resultNumbers) {
            // 모의 로또 번호 생성
            const numbers = [];
            while (numbers.length < 6) {
                const num = Math.floor(Math.random() * 45) + 1;
                if (!numbers.includes(num)) {
                    numbers.push(num);
                }
            }
            numbers.sort((a, b) => a - b);
            
            // 번호 표시 HTML 생성
            let numbersHTML = `<h4>생성된 번호</h4><div class="number-balls">`;
            
            numbers.forEach(num => {
                let ballClass = '';
                if (num <= 10) ballClass = 'ball-yellow';
                else if (num <= 20) ballClass = 'ball-blue';
                else if (num <= 30) ballClass = 'ball-red';
                else if (num <= 40) ballClass = 'ball-gray';
                else ballClass = 'ball-green';
                
                numbersHTML += `<div class="number-ball ${ballClass}">${num}</div>`;
            });
            
            numbersHTML += `</div>`;
            
            // 프리미엄 사용자를 위한 보너스 정보
            const isPremium = localStorage.getItem('isPremium') === 'true';
            if (isPremium) {
                numbersHTML += `
                    <div class="premium-info">
                        <div class="premium-badge">프리미엄</div>
                        <div class="guarantee-message">당첨 시 구독료 회수 보장 적용</div>
                    </div>
                `;
            } else {
                numbersHTML += `
                    <div class="premium-cta">
                        <p>프리미엄 구독 시 더 정확한 번호와 구독료 회수 보장을 받을 수 있습니다.</p>
                        <button id="upgradeToPremiumBtn" class="upgrade-btn">프리미엄으로 업그레이드</button>
                    </div>
                `;
            }
            
            resultNumbers.innerHTML = numbersHTML;
            
            // 프리미엄 업그레이드 버튼 이벤트
            const upgradeBtn = document.getElementById('upgradeToPremiumBtn');
            if (upgradeBtn) {
                upgradeBtn.addEventListener('click', () => {
                    if (window.uiComponentManager) {
                        window.uiComponentManager.togglePremiumBanner(true);
                    }
                });
            }
        }
        
        this.simState.numberGenerated = true;
        this.simState.generatingNumbers = false;
    }
    
    initControls() {
        // 이미지 업로드 관련 요소
        const uploadArea = document.getElementById('uploadArea');
        const photoUpload = document.getElementById('photoUpload');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const removeImageBtn = document.getElementById('removeImageBtn');
        
        // 분석 및 생성 버튼
        const analyzeImageBtn = document.getElementById('analyzeImageBtn');
        const generateNumbersBtn = document.getElementById('generateNumbersBtn');
        
        if (!uploadArea || !photoUpload) {
            console.error('업로드 관련 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 파일 선택 다이얼로그 열기
        uploadArea.addEventListener('click', () => {
            photoUpload.click();
        });
        
        // 드래그 앤 드롭 이벤트
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length > 0) {
                handleImageUpload(e.dataTransfer.files[0]);
            }
        });
        
        // 파일 업로드 처리
        photoUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleImageUpload(e.target.files[0]);
            }
        });
        
        // 이미지 업로드 처리 함수
        const handleImageUpload = (file) => {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                uploadArea.style.display = 'none';
                imagePreviewContainer.style.display = 'block';
                
                // 이미지 업로드 후 분석 버튼 활성화
                if (analyzeImageBtn) {
                    analyzeImageBtn.disabled = false;
                }
            };
            reader.readAsDataURL(file);
        };
        
        // 이미지 제거 버튼
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 업로드 영역 클릭 이벤트 방지
                
                imagePreview.src = '';
                uploadArea.style.display = 'flex';
                imagePreviewContainer.style.display = 'none';
                photoUpload.value = '';
                
                // 버튼 상태 리셋
                if (analyzeImageBtn) {
                    analyzeImageBtn.disabled = true;
                    analyzeImageBtn.classList.remove('complete');
                    analyzeImageBtn.textContent = '이미지 분석';
                }
                
                if (generateNumbersBtn) {
                    generateNumbersBtn.disabled = true;
                    generateNumbersBtn.classList.remove('ready', 'complete');
                    generateNumbersBtn.textContent = '번호 생성';
                }
                
                // 결과 영역 초기화
                const resultNumbers = document.getElementById('resultNumbers');
                const resultAnalysis = document.getElementById('resultAnalysis');
                
                if (resultNumbers) resultNumbers.innerHTML = '';
                if (resultAnalysis) resultAnalysis.innerHTML = '';
                
                // 시뮬레이션 상태 초기화
                this.simState.imageAnalyzed = false;
                this.simState.numberGenerated = false;
            });
        }
        
        // 이미지 분석 버튼
        if (analyzeImageBtn) {
            analyzeImageBtn.addEventListener('click', () => {
                if (!imagePreview.src && !window.location.search.includes('debug=true')) {
                    alert('먼저 이미지를 업로드해주세요.');
                    return;
                }
                
                this.startImageAnalysisAnimation();
            });
        }
        
        // 번호 생성 버튼
        if (generateNumbersBtn) {
            generateNumbersBtn.addEventListener('click', () => {
                if (!this.simState.imageAnalyzed && !window.location.search.includes('debug=true')) {
                    alert('먼저 이미지를 분석해주세요.');
                    return;
                }
                
                this.generateNumbers();
            });
        }
    }
    
    loadDemoImage() {
        console.log('데모 이미지 로드 중...');
        
        // 테스트용 이미지 URL (실제 환경에서는 적절한 이미지로 교체)
        const demoImageUrl = 'https://cdn.pixabay.com/photo/2017/08/10/02/05/balls-2617866_1280.jpg';
        
        // 이미지 요소 찾기
        const imagePreview = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('uploadArea');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const analyzeImageBtn = document.getElementById('analyzeImageBtn');
        
        if (!imagePreview || !uploadArea || !imagePreviewContainer) {
            console.error('이미지 프리뷰 요소를 찾을 수 없습니다.');
            return;
        }
        
        // 이미지 로드
        imagePreview.onload = () => {
            uploadArea.style.display = 'none';
            imagePreviewContainer.style.display = 'block';
            
            // 이미지 업로드 후 분석 버튼 활성화
            if (analyzeImageBtn) {
                analyzeImageBtn.disabled = false;
            }
            
            console.log('데모 이미지 로드 완료');
        };
        
        imagePreview.onerror = () => {
            console.error('데모 이미지 로드 실패');
        };
        
        imagePreview.src = demoImageUrl;
    }
    
    resetSimulation() {
        // 시뮬레이션 상태 초기화
        this.simState.running = false;
        this.simState.imageAnalyzed = false;
        this.simState.generatingNumbers = false;
        this.simState.numberGenerated = false;
        
        // UI 요소 리셋
        const analyzeImageBtn = document.getElementById('analyzeImageBtn');
        const generateNumbersBtn = document.getElementById('generateNumbersBtn');
        
        if (analyzeImageBtn) {
            analyzeImageBtn.disabled = true;
            analyzeImageBtn.classList.remove('complete');
            analyzeImageBtn.textContent = '이미지 분석';
        }
        
        if (generateNumbersBtn) {
            generateNumbersBtn.disabled = true;
            generateNumbersBtn.classList.remove('ready', 'complete');
            generateNumbersBtn.textContent = '번호 생성';
        }
        
        // 결과 영역 초기화
        const resultNumbers = document.getElementById('resultNumbers');
        const resultAnalysis = document.getElementById('resultAnalysis');
        
        if (resultNumbers) resultNumbers.innerHTML = '';
        if (resultAnalysis) resultAnalysis.innerHTML = '';
        
        // 이미지 프리뷰 초기화
        const imagePreview = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('uploadArea');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        
        if (imagePreview && uploadArea && imagePreviewContainer) {
            imagePreview.src = '';
            uploadArea.style.display = 'flex';
            imagePreviewContainer.style.display = 'none';
        }
        
        // 분자 상태 초기화
        this.molecules.forEach(molecule => {
            // 원래 색상으로 복원
            molecule.mesh.material.color.setHex(molecule.originalColor);
            molecule.mesh.material.emissive.setHex(0x000000);
            
            // 속도 초기화
            molecule.velocity.normalize().multiplyScalar(this.settings.speedFactor);
        });
    }
}

// 전역으로 내보내기
window.SimulationManager = SimulationManager;

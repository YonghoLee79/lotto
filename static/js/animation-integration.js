/**
 * Animation Integration Module
 * 로또볼 3D 애니메이션 통합 모듈
 */

class AnimationIntegration {
    constructor() {
        this.ballAnimationManager = null;
        this.initialized = false;
        this.container = 'simulationCanvas';
    }

    init() {
        if (!window.BallAnimationManager) {
            console.error('BallAnimationManager를 찾을 수 없습니다. ball-animation.js가 로드되었는지 확인하세요.');
            return false;
        }

        // 애니메이션 컨테이너 체크
        const container = document.getElementById(this.container);
        if (!container) {
            console.error(`애니메이션 컨테이너 '${this.container}'를 찾을 수 없습니다.`);
            return false;
        }

        // BallAnimationManager 초기화
        this.ballAnimationManager = new BallAnimationManager();
        const success = this.ballAnimationManager.init(this.container);
        
        if (success) {
            console.log('로또볼 애니메이션 매니저가 성공적으로 초기화되었습니다.');
            this.initialized = true;
        } else {
            console.error('로또볼 애니메이션 매니저 초기화에 실패했습니다.');
        }

        return success;
    }

    // 이미지 분석 및 애니메이션 시작
    startAnimationSequence(imageUrl, callback) {
        if (!this.initialized) {
            if (!this.init()) {
                console.error('애니메이션 초기화에 실패했습니다.');
                alert('애니메이션 초기화에 실패했습니다. 콘솔을 확인하세요.');
                return;
            }
        }

        console.log('이미지 분석 및 애니메이션 시퀀스 시작:', imageUrl);
        
        // 병렬로 처리: 서버 API로 이미지 분석 요청 및 애니메이션 준비
        const apiPromise = new Promise((resolve) => {
            this.getAnalysisFromBackend(imageUrl, resolve);
        });
        
        // 이미지 처리 및 애니메이션 시작
        this.ballAnimationManager.processUserImage(imageUrl, (success) => {
            if (success) {
                console.log('애니메이션 시퀀스 시작됨');
                
                // 애니메이션 완료 후 콜백 처리
                setTimeout(() => {
                    // API 결과 확인
                    apiPromise.then(apiResult => {
                        if (callback && typeof callback === 'function') {
                            console.log('애니메이션 시퀀스 완료, 콜백 호출');
                            
                            // 우선순위: API 결과 > 애니메이션 결과 > 기본값
                            const resultNumbers = apiResult || 
                                                this.ballAnimationManager.selectedNumbers || 
                                                [1, 13, 22, 25, 33, 45]; // 기본값
                                                
                            console.log('최종 선택된 번호:', resultNumbers);
                            callback(resultNumbers);
                        }
                    });
                }, 12000); // 애니메이션 예상 지속 시간
            } else {
                console.error('이미지 처리 실패');
                alert('이미지 처리에 실패했습니다. 콘솔을 확인하세요.');
                
                // API 결과만으로도 콜백 실행
                apiPromise.then(apiResult => {
                    if (callback && typeof callback === 'function') {
                        callback(apiResult || null);
                    }
                });
            }
        });
    }

    // 애니메이션 정지
    stop() {
        if (this.ballAnimationManager) {
            this.ballAnimationManager.stop();
        }
    }

    // 애니메이션 리셋
    reset() {
        if (this.ballAnimationManager) {
            this.ballAnimationManager.reset();
        }
    }

    // 이미지 분석 결과 API 호출
    getAnalysisFromBackend(imageUrl, callback) {
        console.log('서버에 이미지 분석 요청:', imageUrl);
        
        // 이미지 데이터 가져오기 (URL이나 base64 문자열)
        let imageData = imageUrl;
        
        // URL인 경우 fetch로 데이터 가져오기
        if (imageUrl.startsWith('http')) {
            fetch(imageUrl)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        // base64 데이터로 변환
                        imageData = reader.result;
                        this.sendAnalysisRequest(imageData, callback);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => {
                    console.error('이미지 가져오기 오류:', error);
                    if (callback) callback(null);
                });
        } else {
            // 이미 base64 데이터인 경우
            this.sendAnalysisRequest(imageData, callback);
        }
    }
    
    // API 요청 보내기
    sendAnalysisRequest(imageData, callback) {
        fetch('/api/mobile-generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image_data: imageData })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('분석 결과 수신:', data);
            
            // 결과가 있으면 저장
            if (data && data.numbers) {
                this.selectedNumbers = data.numbers;
                console.log('선택된 번호:', this.selectedNumbers);
                
                // 콜백 호출
                if (callback) callback(data.numbers);
            } else {
                console.warn('서버에서 유효한 번호 데이터를 받지 못했습니다');
                if (callback) callback(null);
            }
        })
        .catch(error => {
            console.error('분석 API 오류:', error);
            if (callback) callback(null);
        });
    }
}

// 전역 인스턴스 생성
window.animationIntegration = new AnimationIntegration();

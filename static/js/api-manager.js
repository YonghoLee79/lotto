/**
 * API Integration Module
 * API 통합 모듈
 */

class APIManager {
    constructor() {
        this.baseUrl = '/api'; // Flask API 기본 URL
        this.endpoints = {
            generateNumbers: '/generate',
            analyzeImage: '/analyze-image',
            verifySubscription: '/verify-subscription',
            getStats: '/stats'
        };
    }
    
    /**
     * 로또 번호 생성 API 호출
     * @param {Object} params - 생성 매개변수
     * @param {boolean} isPremium - 프리미엄 사용자 여부
     * @returns {Promise<Object>} 생성된 번호 및 분석 정보
     */
    async generateNumbers(params = {}, isPremium = false) {
        try {
            const url = `${this.baseUrl}${this.endpoints.generateNumbers}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...params,
                    premium: isPremium
                })
            });
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('번호 생성 API 오류:', error);
            
            // 오류 시 모의 데이터 반환 (실제 구현에서는 제거)
            return this.getMockGenerationResult(isPremium);
        }
    }
    
    /**
     * 이미지 분석 API 호출
     * @param {File|Blob} imageFile - 분석할 이미지 파일
     * @returns {Promise<Object>} 이미지 분석 결과
     */
    async analyzeImage(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const url = `${this.baseUrl}${this.endpoints.analyzeImage}`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('이미지 분석 API 오류:', error);
            
            // 오류 시 모의 데이터 반환 (실제 구현에서는 제거)
            return this.getMockAnalysisResult();
        }
    }
    
    /**
     * 구독 상태 확인 API 호출
     * @param {string} userId - 사용자 ID 또는 토큰
     * @returns {Promise<Object>} 구독 상태 정보
     */
    async verifySubscription(userId) {
        try {
            const url = `${this.baseUrl}${this.endpoints.verifySubscription}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('구독 확인 API 오류:', error);
            
            // 오류 시 모의 데이터 반환 (실제 구현에서는 제거)
            return {
                isPremium: false,
                expiryDate: null,
                plan: 'free'
            };
        }
    }
    
    /**
     * 통계 데이터 가져오기 API 호출
     * @returns {Promise<Object>} 성능 통계 데이터
     */
    async getStats() {
        try {
            const url = `${this.baseUrl}${this.endpoints.getStats}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('통계 데이터 API 오류:', error);
            
            // 오류 시 모의 데이터 반환 (실제 구현에서는 제거)
            return this.getMockStatsData();
        }
    }
    
    // 테스트 및 개발용 모의 데이터 생성 함수들
    
    getMockGenerationResult(isPremium) {
        // 번호 생성
        const numbers = [];
        while (numbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        numbers.sort((a, b) => a - b);
        
        return {
            numbers,
            timestamp: new Date().toISOString(),
            isPremium,
            algorithm: isPremium ? 'Jackson-Hwang RNG' : 'Basic RNG',
            confidenceScore: isPremium ? 
                (Math.random() * 0.3 + 0.7).toFixed(2) : 
                (Math.random() * 0.3 + 0.4).toFixed(2),
            guaranteeEligible: isPremium
        };
    }
    
    getMockAnalysisResult() {
        return {
            entropyLevel: (Math.random() * 2 + 8).toFixed(2),
            quantumNoise: ['낮음', '중간', '중상위', '높음'][Math.floor(Math.random() * 4)],
            patternComplexity: ['단순함', '보통', '복잡함', '매우 복잡함'][Math.floor(Math.random() * 4)],
            analysisTime: (Math.random() * 2 + 1).toFixed(2),
            timestamp: new Date().toISOString()
        };
    }
    
    getMockStatsData() {
        return {
            hitRate: {
                overall: (Math.random() * 0.2 + 0.6).toFixed(2),
                premium: (Math.random() * 0.2 + 0.7).toFixed(2),
                free: (Math.random() * 0.2 + 0.5).toFixed(2)
            },
            accuracy: {
                overall: (Math.random() * 2 + 3).toFixed(1) + 'x',
                premium: (Math.random() * 2 + 4).toFixed(1) + 'x',
                free: (Math.random() * 2 + 2).toFixed(1) + 'x'
            },
            weeklyPerformance: [
                { week: '1주', value: Math.random() * 1 + 1 },
                { week: '2주', value: Math.random() * 1 + 1.5 },
                { week: '3주', value: Math.random() * 1 + 2 },
                { week: '4주', value: Math.random() * 1 + 2.5 },
                { week: '5주', value: Math.random() * 1 + 3 },
                { week: '6주', value: Math.random() * 1 + 3.5 }
            ]
        };
    }
}

// 전역으로 내보내기
window.APIManager = APIManager;

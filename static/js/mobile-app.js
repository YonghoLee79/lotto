/**
 * 모바일 적응형 로또 애플리케이션
 */

class MobileLottoApp {
    constructor() {
        this.isLoading = false;
        this.cache = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatus();
        this.setupServiceWorker();
    }

    bindEvents() {
        // 버튼 이벤트
        document.getElementById('btn-single').addEventListener('click', () => this.generateSingle());
        document.getElementById('btn-batch').addEventListener('click', () => this.generateBatch());
        document.getElementById('btn-cleanup').addEventListener('click', () => this.cleanup());
        document.getElementById('btn-status').addEventListener('click', () => this.updateStatus());

        // 터치 피드백
        this.addTouchFeedback();
        
        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => this.showToast('온라인 연결됨', 'success'));
        window.addEventListener('offline', () => this.showToast('오프라인 모드', 'warning'));
    }

    addTouchFeedback() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });
            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.style.transform = '';
                }, 100);
            });
        });
    }

    async generateSingle() {
        if (this.isLoading) return;
        
        try {
            this.setLoading(true, 'AI가 번호를 생성중입니다...');
            
            const response = await fetch('/api/generate-single');
            const data = await response.json();
            
            if (data.success) {
                this.displayNumbers(data.numbers, data.analysis);
                this.showToast('번호 생성 완료!', 'success');
                this.updateStats(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showToast(`오류: ${error.message}`, 'error');
            console.error('Generation error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    async generateBatch() {
        if (this.isLoading) return;
        
        try {
            const count = document.getElementById('simulation-count').value;
            this.setLoading(true, `${count}회 시뮬레이션 실행중...`);
            
            const response = await fetch(`/api/generate-batch?count=${count}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayBatchResults(data);
                this.showToast(`${data.total_simulations}회 분석 완료!`, 'success');
                this.updateStats(data);
                await this.loadPredictions();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showToast(`오류: ${error.message}`, 'error');
            console.error('Batch generation error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    displayNumbers(numbers, analysis) {
        const container = document.getElementById('lotto-numbers');
        const analysisContainer = document.getElementById('number-analysis');
        
        // 번호 표시
        container.innerHTML = '';
        numbers.forEach((number, index) => {
            setTimeout(() => {
                const numberEl = document.createElement('div');
                numberEl.className = `lotto-number ${this.getNumberRange(number)}`;
                numberEl.textContent = number;
                container.appendChild(numberEl);
            }, index * 100);
        });

        // 분석 정보 표시
        if (analysis) {
            analysisContainer.innerHTML = `
                <div class="analysis-item">
                    <span>홀수/짝수:</span>
                    <strong>${analysis.odd_count}/${analysis.even_count}</strong>
                </div>
                <div class="analysis-item">
                    <span>번호 합계:</span>
                    <strong>${analysis.sum_total}</strong>
                </div>
                <div class="analysis-item">
                    <span>평균값:</span>
                    <strong>${analysis.average}</strong>
                </div>
            `;
        }

        // 결과 카드 표시
        document.getElementById('number-result').classList.remove('hidden');
        
        // 부드러운 스크롤
        setTimeout(() => {
            document.getElementById('number-result').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 500);
    }

    displayBatchResults(data) {
        const analysisCard = document.getElementById('analysis-result');
        const analysisContent = document.getElementById('analysis-content');
        
        if (data.analysis && data.analysis.frequency_analysis) {
            const freq = data.analysis.frequency_analysis;
            const patterns = data.analysis.pattern_analysis;
            
            analysisContent.innerHTML = `
                <div class="analysis-grid">
                    <div class="analysis-section">
                        <h4><i class="fas fa-chart-bar"></i> 빈도 분석</h4>
                        <div class="analysis-item">
                            <span>총 시뮬레이션:</span>
                            <strong>${freq.total_simulations}회</strong>
                        </div>
                        ${freq.most_frequent ? `
                        <div class="analysis-item">
                            <span>최다 출현:</span>
                            <strong>번호 ${freq.most_frequent.number} (${freq.most_frequent.count}회)</strong>
                        </div>
                        ` : ''}
                        ${freq.least_frequent ? `
                        <div class="analysis-item">
                            <span>최소 출현:</span>
                            <strong>번호 ${freq.least_frequent.number} (${freq.least_frequent.count}회)</strong>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="analysis-section">
                        <h4><i class="fas fa-chart-pie"></i> 패턴 분석</h4>
                        <div class="analysis-item">
                            <span>평균 홀수:</span>
                            <strong>${patterns.avg_odd}개</strong>
                        </div>
                        <div class="analysis-item">
                            <span>평균 짝수:</span>
                            <strong>${patterns.avg_even}개</strong>
                        </div>
                        <div class="analysis-item">
                            <span>연속 번호:</span>
                            <strong>${patterns.consecutive_pairs}쌍</strong>
                        </div>
                    </div>
                </div>
            `;
            
            analysisCard.classList.remove('hidden');
        }
    }

    async loadPredictions() {
        try {
            const response = await fetch('/api/predictions');
            const data = await response.json();
            
            if (data.success && data.predictions && data.predictions.predicted_numbers) {
                this.displayPredictions(data.predictions);
            }
        } catch (error) {
            console.error('Predictions error:', error);
        }
    }

    displayPredictions(predictions) {
        const predictionCard = document.getElementById('prediction-result');
        const predictionContent = document.getElementById('prediction-content');
        
        const numbers = predictions.predicted_numbers;
        const confidence = Math.round(predictions.confidence * 100);
        
        let numbersHtml = '<div class="lotto-numbers">';
        numbers.forEach(number => {
            numbersHtml += `<div class="lotto-number ${this.getNumberRange(number)}">${number}</div>`;
        });
        numbersHtml += '</div>';
        
        predictionContent.innerHTML = `
            ${numbersHtml}
            <div class="prediction-info">
                <div class="confidence-meter">
                    <div class="confidence-label">예측 신뢰도</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                    </div>
                    <div class="confidence-value">${confidence}%</div>
                </div>
            </div>
        `;
        
        predictionCard.classList.remove('hidden');
        
        // 신뢰도 업데이트
        document.getElementById('confidence-level').textContent = `${confidence}%`;
    }

    getNumberRange(number) {
        if (number <= 10) return 'range-1-10';
        if (number <= 20) return 'range-11-20';
        if (number <= 30) return 'range-21-30';
        if (number <= 40) return 'range-31-40';
        return 'range-41-46';
    }

    async updateStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            if (data.success) {
                this.updateStats(data);
            }
        } catch (error) {
            console.error('Status update error:', error);
        }
    }

    updateStats(data) {
        if (data.resource_usage && data.resource_usage.memory) {
            const memoryMB = Math.round(data.resource_usage.memory.current_memory_mb.rss);
            document.getElementById('memory-usage').textContent = `${memoryMB}MB`;
        }
        
        if (data.total_simulations) {
            document.getElementById('total-simulations').textContent = data.total_simulations;
        }
    }

    async cleanup() {
        try {
            this.setLoading(true, '메모리 정리중...');
            
            const response = await fetch('/api/cleanup');
            const data = await response.json();
            
            if (data.success) {
                this.showToast('메모리 정리 완료', 'success');
                this.updateStats(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            this.showToast(`정리 오류: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading, message = 'AI 분석중...') {
        this.isLoading = loading;
        const overlay = document.getElementById('loading-overlay');
        
        if (loading) {
            overlay.querySelector('p').textContent = message;
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
        
        // 버튼 비활성화
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.disabled = loading;
            if (loading) {
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '';
                btn.style.cursor = '';
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const messageEl = document.getElementById('toast-message');
        
        messageEl.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        // 3초 후 자동 숨김
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    setupServiceWorker() {
        // 서비스 워커 등록 (PWA 기능)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }

    // 진동 피드백 (모바일)
    vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // 화면 깨우기 방지
    preventSleep() {
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen');
        }
    }
}

// 추가 CSS 스타일을 동적으로 추가
const additionalStyles = `
    .analysis-grid {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: 1fr;
    }
    
    .analysis-section h4 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: var(--primary-color);
        font-size: 1.1rem;
    }
    
    .confidence-meter {
        margin-top: 1rem;
        text-align: center;
    }
    
    .confidence-label {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-bottom: 0.5rem;
    }
    
    .confidence-bar {
        width: 100%;
        height: 8px;
        background: var(--gray-200);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    
    .confidence-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--danger-color), var(--warning-color), var(--success-color));
        transition: width 0.3s ease;
    }
    
    .confidence-value {
        font-weight: 700;
        color: var(--primary-color);
    }
    
    .toast.success {
        background: var(--success-color);
    }
    
    .toast.warning {
        background: var(--warning-color);
    }
    
    .toast.error {
        background: var(--danger-color);
    }
    
    @media (min-width: 768px) {
        .analysis-grid {
            grid-template-columns: 1fr 1fr;
        }
    }
`;

// 스타일 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.lottoApp = new MobileLottoApp();
});

// PWA 설치 프롬프트
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 설치 버튼 표시 (필요시)
    const installButton = document.createElement('button');
    installButton.textContent = '앱 설치';
    installButton.className = 'btn btn-secondary install-btn';
    installButton.style.position = 'fixed';
    installButton.style.bottom = '20px';
    installButton.style.right = '20px';
    installButton.style.zIndex = '1000';
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installButton.remove();
            }
            deferredPrompt = null;
        }
    });
    
    document.body.appendChild(installButton);
});

// 에러 핸들링
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.lottoApp) {
        window.lottoApp.showToast('예상치 못한 오류가 발생했습니다.', 'error');
    }
});

// 성능 모니터링
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`페이지 로드 시간: ${loadTime}ms`);
    });
}

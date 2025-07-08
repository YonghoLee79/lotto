/**
 * UI Component Manager
 * UI 컴포넌트 관리 모듈
 */

class UIComponentManager {
    constructor() {
        this.components = {};
        this.modalOpen = false;
    }
    
    init() {
        this.initHeader();
        this.initPremiumBanner();
        this.initJackpotBanner();
        this.initWinnersCarousel();
        this.initTechCards();
        this.initStatistics();
        this.attachEventListeners();
    }
    
    initHeader() {
        const togglePremiumBtn = document.getElementById('togglePremiumBtn');
        if (togglePremiumBtn) {
            togglePremiumBtn.addEventListener('click', () => {
                this.togglePremiumBanner();
            });
        }
    }
    
    initPremiumBanner() {
        const premiumBanner = document.getElementById('premiumBanner');
        const closePremiumBtn = document.getElementById('closePremiumBtn');
        
        if (closePremiumBtn) {
            closePremiumBtn.addEventListener('click', () => {
                this.togglePremiumBanner(false);
            });
        }
        
        // 구독 버튼 이벤트
        const subscribeButtons = document.querySelectorAll('.subscribe-btn');
        subscribeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plan = e.target.getAttribute('data-plan');
                this.handleSubscription(plan);
            });
        });
        
        // 카운트다운 타이머 초기화
        this.initCountdown();
    }
    
    initCountdown() {
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;
        
        // 오늘 자정까지의 카운트다운
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 0);
        
        const updateCountdown = () => {
            const currentTime = new Date();
            const diff = midnight - currentTime;
            
            if (diff <= 0) {
                // 자정이 지나면 다음 날로 리셋
                midnight.setDate(midnight.getDate() + 1);
                midnight.setHours(23, 59, 59, 0);
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            countdownEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    initJackpotBanner() {
        // 여기서 실제 API에서 최신 당첨금 정보를 가져올 수 있음
        // 현재는 하드코딩된 값 사용
    }
    
    initWinnersCarousel() {
        const carousel = document.querySelector('.winners-carousel');
        if (!carousel) return;
        
        // 간단한 캐러셀 애니메이션
        let scrollPosition = 0;
        const cardWidth = 280; // 카드 너비 + 마진
        const totalCards = carousel.children.length;
        
        setInterval(() => {
            scrollPosition += cardWidth;
            if (scrollPosition >= cardWidth * totalCards) {
                scrollPosition = 0;
            }
            carousel.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }, 5000);
    }
    
    initTechCards() {
        const techCards = document.querySelectorAll('.tech-card');
        const techModal = document.getElementById('techModal');
        const techModalContainer = document.getElementById('techModalContainer');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modalTitle = document.getElementById('modalTitle');
        const modalVisual = document.getElementById('modalVisual');
        const modalDescription = document.getElementById('modalDescription');
        
        if (!techModal || !techCards.length) return;
        
        // 모달 닫기 버튼
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                techModalContainer.classList.remove('active');
                this.modalOpen = false;
            });
        }
        
        // 기술 카드 클릭 이벤트
        techCards.forEach(card => {
            const infoBtn = card.querySelector('.info-btn');
            if (infoBtn) {
                infoBtn.addEventListener('click', () => {
                    const techType = card.getAttribute('data-tech');
                    this.openTechModal(techType);
                });
            }
        });
    }
    
    openTechModal(techType) {
        const techModalContainer = document.getElementById('techModalContainer');
        const modalTitle = document.getElementById('modalTitle');
        const modalVisual = document.getElementById('modalVisual');
        const modalDescription = document.getElementById('modalDescription');
        
        if (!techModalContainer || !modalTitle || !modalVisual || !modalDescription) return;
        
        // 기술 유형에 따른 모달 내용 설정
        const techDetails = {
            molecular: {
                title: 'Jackson-Hwang RNG',
                description: `
                    <p>Jackson-Hwang Random Number Generator는 양자 물리학과 분자 운동의 원리를 결합한 첨단 난수 생성 알고리즘입니다.</p>
                    <p>주요 특징:</p>
                    <ul>
                        <li>양자 불확정성 원리 기반 난수 생성</li>
                        <li>패턴 예측 불가능성 보장</li>
                        <li>통계적 편향 최소화 알고리즘</li>
                        <li>실시간 엔트로피 소스 활용</li>
                    </ul>
                    <p>이 알고리즘은 일반 난수 생성기의 한계를 뛰어넘어 진정한 무작위성을 제공합니다.</p>
                `
            },
            entropy: {
                title: '엔트로피 드리프트 분석',
                description: `
                    <p>엔트로피 드리프트 분석은 시간에 따른 확률 분포의 미세한 변화를 감지하는 시계열 분석 방법입니다.</p>
                    <p>주요 특징:</p>
                    <ul>
                        <li>역사적 데이터 기반 패턴 인식</li>
                        <li>비선형 확률 드리프트 모델링</li>
                        <li>자기상관 및 교차상관 분석</li>
                        <li>베이지안 추론을 통한 예측 정확도 향상</li>
                    </ul>
                    <p>이 분석 방법은 완전한 무작위성 내에서도 존재하는 미세한 통계적 편향을 포착합니다.</p>
                `
            },
            thermodynamics: {
                title: '통계 열역학',
                description: `
                    <p>통계 열역학 모델은 물리적 시스템의 에너지 분포와 확률적 거동을 시뮬레이션하는 물리학 기반 접근법입니다.</p>
                    <p>주요 특징:</p>
                    <ul>
                        <li>볼츠만 분포 기반 에너지 상태 모델링</li>
                        <li>마르코프 체인 몬테카를로 시뮬레이션</li>
                        <li>미시적 상태와 거시적 관측치 연결</li>
                        <li>평형 및 비평형 상태 분석</li>
                    </ul>
                    <p>이 모델은 물리적 세계의 근본 법칙을 활용하여 확률 분포를 생성합니다.</p>
                `
            },
            quantum: {
                title: '이미지 기반 양자 분석',
                description: `
                    <p>이미지 기반 양자 분석은 사용자가 업로드한 이미지에서 양자 노이즈와 엔트로피를 추출하는 혁신적인 방법입니다.</p>
                    <p>주요 특징:</p>
                    <ul>
                        <li>디지털 이미지의 양자 노이즈 추출</li>
                        <li>이미지 엔트로피 매핑 및 분석</li>
                        <li>사용자 입력 기반 시드 생성</li>
                        <li>이미지 특성과 난수 생성 연결</li>
                    </ul>
                    <p>이 기술은 사용자 제공 데이터를 활용하여 맞춤형 확률 분포를 생성합니다.</p>
                `
            }
        };
        
        // 선택한 기술 정보로 모달 내용 업데이트
        const techInfo = techDetails[techType];
        if (techInfo) {
            modalTitle.textContent = techInfo.title;
            modalDescription.innerHTML = techInfo.description;
            
            // 시각화 모듈 호출
            if (window.scienceVisualizations) {
                // 기존 시각화 요소 제거
                while (modalVisual.firstChild) {
                    modalVisual.removeChild(modalVisual.firstChild);
                }
                
                // 새 시각화 생성
                const visualElement = window.scienceVisualizations.createVisualization(techType);
                if (visualElement) {
                    modalVisual.appendChild(visualElement);
                }
            }
            
            // 모달 표시
            techModalContainer.classList.add('active');
            this.modalOpen = true;
        }
    }
    
    initStatistics() {
        const performanceChart = document.getElementById('performanceChart');
        if (!performanceChart) return;
        
        // Plotly.js를 사용한 차트 생성
        const trace1 = {
            x: ['1주', '2주', '3주', '4주', '5주', '6주'],
            y: [1.2, 1.8, 2.3, 2.8, 3.5, 4.2],
            type: 'scatter',
            mode: 'lines+markers',
            name: '정확도 향상',
            line: {
                color: 'rgb(41, 98, 255)',
                width: 3
            },
            marker: {
                color: 'rgb(41, 98, 255)',
                size: 8
            }
        };
        
        const trace2 = {
            x: ['1주', '2주', '3주', '4주', '5주', '6주'],
            y: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
            type: 'scatter',
            mode: 'lines',
            name: '무작위 기준',
            line: {
                color: 'rgba(150, 150, 150, 0.5)',
                width: 2,
                dash: 'dash'
            }
        };
        
        const layout = {
            title: '알고리즘 성능 추이',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'SF Pro Display, sans-serif',
                color: '#b2b5be'
            },
            xaxis: {
                gridcolor: 'rgba(80, 80, 80, 0.1)',
                zerolinecolor: 'rgba(80, 80, 80, 0.2)'
            },
            yaxis: {
                title: '무작위 대비 향상도',
                gridcolor: 'rgba(80, 80, 80, 0.1)',
                zerolinecolor: 'rgba(80, 80, 80, 0.2)'
            },
            margin: {
                l: 50,
                r: 20,
                t: 50,
                b: 50
            },
            legend: {
                orientation: 'h',
                y: -0.2
            }
        };
        
        const data = [trace1, trace2];
        
        if (typeof Plotly !== 'undefined') {
            Plotly.newPlot(performanceChart, data, layout, {responsive: true});
        }
    }
    
    togglePremiumBanner(show) {
        const premiumBanner = document.getElementById('premiumBanner');
        if (!premiumBanner) return;
        
        if (show === undefined) {
            // 토글 모드
            premiumBanner.classList.toggle('active');
        } else if (show) {
            // 명시적으로 표시
            premiumBanner.classList.add('active');
        } else {
            // 명시적으로 숨김
            premiumBanner.classList.remove('active');
        }
    }
    
    handleSubscription(plan) {
        console.log(`구독 플랜 선택: ${plan}`);
        // 여기서 실제 결제 처리 또는 API 호출
        alert(`${plan === 'yearly' ? '연간' : '월간'} 구독을 선택하셨습니다. 결제 페이지로 이동합니다.`);
        
        // 결제 성공 시 프리미엄 상태 업데이트
        // this.updatePremiumStatus(true);
    }
    
    updatePremiumStatus(isPremium) {
        // 프리미엄 상태에 따른 UI 업데이트
        document.body.classList.toggle('premium-user', isPremium);
        
        // 로컬 스토리지에 상태 저장 (데모용)
        localStorage.setItem('isPremium', isPremium);
        
        // 프리미엄 버튼 텍스트 업데이트
        const togglePremiumBtn = document.getElementById('togglePremiumBtn');
        if (togglePremiumBtn) {
            togglePremiumBtn.textContent = isPremium ? '프리미엄 활성' : '프리미엄 혜택';
        }
    }
    
    attachEventListeners() {
        // 전역 이벤트 리스너
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalOpen) {
                const techModalContainer = document.getElementById('techModalContainer');
                techModalContainer.classList.remove('active');
                this.modalOpen = false;
            }
        });
    }
}

// 전역으로 내보내기
window.UIComponentManager = UIComponentManager;

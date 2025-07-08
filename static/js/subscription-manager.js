/**
 * Subscription Manager
 * 구독 관리 모듈
 */

class SubscriptionManager {
    constructor() {
        this.plans = {
            free: {
                name: '무료',
                price: 0,
                features: [
                    '기본 시뮬레이션 접근',
                    '일일 5회 번호 생성 제한',
                    '기본 알고리즘 사용'
                ]
            },
            monthly: {
                name: '월간 구독',
                price: 12900,
                features: [
                    '무제한 시뮬레이션',
                    '고급 알고리즘 접근',
                    '고급 통계 대시보드',
                    '우선 고객 지원'
                ]
            },
            yearly: {
                name: '연간 구독',
                price: 109000,
                discountPercentage: 30,
                features: [
                    '무제한 시뮬레이션',
                    '고급 알고리즘 접근',
                    '고급 통계 대시보드',
                    '우선 고객 지원',
                    '구독료 회수 보장'
                ]
            }
        };
        
        // 구독 상태 (로컬 스토리지에서 불러오기)
        this.subscription = {
            active: false,
            plan: 'free',
            expiryDate: null
        };
        
        this.loadSubscriptionFromStorage();
    }
    
    init() {
        this.updateUI();
        this.attachEventListeners();
    }
    
    loadSubscriptionFromStorage() {
        try {
            const storedSubscription = localStorage.getItem('subscription');
            if (storedSubscription) {
                this.subscription = JSON.parse(storedSubscription);
                
                // 만료 날짜 검사
                if (this.subscription.expiryDate) {
                    const expiryDate = new Date(this.subscription.expiryDate);
                    const now = new Date();
                    
                    if (expiryDate < now) {
                        // 구독 만료됨
                        this.subscription.active = false;
                        this.subscription.plan = 'free';
                        this.subscription.expiryDate = null;
                        this.saveSubscriptionToStorage();
                    }
                }
            }
        } catch (error) {
            console.error('구독 정보 로드 오류:', error);
            this.resetSubscription();
        }
    }
    
    saveSubscriptionToStorage() {
        try {
            localStorage.setItem('subscription', JSON.stringify(this.subscription));
        } catch (error) {
            console.error('구독 정보 저장 오류:', error);
        }
    }
    
    resetSubscription() {
        this.subscription = {
            active: false,
            plan: 'free',
            expiryDate: null
        };
        this.saveSubscriptionToStorage();
    }
    
    updateUI() {
        // 프리미엄 상태에 따른 UI 업데이트
        document.body.classList.toggle('premium-user', this.isPremium());
        
        // 프리미엄 버튼 텍스트 업데이트
        const togglePremiumBtn = document.getElementById('togglePremiumBtn');
        if (togglePremiumBtn) {
            togglePremiumBtn.textContent = this.isPremium() ? '프리미엄 활성' : '프리미엄 혜택';
        }
        
        // 구독 옵션 UI 업데이트
        this.updateSubscriptionOptions();
    }
    
    updateSubscriptionOptions() {
        const subscriptionOptions = document.querySelectorAll('.subscription-option');
        
        subscriptionOptions.forEach(option => {
            const planBtn = option.querySelector('.subscribe-btn');
            if (!planBtn) return;
            
            const plan = planBtn.getAttribute('data-plan');
            
            // 현재 활성화된 플랜 표시
            if (plan === this.subscription.plan && this.subscription.active) {
                option.classList.add('active');
                planBtn.textContent = '현재 구독 중';
                planBtn.disabled = true;
            } else {
                option.classList.remove('active');
                planBtn.textContent = '구독하기';
                planBtn.disabled = false;
            }
        });
    }
    
    attachEventListeners() {
        // 구독 버튼 이벤트
        const subscribeButtons = document.querySelectorAll('.subscribe-btn');
        subscribeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plan = e.target.getAttribute('data-plan');
                this.handleSubscription(plan);
            });
        });
    }
    
    handleSubscription(plan) {
        if (!this.plans[plan]) {
            console.error('유효하지 않은 구독 플랜:', plan);
            return;
        }
        
        // 실제 구현에서는 결제 처리 로직 추가
        // 여기서는 데모용으로 바로 구독 처리
        
        // 가상의 결제 처리 성공 알림
        const planInfo = this.plans[plan];
        const confirmMessage = `'${planInfo.name}' 플랜에 구독하시겠습니까?\n가격: ${this.formatPrice(planInfo.price)}`;
        
        if (confirm(confirmMessage)) {
            // 구독 정보 업데이트
            const now = new Date();
            let expiryDate = new Date(now);
            
            if (plan === 'monthly') {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else if (plan === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }
            
            this.subscription = {
                active: true,
                plan: plan,
                expiryDate: expiryDate.toISOString(),
                purchaseDate: now.toISOString()
            };
            
            this.saveSubscriptionToStorage();
            this.updateUI();
            
            // 프리미엄 상태 로컬 스토리지에 저장 (다른 모듈과 공유)
            localStorage.setItem('isPremium', this.isPremium());
            
            // 구독 완료 메시지
            alert(`${planInfo.name} 구독이 완료되었습니다. 감사합니다!`);
            
            // 프리미엄 배너 닫기
            const premiumBanner = document.getElementById('premiumBanner');
            if (premiumBanner) {
                premiumBanner.classList.remove('active');
            }
        }
    }
    
    isPremium() {
        return this.subscription.active && (this.subscription.plan === 'monthly' || this.subscription.plan === 'yearly');
    }
    
    // 추가 유틸리티 함수
    
    formatPrice(price) {
        return `₩${price.toLocaleString()}`;
    }
    
    getRemainingDays() {
        if (!this.subscription.active || !this.subscription.expiryDate) {
            return 0;
        }
        
        const expiryDate = new Date(this.subscription.expiryDate);
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    }
    
    getGuaranteeEligible() {
        return this.subscription.active && this.subscription.plan === 'yearly';
    }
}

// 전역으로 내보내기
window.SubscriptionManager = SubscriptionManager;

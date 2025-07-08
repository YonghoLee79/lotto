MOLECULAR_SIMULATION_CONFIG = {
    'num_particles': 1000,      # 분자 입자 수
    'temperature': 298.15,      # 시뮬레이션 온도 (K)
    'pressure': 101325,         # 압력 (Pa)
    'time_step': 0.001,         # 시간 간격 (s)
    'equilibrium_steps': 10000  # 평형 달성 단계
}

ENTROPY_ANALYSIS_CONFIG = {
    'window_size': 50,          # 분석 윈도우 크기
    'drift_threshold': 0.05,    # 드리프트 감지 임계값
    'convergence_rate': 0.01    # 수렴 판정 기준
}

ACCESS_LEVELS = {
    'FREE': {
        'max_simulations': 3,
        'algorithms': ['basic_rng'],
        'data_access': 'limited',
        'ui_features': ['ads', 'subscription_banner'],
        'validity': '제한 없음'
    },
    'BASIC_SUBSCRIBER': {
        'max_simulations': 30,
        'algorithms': ['molecular_rng', 'entropy_analysis'],
        'data_access': 'extended',
        'ui_features': ['no_ads', 'premium_badge'],
        'validity': '월간 구독',
        'price': '8,900원/월',
        'guarantee': '매월 최소 10,000원 상당의 당첨금 보장'
    },
    'PREMIUM_SUBSCRIBER': {
        'max_simulations': 'unlimited',
        'algorithms': ['all'],
        'data_access': 'full',
        'ui_features': ['no_ads', 'vip_badge', 'custom_analysis'],
        'validity': '연간 구독',
        'price': '84,900원/년',
        'monthly_equivalent': '7,075원/월',
        'guarantee': '연간 최소 100,000원 상당의 당첨금 보장'
    },
    'VIP_MEMBER': {
        'max_simulations': 'unlimited',
        'algorithms': ['all', 'experimental'],
        'data_access': 'full_plus',
        'ui_features': ['all', 'priority_support'],
        'custom_features': ['personal_consultation', 'custom_algorithms'],
        'validity': '월간 프리미엄',
        'price': '23,900원/월',
        'annual_price': '239,000원/년',
        'annual_monthly_equivalent': '19,917원/월',
        'guarantee': '매월 최소 30,000원 상당의 당첨금 보장'
    }
}

SUBSCRIPTION_UI_CONFIG = {
    'popup_timing': {
        'session_start': True,
        'after_simulation': 3,  # 3회 시뮬레이션 후
        'on_exit': True,
        'interval_days': 3      # 3일마다 표시
    },
    'messages': {
        'hope': [
            "이번엔 당신의 차례입니다! 프리미엄 알고리즘으로 확률을 높이세요.",
            "과학적 분석으로 당첨 확률을 높여보세요!",
            "프리미엄 구독으로 업그레이드하고 더 정확한 예측을 받아보세요."
        ]
    }
}

SIMULATION_CONSTANTS = {
    'BOX_SIZE': 50,
    'BALL_RADIUS': 1.0,
    'GRAVITY': [0, -9.8, 0],
    'FRICTION': 0.98,
    'RESTITUTION': 0.8,
    'NUM_BALLS': 46,
    'HOLE_RADIUS': 2.0
}

# 로또 번호 범위 및 기본값 상수 추가
LOTTO_MIN_NUMBER = 1
LOTTO_MAX_NUMBER = 46
DEFAULT_TEMPERATURE = MOLECULAR_SIMULATION_CONFIG['temperature']
DEFAULT_MOLECULES = MOLECULAR_SIMULATION_CONFIG['num_particles']

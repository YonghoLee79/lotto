#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🎲 간편 로또 예측기 🎲
사용법: python3 quick_lotto.py
"""

import random
import numpy as np
import matplotlib.pyplot as plt
from collections import Counter
import time

def generate_lotto_numbers():
    """간단한 로또 번호 생성기"""
    print("🎲 === 간편 로또 번호 생성기 === 🎲")
    print("물리 시뮬레이션 기반으로 로또 번호를 생성합니다.\n")
    
    # 여러 방법으로 번호 생성
    methods = {
        "랜덤 생성": generate_random(),
        "가중 확률": generate_weighted(),
        "물리 시뮬레이션": generate_physics_based(),
        "통계 분석": generate_statistical(),
        "AI 조합": generate_ai_combined()
    }
    
    print("=== 각 방법별 추천 번호 ===")
    all_numbers = []
    
    for method, numbers in methods.items():
        print(f"📊 {method:12}: {sorted(numbers)}")
        all_numbers.extend(numbers)
    
    # 최종 AI 추천
    frequency = Counter(all_numbers)
    final_recommendation = [num for num, count in frequency.most_common(6)]
    
    print("\n🎯 === 최종 AI 추천 번호 ===")
    print(f"추천: {sorted(final_recommendation)}")
    print(f"생성 시간: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 간단한 차트 생성
    create_simple_chart(methods, final_recommendation)
    
    return final_recommendation

def generate_random():
    """완전 랜덤 생성"""
    return random.sample(range(1, 46), 6)

def generate_weighted():
    """가중 확률 기반"""
    # 과거 당첨 빈도를 시뮬레이션한 가중치
    weights = [1] * 45  # 기본 가중치
    
    # 특정 번호들에 더 높은 가중치
    hot_numbers = [7, 12, 17, 23, 34, 39]  # 예시 "핫" 번호들
    for num in hot_numbers:
        weights[num-1] = 2
    
    return sorted(random.choices(range(1, 46), weights=weights, k=6))

def generate_physics_based():
    """간단한 물리 시뮬레이션"""
    # 볼의 위치와 충돌을 간단히 시뮬레이션
    balls = list(range(1, 46))
    selected = []
    
    # 물리적 "인접성" 고려
    for _ in range(6):
        if not balls:
            break
            
        # 이미 선택된 번호와 "물리적으로 인접한" 번호 피하기
        available = [b for b in balls if all(abs(b - s) > 2 for s in selected)]
        if not available:
            available = balls
            
        choice = random.choice(available)
        selected.append(choice)
        balls.remove(choice)
    
    return sorted(selected)

def generate_statistical():
    """통계적 패턴 기반"""
    # 홀짝 균형, 구간 분산 고려
    numbers = []
    
    # 구간별로 선택 (1-15, 16-30, 31-45)
    ranges = [range(1, 16), range(16, 31), range(31, 46)]
    picks_per_range = [2, 2, 2]  # 각 구간에서 2개씩
    
    for i, num_range in enumerate(ranges):
        selected = random.sample(list(num_range), picks_per_range[i])
        numbers.extend(selected)
    
    return sorted(numbers)

def generate_ai_combined():
    """AI 조합 방식"""
    # 여러 전략을 조합
    strategies = [
        generate_random(),
        generate_weighted(), 
        generate_physics_based()
    ]
    
    all_nums = []
    for strategy in strategies:
        all_nums.extend(strategy)
    
    # 가장 자주 나온 번호들로 구성
    frequency = Counter(all_nums)
    return [num for num, count in frequency.most_common(6)]

def create_simple_chart(methods, final_recommendation):
    """간단한 차트 생성"""
    plt.figure(figsize=(12, 8))
    
    # 서브플롯 1: 각 방법별 번호 분포
    plt.subplot(2, 2, 1)
    
    all_numbers = []
    colors = ['red', 'blue', 'green', 'orange', 'purple']
    
    for i, (method, numbers) in enumerate(methods.items()):
        plt.scatter([i] * len(numbers), numbers, 
                   c=colors[i], alpha=0.7, s=50, label=method[:8])
        all_numbers.extend(numbers)
    
    plt.xlabel('생성 방법')
    plt.ylabel('로또 번호')
    plt.title('각 방법별 생성된 번호')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # 서브플롯 2: 번호별 빈도
    plt.subplot(2, 2, 2)
    frequency = Counter(all_numbers)
    numbers = list(frequency.keys())
    counts = list(frequency.values())
    
    plt.bar(numbers, counts, alpha=0.7, color='skyblue')
    plt.xlabel('로또 번호')
    plt.ylabel('출현 빈도')
    plt.title('번호별 출현 빈도')
    plt.grid(True, alpha=0.3)
    
    # 서브플롯 3: 최종 추천 번호
    plt.subplot(2, 2, 3)
    plt.bar(range(len(final_recommendation)), final_recommendation, 
            color='gold', alpha=0.8)
    plt.xlabel('순서')
    plt.ylabel('번호')
    plt.title('최종 AI 추천 번호')
    plt.xticks(range(len(final_recommendation)), 
               [f'{i+1}번째' for i in range(len(final_recommendation))])
    
    # 각 막대 위에 번호 표시
    for i, num in enumerate(final_recommendation):
        plt.text(i, num + 0.5, str(num), ha='center', va='bottom', fontweight='bold')
    
    # 서브플롯 4: 정보 텍스트
    plt.subplot(2, 2, 4)
    plt.axis('off')
    
    info_text = f"""
    🎯 최종 AI 추천 번호
    {sorted(final_recommendation)}
    
    📊 분석 방법: 5가지
    ⏰ 생성 시간: {time.strftime('%H:%M:%S')}
    
    📝 참고사항:
    - 이 예측은 다양한 알고리즘을 
      조합한 결과입니다
    - 로또는 확률 게임이므로 
      당첨을 보장하지 않습니다
    - 재미있게 참고용으로만 
      사용하세요!
    """
    
    plt.text(0.1, 0.9, info_text, transform=plt.gca().transAxes,
            fontsize=10, verticalalignment='top', fontfamily='monospace')
    
    plt.tight_layout()
    
    filename = f'/Users/yongholee/Documents/lotto/quick_lotto_{time.strftime("%Y%m%d_%H%M%S")}.png'
    plt.savefig(filename, dpi=150, bbox_inches='tight')
    print(f"\n📈 차트 저장: {filename}")
    
    plt.show()

def main():
    """메인 함수"""
    try:
        recommendation = generate_lotto_numbers()
        
        print("\n" + "="*50)
        print("🍀 행운을 빕니다! 🍀")
        print("="*50)
        
        # 간단한 통계 정보
        print(f"\n📈 간단한 분석:")
        print(f"   홀수 개수: {sum(1 for n in recommendation if n % 2 == 1)}")
        print(f"   짝수 개수: {sum(1 for n in recommendation if n % 2 == 0)}")
        print(f"   구간별 분포:")
        print(f"     1-15:  {sum(1 for n in recommendation if 1 <= n <= 15)}개")
        print(f"    16-30:  {sum(1 for n in recommendation if 16 <= n <= 30)}개")  
        print(f"    31-45:  {sum(1 for n in recommendation if 31 <= n <= 45)}개")
        
        return recommendation
        
    except KeyboardInterrupt:
        print("\n\n프로그램이 중단되었습니다.")
    except Exception as e:
        print(f"\n오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main()

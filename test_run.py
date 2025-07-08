#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import random
import math
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import pandas as pd
from collections import Counter

print("=== 로또 시뮬레이션 테스트 ===")

# 간단한 3D 벡터 연산 함수들
def vec3(x, y, z):
    return [x, y, z]

def vec_add(a, b):
    return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]

def vec_sub(a, b):
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]

def vec_length(a):
    return math.sqrt(a[0]**2 + a[1]**2 + a[2]**2)

# 간단한 Ball 클래스
class SimpleBall:
    def __init__(self, number):
        self.number = number
        self.position = [
            random.uniform(0, 50),
            random.uniform(0, 50),
            random.uniform(0, 50)
        ]
        self.velocity = [
            random.uniform(-5, 5),
            random.uniform(-5, 5),
            random.uniform(-5, 5)
        ]
        self.trajectory = []
        self.in_hole = False

    def update(self, dt=0.1):
        self.position = vec_add(self.position, [v*dt for v in self.velocity])
        self.trajectory.append(self.position.copy())
        
        # 간단한 경계 검사
        for i in range(3):
            if self.position[i] < 0 or self.position[i] > 50:
                self.velocity[i] *= -1
                self.position[i] = max(0, min(50, self.position[i]))

# 시뮬레이션 실행
def run_simple_simulation():
    print("간단한 물리 시뮬레이션 시작...")
    
    # 46개 볼 생성
    balls = [SimpleBall(i+1) for i in range(46)]
    
    # 100번 업데이트
    for step in range(100):
        for ball in balls:
            ball.update()
            
        # 10단계마다 진행상황 출력
        if step % 20 == 0:
            print(f"Step {step}: 볼들이 움직이고 있습니다...")
    
    print("시뮬레이션 완료!")
    
    # 결과 분석
    winning_numbers = []
    for _ in range(10):  # 10번의 추첨 시뮬레이션
        # 랜덤하게 6개 선택 (실제로는 물리 시뮬레이션 결과를 사용)
        selected = random.sample(range(1, 46), 6)
        winning_numbers.extend(selected)
    
    # 빈도 분석
    frequency = Counter(winning_numbers)
    
    print("\n=== 번호별 출현 빈도 ===")
    for num in sorted(frequency.keys()):
        print(f"번호 {num:2d}: {frequency[num]}회")
    
    # 가장 자주 나온 번호들로 예측
    most_common = frequency.most_common(6)
    predicted = [num for num, count in most_common]
    
    print(f"\n=== 예측 결과 ===")
    print(f"추천 번호: {sorted(predicted)}")
    
    # 간단한 시각화
    create_simple_visualization(balls, frequency)

def create_simple_visualization(balls, frequency):
    print("3D 시각화 생성 중...")
    
    # 3D 산점도
    fig = plt.figure(figsize=(15, 5))
    
    # 첫 번째 서브플롯: 볼들의 최종 위치
    ax1 = fig.add_subplot(131, projection='3d')
    
    for ball in balls[:10]:  # 처음 10개 볼만 표시
        x, y, z = ball.position
        ax1.scatter(x, y, z, s=100, alpha=0.7, label=f'Ball {ball.number}')
    
    ax1.set_xlabel('X')
    ax1.set_ylabel('Y')
    ax1.set_zlabel('Z')
    ax1.set_title('볼들의 3D 위치')
    
    # 두 번째 서브플롯: 빈도 차트
    ax2 = fig.add_subplot(132)
    numbers = list(frequency.keys())
    counts = list(frequency.values())
    
    bars = ax2.bar(numbers, counts, alpha=0.7, color='skyblue')
    ax2.set_xlabel('로또 번호')
    ax2.set_ylabel('출현 빈도')
    ax2.set_title('번호별 출현 빈도')
    
    # 세 번째 서브플롯: 궤적 예시
    ax3 = fig.add_subplot(133, projection='3d')
    
    if len(balls[0].trajectory) > 1:
        trajectory = np.array(balls[0].trajectory)
        ax3.plot(trajectory[:, 0], trajectory[:, 1], trajectory[:, 2], 
                'r-', alpha=0.7, linewidth=2)
        ax3.scatter(trajectory[0, 0], trajectory[0, 1], trajectory[0, 2], 
                   c='green', s=100, label='시작점')
        ax3.scatter(trajectory[-1, 0], trajectory[-1, 1], trajectory[-1, 2], 
                   c='red', s=100, label='끝점')
    
    ax3.set_xlabel('X')
    ax3.set_ylabel('Y')
    ax3.set_zlabel('Z')
    ax3.set_title(f'Ball 1의 이동 궤적')
    ax3.legend()
    
    plt.tight_layout()
    plt.savefig('/Users/yongholee/Documents/lotto/simulation_result.png', dpi=150, bbox_inches='tight')
    print("시각화 결과가 'simulation_result.png'로 저장되었습니다.")
    plt.show()

if __name__ == "__main__":
    run_simple_simulation()

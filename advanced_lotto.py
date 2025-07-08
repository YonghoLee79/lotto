#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import random
import math
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import pandas as pd
from collections import Counter
import time
from datetime import datetime

# 한글 폰트 설정
plt.rcParams['font.family'] = ['Arial Unicode MS', 'DejaVu Sans']

print("🎲 === 고급 3D 로또 당첨번호 예상 프로그램 === 🎲")
print("물리 엔진 기반 3D 시뮬레이션으로 로또 번호를 예측합니다.")
print("=" * 60)

# 3D 벡터 연산 함수들
def vec3(x, y, z):
    return np.array([x, y, z])

def vec_add(a, b):
    return a + b

def vec_sub(a, b):
    return a - b

def vec_mul(a, scalar):
    return a * scalar

def vec_dot(a, b):
    return np.dot(a, b)

def vec_length(a):
    return np.linalg.norm(a)

def vec_normalize(a):
    length = vec_length(a)
    if length == 0:
        return np.array([0, 0, 0])
    return a / length

class AdvancedBall:
    def __init__(self, number, box_size=50):
        self.number = number
        self.box_size = box_size
        self.radius = 1.0
        
        # 초기 위치와 속도 설정
        self.position = vec3(
            random.uniform(self.radius, box_size - self.radius),
            random.uniform(self.radius, box_size - self.radius),
            random.uniform(self.radius, box_size - self.radius)
        )
        
        self.velocity = vec3(
            random.uniform(-15, 15),
            random.uniform(-15, 15),
            random.uniform(-15, 15)
        )
        
        # 물리 속성
        self.mass = 1.0
        self.friction = 0.99
        self.gravity = vec3(0, -9.8, 0)
        
        # 추적 데이터
        self.trajectory = [self.position.copy()]
        self.collision_count = 0
        self.energy_history = []
        self.in_hole = False
        self.hole_entry_time = None
        
        # 색상 (번호에 따라)
        self.color = self.get_color_by_number()
    
    def get_color_by_number(self):
        """번호에 따른 색상 할당"""
        color_map = {
            range(1, 11): 'red',
            range(11, 21): 'blue', 
            range(21, 31): 'green',
            range(31, 41): 'orange',
            range(41, 46): 'purple'
        }
        
        for num_range, color in color_map.items():
            if self.number in num_range:
                return color
        return 'gray'
    
    def update(self, dt=0.01):
        """물리 업데이트"""
        # 중력 적용
        acceleration = self.gravity
        
        # 속도 업데이트
        self.velocity += acceleration * dt
        
        # 마찰 적용
        self.velocity *= self.friction
        
        # 위치 업데이트
        self.position += self.velocity * dt
        
        # 에너지 계산 및 저장
        kinetic_energy = 0.5 * self.mass * vec_length(self.velocity)**2
        potential_energy = self.mass * 9.8 * self.position[1]
        total_energy = kinetic_energy + potential_energy
        self.energy_history.append(total_energy)
        
        # 궤적 저장
        self.trajectory.append(self.position.copy())
    
    def check_wall_collision(self):
        """벽 충돌 검사 및 처리"""
        for i in range(3):
            if self.position[i] <= self.radius:
                self.position[i] = self.radius
                self.velocity[i] *= -0.8  # 에너지 손실
                self.collision_count += 1
            elif self.position[i] >= self.box_size - self.radius:
                self.position[i] = self.box_size - self.radius
                self.velocity[i] *= -0.8  # 에너지 손실
                self.collision_count += 1
    
    def check_ball_collision(self, other_ball):
        """다른 볼과의 충돌 검사"""
        delta = self.position - other_ball.position
        distance = vec_length(delta)
        
        if distance < 2 * self.radius and distance > 0:
            # 충돌 처리
            normal = vec_normalize(delta)
            
            # 상대 속도
            relative_velocity = self.velocity - other_ball.velocity
            speed = vec_dot(relative_velocity, normal)
            
            # 이미 멀어지고 있다면 무시
            if speed > 0:
                return
            
            # 충돌 임펄스 계산
            impulse = 2 * speed / (self.mass + other_ball.mass)
            
            # 속도 업데이트
            self.velocity -= impulse * other_ball.mass * normal
            other_ball.velocity += impulse * self.mass * normal
            
            # 겹침 해소
            overlap = 2 * self.radius - distance
            separation = normal * (overlap / 2)
            self.position += separation
            other_ball.position -= separation
            
            self.collision_count += 1
            other_ball.collision_count += 1
    
    def check_hole(self, hole_position, hole_radius):
        """구멍 진입 검사"""
        if not self.in_hole:
            distance_to_hole = vec_length(self.position - hole_position)
            if distance_to_hole < hole_radius:
                self.in_hole = True
                self.hole_entry_time = len(self.trajectory)
                return True
        return False

class LottoSimulator:
    def __init__(self, num_balls=45, box_size=50):
        self.num_balls = num_balls
        self.box_size = box_size
        self.hole_position = vec3(box_size/2, 0, box_size/2)
        self.hole_radius = 3.0
        
        # 시뮬레이션 결과 저장
        self.simulation_results = []
        self.winning_numbers_history = []
        
    def create_balls(self):
        """볼 생성"""
        return [AdvancedBall(i+1, self.box_size) for i in range(self.num_balls)]
    
    def run_simulation(self, max_steps=2000, dt=0.01):
        """단일 시뮬레이션 실행"""
        balls = self.create_balls()
        winning_numbers = []
        
        print(f"시뮬레이션 진행 중... (최대 {max_steps} 스텝)")
        
        for step in range(max_steps):
            # 진행상황 표시
            if step % 400 == 0:
                progress = (step / max_steps) * 100
                print(f"  진행률: {progress:.1f}% ({step}/{max_steps})")
            
            # 모든 볼 업데이트
            for ball in balls:
                if not ball.in_hole:
                    ball.update(dt)
                    ball.check_wall_collision()
            
            # 볼-볼 충돌 검사
            for i in range(len(balls)):
                for j in range(i+1, len(balls)):
                    if not balls[i].in_hole and not balls[j].in_hole:
                        balls[i].check_ball_collision(balls[j])
            
            # 구멍 진입 검사
            for ball in balls:
                if ball.check_hole(self.hole_position, self.hole_radius):
                    winning_numbers.append(ball.number)
                    print(f"  🎯 Ball {ball.number} 구멍 진입! (순서: {len(winning_numbers)})")
                    
                    # 6개 당첨번호가 모두 나오면 종료
                    if len(winning_numbers) >= 6:
                        break
            
            # 6개 번호가 모두 나왔으면 시뮬레이션 종료
            if len(winning_numbers) >= 6:
                break
        
        # 6개 미만이면 랜덤으로 채우기
        if len(winning_numbers) < 6:
            remaining_numbers = [i for i in range(1, self.num_balls+1) if i not in winning_numbers]
            additional = random.sample(remaining_numbers, 6 - len(winning_numbers))
            winning_numbers.extend(additional)
        
        # 6개만 선택
        winning_numbers = winning_numbers[:6]
        
        # 결과 저장
        simulation_data = {
            'winning_numbers': sorted(winning_numbers),
            'balls': balls,
            'total_steps': step + 1
        }
        
        return simulation_data
    
    def run_multiple_simulations(self, num_simulations=10):
        """여러 번의 시뮬레이션 실행"""
        print(f"\n🚀 {num_simulations}번의 시뮬레이션을 시작합니다!")
        
        all_results = []
        
        for sim_num in range(num_simulations):
            print(f"\n--- 시뮬레이션 {sim_num + 1}/{num_simulations} ---")
            start_time = time.time()
            
            result = self.run_simulation()
            
            end_time = time.time()
            print(f"완료! 소요시간: {end_time - start_time:.2f}초")
            print(f"당첨번호: {result['winning_numbers']}")
            
            all_results.append(result)
            self.winning_numbers_history.extend(result['winning_numbers'])
        
        self.simulation_results = all_results
        return all_results
    
    def analyze_results(self):
        """결과 분석"""
        if not self.simulation_results:
            print("분석할 시뮬레이션 결과가 없습니다.")
            return
        
        print("\n📊 === 시뮬레이션 결과 분석 === 📊")
        
        # 번호별 출현 빈도
        frequency = Counter(self.winning_numbers_history)
        
        print(f"\n총 시뮬레이션: {len(self.simulation_results)}회")
        print(f"총 추출된 번호: {len(self.winning_numbers_history)}개")
        
        print("\n🔥 가장 자주 나온 번호 TOP 10:")
        for i, (number, count) in enumerate(frequency.most_common(10), 1):
            percentage = (count / len(self.winning_numbers_history)) * 100
            print(f"  {i:2d}. 번호 {number:2d}: {count:2d}회 ({percentage:.1f}%)")
        
        print("\n❄️  가장 적게 나온 번호 BOTTOM 5:")
        for i, (number, count) in enumerate(frequency.most_common()[:-6:-1], 1):
            percentage = (count / len(self.winning_numbers_history)) * 100
            print(f"  {i:2d}. 번호 {number:2d}: {count:2d}회 ({percentage:.1f}%)")
        
        return frequency
    
    def predict_numbers(self, frequency_data):
        """AI 기반 번호 예측"""
        print("\n🤖 === AI 예측 시스템 === 🤖")
        
        # 여러 예측 방법 조합
        predictions = {}
        
        # 1. 빈도 기반 예측
        most_frequent = [num for num, count in frequency_data.most_common(10)]
        predictions['frequency'] = most_frequent[:6]
        
        # 2. 가중 랜덤 예측
        numbers = list(frequency_data.keys())
        weights = list(frequency_data.values())
        weighted_selection = random.choices(numbers, weights=weights, k=6)
        predictions['weighted'] = sorted(list(set(weighted_selection)))
        
        # 3. 통계적 예측 (평균 주변)
        mean_freq = np.mean(list(frequency_data.values()))
        balanced_numbers = [num for num, count in frequency_data.items() 
                          if abs(count - mean_freq) <= 1]
        if len(balanced_numbers) >= 6:
            predictions['balanced'] = sorted(random.sample(balanced_numbers, 6))
        else:
            predictions['balanced'] = sorted(random.sample(numbers, 6))
        
        # 4. 최종 AI 예측 (앙상블)
        all_predicted = predictions['frequency'] + predictions['weighted'] + predictions['balanced']
        final_frequency = Counter(all_predicted)
        ai_prediction = [num for num, count in final_frequency.most_common(6)]
        
        print("예측 결과:")
        print(f"  📈 빈도 기반: {predictions['frequency']}")
        print(f"  ⚖️  가중 선택: {predictions['weighted']}")
        print(f"  📊 균형 선택: {predictions['balanced']}")
        print(f"  🎯 AI 최종 예측: {sorted(ai_prediction)}")
        
        return {
            'ai_prediction': sorted(ai_prediction),
            'all_methods': predictions
        }
    
    def create_visualization(self, frequency_data):
        """3D 시각화 생성"""
        print("\n🎨 3D 시각화 생성 중...")
        
        fig = plt.figure(figsize=(20, 12))
        
        # 1. 3D 볼 위치 시각화
        ax1 = fig.add_subplot(231, projection='3d')
        
        if self.simulation_results:
            last_sim = self.simulation_results[-1]
            for ball in last_sim['balls'][:15]:  # 처음 15개만 표시
                x, y, z = ball.position
                color = ball.color
                size = 100 if ball.in_hole else 50
                alpha = 1.0 if ball.in_hole else 0.7
                
                ax1.scatter(x, y, z, c=color, s=size, alpha=alpha, 
                           label=f'Ball {ball.number}' if ball.in_hole else '')
        
        ax1.set_xlabel('X')
        ax1.set_ylabel('Y') 
        ax1.set_zlabel('Z')
        ax1.set_title('3D Ball Positions')
        
        # 2. 번호별 출현 빈도
        ax2 = fig.add_subplot(232)
        numbers = list(frequency_data.keys())
        counts = list(frequency_data.values())
        
        bars = ax2.bar(numbers, counts, alpha=0.7, color='skyblue')
        ax2.set_xlabel('Lotto Numbers')
        ax2.set_ylabel('Frequency')
        ax2.set_title('Number Frequency Distribution')
        ax2.grid(True, alpha=0.3)
        
        # 3. 볼 궤적 시각화
        ax3 = fig.add_subplot(233, projection='3d')
        
        if self.simulation_results:
            ball = self.simulation_results[-1]['balls'][0]
            if len(ball.trajectory) > 1:
                trajectory = np.array(ball.trajectory)
                ax3.plot(trajectory[:, 0], trajectory[:, 1], trajectory[:, 2], 
                        'r-', alpha=0.7, linewidth=2)
                ax3.scatter(trajectory[0, 0], trajectory[0, 1], trajectory[0, 2], 
                           c='green', s=100, label='Start')
                ax3.scatter(trajectory[-1, 0], trajectory[-1, 1], trajectory[-1, 2], 
                           c='red', s=100, label='End')
        
        ax3.set_xlabel('X')
        ax3.set_ylabel('Y')
        ax3.set_zlabel('Z')
        ax3.set_title('Ball Trajectory')
        ax3.legend()
        
        # 4. 에너지 변화
        ax4 = fig.add_subplot(234)
        
        if self.simulation_results:
            ball = self.simulation_results[-1]['balls'][0]
            if ball.energy_history:
                ax4.plot(ball.energy_history, 'b-', alpha=0.7)
                ax4.set_xlabel('Time Steps')
                ax4.set_ylabel('Total Energy')
                ax4.set_title('Energy Evolution')
                ax4.grid(True, alpha=0.3)
        
        # 5. 충돌 횟수 분포
        ax5 = fig.add_subplot(235)
        
        if self.simulation_results:
            collision_counts = [ball.collision_count for ball in self.simulation_results[-1]['balls']]
            ax5.hist(collision_counts, bins=10, alpha=0.7, color='orange')
            ax5.set_xlabel('Collision Count')
            ax5.set_ylabel('Number of Balls')
            ax5.set_title('Collision Distribution')
            ax5.grid(True, alpha=0.3)
        
        # 6. 시뮬레이션 요약
        ax6 = fig.add_subplot(236)
        ax6.axis('off')
        
        summary_text = f"""
        LOTTO SIMULATION SUMMARY
        
        Total Simulations: {len(self.simulation_results)}
        Total Numbers Generated: {len(self.winning_numbers_history)}
        
        Most Frequent: {max(frequency_data.items(), key=lambda x: x[1])}
        Least Frequent: {min(frequency_data.items(), key=lambda x: x[1])}
        
        Average per Number: {len(self.winning_numbers_history) / len(frequency_data):.1f}
        """
        
        ax6.text(0.1, 0.9, summary_text, transform=ax6.transAxes, 
                fontsize=12, verticalalignment='top', fontfamily='monospace')
        
        plt.tight_layout()
        
        # 파일로 저장
        filename = f'/Users/yongholee/Documents/lotto/lotto_analysis_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        print(f"시각화 결과 저장: {filename}")
        
        plt.show()

def main():
    """메인 실행 함수"""
    simulator = LottoSimulator()
    
    # 사용자 입력
    try:
        num_sims = int(input("\n시뮬레이션 횟수를 입력하세요 (기본값: 5): ") or "5")
    except ValueError:
        num_sims = 5
    
    # 시뮬레이션 실행
    results = simulator.run_multiple_simulations(num_sims)
    
    # 결과 분석
    frequency = simulator.analyze_results()
    
    # AI 예측
    predictions = simulator.predict_numbers(frequency)
    
    # 시각화
    simulator.create_visualization(frequency)
    
    # 최종 결과 출력
    print("\n" + "="*60)
    print("🎉 === 최종 AI 로또 번호 예측 결과 === 🎉")
    print("="*60)
    print(f"🎯 추천 번호: {predictions['ai_prediction']}")
    print(f"📊 분석 기반: {num_sims}회 시뮬레이션")
    print(f"⏰ 생성 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    print("📝 이 예측은 물리 시뮬레이션과 통계 분석을 바탕으로 하지만,")
    print("   로또는 순수한 확률 게임임을 기억하세요!")
    print("="*60)

if __name__ == "__main__":
    main()

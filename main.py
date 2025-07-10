"""
Railway 배포용 메인 엔트리 포인트
Web App을 실행합니다.
"""
# Railway가 main.py를 찾으므로 web_app을 import
from web_app import app

if __name__ == "__main__":
    import os
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

# 3D 벡터 연산을 위한 클래스
def vec3(x, y, z):
    return [x, y, z]

def vec_add(a, b):
    return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]

def vec_sub(a, b):
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]

def vec_mul(a, scalar):
    return [a[0]*scalar, a[1]*scalar, a[2]*scalar]

def vec_dot(a, b):
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

def vec_length(a):
    return math.sqrt(a[0]**2 + a[1]**2 + a[2]**2)

def vec_normalize(a):
    l = vec_length(a)
    if l == 0:
        return [0,0,0]
    return [a[0]/l, a[1]/l, a[2]/l]

class Ball:
    def __init__(self, number, position, velocity, radius=1.0):
        self.number = number
        self.position = position
        self.velocity = velocity
        self.radius = radius
        self.trajectory = [position.copy()]
        self.in_hole = False
        self.color = self.get_color_by_number()
        self.time_to_hole = None
        
    def get_color_by_number(self):
        # 번호에 따른 색상 할당
        colors = [
            (255, 50, 50),   # 빨간색 계열
            (50, 255, 50),   # 초록색 계열
            (50, 50, 255),   # 파란색 계열
            (255, 255, 50),  # 노란색 계열
            (255, 50, 255),  # 마젠타 계열
            (50, 255, 255),  # 시안 계열
            (255, 150, 50),  # 주황색 계열
            (150, 50, 255),  # 보라색 계열
            (255, 100, 150), # 분홍색 계열
            (100, 255, 150)  # 라이트 그린 계열
        ]
        return colors[self.number % len(colors)]

    def update(self, dt):
        if not self.in_hole:
            self.position = vec_add(self.position, vec_mul(self.velocity, dt))
            self.trajectory.append(self.position.copy())

# 시뮬레이션 파라미터
NUM_BALLS = 46
BOX_SIZE = 50
BALL_RADIUS = 1.0
HOLE_POSITION = vec3(BOX_SIZE/2, 0, BOX_SIZE/2)
HOLE_RADIUS = 2.0
GRAVITY = vec3(0, -9.8, 0)
FRICTION = 0.98
RESTITUTION = 0.8

# 헤드리스 시뮬레이션 클래스
class LottoSimulation:
    def __init__(self):
        self.balls = []
        self.simulation_results = []
        self.current_simulation = 0
        self.max_simulations = 100
        self.step_count = 0
        
        # Initialize scientific modules
        self.rng = JacksonHwangRNG()
        self.entropy_analyzer = EntropyDriftAnalyzer()
        self.thermo = StatisticalThermodynamics()
        self.quantum_analyzer = ImageQuantumAnalyzer()
        
        # Initialize UI components - headless mode
        self.subscription_ui = None
        
        # Load simulation constants
        self.load_constants()
        self.reset_simulation()
        
    def load_constants(self):
        """Load simulation constants from config"""
        constants = SIMULATION_CONSTANTS
        global BOX_SIZE, BALL_RADIUS, GRAVITY, FRICTION, RESTITUTION, NUM_BALLS, HOLE_RADIUS
        
        BOX_SIZE = constants['BOX_SIZE']
        BALL_RADIUS = constants['BALL_RADIUS']
        GRAVITY = constants['GRAVITY']
        FRICTION = constants['FRICTION']
        RESTITUTION = constants['RESTITUTION']
        NUM_BALLS = constants['NUM_BALLS']
        HOLE_RADIUS = constants['HOLE_RADIUS']
        
    def random_position(self):
        return [
            random.uniform(BALL_RADIUS*2, BOX_SIZE-BALL_RADIUS*2),
            random.uniform(BOX_SIZE/2, BOX_SIZE-BALL_RADIUS*2),
            random.uniform(BALL_RADIUS*2, BOX_SIZE-BALL_RADIUS*2)
        ]
        
    def reset_simulation(self):
        """Reset simulation with scientific initialization"""
        self.balls = []
        self.step_count = 0
        
        # Use Jackson-Hwang RNG for initial positions
        molecular_numbers = self.rng.generate_numbers(NUM_BALLS, 1, NUM_BALLS)
        
        for i in range(NUM_BALLS):
            position = self.random_position()
            velocity = [random.uniform(-5, 5), random.uniform(-5, 5), random.uniform(-5, 5)]
            self.balls.append(Ball(molecular_numbers[i], position, velocity))
            
    def update_physics(self, dt):
        """Update simulation with scientific analysis"""
        # Update ball physics
        for ball in self.balls:
            if not ball.in_hole:
                # Apply gravity
                ball.velocity = vec_add(ball.velocity, vec_mul(GRAVITY, dt))
                
                # Apply friction
                ball.velocity = vec_mul(ball.velocity, FRICTION)
                
                # Update position
                ball.update(dt)
                
                # Check for wall collisions
                self.handle_wall_collisions(ball)
                
        # Check for ball collisions
        self.handle_ball_collisions()
        
        # Check for hole entry
        self.check_hole_entry()
        
        # Perform scientific analysis
        if not any(ball.in_hole for ball in self.balls):
            # Analyze entropy drift
            velocities = np.array([ball.velocity for ball in self.balls])
            analysis = self.entropy_analyzer.analyze_drift(velocities)
            
            if analysis and analysis['is_stable']:
                # Use statistical thermodynamics for optimization
                energies = np.array([vec_length(ball.velocity)**2/2 for ball in self.balls])
                optimized_numbers = self.thermo.optimize_numbers(
                    list(range(1, NUM_BALLS+1)), 
                    num_select=6
                )
                self.simulation_results.append(optimized_numbers)
                
    def handle_wall_collisions(self, ball):
        """Handle wall collisions with improved physics"""
        for i in range(3):
            if ball.position[i] < BALL_RADIUS:
                ball.position[i] = BALL_RADIUS
                ball.velocity[i] = -ball.velocity[i] * RESTITUTION
            elif ball.position[i] > BOX_SIZE - BALL_RADIUS:
                ball.position[i] = BOX_SIZE - BALL_RADIUS
                ball.velocity[i] = -ball.velocity[i] * RESTITUTION
                
    def handle_ball_collisions(self):
        """Handle ball collisions with improved physics"""
        for i in range(len(self.balls)):
            for j in range(i + 1, len(self.balls)):
                ball1 = self.balls[i]
                ball2 = self.balls[j]
                
                if not ball1.in_hole and not ball2.in_hole:
                    relative_pos = vec_sub(ball2.position, ball1.position)
                    distance = vec_length(relative_pos)
                    
                    if distance < 2 * BALL_RADIUS:
                        # Collision response
                        normal = vec_normalize(relative_pos)
                        
                        relative_vel = vec_sub(ball2.velocity, ball1.velocity)
                        impulse = vec_mul(normal, 
                                        vec_dot(relative_vel, normal) * RESTITUTION)
                        
                        ball1.velocity = vec_add(ball1.velocity, impulse)
                        ball2.velocity = vec_sub(ball2.velocity, impulse)
                        
                        # Separate balls
                        overlap = 2 * BALL_RADIUS - distance
                        separation = vec_mul(normal, overlap / 2)
                        ball1.position = vec_sub(ball1.position, separation)
                        ball2.position = vec_add(ball2.position, separation)
                        
    def check_hole_entry(self):
        """Check for ball entry into hole"""
        current_time = time.time()
        for ball in self.balls:
            if not ball.in_hole:
                to_hole = vec_sub(HOLE_POSITION, ball.position)
                distance = vec_length(to_hole)
                
                if distance < HOLE_RADIUS:
                    ball.in_hole = True
                    ball.time_to_hole = current_time

    def get_simulation_data(self):
        """Get current simulation state data for web API"""
        result = {
            'balls': [],
            'hole_position': HOLE_POSITION,
            'box_size': BOX_SIZE,
            'step_count': self.step_count,
            'in_hole_count': sum(1 for ball in self.balls if ball.in_hole),
            'total_balls': len(self.balls)
        }
        
        # Add ball data
        for ball in self.balls:
            ball_data = {
                'number': ball.number,
                'position': ball.position,
                'velocity': ball.velocity,
                'in_hole': ball.in_hole,
                'color': ball.color
            }
            result['balls'].append(ball_data)
            
        return result
        
    def run_single_simulation(self):
        """Run a single simulation and return the results"""
        dt = 0.05
        max_steps = 2000
        
        while self.step_count < max_steps:
            self.update_physics(dt)
            self.step_count += 1
            
            # 7개 이상 들어가면 시뮬레이션 종료
            entered_count = sum(1 for ball in self.balls if ball.in_hole)
            if entered_count >= 7:
                break
                
        # 결과 저장
        entered_balls = sorted([ball.number for ball in self.balls if ball.in_hole])
        self.simulation_results.append(entered_balls[:7])  # 처음 7개만
        
        return entered_balls[:7]

    def run_all_simulations(self):
        """Run multiple simulations and analyze results"""
        results = []
        
        for sim in range(self.max_simulations):
            self.current_simulation = sim
            print(f"\n시뮬레이션 {sim + 1} 시작...")
            self.reset_simulation()
            
            sim_result = self.run_single_simulation()
            results.append(sim_result)
            
            print(f"시뮬레이션 {sim + 1} 완료: {sim_result}")
            
            # 잠시 대기
            time.sleep(0.5)
            
        return results

    def analyze_image(self, image_data):
        """Analyze image and generate numbers based on image data"""
        print("이미지 분석 시작...")
        
        try:
            # 이미지 데이터로 양자 분석 수행
            analysis_result = self.quantum_analyzer.analyze_image(image_data)
            
            # 분석 결과를 바탕으로 번호 생성
            numbers = self.rng.generate_numbers_from_seed(
                seed_value=analysis_result['entropy'],
                count=6
            )
            
            # 열역학 최적화 적용
            optimized_numbers = self.thermo.optimize_numbers(numbers)
            
            return {
                'numbers': sorted(optimized_numbers),
                'analysis': analysis_result
            }
        except Exception as e:
            print(f"이미지 분석 중 오류: {e}")
            return None

class DataAnalyzer:
    def __init__(self, results):
        self.results = results
        self.df = pd.DataFrame(results)
        
    def analyze_frequency(self, return_json=False):
        # 각 번호의 출현 빈도 분석
        all_numbers = []
        for result in self.results:
            all_numbers.extend(result)
            
        frequency = Counter(all_numbers)
        
        print("\n=== 번호 출현 빈도 분석 ===")
        for number in sorted(frequency.keys()):
            print(f"번호 {number:2d}: {frequency[number]:3d}회 ({frequency[number]/len(self.results)*100:.1f}%)")
        
        if return_json:
            return {str(k): v for k, v in frequency.items()}
        return frequency
        
    def plot_frequency_chart(self, frequency):
        numbers = sorted(frequency.keys())
        counts = [frequency[num] for num in numbers]
        
        plt.figure(figsize=(15, 8))
        plt.subplot(2, 2, 1)
        bars = plt.bar(numbers, counts, color='skyblue', edgecolor='navy')
        plt.title('번호별 출현 빈도')
        plt.xlabel('번호')
        plt.ylabel('출현 횟수')
        plt.grid(True, alpha=0.3)
        
        # 가장 자주 나온 번호 강조
        max_count = max(counts)
        for i, (num, count) in enumerate(zip(numbers, counts)):
            if count == max_count:
                bars[i].set_color('red')
                
    def analyze_patterns(self, return_json=False):
        print("\n=== 패턴 분석 ===")
        
        # 연속 번호 분석
        consecutive_pairs = 0
        for result in self.results:
            sorted_result = sorted(result)
            for i in range(len(sorted_result)-1):
                if sorted_result[i+1] - sorted_result[i] == 1:
                    consecutive_pairs += 1
                    
        print(f"연속 번호 쌍 개수: {consecutive_pairs}개")
        
        # 홀짝 분석
        odd_even_stats = []
        for result in self.results:
            odd_count = sum(1 for num in result if num % 2 == 1)
            even_count = len(result) - odd_count
            odd_even_stats.append((odd_count, even_count))
            
        avg_odd = sum(stat[0] for stat in odd_even_stats) / len(odd_even_stats)
        avg_even = sum(stat[1] for stat in odd_even_stats) / len(odd_even_stats)
        
        print(f"평균 홀수 개수: {avg_odd:.1f}개")
        print(f"평균 짝수 개수: {avg_even:.1f}개")
        
        if return_json:
            return {
                'consecutive_pairs': consecutive_pairs,
                'avg_odd': float(avg_odd),
                'avg_even': float(avg_even)
            }
        
    def plot_advanced_analysis(self):
        plt.figure(figsize=(15, 12))
        
        # 홀짝 분포
        plt.subplot(2, 2, 2)
        odd_counts = []
        even_counts = []
        for result in self.results:
            odd_count = sum(1 for num in result if num % 2 == 1)
            even_count = len(result) - odd_count
            odd_counts.append(odd_count)
            even_counts.append(even_count)
            
        plt.hist(odd_counts, bins=range(0, 8), alpha=0.7, label='홀수', color='orange')
        plt.hist(even_counts, bins=range(0, 8), alpha=0.7, label='짝수', color='green')
        plt.title('홀수/짝수 분포')
        plt.xlabel('개수')
        plt.ylabel('빈도')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # 번호 범위 분석
        plt.subplot(2, 2, 3)
        range_counts = {'1-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-46': 0}
        
        for result in self.results:
            for num in result:
                if 1 <= num <= 10:
                    range_counts['1-10'] += 1
                elif 11 <= num <= 20:
                    range_counts['11-20'] += 1
                elif 21 <= num <= 30:
                    range_counts['21-30'] += 1
                elif 31 <= num <= 40:
                    range_counts['31-40'] += 1
                elif 41 <= num <= 46:
                    range_counts['41-46'] += 1
                    
        ranges = list(range_counts.keys())
        counts = list(range_counts.values())
        plt.bar(ranges, counts, color=['red', 'orange', 'yellow', 'green', 'blue'])
        plt.title('번호 범위별 출현 빈도')
        plt.xlabel('번호 범위')
        plt.ylabel('출현 횟수')
        plt.grid(True, alpha=0.3)
        
        # 시뮬레이션별 추이
        plt.subplot(2, 2, 4)
        sim_numbers = list(range(1, len(self.results) + 1))
        first_numbers = [result[0] if result else 0 for result in self.results]
        plt.plot(sim_numbers, first_numbers, 'bo-', markersize=4)
        plt.title('시뮬레이션별 첫 번째 당첨 번호')
        plt.xlabel('시뮬레이션 번호')
        plt.ylabel('첫 번째 당첨 번호')
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()

    def predict_next_numbers(self, frequency, return_json=False):
        print("\n=== 다음 당첨 번호 예측 ===")
        
        # 빈도 기반 예측
        sorted_by_frequency = sorted(frequency.items(), key=lambda x: x[1], reverse=True)
        high_freq_numbers = [num for num, count in sorted_by_frequency[:15]]
        
        # 최근 트렌드 분석 (최근 20% 시뮬레이션)
        recent_count = max(1, len(self.results) // 5)
        recent_results = self.results[-recent_count:]
        recent_numbers = []
        for result in recent_results:
            recent_numbers.extend(result)
        recent_frequency = Counter(recent_numbers)
        
        # 가중치 계산 (전체 빈도 70% + 최근 트렌드 30%)
        weighted_scores = {}
        for num in range(1, 47):
            total_freq = frequency.get(num, 0)
            recent_freq = recent_frequency.get(num, 0)
            weighted_scores[num] = total_freq * 0.7 + recent_freq * 3 * 0.3
            
        # 예측 번호 생성
        sorted_predictions = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)
        predicted_numbers = [num for num, score in sorted_predictions[:7]]
        
        print(f"예측된 7개 번호: {sorted(predicted_numbers)}")
        print("\n각 번호별 예측 근거:")
        
        prediction_details = {}
        for num in sorted(predicted_numbers):
            total_freq = frequency.get(num, 0)
            recent_freq = recent_frequency.get(num, 0)
            score = weighted_scores[num]
            print(f"번호 {num:2d}: 전체 {total_freq:3d}회, 최근 {recent_freq:2d}회, 점수 {score:.1f}")
            
            prediction_details[num] = {
                'total_frequency': total_freq,
                'recent_frequency': recent_freq,
                'score': float(score)
            }
            
        if return_json:
            return {
                'predicted_numbers': sorted(predicted_numbers),
                'details': prediction_details
            }
            
        return sorted(predicted_numbers)

# API 유틸리티 함수
def api_generate_numbers(seed=None, image_data=None):
    """API용 번호 생성 함수"""
    # 시뮬레이션 인스턴스 생성
    simulation = LottoSimulation()
    
    # 이미지 분석이 있으면 이미지 기반 생성
    if image_data:
        result = simulation.analyze_image(image_data)
        if result:
            return result
    
    # 일반 생성
    simulation.reset_simulation()
    numbers = simulation.run_single_simulation()
    
    # 추가 분석 실행
    analyzer = DataAnalyzer([numbers])
    frequency = analyzer.analyze_frequency(return_json=True)
    patterns = analyzer.analyze_patterns(return_json=True)
    
    return {
        'numbers': numbers,
        'frequency': frequency,
        'patterns': patterns
    }

def main():
    print("=== 로또 과학적 시뮬레이션 CLI 버전 시작 ===")
    
    # 시뮬레이션 실행
    simulation = LottoSimulation()
    results = simulation.run_all_simulations()
    
    if not results:
        print("시뮬레이션이 중단되었습니다.")
        return
        
    print(f"\n총 {len(results)}개의 시뮬레이션이 완료되었습니다.")
    
    # 데이터 분석
    analyzer = DataAnalyzer(results)
    frequency = analyzer.analyze_frequency()
    analyzer.analyze_patterns()
    
    # 예측
    predicted = analyzer.predict_next_numbers(frequency)
    
    # 차트 생성
    analyzer.plot_frequency_chart(frequency)
    analyzer.plot_advanced_analysis()
    
    # 결과 요약
    print("\n=== 시뮬레이션 결과 요약 ===")
    print(f"총 시뮬레이션 횟수: {len(results)}")
    print(f"가장 자주 나온 번호: {max(frequency.items(), key=lambda x: x[1])}")
    print(f"가장 적게 나온 번호: {min(frequency.items(), key=lambda x: x[1])}")
    print(f"AI 예측 다음 당첨 번호: {sorted(predicted)}")

if __name__ == "__main__":
    main()

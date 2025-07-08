#!/usr/bin/env python3
"""
로또 시뮬레이션 테스트 스크립트
"""
from main import LottoSimulation, DataAnalyzer

def run_test_simulation():
    print("===== 로또 시뮬레이션 테스트 시작 =====")
    
    # 시뮬레이션 인스턴스 생성
    simulation = LottoSimulation()
    
    # 단일 시뮬레이션 실행
    print("단일 시뮬레이션 시작...")
    result = simulation.run_single_simulation()
    print(f"시뮬레이션 결과: {result}")
    
    # 여러 시뮬레이션 실행
    print("\n10개 시뮬레이션 시작...")
    simulation.max_simulations = 10
    results = simulation.run_all_simulations()
    print(f"시뮬레이션 완료: {len(results)}개")
    
    # 결과 분석
    print("\n결과 분석 중...")
    analyzer = DataAnalyzer(results)
    frequency = analyzer.analyze_frequency()
    analyzer.analyze_patterns()
    
    # 예측
    print("\n예측 생성 중...")
    predicted = analyzer.predict_next_numbers(frequency)
    print(f"예측된 번호: {predicted}")
    
    print("\n===== 로또 시뮬레이션 테스트 완료 =====")

if __name__ == "__main__":
    run_test_simulation()

"""
Optimized main application with memory management
"""
import sys
import argparse
from typing import Optional
from api.lotto_api import LottoAPI
from utils.memory_manager import PerformanceTimer

class OptimizedLottoApp:
    """Memory-optimized lotto application"""
    
    def __init__(self):
        self.api = LottoAPI()
        self.timer = PerformanceTimer()
        
    def run_single_simulation(self) -> None:
        """Run a single simulation"""
        print("=== 단일 시뮬레이션 실행 ===")
        self.timer.start_timer('single_sim')
        
        result = self.api.generate_single_numbers()
        
        elapsed = self.timer.stop_timer('single_sim')
        
        if result['success']:
            print(f"생성된 번호: {sorted(result['numbers'])}")
            print(f"실행 시간: {elapsed:.2f}초")
            
            analysis = result['analysis']
            print(f"홀수/짝수: {analysis['odd_count']}/{analysis['even_count']}")
            print(f"번호 합계: {analysis['sum_total']}")
            print(f"평균: {analysis['average']}")
            
            memory_usage = result['resource_usage']['memory']['current_memory_mb']
            print(f"메모리 사용량: {memory_usage['rss']:.1f} MB")
        else:
            print(f"오류 발생: {result['error']}")
            
    def run_batch_simulation(self, num_simulations: int = 10) -> None:
        """Run batch simulation"""
        print(f"=== 배치 시뮬레이션 실행 ({num_simulations}회) ===")
        self.timer.start_timer('batch_sim')
        
        result = self.api.run_batch_simulation(num_simulations)
        
        elapsed = self.timer.stop_timer('batch_sim')
        
        if result['success']:
            print(f"총 {result['total_simulations']}회 시뮬레이션 완료")
            print(f"실행 시간: {elapsed:.2f}초")
            print(f"평균 시뮬레이션 시간: {elapsed/num_simulations:.3f}초")
            
            # Analysis summary
            analysis = result['analysis']
            freq_analysis = analysis['frequency_analysis']
            pattern_analysis = analysis['pattern_analysis']
            predictions = analysis['predictions']
            
            print("\n=== 분석 결과 ===")
            if freq_analysis.get('most_frequent'):
                most_freq = freq_analysis['most_frequent']
                print(f"가장 자주 나온 번호: {most_freq['number']} ({most_freq['count']}회)")
                
            if freq_analysis.get('least_frequent'):
                least_freq = freq_analysis['least_frequent']
                print(f"가장 적게 나온 번호: {least_freq['number']} ({least_freq['count']}회)")
                
            print(f"평균 홀수 개수: {pattern_analysis['avg_odd']}")
            print(f"평균 짝수 개수: {pattern_analysis['avg_even']}")
            print(f"연속 번호 쌍: {pattern_analysis['consecutive_pairs']}개")
            
            print("\n=== AI 예측 번호 ===")
            pred_numbers = predictions['predicted_numbers']
            confidence = predictions['confidence']
            print(f"예측 번호: {sorted(pred_numbers)}")
            print(f"신뢰도: {confidence*100:.0f}%")
            
            # Resource usage
            memory_usage = result['resource_usage']['memory']['current_memory_mb']
            print(f"\n메모리 사용량: {memory_usage['rss']:.1f} MB")
            
        else:
            print(f"오류 발생: {result['error']}")
            
    def interactive_mode(self) -> None:
        """Interactive mode"""
        print("=== 로또 과학적 시뮬레이션 (최적화 버전) ===")
        print("메모리 효율성과 성능을 개선한 버전입니다.")
        
        while True:
            print("\n메뉴:")
            print("1. 단일 시뮬레이션")
            print("2. 배치 시뮬레이션 (10회)")
            print("3. 대용량 시뮬레이션 (100회)")
            print("4. 현재 예측 보기")
            print("5. 메모리 정리")
            print("6. 종료")
            
            choice = input("선택하세요 (1-6): ").strip()
            
            try:
                if choice == '1':
                    self.run_single_simulation()
                elif choice == '2':
                    self.run_batch_simulation(10)
                elif choice == '3':
                    self.run_batch_simulation(100)
                elif choice == '4':
                    self.show_current_predictions()
                elif choice == '5':
                    self.cleanup_memory()
                elif choice == '6':
                    print("프로그램을 종료합니다.")
                    break
                else:
                    print("잘못된 선택입니다.")
                    
            except KeyboardInterrupt:
                print("\n\n프로그램이 중단되었습니다.")
                break
            except Exception as e:
                print(f"오류 발생: {e}")
                
    def show_current_predictions(self) -> None:
        """Show current predictions"""
        print("=== 현재 예측 결과 ===")
        result = self.api.get_predictions()
        
        if result['success']:
            predictions = result['predictions']
            if predictions:
                pred_numbers = predictions['predicted_numbers']
                confidence = predictions['confidence']
                print(f"예측 번호: {sorted(pred_numbers)}")
                print(f"신뢰도: {confidence*100:.0f}%")
                
                print("\n상세 정보:")
                for num, details in predictions['details'].items():
                    print(f"번호 {num}: 빈도 {details['total_frequency']}, 점수 {details['score']}")
            else:
                print("아직 충분한 데이터가 없습니다. 시뮬레이션을 먼저 실행해주세요.")
        else:
            print(f"오류 발생: {result['error']}")
            
    def cleanup_memory(self) -> None:
        """Manual memory cleanup"""
        print("=== 메모리 정리 중 ===")
        result = self.api.cleanup()
        
        if result['success']:
            cleanup_result = result['cleanup_result']
            print(f"해제된 객체 수: {cleanup_result['objects_collected']}")
            print(f"해제된 메모리: {cleanup_result['memory_freed']:.1f} MB")
            
            memory_usage = result['resource_usage']['memory']['current_memory_mb']
            print(f"현재 메모리 사용량: {memory_usage['rss']:.1f} MB")
        else:
            print(f"정리 중 오류 발생: {result['error']}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='최적화된 로또 과학적 시뮬레이션')
    parser.add_argument('--mode', choices=['single', 'batch', 'interactive'], 
                       default='interactive', help='실행 모드')
    parser.add_argument('--simulations', type=int, default=10, 
                       help='배치 모드에서 시뮬레이션 횟수')
    
    args = parser.parse_args()
    
    app = OptimizedLottoApp()
    
    try:
        if args.mode == 'single':
            app.run_single_simulation()
        elif args.mode == 'batch':
            app.run_batch_simulation(args.simulations)
        else:
            app.interactive_mode()
            
    except KeyboardInterrupt:
        print("\n프로그램이 중단되었습니다.")
    except Exception as e:
        print(f"예상치 못한 오류 발생: {e}")
    finally:
        # Final cleanup
        app.cleanup_memory()

if __name__ == "__main__":
    main()

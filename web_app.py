"""
Railway 배포용 모바일 적응형 로또 웹 애플리케이션
"""
import os
import json
import sys
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import logging

# Import 에러 처리를 위한 try-except 블록
try:
    from api.lotto_api import LottoAPI
    from utils.memory_manager import ResourceManager
    API_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Full API modules not available: {e}")
    try:
        # 간단한 API 사용
        from simple_api import SimpleLottoAPI, SimpleResourceManager
        LottoAPI = SimpleLottoAPI
        ResourceManager = SimpleResourceManager
        API_AVAILABLE = True
        logging.info("Using simplified API")
    except ImportError as e2:
        logging.error(f"Simple API also not available: {e2}")
        API_AVAILABLE = False
    # 대체 클래스 정의
    class MockAPI:
        def generate_single_numbers(self):
            import random
            numbers = sorted(random.sample(range(1, 47), 6))
            return {
                'success': True,
                'numbers': numbers,
                'analysis': {
                    'odd_count': sum(1 for n in numbers if n % 2 == 1),
                    'even_count': sum(1 for n in numbers if n % 2 == 0),
                    'sum_total': sum(numbers),
                    'average': round(sum(numbers) / len(numbers), 1)
                }
            }
        
        def run_batch_simulation(self, count):
            import random
            results = []
            for _ in range(count):
                numbers = sorted(random.sample(range(1, 47), 6))
                results.append(numbers)
            
            return {
                'success': True,
                'total_simulations': count,
                'results': results,
                'analysis': {
                    'frequency_analysis': {'total_simulations': count},
                    'pattern_analysis': {'avg_odd': 3.0, 'avg_even': 3.0, 'consecutive_pairs': 0}
                }
            }
        
        def get_predictions(self):
            import random
            numbers = sorted(random.sample(range(1, 47), 7))
            return {
                'success': True,
                'predictions': {
                    'predicted_numbers': numbers,
                    'confidence': 0.7,
                    'details': {num: {'total_frequency': 5, 'score': 10.0} for num in numbers}
                }
            }
        
        def get_analysis_summary(self):
            return {'success': True, 'summary': {}}
        
        def cleanup(self):
            return {'success': True, 'cleanup_result': {'objects_collected': 0, 'memory_freed': 0}}
    
    class MockResourceManager:
        def get_resource_status(self):
            return {'memory': {'current_memory_mb': {'rss': 50}}}

# Flask 앱 초기화
app = Flask(__name__, 
           template_folder='templates',
           static_folder='static')
CORS(app)

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 전역 인스턴스
if API_AVAILABLE:
    lotto_api = LottoAPI()
    resource_manager = ResourceManager()
else:
    lotto_api = MockAPI()
    resource_manager = MockResourceManager()
    logger.warning("Using mock API due to import errors")

@app.route('/')
def index():
    """메인 페이지 - 모바일 적응형"""
    return render_template('mobile_index.html')

@app.route('/api/generate-single')
def api_generate_single():
    """단일 번호 생성 API"""
    try:
        result = lotto_api.generate_single_numbers()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Single generation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate-batch')
def api_generate_batch():
    """배치 번호 생성 API"""
    try:
        num_simulations = request.args.get('count', 10, type=int)
        num_simulations = min(num_simulations, 50)  # 최대 50개로 제한
        
        result = lotto_api.run_batch_simulation(num_simulations)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Batch generation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predictions')
def api_predictions():
    """현재 예측 결과 API"""
    try:
        result = lotto_api.get_predictions()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Predictions error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analysis')
def api_analysis():
    """분석 결과 API"""
    try:
        result = lotto_api.get_analysis_summary()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cleanup')
def api_cleanup():
    """메모리 정리 API"""
    try:
        result = lotto_api.cleanup()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Cleanup error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/status')
def api_status():
    """시스템 상태 API"""
    try:
        resource_status = resource_manager.get_resource_status()
        return jsonify({
            'success': True,
            'status': 'healthy',
            'resource_usage': resource_status
        })
    except Exception as e:
        logger.error(f"Status error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health')
def health_check():
    """헬스 체크 엔드포인트 (Railway용)"""
    return jsonify({
        'status': 'healthy',
        'service': 'lotto-scientific-simulation'
    })

@app.errorhandler(404)
def not_found(error):
    """404 에러 핸들러"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """500 에러 핸들러"""
    logger.error(f"Internal error: {error}")
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Railway에서 제공하는 PORT 환경변수 사용
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting application on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)

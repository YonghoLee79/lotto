import numpy as np
from config import ENTROPY_ANALYSIS_CONFIG as CONFIG

class EntropyDriftAnalyzer:
    def __init__(self):
        self.window_size = CONFIG['window_size']
        self.drift_threshold = CONFIG['drift_threshold']
        self.convergence_rate = CONFIG['convergence_rate']
        self.entropy_history = []
        
    def calculate_entropy(self, data):
        """Calculate Shannon entropy of the data"""
        if isinstance(data, list):
            data = np.array(data)
            
        # Normalize data
        if len(data.shape) > 1:
            data = np.linalg.norm(data, axis=1)
            
        hist, _ = np.histogram(data, bins='auto', density=True)
        entropy = -np.sum(hist * np.log2(hist + 1e-10))
        return entropy
        
    def analyze_drift(self, new_data):
        """Analyze entropy drift in the time series"""
        current_entropy = self.calculate_entropy(new_data)
        self.entropy_history.append(current_entropy)
        
        if len(self.entropy_history) < self.window_size:
            return None, 0.0
            
        # Calculate moving average
        window = self.entropy_history[-self.window_size:]
        ma = np.mean(window)
        
        # Calculate drift
        drift = (current_entropy - ma) / ma
        
        # Calculate convergence
        if len(self.entropy_history) >= 2 * self.window_size:
            prev_window = self.entropy_history[-2*self.window_size:-self.window_size]
            prev_ma = np.mean(prev_window)
            convergence = abs(ma - prev_ma) / prev_ma
        else:
            convergence = float('inf')
            
        return {
            'entropy': current_entropy,
            'drift': drift,
            'convergence': convergence,
            'is_stable': abs(drift) < self.drift_threshold and convergence < self.convergence_rate
        }
        
    def get_distribution_bias(self, numbers, max_num=45):
        """Analyze bias in number distribution"""
        freq = np.zeros(max_num)
        for num in numbers:
            freq[num-1] += 1
            
        freq_entropy = self.calculate_entropy(freq)
        uniform_entropy = self.calculate_entropy(np.ones(max_num))
        
        bias = 1 - (freq_entropy / uniform_entropy)
        return bias
        
    def get_recommendations(self, analysis_result):
        """Generate recommendations based on analysis"""
        if analysis_result is None:
            return ["더 많은 데이터가 필요합니다."]
            
        recommendations = []
        
        if abs(analysis_result['drift']) > self.drift_threshold:
            if analysis_result['drift'] > 0:
                recommendations.append("엔트로피가 증가 중입니다. 더 안정적인 패턴을 찾으세요.")
            else:
                recommendations.append("엔트로피가 감소 중입니다. 더 다양한 조합을 시도하세요.")
                
        if analysis_result['convergence'] > self.convergence_rate:
            recommendations.append("시스템이 아직 수렴하지 않았습니다. 더 많은 시뮬레이션이 필요합니다.")
            
        if not recommendations:
            recommendations.append("현재 시스템은 안정적입니다. 예측을 진행하세요.")
            
        return recommendations

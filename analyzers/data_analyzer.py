"""
Memory-efficient data analyzer with streaming support
"""
import gc
from collections import Counter, defaultdict
from typing import List, Dict, Any, Iterator, Optional
import numpy as np

class StreamingDataAnalyzer:
    """Memory-efficient data analyzer that processes data in streams"""
    
    def __init__(self):
        self.frequency_counter = Counter()
        self.total_simulations = 0
        self.pattern_stats = {
            'consecutive_pairs': 0,
            'odd_counts': [],
            'even_counts': [],
            'range_counts': defaultdict(int)
        }
        
    def add_result(self, result: List[int]) -> None:
        """Add a single simulation result"""
        if not result:
            return
            
        # Update frequency
        self.frequency_counter.update(result)
        self.total_simulations += 1
        
        # Update pattern statistics
        self._update_patterns(result)
        
    def add_results_batch(self, results: List[List[int]]) -> None:
        """Add batch of results efficiently"""
        for result in results:
            self.add_result(result)
            
    def _update_patterns(self, result: List[int]) -> None:
        """Update pattern statistics for a single result"""
        sorted_result = sorted(result)
        
        # Count consecutive pairs
        for i in range(len(sorted_result) - 1):
            if sorted_result[i + 1] - sorted_result[i] == 1:
                self.pattern_stats['consecutive_pairs'] += 1
                
        # Count odd/even
        odd_count = sum(1 for num in result if num % 2 == 1)
        even_count = len(result) - odd_count
        self.pattern_stats['odd_counts'].append(odd_count)
        self.pattern_stats['even_counts'].append(even_count)
        
        # Count by ranges
        for num in result:
            if 1 <= num <= 10:
                self.pattern_stats['range_counts']['1-10'] += 1
            elif 11 <= num <= 20:
                self.pattern_stats['range_counts']['11-20'] += 1
            elif 21 <= num <= 30:
                self.pattern_stats['range_counts']['21-30'] += 1
            elif 31 <= num <= 40:
                self.pattern_stats['range_counts']['31-40'] += 1
            elif 41 <= num <= 46:
                self.pattern_stats['range_counts']['41-46'] += 1
                
    def get_frequency_analysis(self) -> Dict[str, Any]:
        """Get frequency analysis results"""
        if self.total_simulations == 0:
            return {}
            
        frequency_dict = {}
        for number in sorted(self.frequency_counter.keys()):
            count = self.frequency_counter[number]
            percentage = (count / self.total_simulations) * 100
            frequency_dict[str(number)] = {
                'count': count,
                'percentage': round(percentage, 1)
            }
            
        return {
            'frequency': frequency_dict,
            'total_simulations': self.total_simulations,
            'most_frequent': self._get_most_frequent(),
            'least_frequent': self._get_least_frequent()
        }
        
    def get_pattern_analysis(self) -> Dict[str, Any]:
        """Get pattern analysis results"""
        if self.total_simulations == 0:
            return {}
            
        odd_counts = self.pattern_stats['odd_counts']
        even_counts = self.pattern_stats['even_counts']
        
        return {
            'consecutive_pairs': self.pattern_stats['consecutive_pairs'],
            'avg_odd': round(sum(odd_counts) / len(odd_counts), 1) if odd_counts else 0,
            'avg_even': round(sum(even_counts) / len(even_counts), 1) if even_counts else 0,
            'range_distribution': dict(self.pattern_stats['range_counts'])
        }
        
    def _get_most_frequent(self) -> Optional[Dict[str, Any]]:
        """Get most frequent number"""
        if not self.frequency_counter:
            return None
        number, count = self.frequency_counter.most_common(1)[0]
        return {'number': number, 'count': count}
        
    def _get_least_frequent(self) -> Optional[Dict[str, Any]]:
        """Get least frequent number"""
        if not self.frequency_counter:
            return None
        number, count = self.frequency_counter.most_common()[-1]
        return {'number': number, 'count': count}
        
    def predict_numbers(self, num_predictions: int = 7) -> Dict[str, Any]:
        """Predict next numbers based on analysis"""
        if self.total_simulations == 0:
            return {}
            
        # Calculate weighted scores
        weighted_scores = {}
        recent_weight = 0.3
        total_weight = 0.7
        
        # Get recent frequency (last 20% of data)
        recent_count = max(1, len(self.pattern_stats['odd_counts']) // 5)
        if recent_count > 0:
            # This is simplified - in real implementation, we'd track recent results
            recent_frequency = self.frequency_counter
        else:
            recent_frequency = Counter()
            
        for num in range(1, 47):
            total_freq = self.frequency_counter.get(num, 0)
            recent_freq = recent_frequency.get(num, 0)
            weighted_scores[num] = total_freq * total_weight + recent_freq * 3 * recent_weight
            
        # Get top predictions
        sorted_predictions = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)
        predicted_numbers = [num for num, score in sorted_predictions[:num_predictions]]
        
        # Prepare detailed results
        prediction_details = {}
        for num in predicted_numbers:
            prediction_details[num] = {
                'total_frequency': self.frequency_counter.get(num, 0),
                'score': round(weighted_scores[num], 1)
            }
            
        return {
            'predicted_numbers': sorted(predicted_numbers),
            'details': prediction_details,
            'confidence': self._calculate_confidence()
        }
        
    def _calculate_confidence(self) -> float:
        """Calculate prediction confidence based on data amount"""
        if self.total_simulations < 10:
            return 0.1
        elif self.total_simulations < 50:
            return 0.5
        elif self.total_simulations < 100:
            return 0.7
        else:
            return 0.9
            
    def reset(self) -> None:
        """Reset analyzer state"""
        self.frequency_counter.clear()
        self.total_simulations = 0
        self.pattern_stats = {
            'consecutive_pairs': 0,
            'odd_counts': [],
            'even_counts': [],
            'range_counts': defaultdict(int)
        }
        gc.collect()
        
    def get_summary(self) -> Dict[str, Any]:
        """Get comprehensive analysis summary"""
        return {
            'frequency_analysis': self.get_frequency_analysis(),
            'pattern_analysis': self.get_pattern_analysis(),
            'predictions': self.predict_numbers()
        }

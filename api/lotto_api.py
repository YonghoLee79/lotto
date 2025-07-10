"""
Memory-efficient API handlers
"""
import gc
from typing import Dict, Any, Optional, List
import json
from core.simulation_manager import SimulationManager, SimulationBatch
from analyzers.data_analyzer import StreamingDataAnalyzer
from utils.memory_manager import ResourceManager
from jackson_hwang_rng import JacksonHwangRNG
from entropy_analyzer import EntropyDriftAnalyzer
from statistical_thermodynamics import StatisticalThermodynamics

class LottoAPI:
    """Memory-efficient API for lotto simulation"""
    
    def __init__(self):
        self.resource_manager = ResourceManager()
        self.rng = None  # Lazy loading
        self.entropy_analyzer = None  # Lazy loading
        self.thermo = None  # Lazy loading
        self.analyzer = StreamingDataAnalyzer()
        
    def _get_rng(self) -> JacksonHwangRNG:
        """Lazy load RNG"""
        if self.rng is None:
            self.rng = JacksonHwangRNG()
        return self.rng
        
    def _get_entropy_analyzer(self) -> EntropyDriftAnalyzer:
        """Lazy load entropy analyzer"""
        if self.entropy_analyzer is None:
            self.entropy_analyzer = EntropyDriftAnalyzer()
        return self.entropy_analyzer
        
    def _get_thermo(self) -> StatisticalThermodynamics:
        """Lazy load thermodynamics"""
        if self.thermo is None:
            self.thermo = StatisticalThermodynamics()
        return self.thermo
        
    def generate_single_numbers(self, seed: Optional[int] = None) -> Dict[str, Any]:
        """Generate single set of numbers with minimal memory usage"""
        try:
            # Generate ball numbers using RNG
            rng = self._get_rng()
            ball_numbers = rng.generate_numbers(46, 1, 46)
            
            # Run single simulation
            sim_manager = SimulationManager()
            sim_manager.start_simulation(ball_numbers)
            
            while sim_manager.run_simulation_step():
                pass
                
            results = sim_manager.get_results()
            
            # Clean up immediately
            sim_manager.cleanup()
            
            # Basic analysis
            basic_analysis = self._get_basic_analysis(results)
            
            return {
                'success': True,
                'numbers': results,
                'analysis': basic_analysis,
                'resource_usage': self.resource_manager.get_resource_status()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'resource_usage': self.resource_manager.get_resource_status()
            }
            
    def run_batch_simulation(self, num_simulations: int = 10) -> Dict[str, Any]:
        """Run batch simulation with memory management"""
        try:
            self.analyzer.reset()
            rng = self._get_rng()
            
            # Generator function for ball numbers
            def number_generator():
                return rng.generate_numbers(46, 1, 46)
                
            # Run simulations in batches
            batch_runner = SimulationBatch(batch_size=5)
            results = []
            
            for i, result in enumerate(batch_runner.run_simulations(num_simulations, number_generator)):
                results.append(result)
                self.analyzer.add_result(result)
                
                # Check memory and cleanup if needed
                if (i + 1) % 10 == 0:
                    self.resource_manager.check_and_cleanup()
                    
            # Get comprehensive analysis
            analysis = self.analyzer.get_summary()
            
            return {
                'success': True,
                'total_simulations': len(results),
                'results': results[-10:],  # Return only last 10 results to save memory
                'analysis': analysis,
                'resource_usage': self.resource_manager.get_resource_status()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'resource_usage': self.resource_manager.get_resource_status()
            }
            
    def get_predictions(self) -> Dict[str, Any]:
        """Get current predictions based on accumulated data"""
        try:
            predictions = self.analyzer.predict_numbers()
            return {
                'success': True,
                'predictions': predictions,
                'resource_usage': self.resource_manager.get_resource_status()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
            
    def get_analysis_summary(self) -> Dict[str, Any]:
        """Get current analysis summary"""
        try:
            summary = self.analyzer.get_summary()
            return {
                'success': True,
                'summary': summary,
                'resource_usage': self.resource_manager.get_resource_status()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
            
    def _get_basic_analysis(self, numbers: List[int]) -> Dict[str, Any]:
        """Get basic analysis for a single result"""
        if not numbers:
            return {}
            
        odd_count = sum(1 for num in numbers if num % 2 == 1)
        even_count = len(numbers) - odd_count
        
        # Range distribution
        ranges = {'1-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-46': 0}
        for num in numbers:
            if 1 <= num <= 10:
                ranges['1-10'] += 1
            elif 11 <= num <= 20:
                ranges['11-20'] += 1
            elif 21 <= num <= 30:
                ranges['21-30'] += 1
            elif 31 <= num <= 40:
                ranges['31-40'] += 1
            elif 41 <= num <= 46:
                ranges['41-46'] += 1
                
        return {
            'odd_count': odd_count,
            'even_count': even_count,
            'range_distribution': ranges,
            'sum_total': sum(numbers),
            'average': round(sum(numbers) / len(numbers), 1) if numbers else 0
        }
        
    def cleanup(self) -> Dict[str, Any]:
        """Manual cleanup of all resources"""
        try:
            # Reset analyzer
            self.analyzer.reset()
            
            # Clear lazy-loaded objects
            self.rng = None
            self.entropy_analyzer = None
            self.thermo = None
            
            # Force garbage collection
            gc_result = self.resource_manager.memory_monitor.force_garbage_collection()
            
            return {
                'success': True,
                'cleanup_result': gc_result,
                'resource_usage': self.resource_manager.get_resource_status()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

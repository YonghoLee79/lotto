import unittest
import numpy as np
from jackson_hwang_rng import JacksonHwangRNG
from entropy_analyzer import EntropyDriftAnalyzer
from statistical_thermodynamics import StatisticalThermodynamics

class TestLottoScientific(unittest.TestCase):
    def setUp(self):
        self.rng = JacksonHwangRNG()
        self.entropy_analyzer = EntropyDriftAnalyzer()
        self.thermo = StatisticalThermodynamics()
        
    def test_jackson_hwang_rng(self):
        """Test Jackson-Hwang RNG number generation"""
        numbers = self.rng.generate_numbers()
        self.assertEqual(len(numbers), 6)
        self.assertTrue(all(1 <= n <= 45 for n in numbers))
        self.assertEqual(len(set(numbers)), 6)  # Check for duplicates
        
    def test_entropy_analysis(self):
        """Test entropy drift analysis"""
        # Generate some test data
        data = np.random.normal(0, 1, (100, 3))
        analysis = self.entropy_analyzer.analyze_drift(data)
        
        self.assertIsNotNone(analysis)
        self.assertIn('entropy', analysis)
        self.assertIn('drift', analysis)
        self.assertIn('convergence', analysis)
        self.assertIn('is_stable', analysis)
        
    def test_thermodynamics(self):
        """Test statistical thermodynamics"""
        # Generate test energy levels
        energy_levels = np.array([1, 2, 3, 4, 5])
        probs = np.array([0.3, 0.25, 0.2, 0.15, 0.1])
        
        # Test partition function
        Z = self.thermo.partition_function(energy_levels)
        self.assertGreater(Z, 0)
        
        # Test entropy calculation
        S = self.thermo.entropy(energy_levels, probs)
        self.assertGreater(S, 0)
        
        # Test number optimization
        numbers = self.thermo.optimize_numbers(list(range(1, 46)))
        self.assertEqual(len(numbers), 6)
        self.assertTrue(all(1 <= n <= 45 for n in numbers))
        
if __name__ == '__main__':
    unittest.main()

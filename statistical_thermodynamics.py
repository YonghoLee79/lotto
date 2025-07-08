import numpy as np
from scipy import constants

class StatisticalThermodynamics:
    def __init__(self, temperature=298.15):
        self.temperature = temperature
        self.k_B = constants.Boltzmann
        self.h = constants.Planck
        
    def maxwell_boltzmann_distribution(self, velocities):
        """Calculate Maxwell-Boltzmann distribution"""
        m = 1.0  # 단위 질량
        v_mag = np.linalg.norm(velocities, axis=1)
        
        # Maxwell-Boltzmann 분포 계산
        prob = (m/(2*np.pi*self.k_B*self.temperature))**(3/2) * \
               4*np.pi * v_mag**2 * \
               np.exp(-m*v_mag**2/(2*self.k_B*self.temperature))
               
        return prob
        
    def partition_function(self, energy_levels):
        """Calculate partition function"""
        Z = np.sum(np.exp(-energy_levels/(self.k_B*self.temperature)))
        return Z
        
    def free_energy(self, energy_levels):
        """Calculate Helmholtz free energy"""
        Z = self.partition_function(energy_levels)
        F = -self.k_B * self.temperature * np.log(Z)
        return F
        
    def entropy(self, energy_levels, probabilities):
        """Calculate entropy using Gibbs formula"""
        S = -self.k_B * np.sum(probabilities * np.log(probabilities + 1e-10))
        return S
        
    def optimize_numbers(self, candidates, num_select=6):
        """최적의 로또 번호 선택"""
        # 숫자들의 에너지 레벨 계산 (간단한 모델)
        energy_levels = np.array(candidates, dtype=float)
        energy_levels = energy_levels / np.max(energy_levels)  # 정규화
        
        # Boltzmann 분포에 따른 확률 계산
        probabilities = np.exp(-energy_levels/(self.k_B*self.temperature))
        probabilities = probabilities / np.sum(probabilities)
        
        # 자유 에너지 최소화 원리에 따른 선택
        selected_indices = np.argsort(probabilities)[-num_select:]
        selected_numbers = [candidates[i] for i in selected_indices]
        
        return sorted(selected_numbers)
        
    def calculate_critical_points(self, energies, temperatures):
        """상전이 임계점 계산"""
        critical_points = []
        
        for i in range(1, len(temperatures)-1):
            # 자유 에너지의 2차 미분 계산
            F_prev = self.free_energy(energies[i-1])
            F_curr = self.free_energy(energies[i])
            F_next = self.free_energy(energies[i+1])
            
            second_derivative = (F_next - 2*F_curr + F_prev) / \
                              ((temperatures[i+1] - temperatures[i-1])/2)**2
                              
            # 임계점 감지 (2차 미분이 0에 가까운 지점)
            if abs(second_derivative) < 1e-6:
                critical_points.append({
                    'temperature': temperatures[i],
                    'free_energy': F_curr,
                    'entropy': self.entropy(energies[i], 
                              np.exp(-energies[i]/(self.k_B*temperatures[i])))
                })
                
        return critical_points

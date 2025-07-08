import numpy as np
from config import MOLECULAR_SIMULATION_CONFIG as CONFIG

class JacksonHwangRNG:
    def __init__(self):
        self.num_particles = CONFIG['num_particles']
        self.temperature = CONFIG['temperature']
        self.pressure = CONFIG['pressure']
        self.time_step = CONFIG['time_step']
        self.equilibrium_steps = CONFIG['equilibrium_steps']
        
        # Initialize particle states
        self.positions = np.random.rand(self.num_particles, 3)
        self.velocities = np.random.normal(0, np.sqrt(self.temperature), (self.num_particles, 3))
        self.masses = np.ones(self.num_particles)
        
    def calculate_forces(self):
        """Lennard-Jones potential for molecular interactions"""
        forces = np.zeros((self.num_particles, 3))
        for i in range(self.num_particles):
            for j in range(i + 1, self.num_particles):
                r = self.positions[j] - self.positions[i]
                r_mag = np.linalg.norm(r)
                
                # Avoid division by zero
                if r_mag < 1e-10:
                    continue
                    
                # Lennard-Jones force calculation
                f_mag = 24 * (2 * (1/r_mag)**13 - (1/r_mag)**7)
                f = f_mag * r / r_mag
                
                forces[i] += f
                forces[j] -= f
                
        return forces
        
    def update_system(self):
        """Velocity Verlet integrator for molecular dynamics"""
        forces = self.calculate_forces()
        
        # Update positions
        self.positions += self.velocities * self.time_step + \
                         0.5 * forces / self.masses[:, np.newaxis] * self.time_step**2
                         
        # Apply periodic boundary conditions
        self.positions = self.positions % 1.0
        
        # Calculate new forces
        new_forces = self.calculate_forces()
        
        # Update velocities
        self.velocities += 0.5 * (forces + new_forces) / self.masses[:, np.newaxis] * self.time_step
        
        # Apply Andersen thermostat
        collision_prob = 0.1
        collisions = np.random.random(self.num_particles) < collision_prob
        self.velocities[collisions] = np.random.normal(0, np.sqrt(self.temperature), 
                                                     (np.sum(collisions), 3))
        
    def generate_numbers(self, n=6, min_num=1, max_num=45):
        """Generate lotto numbers based on molecular simulation"""
        # Run equilibration
        for _ in range(self.equilibrium_steps):
            self.update_system()
            
        # Calculate particle energies
        energies = 0.5 * self.masses * np.sum(self.velocities**2, axis=1)
        
        # Use particle energies to generate numbers
        energy_ranks = np.argsort(energies)
        
        # Convert to lotto numbers
        lotto_numbers = []
        for i in range(n):
            particle_idx = energy_ranks[int(i * len(energy_ranks)/n)]
            pos = self.positions[particle_idx]
            number = int(min_num + (pos[0] * pos[1] * pos[2] * (max_num - min_num)))
            
            # Ensure number is within range and not duplicate
            while number < min_num or number > max_num or number in lotto_numbers:
                number = (number % (max_num - min_num + 1)) + min_num
                
            lotto_numbers.append(number)
            
        return sorted(lotto_numbers)

    def get_entropy(self):
        """Calculate the system's entropy"""
        # Calculate velocity distribution
        v_mag = np.linalg.norm(self.velocities, axis=1)
        hist, _ = np.histogram(v_mag, bins=50, density=True)
        
        # Calculate entropy using Boltzmann's formula
        entropy = -np.sum(hist * np.log(hist + 1e-10))
        return entropy

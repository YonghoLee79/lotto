"""
Simulation manager with memory optimization and streaming
"""
import random
import gc
from typing import List, Iterator, Optional, Dict, Any
from core.ball import Ball
from core.physics_engine import PhysicsEngine
from core.vector_math import vec3
from config import SIMULATION_CONSTANTS

class SimulationManager:
    """Memory-efficient simulation manager"""
    
    def __init__(self):
        self.physics_engine = PhysicsEngine()
        self.constants = SIMULATION_CONSTANTS
        self.num_balls = self.constants['NUM_BALLS']
        self.box_size = self.constants['BOX_SIZE']
        self.ball_radius = self.constants['BALL_RADIUS']
        self._reset_simulation_state()
        
    def _reset_simulation_state(self):
        """Reset simulation state"""
        self.balls: List[Ball] = []
        self.step_count = 0
        self.simulation_active = False
        
    def create_balls(self, ball_numbers: List[int]) -> None:
        """Create balls with given numbers"""
        self.balls.clear()
        
        for i, number in enumerate(ball_numbers):
            position = self._get_random_position()
            velocity = [
                random.uniform(-5, 5),
                random.uniform(-5, 5), 
                random.uniform(-5, 5)
            ]
            self.balls.append(Ball(number, position, velocity, self.ball_radius))
            
    def _get_random_position(self) -> List[float]:
        """Generate random position within bounds"""
        margin = self.ball_radius * 2
        return [
            random.uniform(margin, self.box_size - margin),
            random.uniform(self.box_size/2, self.box_size - margin),
            random.uniform(margin, self.box_size - margin)
        ]
        
    def run_simulation_step(self, dt: float = 0.05) -> bool:
        """Run single simulation step - returns True if should continue"""
        if not self.simulation_active:
            return False
            
        # Update physics for all balls
        for ball in self.balls:
            self.physics_engine.update_ball_physics(ball, dt)
            
        # Handle collisions
        self.physics_engine.handle_ball_collisions(self.balls)
        
        # Check hole entries
        entered_balls = self.physics_engine.check_hole_entries(self.balls)
        
        self.step_count += 1
        
        # Check termination conditions
        entered_count = sum(1 for ball in self.balls if ball.in_hole)
        max_steps_reached = self.step_count >= 2000
        enough_balls_entered = entered_count >= 7
        
        if max_steps_reached or enough_balls_entered:
            self.simulation_active = False
            return False
            
        return True
        
    def start_simulation(self, ball_numbers: List[int]) -> None:
        """Start new simulation"""
        self._reset_simulation_state()
        self.create_balls(ball_numbers)
        self.simulation_active = True
        
    def get_results(self) -> List[int]:
        """Get simulation results - numbers that entered hole"""
        entered_balls = [ball for ball in self.balls if ball.in_hole]
        # Sort by time entered hole, then by number
        entered_balls.sort(key=lambda b: (b.time_to_hole or float('inf'), b.number))
        return [ball.number for ball in entered_balls[:7]]
        
    def get_simulation_data(self) -> Dict[str, Any]:
        """Get current simulation data for API"""
        state = self.physics_engine.get_simulation_state(self.balls, self.step_count)
        state['balls'] = [ball.to_dict() for ball in self.balls]
        return state
        
    def cleanup(self) -> None:
        """Clean up simulation data to free memory"""
        self.balls.clear()
        gc.collect()

class SimulationBatch:
    """Batch simulation runner with memory management"""
    
    def __init__(self, batch_size: int = 10):
        self.batch_size = batch_size
        self.simulation_manager = SimulationManager()
        
    def run_simulations(self, num_simulations: int, ball_numbers_generator) -> Iterator[List[int]]:
        """Run simulations in batches to manage memory"""
        for batch_start in range(0, num_simulations, self.batch_size):
            batch_end = min(batch_start + self.batch_size, num_simulations)
            
            for sim_idx in range(batch_start, batch_end):
                # Generate ball numbers for this simulation
                ball_numbers = ball_numbers_generator()
                
                # Run single simulation
                self.simulation_manager.start_simulation(ball_numbers)
                
                while self.simulation_manager.run_simulation_step():
                    pass  # Continue until simulation completes
                    
                # Yield results
                results = self.simulation_manager.get_results()
                yield results
                
                # Progress feedback
                if (sim_idx + 1) % 10 == 0:
                    print(f"시뮬레이션 {sim_idx + 1}/{num_simulations} 완료")
                    
            # Clean up memory after each batch
            self.simulation_manager.cleanup()
            gc.collect()

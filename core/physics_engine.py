"""
Physics engine for ball simulation - Memory optimized
"""
import time
from typing import List, Iterator
from core.ball import Ball
from core.vector_math import Vector3D, vec_add, vec_mul, vec_sub, vec_length, vec_normalize, vec_dot
from config import SIMULATION_CONSTANTS

class PhysicsEngine:
    """Memory-efficient physics simulation engine"""
    
    def __init__(self):
        self.constants = SIMULATION_CONSTANTS
        self.gravity = self.constants['GRAVITY']
        self.friction = self.constants['FRICTION']
        self.restitution = self.constants['RESTITUTION']
        self.ball_radius = self.constants['BALL_RADIUS']
        self.box_size = self.constants['BOX_SIZE']
        self.hole_position = [self.box_size/2, 0, self.box_size/2]
        self.hole_radius = self.constants['HOLE_RADIUS']
        
    def update_ball_physics(self, ball: Ball, dt: float) -> None:
        """Update single ball physics"""
        if ball.in_hole:
            return
            
        # Apply gravity
        ball.velocity = vec_add(ball.velocity, vec_mul(self.gravity, dt))
        
        # Apply friction
        ball.velocity = vec_mul(ball.velocity, self.friction)
        
        # Update position
        ball.update(dt)
        
        # Handle wall collisions
        self._handle_wall_collision(ball)
        
    def _handle_wall_collision(self, ball: Ball) -> None:
        """Handle wall collisions for a single ball"""
        for i in range(3):
            if ball.position[i] < self.ball_radius:
                ball.position[i] = self.ball_radius
                ball.velocity[i] = -ball.velocity[i] * self.restitution
            elif ball.position[i] > self.box_size - self.ball_radius:
                ball.position[i] = self.box_size - self.ball_radius
                ball.velocity[i] = -ball.velocity[i] * self.restitution
                
    def handle_ball_collisions(self, balls: List[Ball]) -> None:
        """Handle collisions between balls - optimized for large numbers"""
        active_balls = [ball for ball in balls if not ball.in_hole]
        
        for i in range(len(active_balls)):
            for j in range(i + 1, len(active_balls)):
                self._resolve_collision(active_balls[i], active_balls[j])
                
    def _resolve_collision(self, ball1: Ball, ball2: Ball) -> None:
        """Resolve collision between two balls"""
        relative_pos = vec_sub(ball2.position, ball1.position)
        distance = vec_length(relative_pos)
        
        if distance < 2 * self.ball_radius and distance > 0:
            # Collision response
            normal = vec_normalize(relative_pos)
            relative_vel = vec_sub(ball2.velocity, ball1.velocity)
            impulse = vec_mul(normal, vec_dot(relative_vel, normal) * self.restitution)
            
            ball1.velocity = vec_add(ball1.velocity, impulse)
            ball2.velocity = vec_sub(ball2.velocity, impulse)
            
            # Separate balls
            overlap = 2 * self.ball_radius - distance
            separation = vec_mul(normal, overlap / 2)
            ball1.position = vec_sub(ball1.position, separation)
            ball2.position = vec_add(ball2.position, separation)
            
    def check_hole_entries(self, balls: List[Ball]) -> List[Ball]:
        """Check which balls entered the hole"""
        entered_balls = []
        current_time = time.time()
        
        for ball in balls:
            if not ball.in_hole:
                to_hole = vec_sub(self.hole_position, ball.position)
                distance = vec_length(to_hole)
                
                if distance < self.hole_radius:
                    ball.in_hole = True
                    ball.time_to_hole = current_time
                    entered_balls.append(ball)
                    
        return entered_balls
        
    def get_simulation_state(self, balls: List[Ball], step_count: int) -> dict:
        """Get current simulation state - memory efficient"""
        in_hole_count = sum(1 for ball in balls if ball.in_hole)
        
        return {
            'step_count': step_count,
            'in_hole_count': in_hole_count,
            'total_balls': len(balls),
            'hole_position': self.hole_position,
            'box_size': self.box_size
        }

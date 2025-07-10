"""
Ball entity with memory-efficient implementation
"""
from typing import List, Optional, Tuple
from core.vector_math import Vector3D, vec_add, vec_mul

class Ball:
    """Optimized Ball class with minimal memory footprint"""
    
    __slots__ = ['number', 'position', 'velocity', 'radius', 'in_hole', 
                 'time_to_hole', '_color_cache']
    
    def __init__(self, number: int, position: Vector3D, velocity: Vector3D, radius: float = 1.0):
        self.number = number
        self.position = position
        self.velocity = velocity
        self.radius = radius
        self.in_hole = False
        self.time_to_hole: Optional[float] = None
        self._color_cache: Optional[Tuple[int, int, int]] = None
        
    @property
    def color(self) -> Tuple[int, int, int]:
        """Lazy-loaded color calculation"""
        if self._color_cache is None:
            self._color_cache = self._calculate_color()
        return self._color_cache
        
    def _calculate_color(self) -> Tuple[int, int, int]:
        """Calculate color based on ball number"""
        colors = [
            (255, 50, 50),   (50, 255, 50),   (50, 50, 255),   (255, 255, 50),
            (255, 50, 255),  (50, 255, 255),  (255, 150, 50),  (150, 50, 255),
            (255, 100, 150), (100, 255, 150)
        ]
        return colors[self.number % len(colors)]

    def update(self, dt: float) -> None:
        """Update ball position if not in hole"""
        if not self.in_hole:
            self.position = vec_add(self.position, vec_mul(self.velocity, dt))
            
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses"""
        return {
            'number': self.number,
            'position': self.position,
            'velocity': self.velocity,
            'in_hole': self.in_hole,
            'color': self.color
        }

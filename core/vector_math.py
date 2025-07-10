"""
3D Vector operations - Memory efficient implementation
"""
import math
from typing import List, Tuple

Vector3D = List[float]

def vec3(x: float, y: float, z: float) -> Vector3D:
    """Create a 3D vector"""
    return [x, y, z]

def vec_add(a: Vector3D, b: Vector3D) -> Vector3D:
    """Add two vectors"""
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

def vec_sub(a: Vector3D, b: Vector3D) -> Vector3D:
    """Subtract two vectors"""
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]

def vec_mul(a: Vector3D, scalar: float) -> Vector3D:
    """Multiply vector by scalar"""
    return [a[0] * scalar, a[1] * scalar, a[2] * scalar]

def vec_dot(a: Vector3D, b: Vector3D) -> float:
    """Dot product of two vectors"""
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

def vec_length(a: Vector3D) -> float:
    """Calculate vector length"""
    return math.sqrt(a[0]**2 + a[1]**2 + a[2]**2)

def vec_normalize(a: Vector3D) -> Vector3D:
    """Normalize vector"""
    length = vec_length(a)
    if length == 0:
        return [0.0, 0.0, 0.0]
    return [a[0] / length, a[1] / length, a[2] / length]

def vec_distance(a: Vector3D, b: Vector3D) -> float:
    """Calculate distance between two points"""
    return vec_length(vec_sub(b, a))

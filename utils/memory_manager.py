"""
Memory monitoring and optimization utilities
"""
import gc
import psutil
import os
from typing import Dict, Any
import time

class MemoryMonitor:
    """Monitor and manage memory usage"""
    
    def __init__(self):
        self.process = psutil.Process(os.getpid())
        self.initial_memory = self.get_memory_usage()
        
    def get_memory_usage(self) -> Dict[str, float]:
        """Get current memory usage in MB"""
        memory_info = self.process.memory_info()
        return {
            'rss': memory_info.rss / 1024 / 1024,  # Resident Set Size
            'vms': memory_info.vms / 1024 / 1024,  # Virtual Memory Size
        }
        
    def get_memory_percent(self) -> float:
        """Get memory usage as percentage of total system memory"""
        return self.process.memory_percent()
        
    def force_garbage_collection(self) -> Dict[str, Any]:
        """Force garbage collection and return statistics"""
        before_memory = self.get_memory_usage()
        collected = gc.collect()
        after_memory = self.get_memory_usage()
        
        return {
            'objects_collected': collected,
            'memory_before': before_memory,
            'memory_after': after_memory,
            'memory_freed': before_memory['rss'] - after_memory['rss']
        }
        
    def check_memory_threshold(self, threshold_mb: float = 500) -> bool:
        """Check if memory usage exceeds threshold"""
        current_memory = self.get_memory_usage()
        return current_memory['rss'] > threshold_mb
        
    def get_memory_report(self) -> Dict[str, Any]:
        """Get comprehensive memory report"""
        current_memory = self.get_memory_usage()
        return {
            'current_memory_mb': current_memory,
            'memory_percent': self.get_memory_percent(),
            'memory_increase_mb': current_memory['rss'] - self.initial_memory['rss'],
            'gc_stats': {
                'generation_0': gc.get_count()[0],
                'generation_1': gc.get_count()[1], 
                'generation_2': gc.get_count()[2]
            }
        }

class PerformanceTimer:
    """Performance timing utility"""
    
    def __init__(self):
        self.timers = {}
        
    def start_timer(self, name: str) -> None:
        """Start a named timer"""
        self.timers[name] = time.time()
        
    def stop_timer(self, name: str) -> float:
        """Stop a named timer and return elapsed time"""
        if name not in self.timers:
            return 0.0
        elapsed = time.time() - self.timers[name]
        del self.timers[name]
        return elapsed
        
    def get_timer_status(self, name: str) -> float:
        """Get current elapsed time for a running timer"""
        if name not in self.timers:
            return 0.0
        return time.time() - self.timers[name]

class ResourceManager:
    """Manage system resources efficiently"""
    
    def __init__(self, memory_threshold_mb: float = 500):
        self.memory_monitor = MemoryMonitor()
        self.memory_threshold = memory_threshold_mb
        self.auto_cleanup_enabled = True
        
    def check_and_cleanup(self) -> bool:
        """Check memory usage and cleanup if needed"""
        if not self.auto_cleanup_enabled:
            return False
            
        if self.memory_monitor.check_memory_threshold(self.memory_threshold):
            gc_result = self.memory_monitor.force_garbage_collection()
            print(f"Memory cleanup performed. Freed: {gc_result['memory_freed']:.1f} MB")
            return True
        return False
        
    def get_resource_status(self) -> Dict[str, Any]:
        """Get current resource status"""
        return {
            'memory': self.memory_monitor.get_memory_report(),
            'auto_cleanup': self.auto_cleanup_enabled,
            'memory_threshold_mb': self.memory_threshold
        }
        
    def enable_auto_cleanup(self, enabled: bool = True) -> None:
        """Enable or disable automatic cleanup"""
        self.auto_cleanup_enabled = enabled

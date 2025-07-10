"""
Gunicorn 설정 파일
"""
import os
import multiprocessing

# 서버 소켓
bind = f"0.0.0.0:{os.environ.get('PORT', 8080)}"
backlog = 2048

# 워커 프로세스
workers = min(multiprocessing.cpu_count() * 2 + 1, 4)  # 최대 4개 워커
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# 재시작 설정
max_requests = 1000
max_requests_jitter = 100
preload_app = True

# 로깅
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# 프로세스 네이밍
proc_name = "lotto-scientific-app"

# 보안
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# 성능 튜닝
worker_tmp_dir = "/dev/shm"

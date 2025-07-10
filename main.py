"""
Railway 배포용 메인 엔트리 포인트
Web App을 실행합니다.
"""

if __name__ == "__main__":
    # Railway가 main.py를 찾으므로 web_app을 import하여 실행
    from web_app import app
    import os
    
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)

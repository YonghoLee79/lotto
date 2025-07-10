/**
 * Service Worker for PWA functionality
 */
const CACHE_NAME = 'lotto-scientific-v1';
const urlsToCache = [
    '/',
    '/static/css/mobile-styles.css',
    '/static/js/mobile-app.js',
    '/static/manifest.json',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 설치 이벤트
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 패치 이벤트 (네트워크 요청 가로채기)
self.addEventListener('fetch', event => {
    // API 요청은 항상 네트워크에서 가져오기
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // 오프라인일 때 기본 응답 반환
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: '네트워크 연결을 확인해주세요'
                        }),
                        {
                            status: 503,
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })
        );
        return;
    }

    // 정적 파일은 캐시 우선
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에서 찾으면 반환
                if (response) {
                    return response;
                }

                // 네트워크에서 가져오기
                return fetch(event.request)
                    .then(response => {
                        // 유효한 응답인지 확인
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 응답 복사 (스트림은 한 번만 사용 가능)
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // 백그라운드에서 데이터 동기화 로직
    }
});

// 푸시 알림 (선택사항)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '새로운 로또 분석 결과가 있습니다!',
        icon: '/static/icons/icon-192.png',
        badge: '/static/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification('과학적 로또', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});



export const register = () => {
    const CACHE_NAME = 'my-app-cache';
    const urlsToCache = [
        '/',
        '/index.html',
        '/static/js/bundle.js',
        '/static/js/1.chunk.js',
        '/static/js/main.chunk.js',
    ];

    window.addEventListener('install', function (event: any) {
        // Perform install steps
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(function (cache) {
                    console.log('Opened cache');
                    return cache.addAll(urlsToCache);
                })
        );
    });
}

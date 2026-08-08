// sw.js - Service Worker พื้นฐานสำหรับ Cache ไฟล์

const CACHE_NAME = '3in1-spinner-cache-v1.7'; // ตั้งชื่อ Cache (เปลี่ยน v1 เป็น v2, v3... ถ้ามีการอัปเดตไฟล์ Cache ครั้งใหญ่)

// รายชื่อไฟล์หลักๆ ที่จะ Cache ไว้ตอนติดตั้ง Service Worker
// ใช้ Path แบบ Relative './' เหมือนเดิม
const urlsToCache = [
  '.', // หมายถึง index.html ใน root
  './index.html', // ใส่ index.html เต็มๆ ไปด้วยก็ได้ เผื่อบาง Browser
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192x192.png', // ไอคอนที่มึงสร้าง
  './icon-512x512.png'  // ไอคอนที่มึงสร้าง
  // เพิ่มไฟล์อื่นๆ ที่จำเป็น เช่น รูปภาพอื่นๆ, Font ที่โหลดเอง (ถ้ามี)
  // พวกไฟล์จาก CDN (Firebase SDK, Font Awesome) อาจจะไม่ต้อง Cache เองก็ได้ ให้ Browser จัดการ
];

// --- Event: install ---
// เกิดขึ้นตอนติดตั้ง Service Worker ครั้งแรก
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event in progress.');
  // รอให้การเปิด Cache และ Cache ไฟล์เสร็จก่อน ค่อยติดตั้งสำเร็จ
  event.waitUntil(
    caches.open(CACHE_NAME) // เปิด Cache ตามชื่อที่ตั้งไว้
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        // เพิ่มไฟล์ทั้งหมดใน urlsToCache ลงใน Cache
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] All required files cached successfully!');
        // บังคับให้ Service Worker ใหม่เริ่มทำงานทันที (แทนที่จะรอหน้าเก่าปิด)
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Caching failed during install:', error);
      })
  );
});

// --- Event: activate ---
// เกิดขึ้นหลังจากติดตั้งเสร็จ และ Service Worker เก่า (ถ้ามี) ถูกปิดไปแล้ว
// ใช้สำหรับลบ Cache เก่าที่ไม่ต้องการแล้ว
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event in progress.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // ถ้าชื่อ Cache ไม่ตรงกับ CACHE_NAME ปัจจุบัน ให้ลบทิ้ง
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients.');
      // ทำให้ Service Worker ควบคุมหน้าเว็บที่เปิดอยู่ทันที
      return self.clients.claim();
    })
  );
});


// --- Event: fetch ---
// เกิดขึ้นทุกครั้งที่มี Request เกิดขึ้นจากหน้าเว็บ (โหลดรูป, CSS, JS, API)
// เราจะดัก Request แล้วเช็คว่ามีใน Cache มั้ย (Cache-First Strategy)
self.addEventListener('fetch', (event) => {
  // console.log('[Service Worker] Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request) // ลองหา Request นี้ใน Cache
      .then((cachedResponse) => {
        // ถ้าเจอใน Cache -> ส่งค่าจาก Cache กลับไปเลย (เร็ว + Offline ได้)
        if (cachedResponse) {
          // console.log('[Service Worker] Found in cache:', event.request.url);
          return cachedResponse;
        }

        // ถ้าไม่เจอใน Cache -> ไปโหลดจาก Network ตามปกติ
        // console.log('[Service Worker] Not found in cache, fetching from network:', event.request.url);
        return fetch(event.request).then(
            (networkResponse) => {
                // (Optional แต่แนะนำ) ถ้าโหลดจาก Network สำเร็จ ให้เอา Response นั้นไปเก็บใน Cache ด้วย เผื่อใช้ครั้งหน้า
                // ต้อง clone() response ก่อน เพราะ response ใช้ได้ครั้งเดียว
                if (networkResponse && networkResponse.status === 200) { // เช็คว่าโหลดสำเร็จจริง
                    // เช็คว่าเป็น request ที่เราอยาก cache ไหม (เช่น ไม่ cache request ไปยัง googleapis หรือ apps script)
                    if (!event.request.url.includes('googleapi') && !event.request.url.includes('script.google.com')) {
                        let responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // console.log('[Service Worker] Caching new resource:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                    }
                }
                return networkResponse; // ส่ง Response จาก Network กลับไป
            }
        ).catch(error => {
            // ถ้าโหลดจาก Network ก็ไม่ได้ (เช่น Offline)
            console.error('[Service Worker] Fetch failed:', error);
            // อาจจะส่งหน้า Offline fallback กลับไปก็ได้
            // return caches.match('./offline.html'); // ต้องสร้างไฟล์ offline.html ไว้ด้วย
            // หรือแค่ปล่อยให้มัน Error ไปตามปกติ
        });
      })
  );
});
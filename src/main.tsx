import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import store from './store/index.ts';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Импорт локализации

// Установка русской локали для dayjs
dayjs.locale('ru');

// Обработка двойного касания для предотвращения масштабирования
let lastTouchEnd = 0;

document.addEventListener(
    'touchend',
    (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault(); // Предотвращаем масштабирование
        }
        lastTouchEnd = now;
    },
    { passive: false }
);

// Запрет контекстного меню
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Запрет масштабирования при движении двумя пальцами
document.addEventListener(
    'touchmove',
    (event) => {
        if (event.touches.length > 1) {
            event.preventDefault(); // Предотвращаем масштабирование
        }
    },
    { passive: false }
);

// Регистрация Service Worker с обработкой обновлений
const updateSW = registerSW({
    onNeedRefresh() {
        const shouldUpdate = window.confirm('Доступна новая версия приложения. Хотите обновить?');
        if (shouldUpdate) {
            updateSW(); // Обновляем Service Worker
        }
    },
    onOfflineReady() {
        console.log('Приложение готово для работы в оффлайн-режиме.');
    },
});


// Рендер приложения
createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Provider store={store}>
                <App />
        </Provider>
    </BrowserRouter>
);
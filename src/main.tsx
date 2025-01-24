import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import store from './store/index.ts';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Импорт локализации

dayjs.locale('ru'); // Установка русской локали

let lastTouchEnd = 0;

document.addEventListener(
    'touchend',
    (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            // Если между двумя касаниями прошло меньше 300 мс
            event.preventDefault(); // Предотвращаем масштабирование
        }
        lastTouchEnd = now;
    },
    { passive: false }
);

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
document.addEventListener(
    'touchmove',
    (event) => {
        if (event.touches.length > 1) {
            // Если касаний больше одного (два пальца)
            event.preventDefault(); // Предотвращаем масштабирование
        }
    },
    { passive: false }
);
// Регистрация Service Worker с обработкой обновлений
const updateSW = registerSW({
    onNeedRefresh() {
        // Показываем уведомление пользователю
        const shouldUpdate = window.confirm('Доступна новая версия приложения. Хотите обновить?');
        if (shouldUpdate) {
            updateSW(); // Обновляем Service Worker
        }
    },
    onOfflineReady() {
        console.log('Приложение готово для работы в оффлайн-режиме.');
    },
});
createRoot(document.getElementById('root')!).render(
        <BrowserRouter>
            <Provider store={store}>
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale='ru'
                    localeText={{
                        cancelButtonLabel: 'Отмена',
                        okButtonLabel: 'ОК',
                        clearButtonLabel: 'Очистить',
                        todayButtonLabel: 'Сегодня',
                    }}
                >
                    <App />
                </LocalizationProvider>
            </Provider>
        </BrowserRouter>
);

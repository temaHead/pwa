import { StrictMode } from 'react';
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
import 'dayjs/locale/ru'; // Импорт локализации
import dayjs from 'dayjs';

dayjs.locale('ru'); // Установка русской локали

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale='ru'
                >
                    <App />
                </LocalizationProvider>
            </Provider>
        </BrowserRouter>
    </StrictMode>
);

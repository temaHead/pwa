import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import measurementReducer from './slices/measurementSlice';
import filterReducer from './slices/filterSlice';
import widgetsReducer from './slices/widgetsSlice';
import { useDispatch } from 'react-redux';

const store = configureStore({
    reducer: {
        user: userReducer,
        measurements: measurementReducer,
        filter:filterReducer,
        widgets:widgetsReducer
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;

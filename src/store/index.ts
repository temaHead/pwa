import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import measurementReducer from './slices/measurementSlice';
import { useDispatch } from 'react-redux';

const store = configureStore({
    reducer: {
        user: userReducer,
        measurements: measurementReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;

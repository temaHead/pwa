import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    BodyMeasuring,
    FatMeasuring,
    FatMeasuringData,
    Measurements,
    WeightMeasuringData,
} from '../../types';

import { RootState } from '..';
import {
    getAllFatMeasuring,
    getAllWeightMeasuring,
    addFatMeasuring,
    updateFatMeasuring,
    addWeightMeasuring,
    addBodyMeasuring,
    updateWeightMeasuring,
    updateBodyMeasuring,
} from '../../api/measurement-api';

const initialState: Measurements = {
    fatMeasuring: [],
    weightMeasuring: [],
    bodyMeasuring: [],
};

export const getAllFatMeasuringAsync = createAsyncThunk(
    'user/getAllFatMeasuring',
    async (userId: string): Promise<FatMeasuringData[]> => {
        const fatMeasuring = await getAllFatMeasuring(userId);
        return fatMeasuring;
    }
);

export const getAllWeightMeasuringAsync = createAsyncThunk(
    'user/getAllWeightMeasuring',
    async (userId: string): Promise<WeightMeasuringData[]> => {
        const weightMeasuring = await getAllWeightMeasuring(userId);
        return weightMeasuring;
    }
);
//Добавление измерения жира
export const addFatMeasuringAsync = createAsyncThunk(
    'user/addFatMeasuring',
    async (
        fatMeasuring: { bodyFat: number; measurements: FatMeasuring; timestamp?: string },
        { getState }
    ) => {
        const state = getState() as RootState;
        const userId = state.user.id;
        if (!userId) throw new Error('User ID not found');
        const data = await addFatMeasuring(
            fatMeasuring.bodyFat,
            fatMeasuring.measurements,
            userId,
            fatMeasuring.timestamp
        );
        return data;
    }
);
// Редактирование измерения жира
export const updateFatMeasuringAsync = createAsyncThunk(
    'user/updateFatMeasuring',
    async ({
        id,
        measurements,
        bodyFat,
    }: {
        id: string;
        measurements: FatMeasuring;
        bodyFat: number | null;
    }) => {
        await updateFatMeasuring(id, measurements, bodyFat);
        return { id, measurements, bodyFat };
    }
);

// Добавление измерения веса
export const addWeightMeasuringAsync = createAsyncThunk(
    'user/addWeightMeasuring',
    async (weightMeasuring: { weight: number; timestamp?: string }, { getState }) => {
        const state = getState() as RootState;
        const userId = state.user.id;
        if (!userId) throw new Error('User ID not found');
        const data = await addWeightMeasuring(weightMeasuring.weight, userId, weightMeasuring.timestamp);
        return data;
    }
);
// Редактирование измерения веса
export const updateWeightMeasuringAsync = createAsyncThunk(
    'user/updateWeightMeasuring',
    async ({ id, weight }: { id: string; weight: number | null }) => {
        await updateWeightMeasuring(id, weight); // Предположим, что у вас есть такая функция в API
        return { id, weight };
    }
);

// добавление измерения лентой
export const addBodyMeasuringAsync = createAsyncThunk(
    'user/addBodyMeasuring',
    async (bodyMeasuring: { measurements: BodyMeasuring; timestamp?: string }, { getState }) => {
        const state = getState() as RootState;
        const userId = state.user.id;
        if (!userId) throw new Error('User ID not found');
        const data = await addBodyMeasuring(bodyMeasuring.measurements, userId, bodyMeasuring.timestamp);
        return data;
    }
);
export const updateBodyMeasuringAsync = createAsyncThunk(
    'user/updateBodyMeasuring',
    async ({ id, measurements }: { id: string; measurements: BodyMeasuring }) => {
        await updateBodyMeasuring(id, measurements); // Предположим, что у вас есть такая функция в API
        return { id, measurements };
    }
)

const measurementSlice = createSlice({
    name: 'measurement',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllFatMeasuringAsync.fulfilled, (state, action) => {
            state.fatMeasuring = action.payload;
        });
        builder.addCase(getAllWeightMeasuringAsync.fulfilled, (state, action) => {
            state.weightMeasuring = action.payload;
        });
        builder.addCase(addFatMeasuringAsync.fulfilled, (state, action) => {
            state.fatMeasuring = [...state.fatMeasuring, action.payload];
        });
        builder.addCase(addWeightMeasuringAsync.fulfilled, (state, action) => {
            state.weightMeasuring = [...state.weightMeasuring, action.payload];
        });
        builder.addCase(addBodyMeasuringAsync.fulfilled, (state, action) => {
            state.bodyMeasuring = [...state.bodyMeasuring, action.payload];
        });
        builder.addCase(updateFatMeasuringAsync.fulfilled, (state, action) => {
            const index = state.fatMeasuring.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.fatMeasuring[index] = {
                    ...state.fatMeasuring[index],
                    ...action.payload,
                };
            }
        });
        builder.addCase(updateWeightMeasuringAsync.fulfilled, (state, action) => {
            const index = state.weightMeasuring.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.weightMeasuring[index] = {
                    ...state.weightMeasuring[index],
                    ...action.payload,
                };
            }
        });
        builder.addCase(updateBodyMeasuringAsync.fulfilled, (state, action) => {
            const index = state.bodyMeasuring.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.bodyMeasuring[index] = {
                    ...state.bodyMeasuring[index],
                    ...action.payload,
                };
            }
        })
    },
});

export default measurementSlice.reducer;

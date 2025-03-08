import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    BodyMeasuring,
    BodyMeasuringData,
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
    deleteFatMeasuring,
    deleteWeightMeasuring,
    deleteBodyMeasuring,
    getAllBodyMeasuring,
} from '../../api/measurement-api';

const initialState: Measurements = {
    fatMeasuring: [],
    weightMeasuring: [],
    bodyMeasuring: [],
};

//Получение всех измерений жира
export const getAllFatMeasuringAsync = createAsyncThunk(
    'user/getAllFatMeasuring',
    async (userId: string): Promise<FatMeasuringData[]> => {
        const fatMeasuring = await getAllFatMeasuring(userId);
        return fatMeasuring;
    }
);

//Получение всех измерений веса
export const getAllWeightMeasuringAsync = createAsyncThunk(
    'user/getAllWeightMeasuring',
    async (userId: string): Promise<WeightMeasuringData[]> => {
        const weightMeasuring = await getAllWeightMeasuring(userId);
        return weightMeasuring;
    }
);

//Получение всех измерений тела
export const getAllBodyMeasuringAsync = createAsyncThunk(
    'user/getAllBodyMeasuring',
    async (userId: string): Promise<BodyMeasuringData[]> => {
        const bodyMeasuring = await getAllBodyMeasuring(userId);
        return bodyMeasuring;
    }
)
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
        timestamp,
    }: {
        id: string;
        measurements: FatMeasuring;
        bodyFat: number | null;
        timestamp?: string
    }) => {
        await updateFatMeasuring(id, measurements, bodyFat, timestamp);
        return { id, measurements, bodyFat, timestamp };
    }
);

// Удаление измерения жира
export const deleteFatMeasuringAsync = createAsyncThunk('user/deleteFatMeasuring', async (id: string) => {
    await deleteFatMeasuring(id);
    return id;
});

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
    async ({ id, weight, timestamp }: { id: string; weight: number | null, timestamp?: string }) => {
        await updateWeightMeasuring(id, weight, timestamp); // Предположим, что у вас есть такая функция в API
        return { id, weight, timestamp };
    }
);

// Удаление измерения веса
export const deleteWeightMeasuringAsync = createAsyncThunk(
    'user/deleteWeightMeasuring',
    async (id: string) => {
        await deleteWeightMeasuring(id);
        return id;
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
// Редактирование измерения лентой
export const updateBodyMeasuringAsync = createAsyncThunk(
    'user/updateBodyMeasuring',
    async ({ id, bodyMeasuring, timestamp }: { id: string; bodyMeasuring: BodyMeasuring, timestamp?: string }) => {
        await updateBodyMeasuring(id, bodyMeasuring); // Предположим, что у вас есть такая функция в API
        return { id, bodyMeasuring, timestamp };
    }
);
// Удаление измерения лентой
export const deleteBodyMeasuringAsync = createAsyncThunk('user/deleteBodyMeasuring', async (id: string) => {
    await deleteBodyMeasuring(id);
    return id;
});

const measurementSlice = createSlice({
    name: 'measurement',
    initialState,
    reducers: {
        // Перезапись всех измерений жира
        setFatMeasurements: (state, action: PayloadAction<FatMeasuringData[]>) => {
            state.fatMeasuring = action.payload;
        },
        // Перезапись всех измерений веса
        setWeightMeasurements: (state, action: PayloadAction<WeightMeasuringData[]>) => {
            state.weightMeasuring = action.payload;
        },
        // Перезапись всех измерений тела
        setBodyMeasurements: (state, action: PayloadAction<BodyMeasuringData[]>) => {
            state.bodyMeasuring = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAllFatMeasuringAsync.fulfilled, (state, action) => {
            state.fatMeasuring = action.payload;
        });
        builder.addCase(getAllWeightMeasuringAsync.fulfilled, (state, action) => {
            state.weightMeasuring = action.payload;
        });
        builder.addCase(getAllBodyMeasuringAsync.fulfilled, (state, action) => {
            state.bodyMeasuring = action.payload;
        })
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
        });
        builder.addCase(deleteFatMeasuringAsync.fulfilled, (state, action) => {
            state.fatMeasuring = state.fatMeasuring.filter((item) => item.id !== action.payload);
        });
        builder.addCase(deleteWeightMeasuringAsync.fulfilled, (state, action) => {
            state.weightMeasuring = state.weightMeasuring.filter((item) => item.id !== action.payload);
        });
        builder.addCase(deleteBodyMeasuringAsync.fulfilled, (state, action) => {
            state.bodyMeasuring = state.bodyMeasuring.filter((item) => item.id !== action.payload);
        });
    },
});

// Экспортируем синхронные экшены
export const { setFatMeasurements, setWeightMeasurements, setBodyMeasurements } = measurementSlice.actions;

export default measurementSlice.reducer;

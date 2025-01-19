import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { FatMeasuringData, Measurements, WeightMeasuringData } from '../../types';
import { getAllFatMeasuring, getAllWeightMeasuring } from '../../api/user-api';

const initialState: Measurements = {
    fatMeasuring: [],
    weightMeasuring: [],
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
    },
});

export default measurementSlice.reducer;

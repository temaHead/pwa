import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface FilterState {
    showFat: boolean;
    showWeight: boolean;
    showBody: boolean;
}

const initialState: FilterState = {
    showFat: true,
    showWeight: true,
    showBody: true,
};

// Загрузка фильтра из Firestore
export const fetchFilterAsync = createAsyncThunk(
    'filter/fetchFilter',
    async (userId: string) => {
        const filterRef = doc(db, 'filters', userId);
        const filterDoc = await getDoc(filterRef);
        if (filterDoc.exists()) {
            return filterDoc.data() as FilterState;
        }
        return initialState;
    }
);

// Сохранение фильтра в Firestore
export const saveFilterAsync = createAsyncThunk(
    'filter/saveFilter',
    async ({ userId, filters }: { userId: string; filters: FilterState }) => {
        const filterRef = doc(db, 'filters', userId);
        await setDoc(filterRef, filters);
        return filters;
    }
);

// Сброс фильтра
export const resetFilterAsync = createAsyncThunk(
    'filter/resetFilter',
    async (userId: string) => {
        const filterRef = doc(db, 'filters', userId);
        await setDoc(filterRef, initialState);
        return initialState;
    }
);

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFilterAsync.fulfilled, (_state, action) => {
                return action.payload;
            })
            .addCase(saveFilterAsync.fulfilled, (_state, action) => {
                return action.payload;
            })
            .addCase(resetFilterAsync.fulfilled, (_state, action) => {
                return action.payload;
            });
    },
});

export default filterSlice.reducer;
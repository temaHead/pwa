import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface FilterItem {
    id: string;
    label: string;
    visible: boolean;
}

interface FilterState {
    filters: FilterItem[];
}

const initialState: FilterState = {
    filters: [
        { id: 'showFat', label: 'Показать жировые измерения', visible: true },
        { id: 'showWeight', label: 'Показать измерения веса', visible: true },
        { id: 'showBody', label: 'Показать измерения лентой', visible: true },
    ],
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
    async ({ userId, filters }: { userId: string; filters: FilterItem[] }) => {
        const filterRef = doc(db, 'filters', userId);
        await setDoc(filterRef, { filters });
        return { filters };
    }
);

// Сброс фильтра к начальному состоянию
export const resetFilterAsync = createAsyncThunk(
    'filter/resetFilter',
    async (userId: string) => {
        const filterRef = doc(db, 'filters', userId);
        await setDoc(filterRef, { filters: initialState.filters });
        return { filters: initialState.filters };
    }
);

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        toggleFilterVisibility: (state, action: PayloadAction<string>) => {
            state.filters = state.filters.map(filter =>
                filter.id === action.payload ? { ...filter, visible: !filter.visible } : filter
            );
        },
        reorderFilters: (state, action: PayloadAction<{ from: number; to: number }>) => {
            const { from, to } = action.payload;
            const updatedFilters = Array.from(state.filters);
            const [movedFilter] = updatedFilters.splice(from, 1);
            updatedFilters.splice(to, 0, movedFilter);
            state.filters = updatedFilters;
        },
        setFiltersFromIDB:(state, action: PayloadAction<FilterItem[]>) => {
            state.filters = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFilterAsync.fulfilled, (_state, action) => action.payload)
            .addCase(saveFilterAsync.fulfilled, (_state, action) => action.payload)
            .addCase(resetFilterAsync.fulfilled, (_state, action) => action.payload);
    },
});

export const { toggleFilterVisibility, reorderFilters, setFiltersFromIDB } = filterSlice.actions;

export default filterSlice.reducer;

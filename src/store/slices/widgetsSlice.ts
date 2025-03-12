import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface WidgetSettings {
    id: string;
    label: string;
    visible: boolean;
}

interface WidgetsState {
    widgets: WidgetSettings[];
}

const initialState: WidgetsState = {
    widgets: [
        { id: 'fat', label: 'График жира', visible: true },
        { id: 'body', label: 'График замеров', visible: true },
        { id: 'pureWeight', label: 'График чистой массы тела', visible: true },
    ],
};

// Загрузка настроек виджетов из Firestore
export const fetchWidgetsAsync = createAsyncThunk('widgets/fetchWidgets', async (userId: string) => {
    const widgetsRef = doc(db, 'widgets', userId);
    const widgetsDoc = await getDoc(widgetsRef);
    if (widgetsDoc.exists()) {
        return widgetsDoc.data().widgets as WidgetSettings[];
    }
    return initialState.widgets;
});

// Сохранение настроек виджетов в Firestore
export const saveWidgetsAsync = createAsyncThunk(
    'widgets/saveWidgets',
    async ({ userId, widgets }: { userId: string; widgets: WidgetSettings[] }) => {
        const widgetsRef = doc(db, 'widgets', userId);
        await setDoc(widgetsRef, { widgets });
        return widgets;
    }
);

// Сброс настроек виджетов
export const resetWidgetsAsync = createAsyncThunk('widgets/resetWidgets', async (userId: string) => {
    const widgetsRef = doc(db, 'widgets', userId);
    await setDoc(widgetsRef, { widgets: initialState.widgets });
    return initialState.widgets;
});

const widgetsSlice = createSlice({
    name: 'widgets',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWidgetsAsync.fulfilled, (state, action) => {
                state.widgets = action.payload;
            })
            .addCase(saveWidgetsAsync.fulfilled, (state, action) => {
                state.widgets = action.payload;
            })
            .addCase(resetWidgetsAsync.fulfilled, (state, action) => {
                state.widgets = action.payload;
            });
    },
});

export default widgetsSlice.reducer;

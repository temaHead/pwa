import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addUserProfile, updateUserProfile } from '../../api/user-api';
import { FatMeasuring, UserProfile } from '../../types';
import { RootState } from '..';

const initialState: UserProfile = {
    email: null,
    id: null,
    name: null,
    birthDate: null,
    currentWeight: null,
    gender: null,
    height: null,
    bodyFat: null,
    theme:'light',
};

export const updateUserProfileAsync = createAsyncThunk(
    'user/updateUserProfile',
    async (profile: UserProfile, { getState }) => {
        const state = getState() as RootState;
        const userId = state.user.id;
        if (!userId) throw new Error('User ID not found');
        const updatedUserData = await updateUserProfile(profile, userId);
        return updatedUserData; // Возвращаем обновленные данные для обновления состояния
    }
);

export const addUserProfileAsync = createAsyncThunk(
    'user/addUserProfile',
    async( {profile, fatMeasuring}:{profile: UserProfile, fatMeasuring: FatMeasuring}, {getState}) => {
        const state = getState() as RootState;
        const userId = state.user.id;
        if (!userId) throw new Error('User ID not found');
        
        const updatedUserData = await addUserProfile(profile, userId , fatMeasuring);
        return updatedUserData;
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action) {
            state.email = action.payload.email || null;
            state.id = action.payload.id || null;
            state.name = action.payload.name || null;
            state.birthDate = action.payload.birthDate || null;
            state.currentWeight = action.payload.currentWeight || null;
            state.gender = action.payload.gender || null;
            state.height = action.payload.height || null;
            state.bodyFat = action.payload.bodyFat || null;
            state.theme = action.payload.theme || 'light';
        },
        removeUser(state) {
            state.email = null;
            state.id = null;
            state.name = null;
            state.birthDate = null;
            state.currentWeight = null;
            state.gender = null;
            state.height = null;
            state.bodyFat = null;
            state.theme = 'light';
            window.localStorage.removeItem('id');
        },
    },
    extraReducers: (builder) => {
        builder.addCase(updateUserProfileAsync.fulfilled, (state, action) => {
            // Обновляем профиль в состоянии после успешного запроса
            const updatedData = action.payload;
            state.email = updatedData.email || null;
            state.id = updatedData.id || null;
            state.name = updatedData.name || null;
            state.birthDate = updatedData.birthDate || null;
            state.currentWeight = updatedData.currentWeight || null;
            state.gender = updatedData.gender || null;
            state.height = updatedData.height || null;
            state.bodyFat = updatedData.bodyFat || null;
            state.theme = updatedData.theme || 'light';
        })
        builder.addCase(addUserProfileAsync.fulfilled, (state, action) => {
            // Обновляем профиль в состоянии после успешного запроса
            const updatedData = action.payload;
            state.email = updatedData.email || null;
            state.id = updatedData.id || null;
            state.name = updatedData.name || null;
            state.birthDate = updatedData.birthDate || null;
            state.currentWeight = updatedData.currentWeight || null;
            state.gender = updatedData.gender || null;
            state.height = updatedData.height || null;
            state.bodyFat = updatedData.bodyFat || null;
            state.theme = updatedData.theme || 'light';
        })
        
    },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;

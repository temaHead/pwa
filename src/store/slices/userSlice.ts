import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '..';
import { updateUserProfile } from '../../api/user-api';
import { UserProfileType } from '../../types';

const initialState: UserProfileType = {
    email: null,
    id: null,
    name: null,
    birthDate: null,
    currentWeight: null,
    initialWeight: null,
    desiredWeight: null,
    gender: null,
    height: null,
};

  export const updateUserProfileAsync = createAsyncThunk(
    'user/updateUserProfile',
    async (profile: UserProfileType, { getState }) => {
      const state = getState() as RootState;
      const userId = state.user.id;
      if (!userId) throw new Error('User ID not found');
      
      const updatedUserData = await updateUserProfile(profile, userId);
      return updatedUserData; // Возвращаем обновленные данные для обновления состояния
    }
  );


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
            state.initialWeight = action.payload.initialWeight || null;
            state.desiredWeight = action.payload.desiredWeight || null;
            state.gender = action.payload.gender || null;
            state.height = action.payload.height || null;
        },
        removeUser(state) {
            state.email = null;
            state.id = null;
            state.name = null;
            state.birthDate = null;
            state.currentWeight = null;
            state.initialWeight = null;
            state.desiredWeight = null;
            state.gender = null;
            state.height = null;
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
            state.initialWeight = updatedData.initialWeight || null;
            state.desiredWeight = updatedData.desiredWeight || null;
            state.gender = updatedData.gender || null;
            state.height = updatedData.height || null;
        });
    },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;

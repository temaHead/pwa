import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addGoal, deleteGoal, getAllGoals, updateGoal } from '../../api/goals-api';
import { GoalData, Goal } from '../../types';

interface GoalsState {
    goals: GoalData[];
}

const initialState: GoalsState = {
    goals: [],
};

// Загрузка всех целей
export const getAllGoalsAsync = createAsyncThunk('goals/getAllGoals', async (userId: string) => {
    const goals = await getAllGoals(userId);
    return goals;
});

// Добавление новой цели
export const addGoalAsync = createAsyncThunk(
    'goals/addGoal',
    async ({ userId, goal }: { userId: string; goal: Goal }) => {
        const newGoal = await addGoal(userId, goal);
        return newGoal;
    }
);

// Обновление цели
export const updateGoalAsync = createAsyncThunk(
    'goals/updateGoal',
    async ({ id, goal }: { id: string; goal: Goal }) => {
        await updateGoal(id, goal);
        return { id, goal };
    }
);

// Удаление цели
export const deleteGoalAsync = createAsyncThunk('goals/deleteGoal', async (id: string) => {
    await deleteGoal(id);
    return id;
});

const goalsSlice = createSlice({
    name: 'goals',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllGoalsAsync.fulfilled, (state, action) => {
                state.goals = action.payload;
            })
            // Обработка добавления цели
            .addCase(addGoalAsync.fulfilled, (state, action) => {
                state.goals = [...state.goals, action.payload];
            })

            // Обработка обновления цели
            .addCase(updateGoalAsync.fulfilled, (state, action) => {
                const index = state.goals.findIndex((goal) => goal.id === action.payload.id);
                if (index !== -1) {
                    state.goals[index] = { ...state.goals[index], ...action.payload };
                }
            })

            // Обработка удаления цели
            .addCase(deleteGoalAsync.fulfilled, (state, action) => {
                state.goals = state.goals.filter((goal) => goal.id !== action.payload);
            });
    },
});

export default goalsSlice.reducer;

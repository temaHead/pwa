import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addGoal, deleteGoal, getAllGoals, updateGoal } from '../../api/goals-api';
import { GoalData, Goal } from '../../types';
import { message } from 'antd';

interface GoalsState {
    goals: GoalData[];
    loading: boolean;
    updating: boolean;
    deleting: boolean;
}

const initialState: GoalsState = {
    goals: [],
    loading: false, // Состояние загрузки целей
    updating: false, // Состояние обновления цели
    deleting: false, // Состояние удаления цели
};

// Загрузка всех целей
export const getAllGoalsAsync = createAsyncThunk(
    'goals/getAllGoals',
    async (userId: string): Promise<GoalData[]> => {
        const goals = await getAllGoals(userId);
        return goals;
    }
);

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
    reducers: {
        // Перезапись всех целей
        setGoals: (state, action: PayloadAction<GoalData[]>) => {
            state.goals = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Загрузка целей
            .addCase(getAllGoalsAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllGoalsAsync.fulfilled, (state, action) => {
                state.goals = action.payload;
                state.loading = false;
            })
            .addCase(getAllGoalsAsync.rejected, (state) => {
                state.loading = false;
                message.error('Не удалось загрузить цели');
            })
            // Обработка добавления цели
            .addCase(addGoalAsync.fulfilled, (state, action) => {
                state.goals = [...state.goals, action.payload];
                message.success('Цель успешно добавлена');
            })
            .addCase(addGoalAsync.rejected, () => {
                message.error('Не удалось добавить цель'); // Уведомление об ошибке
            })

            // Обновление цели
            .addCase(updateGoalAsync.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateGoalAsync.fulfilled, (state, action) => {
                const index = state.goals.findIndex((goal) => goal.id === action.payload.id);
                if (index !== -1) {
                    state.goals[index] = { ...state.goals[index], ...action.payload };
                }
                state.updating = false;
                message.success('Цель успешно отредактирована'); // разобраться почему всплывает после добавления цели
            })
            .addCase(updateGoalAsync.rejected, (state) => {
                state.updating = false;
                message.error('Не удалось обновить цель');
            })

            // Удаление цели
            .addCase(deleteGoalAsync.pending, (state) => {
                state.deleting = true;
            })
            .addCase(deleteGoalAsync.fulfilled, (state, action) => {
                state.goals = state.goals.filter((goal) => goal.id !== action.payload);
                state.deleting = false;
                message.success('Цель успешно удалена');
            })
            .addCase(deleteGoalAsync.rejected, (state) => {
                state.deleting = false;
                message.error('Не удалось удалить цель');
            });
    },
});

export const{ setGoals } = goalsSlice.actions;

export default goalsSlice.reducer;

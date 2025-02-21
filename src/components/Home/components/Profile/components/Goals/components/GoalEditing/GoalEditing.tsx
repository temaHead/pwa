import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Alert, Box } from '@mui/material';
import { AppDispatch, RootState } from '../../../../../../../../store';
import { updateGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import { Goal } from '../../../../../../../../types';

const GoalEditing = () => {
    const { goalId } = useParams<{ goalId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const goalData = useSelector((state: RootState) => state.goals.goals.find((g) => g.id === goalId));

    const [goal, setGoal] = useState<Goal | null>(null);
    const [updatedStatus, setUpdatedStatus] = useState<Goal['status'] | null>(null);

    useEffect(() => {
        if (goalData) {
            setGoal(goalData.goal);
        }
    }, [goalData]);

    if (!goal) {
        return <div>Цель не найдена</div>;
    }

    const handleChange = (field: keyof Goal, value: string | number | null) => {
        setGoal((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleSave = () => {
        if (goalData) {
            dispatch(
                updateGoalAsync({ id: goalData.id, goal: { ...goal, status: updatedStatus || goal.status } })
            );
            navigate(-1);
        }
    };

    return (
        <Box
            maxWidth='400px'
            margin='auto'
            padding='20px'
        >
            <h2>Редактирование цели</h2>

            {/* Информационный блок при статусе "done" */}
            {goal.status === 'done' && (
                <>
                    <Alert
                        severity='info'
                        sx={{ marginBottom: 2 }}
                    >
                        Время на выполнение вашей задачи закончилось. Обновите статус цели.
                    </Alert>
                    <FormControl
                        fullWidth
                        margin='normal'
                    >
                        <InputLabel>Обновите статус</InputLabel>
                        <Select
                            value={updatedStatus || ''}
                            onChange={(e) => setUpdatedStatus(e.target.value as Goal['status'])}
                        >
                            <MenuItem value='success'>Успешно</MenuItem>
                            <MenuItem value='failed'>Провалена</MenuItem>
                        </Select>
                    </FormControl>
                </>
            )}

            <FormControl
                fullWidth
                margin='normal'
            >
                <InputLabel>Тип цели</InputLabel>
                <Select
                    value={goal.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                >
                    <MenuItem value='weight'>Вес</MenuItem>
                    <MenuItem value='fat'>Процент жира</MenuItem>
                </Select>
            </FormControl>

            {/* Поля для веса */}
            {goal.type === 'weight' && (
                <>
                    <TextField
                        fullWidth
                        label='Начальный вес'
                        type='number'
                        value={goal.initialWeight ?? ''}
                        onChange={(e) => handleChange('initialWeight', Number(e.target.value))}
                        margin='normal'
                    />
                    <TextField
                        fullWidth
                        label='Желаемый вес'
                        type='number'
                        value={goal.desiredWeight ?? ''}
                        onChange={(e) => handleChange('desiredWeight', Number(e.target.value))}
                        margin='normal'
                    />
                </>
            )}

            {/* Поля для жира */}
            {goal.type === 'fat' && (
                <>
                    <TextField
                        fullWidth
                        label='Начальный жир (%)'
                        type='number'
                        value={goal.initialFat ?? ''}
                        onChange={(e) => handleChange('initialFat', Number(e.target.value))}
                        margin='normal'
                    />
                    <TextField
                        fullWidth
                        label='Желаемый жир (%)'
                        type='number'
                        value={goal.desiredFat ?? ''}
                        onChange={(e) => handleChange('desiredFat', Number(e.target.value))}
                        margin='normal'
                    />
                </>
            )}

            <TextField
                fullWidth
                label='Дата начала'
                type='date'
                value={goal.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                margin='normal'
                InputLabelProps={{ shrink: true }}
            />

            <TextField
                fullWidth
                label='Дата окончания'
                type='date'
                value={goal.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                margin='normal'
                InputLabelProps={{ shrink: true }}
            />

            <Box
                display='flex'
                justifyContent='space-between'
                marginTop='20px'
            >
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSave}
                >
                    Сохранить
                </Button>
                <Button
                    variant='outlined'
                    color='secondary'
                    onClick={() => navigate(-1)}
                >
                    Отмена
                </Button>
            </Box>
        </Box>
    );
};

export default GoalEditing;

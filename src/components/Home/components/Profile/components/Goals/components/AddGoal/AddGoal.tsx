import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useState } from 'react';
import Selector from '../../../../../../../../shared/components/Selector/Selector';
import { AppDispatch, RootState } from '../../../../../../../../store';
import { addGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import {
    addWeightMeasuringAsync,
    addFatMeasuringAsync,
} from '../../../../../../../../store/slices/measurementSlice';
import Input from '../../../../../../../../shared/components/Input/Input';
import style from './AddGoal.module.scss';

// Типы для состояния цели
interface GoalState {
    startDate: string;
    endDate: string;
    daysToComplete: number;
    status: 'active' | 'done' | 'failed' | 'pending' | 'initial';
    type: 'weight' | 'fat' | '';
    currentWeight: number | null;
    desiredWeight: number | null;
    currentFat: number | null;
    desiredFat: number | null;
}

function AddGoal() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { id, currentWeight, bodyFat } = useSelector((state: RootState) => state.user);

    const [goal, setGoal] = useState<GoalState>({
        startDate: '',
        endDate: '',
        daysToComplete: 0,
        status: 'initial',
        type: '',
        currentWeight: currentWeight || null,
        desiredWeight: null,
        currentFat: bodyFat || null,
        desiredFat: null,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Обработка изменений в инпутах
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setGoal((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Очищаем ошибку при изменении поля
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Обработка изменений дат
    const handleDateChange = (name: string, value: string) => {
        setGoal((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'startDate' || name === 'endDate') {
            const startDate = name === 'startDate' ? new Date(value) : new Date(goal.startDate);
            const endDate = name === 'endDate' ? new Date(value) : new Date(goal.endDate);

            if (startDate && endDate) {
                const timeDiff = endDate.getTime() - startDate.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                setGoal((prev) => ({
                    ...prev,
                    daysToComplete: daysDiff,
                }));
            }
        }
        // Очищаем ошибку при изменении поля
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Обработка изменений дней
    const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const days = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
        if (!isNaN(days)) {
            const startDate = new Date(goal.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + days);

            setGoal((prev) => ({
                ...prev,
                daysToComplete: days,
                endDate: endDate.toISOString().split('T')[0],
            }));
        }
        // Очищаем ошибку при изменении поля
        setErrors((prev) => ({ ...prev, daysToComplete: '' }));
    };

    // Валидация формы
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!goal.startDate) newErrors.startDate = 'Дата начала обязательна';
        if (!goal.endDate) newErrors.endDate = 'Дата окончания обязательна';
        if (goal.daysToComplete <= 0) newErrors.daysToComplete = 'Укажите количество дней';
        if (!goal.type) newErrors.type = 'Тип цели обязателен';

        if (goal.type === 'weight') {
            if (goal.currentWeight === null || goal.currentWeight === undefined) {
                newErrors.currentWeight = 'Текущий вес обязателен';
            }
            if (goal.desiredWeight === null || goal.desiredWeight === undefined) {
                newErrors.desiredWeight = 'Желаемый вес обязателен';
            }
        } else if (goal.type === 'fat') {
            if (goal.currentFat === null || goal.currentFat === undefined) {
                newErrors.currentFat = 'Текущий % жира обязателен';
            }
            if (goal.desiredFat === null || goal.desiredFat === undefined) {
                newErrors.desiredFat = 'Желаемый % жира обязателен';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Возвращает true, если ошибок нет
    };

    // Сохранение цели
    const handleSaveGoal = async () => {
        if (!id) return;

        // Проверяем форму на ошибки
        if (!validateForm()) return;

        const newGoal = {
            startDate: goal.startDate,
            endDate: goal.endDate,
            type: goal.type,
            currentWeight: goal.currentWeight,
            desiredWeight: goal.desiredWeight,
            initialWeight: goal.currentWeight,
            currentFat: goal.currentFat,
            desiredFat: goal.desiredFat,
            initialFat: goal.currentFat,
            status: goal.status,
        };

        // Сохраняем цель
        await dispatch(addGoalAsync({ userId: id, goal: newGoal }));

        // Обновляем замеры, если тип цели связан с ними
        if (goal.type === 'weight' && goal.currentWeight && goal.currentWeight !== currentWeight) {
            await dispatch(
                addWeightMeasuringAsync({
                    weight: goal.currentWeight,
                    timestamp: goal.startDate,
                })
            );
        } else if (goal.type === 'fat' && goal.currentFat && goal.currentFat !== bodyFat) {
            await dispatch(
                addFatMeasuringAsync({
                    bodyFat: goal.currentFat,
                    measurements: {
                        thigh: null,
                        chest: null,
                        abdomen: null,
                        tricep: null,
                        waist: null,
                    },
                    timestamp: goal.startDate,
                })
            );
        }

        navigate('/profile');
    };

    // Навигация назад
    const handleGoBack = () => {
        navigate('/profile');
    };

    return (
        <div className='addGoal'>
            <div className='header'>
                <div
                    className='icon'
                    onClick={handleGoBack}
                >
                    <ArrowBackIosIcon />
                </div>
                <div className='title'>Добавить цель</div>
            </div>

            <div className='form'>
                <div className={style.inputs}>
                    <Input
                        label='Дата начала'
                        type='date'
                        name='startDate'
                        value={goal.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        error={errors.startDate}
                    />
                    <Input
                        label='Дата окончания'
                        type='date'
                        name='endDate'
                        value={goal.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        error={errors.endDate}
                    />
                    {goal.startDate && goal.endDate && (
                        <Input
                            label='Дней на выполнение'
                            name='daysToComplete'
                            value={goal.daysToComplete === null ? '' : goal.daysToComplete.toString()}
                            onChange={handleDaysChange}
                            type='number'
                            error={errors.daysToComplete}
                        />
                    )}

                    <Selector
                        label='Тип цели'
                        name='type'
                        value={goal.type}
                        onChange={handleInputChange}
                        options={[
                            { value: '', label: 'Выберите тип цели' },
                            { value: 'weight', label: 'Похудеть/Набрать вес' },
                            { value: 'fat', label: 'Изменить % жира в организме' },
                        ]}
                    />

                    <div className={style.content}>
                        {goal.type === 'weight' && (
                            <>
                                <Input
                                    label='Текущий вес'
                                    name='currentWeight'
                                    value={goal.currentWeight || ''}
                                    onChange={handleInputChange}
                                    type='number'
                                    postValue='кг'
                                    error={errors.currentWeight}
                                />
                                <Input
                                    label='Желаемый вес'
                                    name='desiredWeight'
                                    value={goal.desiredWeight || ''}
                                    onChange={handleInputChange}
                                    type='number'
                                    postValue='кг'
                                    error={errors.desiredWeight}
                                />
                            </>
                        )}

                        {goal.type === 'fat' && (
                            <>
                                <Input
                                    label='Текущий % жира'
                                    name='currentFat'
                                    value={goal.currentFat || ''}
                                    onChange={handleInputChange}
                                    type='number'
                                    postValue='%'
                                    error={errors.currentFat}
                                />
                                <Input
                                    label='Желаемый % жира'
                                    name='desiredFat'
                                    value={goal.desiredFat || ''}
                                    onChange={handleInputChange}
                                    type='number'
                                    postValue='%'
                                    error={errors.desiredFat}
                                />
                            </>
                        )}
                    </div>

                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSaveGoal}
                    >
                        Сохранить цель
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AddGoal;

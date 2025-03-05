import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, DatePicker, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { AppDispatch, RootState } from '../../../../../../../../store';
import { addGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import {
    addWeightMeasuringAsync,
    addFatMeasuringAsync,
} from '../../../../../../../../store/slices/measurementSlice';
import dayjs from 'dayjs';
import styles from './AddGoal.module.scss';
import { Goal } from '../../../../../../../../types';
import CustomSelect from '../../../../../../../../shared/components/CustomSelect/CustomSelect';
import Header from '../../../../../../../../shared/components/Header/Header';

const { Option } = Select;

function AddGoal() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    
    const { id, currentWeight, bodyFat } = useSelector((state: RootState) => state.user);

    const initialGoal = useMemo(() => ({
        startDate: '',
        endDate: '',
        daysToComplete: 0,
        status: 'initial' as 'active' | 'done' | 'failed' | 'pending' | 'success',
        type: '' as 'weight' | 'fat' | '',
        currentWeight: currentWeight || null,
        desiredWeight: null,
        currentFat: bodyFat || null,
        desiredFat: null,
    }), [currentWeight, bodyFat]);

    const [goal, setGoal] = useState<Goal>(initialGoal);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (name: string, value: string) => {
        setGoal((prev) => ({
            ...prev,
            [name]: name === 'type' && (value === 'weight' || value === 'fat' || value === '') ? value : prev.type,
        }));
    };

    const handleDateChange = useCallback((name: string, date: dayjs.Dayjs | null) => {
        if (!date) return;
        const formattedDate = date.format('YYYY-MM-DD');
        setGoal((prev) => ({ ...prev, [name]: formattedDate }));

        if (name === 'startDate' || name === 'endDate') {
            const startDate = dayjs(name === 'startDate' ? formattedDate : goal.startDate);
            const endDate = dayjs(name === 'endDate' ? formattedDate : goal.endDate);
            if (startDate.isValid() && endDate.isValid()) {
                setGoal((prev) => ({ ...prev, daysToComplete: endDate.diff(startDate, 'day') }));
            }
        }
        setErrors((prev) => ({ ...prev, [name]: '' }));
    }, [goal.startDate, goal.endDate]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!goal.startDate) newErrors.startDate = 'Дата начала обязательна';
        if (!goal.endDate) newErrors.endDate = 'Дата окончания обязательна';
        if (goal.daysToComplete <= 0) newErrors.daysToComplete = 'Укажите количество дней';
        if (!goal.type) newErrors.type = 'Тип цели обязателен';
        
        if (goal.type === 'weight' && (goal.currentWeight === null || goal.desiredWeight === null)) {
            newErrors.currentWeight = 'Текущий вес обязателен';
            newErrors.desiredWeight = 'Желаемый вес обязателен';
        } else if (goal.type === 'fat' && (goal.currentFat === null || goal.desiredFat === null)) {
            newErrors.currentFat = 'Текущий % жира обязателен';
            newErrors.desiredFat = 'Желаемый % жира обязателен';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [goal]);

    const handleSaveGoal = useCallback(async () => {
        if (!id || !validateForm()) return;
        
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
            daysToComplete: goal.daysToComplete
        };
        await dispatch(addGoalAsync({ userId: id, goal: newGoal }));

        if (goal.type === 'weight' &&  goal.currentWeight != null && goal.currentWeight !== currentWeight) {
            await dispatch(addWeightMeasuringAsync({ weight: goal.currentWeight, timestamp: goal.startDate }));
        } else if (goal.type === 'fat' && goal.currentFat != null && goal.currentFat !== bodyFat) {
            await dispatch(addFatMeasuringAsync({ bodyFat: goal.currentFat, measurements: {
                chest: null,
                abdomen: null,
                thigh: null,
                tricep: null,
                waist: null
            }, timestamp: goal.startDate }));
        }

        navigate('/profile');
    }, [goal, id, dispatch, navigate, validateForm, currentWeight, bodyFat]);

    return (
        <div className={styles.addGoal}>
             <Header
                title={'Добавить цель'}
                showBackButton
            />

            <div className={styles.form}>
                <DatePicker
                    placeholder='Дата начала'
                    value={goal.startDate ? dayjs(goal.startDate) : null}
                    onChange={(date) => handleDateChange('startDate', date)}
                    status={errors.startDate ? 'error' : ''}
                />
                <DatePicker
                    placeholder='Дата окончания'
                    value={goal.endDate ? dayjs(goal.endDate) : null}
                    onChange={(date) => handleDateChange('endDate', date)}
                    status={errors.endDate ? 'error' : ''}
                />
                <CustomSelect
                    placeholder='Тип цели'
                    value={goal.type}
                    onChange={(value) => handleInputChange('type', value)}
                >
                    <Option value=''>Выберите тип цели</Option>
                    <Option value='weight'>Похудеть/Набрать вес</Option>
                    <Option value='fat'>Изменить % жира</Option>
                </CustomSelect>
                {goal.type === 'weight' && (
                    <>
                        <Input type='number' placeholder='Текущий вес' value={goal.currentWeight || ''} onChange={(e) => handleInputChange('currentWeight', e.target.value)} />
                        <Input type='number' placeholder='Желаемый вес' value={goal.desiredWeight || ''} onChange={(e) => handleInputChange('desiredWeight', e.target.value)} />
                    </>
                )}
                {goal.type === 'fat' && (
                    <>
                        <Input type='number' placeholder='Текущий % жира' value={goal.currentFat || ''} onChange={(e) => handleInputChange('currentFat', e.target.value)} />
                        <Input type='number' placeholder='Желаемый % жира' value={goal.desiredFat || ''} onChange={(e) => handleInputChange('desiredFat', e.target.value)} />
                    </>
                )}
                <Button type='primary' onClick={handleSaveGoal}>Сохранить цель</Button>
            </div>
        </div>
    );
}

export default AddGoal;

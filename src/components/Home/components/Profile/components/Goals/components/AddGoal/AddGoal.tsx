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
    addBodyMeasuringAsync,
    addFatMeasuringAsync,
} from '../../../../../../../../store/slices/measurementSlice';
import Input from '../../../../../../../../shared/components/Input/Input';

function AddGoal() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { id, currentWeight, gender } = useSelector((state: RootState) => state.user);
    const latestWeight = useSelector((state: RootState) => state.measurements.weightMeasuring[0]);
    const latestBody = useSelector((state: RootState) => state.measurements.bodyMeasuring[0]);
    const latestFat = useSelector((state: RootState) => state.measurements.fatMeasuring[0]);

    const [goal, setGoal] = useState({
        startDate: '',
        endDate: '',
        daysToComplete: 0,
        type: '' as 'weight' | 'body' | 'fat'  , // Указываем допустимые значения
        currentWeight: currentWeight|| null,
        desiredWeight: null,
        currentBody: latestBody?.bodyMeasuring || {
            chest: null,
            waist: null,
            hips: null,
            thigh: null,
            arms: null,
        },
        desiredBody: {
            chest: null,
            waist: null,
            hips: null,
            thigh: null,
            arms: null,
        },
        currentFat: latestFat?.bodyFat || null,
        desiredFat: null,
        currentCaliper: latestFat?.measurements || {
            chest: null,
            abdomen: null,
            thigh: null,
            tricep: null,
            waist: null,
        },
        desiredCaliper: {
            chest: null,
            abdomen: null,
            thigh: null,
            tricep: null,
            waist: null,
        },
    });

    const filteredCaliperFields =
    gender === 'male' ? ['chest', 'abdomen', 'thigh'] : ['thigh', 'tricep', 'waist'];

const caliperLabels = {
    chest: 'Грудь',
    abdomen: 'Живот',
    thigh: 'Бедро',
    tricep: 'Трицепс',
    waist: 'Талия',
};

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Обработка вложенных полей (например, currentBody.chest)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setGoal((prev) => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof typeof prev] as Record<string, unknown>), // Приведение типа
                    [child]: value === '' ? null : parseFloat(value),
                },
            }));
        } else {
            setGoal((prev) => ({
                ...prev,
                [name]: value === '' ? null : value,
            }));
        }
    };

    const handleDateChange = (name: string, value: string) => {
        setGoal((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Если изменяется startDate или endDate, пересчитываем daysToComplete
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
    };

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
    };

    const handleSaveGoal = async () => {
        if (!id) return;

        const newGoal = {
            userId: id,
            startDate: goal.startDate,
            endDate: goal.endDate,
            daysToComplete: goal.daysToComplete, // Добавляем daysToComplete
            type: goal.type,
            currentWeight: goal.currentWeight,
            desiredWeight: goal.desiredWeight,
            currentBody: goal.currentBody,
            desiredBody: goal.desiredBody,
            currentFat: goal.currentFat,
            desiredFat: goal.desiredFat,
            currentCaliper: goal.currentCaliper,
            desiredCaliper: goal.desiredCaliper,
        };

        // Сохраняем цель
        await dispatch(addGoalAsync({ userId: id, goal: newGoal }));

        // Если тип цели связан с замерами, обновляем замеры
        if (goal.type === 'weight' && goal.currentWeight && goal.currentWeight !== latestWeight?.weight) {
            await dispatch(
                addWeightMeasuringAsync({
                    weight: goal.currentWeight,
                    timestamp: goal.startDate,
                })
            );
        } else if (
            goal.type === 'body' &&
            goal.currentBody &&
            goal.currentBody !== latestBody?.bodyMeasuring
        ) {
            await dispatch(
                addBodyMeasuringAsync({
                    measurements: goal.currentBody,
                    timestamp: goal.startDate,
                })
            );
        } else if (goal.type === 'fat' && goal.currentFat && goal.currentFat !== latestFat?.bodyFat) {
            await dispatch(
                addFatMeasuringAsync({
                    bodyFat: goal.currentFat,
                    measurements: goal.currentCaliper,
                    timestamp: goal.startDate,
                })
            );
        }

        navigate('/profile');
    };

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
                <Input
                    label='Дата начала'
                    type='date'
                    name='startDate'
                    value={goal.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
                <Input
                    label='Дата окончания'
                    type='date'
                    name='endDate'
                    value={goal.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
                <Input
                    label='Дней на выполнение'
                    name='daysToComplete'
                    value={goal.daysToComplete === null ? '' : goal.daysToComplete.toString()}
                    onChange={handleDaysChange}
                    type='number'
                />

                <Selector
                    label='Тип цели'
                    name='type'
                    value={goal.type}
                    onChange={handleInputChange}
                    options={[
                        { value: '', label: 'Выберите тип цели' },
                        { value: 'weight', label: 'Похудеть/Набрать вес' },
                        { value: 'body', label: 'Изменить свои объемы' },
                        { value: 'fat', label: 'Изменить % жира в организме' },
                    ]}
                />

                {goal.type === 'weight' && (
                    <>
                        <Input
                            label='Текущий вес'
                            name='currentWeight'
                            value={goal.currentWeight || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='кг'
                        />
                        <Input
                            label='Желаемый вес'
                            name='desiredWeight'
                            value={goal.desiredWeight || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='кг'
                        />
                    </>
                )}

                {goal.type === 'body' && (
                    <>
                        <Input
                            label='Текущий объем груди'
                            name='currentBody.chest'
                            value={goal.currentBody?.chest || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Желаемый объем груди'
                            name='desiredBody.chest'
                            value={goal.desiredBody?.chest || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Текущий объем талии'
                            name='currentBody.waist'
                            value={goal.currentBody?.waist || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Желаемый объем талии'
                            name='desiredBody.waist'
                            value={goal.desiredBody?.waist || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Текущий объем бедер'
                            name='currentBody.hips'
                            value={goal.currentBody?.hips || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Желаемый объем бедер'
                            name='desiredBody.hips'
                            value={goal.desiredBody?.hips || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Текущий объем бедра'
                            name='currentBody.thigh'
                            value={goal.currentBody?.thigh || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Желаемый объем бедра'
                            name='desiredBody.thigh'
                            value={goal.desiredBody?.thigh || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Текущий объем рук'
                            name='currentBody.arms'
                            value={goal.currentBody?.arms || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                        <Input
                            label='Желаемый объем рук'
                            name='desiredBody.arms'
                            value={goal.desiredBody?.arms || ''}
                            onChange={handleInputChange}
                            type='number'
                            postValue='см'
                        />
                    </>
                )}

                {goal.type === 'fat' && (
                    <>
                        {/* Поля калипера в зависимости от гендера */}
                        <div>текущие замеры калипером</div>
                    {filteredCaliperFields.map((field) => (
                        <Input
                            key={field}
                            label={caliperLabels[field as keyof typeof caliperLabels]}
                            name={`currentCaliper.${field}`}
                            value={goal.currentCaliper[field as keyof typeof goal.currentCaliper]}
                            onChange={handleInputChange}
                            type='number'
                            postValue='мм'
                        />
                    ))}
                    <div>желаемые замеры калипером</div>
                    {filteredCaliperFields.map((field) => (
                        <Input
                            key={field}
                            label={caliperLabels[field as keyof typeof caliperLabels]}
                            name={`desiredCaliper.${field}`}
                            value={goal.desiredCaliper[field as keyof typeof goal.desiredCaliper]}
                            onChange={handleInputChange}
                            type='number'
                            postValue='мм'
                        />
                    ))}
                    </>
                )}

                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSaveGoal}
                >
                    Сохранить цель
                </Button>
            </div>
        </div>
    );
}

export default AddGoal;

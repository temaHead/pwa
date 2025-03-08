import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Select, Form, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { AppDispatch, RootState } from '../../../../../../../../store';
import { addGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import {
    addWeightMeasuringAsync,
    addFatMeasuringAsync,
} from '../../../../../../../../store/slices/measurementSlice';
import dayjs from 'dayjs';
import style from './AddGoal.module.scss';
import { Goal } from '../../../../../../../../types';
import CustomSelect from '../../../../../../../../shared/components/CustomSelect/CustomSelect';
import Header from '../../../../../../../../shared/components/Header/Header';

const { Option } = Select;

function AddGoal() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { id, currentWeight, bodyFat } = useSelector((state: RootState) => state.user);

    const initialGoal = useMemo<Goal>(
        () => ({
            startDate: dayjs().format('YYYY-MM-DD'),
            endDate: '',
            daysToComplete: 0,
            status: 'initial',
            type: '',
            initialWeight: currentWeight || null,
            desiredWeight: null,
            initialFat: bodyFat || null,
            desiredFat: null,
        }),
        [currentWeight, bodyFat]
    );

    const [goal, setGoal] = useState<Goal>(initialGoal);

    const isSaveDisabled = useMemo(() => {
        return (
            !goal.startDate ||
            !goal.endDate ||
            goal.daysToComplete <= 0 ||
            !goal.type ||
            (goal.type === 'weight' && (!goal.initialWeight || !goal.desiredWeight)) ||
            (goal.type === 'fat' && (!goal.initialFat || !goal.desiredFat))
        );
    }, [goal]);

    const handleInputChange = useCallback((name: string, value: string) => {
        setGoal((prev) => ({
            ...prev,
            [name]: name === 'type' ? value : value ? Number(value) : null,
        }));
    }, []);

    const handleDateChange = useCallback(
        (name: 'startDate' | 'endDate', date: dayjs.Dayjs | null) => {
            if (!date?.isValid()) return;
            const formattedDate = date.format('YYYY-MM-DD');

            setGoal((prev) => {
                const newGoal = { ...prev, [name]: formattedDate };

                if (newGoal.startDate && newGoal.endDate) {
                    const start = dayjs(newGoal.startDate);
                    const end = dayjs(newGoal.endDate);
                    if (start.isValid() && end.isValid()) {
                        newGoal.daysToComplete = end.diff(start, 'day');
                    }
                }

                return newGoal;
            });
        },
        []
    );

    const handleSaveGoal = useCallback(async () => {
        if (!id || isSaveDisabled) return;

        await dispatch(addGoalAsync({ userId: id, goal }));

        if (goal.type === 'weight' && goal.currentWeight !== currentWeight) {
            await dispatch(addWeightMeasuringAsync({ weight: goal.currentWeight!, timestamp: goal.startDate }));
        } else if (goal.type === 'fat' && goal.currentFat !== bodyFat) {
            await dispatch(
                addFatMeasuringAsync({
                    bodyFat: goal.currentFat!,
                    measurements: { chest: null, abdomen: null, thigh: null, tricep: null, waist: null },
                    timestamp: goal.startDate,
                })
            );
        }

        navigate('/profile');
    }, [goal, id, dispatch, navigate, isSaveDisabled, currentWeight, bodyFat]);

    return (
        <div className={style.addGoal}>
            <Header
                title={'Добавить цель'}
                showBackButton
            />
            <div className={style.form}>
                <Form layout='vertical'>
                    <Form.Item label='Дата начала'>
                        <Input
                            type='date'
                            value={goal.startDate}
                            onChange={(e) => handleDateChange('startDate', dayjs(e.target.value))}
                            style={{ width: '100%', minWidth: 'auto' }}
                        />
                    </Form.Item>

                    <Form.Item label='Дата завершения'>
                        <Input
                            type='date'
                            value={goal.endDate}
                            onChange={(e) => handleDateChange('endDate', dayjs(e.target.value))}
                            style={{ width: '100%', minWidth: 'auto' }}
                        />
                    </Form.Item>
                    <Form.Item label='Тип цели'>
                        <CustomSelect
                            placeholder='Тип цели'
                            value={goal.type}
                            onChange={(value) => handleInputChange('type', value)}
                        >
                            <Option value=''>Выберите тип цели</Option>
                            <Option value='weight'>Похудеть/Набрать вес</Option>
                            <Option value='fat'>Изменить % жира</Option>
                        </CustomSelect>
                    </Form.Item>
                    {goal.type === 'weight' && (
                        <>
                            <Form.Item label='Текущий вес'>
                                <Input
                                    type='number'
                                    placeholder='Вес'
                                    value={goal.initialWeight ?? ''}
                                    onChange={(e) => handleInputChange('initialWeight', e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item label='Желаемый вес'>
                                <Input
                                    type='number'
                                    placeholder='Вес'
                                    value={goal.desiredWeight ?? ''}
                                    onChange={(e) => handleInputChange('desiredWeight', e.target.value)}
                                />
                            </Form.Item>
                        </>
                    )}
                    {goal.type === 'fat' && (
                        <>
                            <Form.Item label='Текущий % жира'>
                                <Input
                                    type='number'
                                    placeholder=' % жира'
                                    value={goal.initialFat ?? ''}
                                    onChange={(e) => handleInputChange('initialFat', e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item label='Желаемый % жира'>
                                <Input
                                    type='number'
                                    placeholder=' % жира'
                                    value={goal.desiredFat ?? ''}
                                    onChange={(e) => handleInputChange('desiredFat', e.target.value)}
                                />
                            </Form.Item>
                        </>
                    )}
                    {!isSaveDisabled && (
                        <Flex
                            justify='center'
                            className={style.buttonsWrapper}
                        >
                            <Button
                                type='primary'
                                onClick={handleSaveGoal}
                            >
                                Сохранить цель
                            </Button>
                        </Flex>
                    )}
                </Form>
            </div>
        </div>
    );
}

export default AddGoal;

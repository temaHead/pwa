import { GoalData } from '../../../../../../../../types';
import style from './Goal.module.scss';
import { updateGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import { useEffect, useState } from 'react';
import { AppDispatch } from '../../../../../../../../store';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd';

interface GoalProps {
    goal: GoalData;
    currentWeight: number;
    bodyFat: number;
}

function Goal({ goal, currentWeight, bodyFat }: GoalProps) {
    const currentDate = new Date();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate(); // Хук для навигации
    const goalData = goal.goal;
    const [status, setStatus] = useState(goalData.status || '');

    const handleGoalClick = () => {
        navigate(`/goalEditing/${goal.id}`);
    };

    // Функция определения статуса
    const isGoalDoneStatus = () => {
        const startDate = new Date(goalData.startDate);
        const endDate = new Date(goalData.endDate);
        if (startDate <= currentDate && endDate >= currentDate) return 'active';
        if (startDate > currentDate) return 'pending';
        return 'done';
    };

    // Проверка и обновление статуса
    const checkAndEditStatus = async () => {
        if (!['failed', 'success'].includes(goalData.status)) {
            const newStatus = isGoalDoneStatus();
            if (newStatus !== goalData.status) {
                setStatus(newStatus);
                await dispatch(updateGoalAsync({ id: goal.id, goal: { ...goalData, status: newStatus } }));
            }
        }
    };

    useEffect(() => {
        checkAndEditStatus();
    }, [goal]);

    // Рассчитываем прогресс
    const initialWeight = Number(goalData.initialWeight);
    const targetWeight = Number(goalData.desiredWeight);
    const initialFat = Number(goalData.initialFat);
    const targetFat = Number(goalData.desiredFat);

    const totalDifferenceWeight = Math.abs(targetWeight - initialWeight);
    const totalDifferenceFat = Math.abs(targetFat - initialFat);

    const isLosingWeight = initialWeight > targetWeight;
    const isLosingFat = initialFat > targetFat;

    let currentDifferenceWeight = Math.abs(currentWeight - initialWeight);
    let currentDifferenceFat = Math.abs(bodyFat - initialFat);

    // Коррекция, если цель "провалена" или текущий вес ушел в обратную сторону
    if (
        (isLosingWeight && currentWeight > initialWeight) ||
        (!isLosingWeight && currentWeight < initialWeight)
    ) {
        currentDifferenceWeight = 0;
    }
    if (
        (isLosingWeight && currentWeight < targetWeight) ||
        (!isLosingWeight && currentWeight > targetWeight)
    ) {
        currentDifferenceWeight = totalDifferenceWeight;
    }

    if ((isLosingFat && bodyFat > initialFat) || (!isLosingFat && bodyFat < initialFat)) {
        currentDifferenceFat = 0;
    }
    if ((isLosingFat && bodyFat < targetFat) || (!isLosingFat && bodyFat > targetFat)) {
        currentDifferenceFat = totalDifferenceFat;
    }

    const resultMath =
        goalData.type === 'weight'
            ? currentDifferenceWeight / totalDifferenceWeight
            : currentDifferenceFat / totalDifferenceFat;

    const progress = status === 'active' ? Math.min(resultMath * 100, 100) : 100;

    // Размеры круга
    const r = 40;
    const cx = 50;
    const cy = 50;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * ((100 - progress) / 100);

    // Цвета прогресса в зависимости от статуса
    const progressColors: Record<string, string> = {
        failed: '#d32f2f', // красный
        active: '#2196f3', // синий
        pending: '#9e9e9e', // серый
        success: '#388e3c', // зеленый
        done: '#ff9800', // оранжевый
    };

    return (
        <div
            className={style.goal}
            onClick={handleGoalClick}
        >
            <Badge
                color='red'
                count={goalData.status === 'done' ? '!' : 0}
                offset={[-15, 13]}
            >
                <div className={style.progressCircle}>
                    <svg
                        viewBox='0 0 100 100'
                        data-status={status}
                    >
                        {/* Светлый фон круга */}
                        <circle
                            className={style.innerBackground}
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill={progressColors[status] + '20'} // Полупрозрачный фон
                        />

                        {/* Серый фон обводки */}
                        <circle
                            className={style.background}
                            cx={cx}
                            cy={cy}
                            r={r}
                            strokeWidth={strokeWidth}
                            stroke={progressColors[status] + '50'} // Светлый серый оттенок
                        />

                        {/* Прогресс */}
                        <circle
                            className={style.progress}
                            cx={cx}
                            cy={cy}
                            r={r}
                            strokeWidth={strokeWidth}
                            stroke={progressColors[status] || '#19e27a'}
                            strokeDasharray={`${circumference}px`}
                            strokeDashoffset={`${offset}px`}
                        />
                    </svg>
                    <div className={style.progressText}>
                        <div className={`${style.title} ${style[status]}`}>
                            {goalData.type === 'weight'
                                ? ` ${goalData.desiredWeight} кг`
                                : ` ${goalData.desiredFat} %`}
                        </div>
                    </div>
                </div>
            </Badge>
        </div>
    );
}

export default Goal;

import { Badge } from '@mui/material';
import { GoalData } from '../../../../../../../../types';
import style from './Goal.module.scss';
import { updateGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import { useEffect, useState } from 'react';
import { AppDispatch } from '../../../../../../../../store';
import { useDispatch } from 'react-redux';

interface GoalProps {
    goal: GoalData;
    currentWeight: number;
    bodyFat: number;
}

function Goal({ goal, currentWeight, bodyFat }: GoalProps) {
    const currentDate = new Date();
    const dispatch = useDispatch<AppDispatch>();

    const goalData = goal.goal;
    const [status, setStatus] = useState(goalData.status || '');

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

    // Рассчитываем прогресс только для active и в зависимости от type
    const initialWeight = Number(goalData.initialWeight);
    const targetWeight = Number(goalData.desiredWeight);
    const initialFat = Number(goalData.initialFat);
    const targetFat = Number(goalData.desiredFat);
    const totalDifferenceWeight = Math.abs(targetWeight - initialWeight);
    const totalDifferenceFat = Math.abs(targetFat - initialFat);
    const currentDifferenceWeight = Math.abs(currentWeight - initialWeight);
    const currentDifferenceFat = Math.abs(bodyFat - initialFat);
    const resultMath =
        goalData.type === 'weight'
            ? currentDifferenceWeight / totalDifferenceWeight
            : currentDifferenceFat / totalDifferenceFat;
    const progress = status === 'active' ? resultMath * 100 : 100;

    // Размеры круга
    const r = 40;
    const cx = 50;
    const cy = 50;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * ((100 - progress) / 100);

    // Цвет прогресса в зависимости от статуса
    const progressColors: Record<string, string> = {
        active: '#1976d2', // синий
        failed: '#d32f2f', // красный
        pending: '#9e9e9e', // серый
        success: '#388e3c', // зеленый
        done: '#d75916', // Дополнительный цвет для "done"
    };

    return (
        <div className={style.goal}>
            <Badge
                color='secondary'
                badgeContent={goalData.status === 'done' ? '!' : 0}
                overlap='circular' // Убедимся, что бейдж прекрывает круг
            >
                <div className={style.progressCircle}>
                    <svg viewBox='0 0 100 100'>
                        {/* Серый фон */}
                        <circle
                            className={style.background}
                            cx={cx}
                            cy={cy}
                            r={r}
                            strokeWidth={strokeWidth}
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
                        <div className={style.title}>
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

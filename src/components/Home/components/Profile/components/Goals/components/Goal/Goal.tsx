import { Badge } from '@mui/material';
import { GoalData } from '../../../../../../../../types';
import style from './Goal.module.scss';
import { updateGoalAsync } from '../../../../../../../../store/slices/goalsSlice';
import { useEffect, useState } from 'react';
import { AppDispatch } from '../../../../../../../../store';
import { useDispatch } from 'react-redux';

interface GoalProps {
    goal: GoalData;
}

function Goal({ goal }: GoalProps) {
    const currentDate = new Date();
    const dispatch = useDispatch<AppDispatch>();

    const goalData = goal.goal;

    const [status, setStatus] = useState(goalData.status || '');

    //  функция определяющая завершилась ли цель сверкой дат начала и конца
    const isGoalDoneStatus = () => {
        const startDate = new Date(goalData.startDate);
        const endDate = new Date(goalData.endDate);
        if (startDate <= currentDate && endDate >= currentDate) {
            return 'active';
        }
        if (startDate > currentDate) {
            return 'pending';
        }
        return 'done';
    };
    const checkAndEditStatus = async () => {
        if (goalData.status !== 'failed' && goalData.status !== 'success') {
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

    return (
        <div className={style.goal}>
            <Badge
                color='secondary'
                badgeContent={goalData.status === 'done' ? '!' : 0}
                overlap='circular' // Убедимся, что бейдж прекрывает круг
            >
                <div className={style.circle}>
                    <div className={`${style.statusLine} ${style[status]}`}>
                        <div className={style.content}>
                            <div className={style.title}>{goalData.type}</div>
                        </div>
                    </div>
                </div>
            </Badge>
        </div>
    );
}

export default Goal;

import { useNavigate } from 'react-router-dom';
import { GoalData } from '../../../../../../../../../../types';
import style from './CurrentGoalFat.module.scss';
import { theme } from 'antd';

interface CurrentGoalFatProps {
    goal: GoalData;
    bodyFat: number;
}

function CurrentGoalFat(props: CurrentGoalFatProps) {
    const { goal, bodyFat } = props;
    const navigate = useNavigate(); // Хук для навигации

    const handleGoalClick = () => {
        navigate(`/goalEditing/${goal.id}`);
    };

    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgContainer; // Автоматически подстраивается
    const colorText = token.colorText;

    const initialFat = Number(goal.goal.initialFat); // 45
    const targetFat = Number(goal.goal.desiredFat); // 55

    // Рассчитываем прогресс в процентах
    const totalDifference = Math.abs(targetFat - initialFat);
    const currentDifference = Math.abs(bodyFat - initialFat);
    const progress = (currentDifference / totalDifference) * 100;

    return (
        <div
            className={style.goalFat}
            onClick={handleGoalClick}
            style={{ backgroundColor, color: colorText }}
        >
            <div className={style.title}>Прогресс цели</div>
            <div className={style.progress}>
                <div className={style.initialFat}>{initialFat} %</div>
                <progress
                    value={progress}
                    max='100'
                    className={style.progressBar}
                />
                <div className={style.targetFat}>{targetFat} %</div>
            </div>
            <div className={style.currentFat}>
                <div className={style.title}>Текущий % жира: </div>
                <div className={style.value}>{bodyFat}</div>
            </div>
        </div>
    );
}

export default CurrentGoalFat;

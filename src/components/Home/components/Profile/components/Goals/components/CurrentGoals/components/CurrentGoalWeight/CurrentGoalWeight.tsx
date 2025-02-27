import { useNavigate } from 'react-router-dom';
import { GoalData } from '../../../../../../../../../../types';
import style from './CurrentGoalWeight.module.scss';
import { theme } from 'antd';

interface CurrentGoalWeightProps {
    goal: GoalData;
    currentWeight: number;
}

function CurrentGoalWeight(props: CurrentGoalWeightProps) {
    const { currentWeight, goal } = props;
    const navigate = useNavigate(); // Хук для навигации

    const handleGoalClick = () => {
        navigate(`/goalEditing/${goal.id}`);
    };

    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgContainer; // Автоматически подстраивается
    const colorText = token.colorText;

    const initialWeight = Number(goal.goal.initialWeight);
    const targetWeight = Number(goal.goal.desiredWeight);

    console.log('Начальный вес:', initialWeight);
    console.log('Целевой вес:', targetWeight);
    console.log('Текущий вес:', currentWeight);

    const totalDifference = Math.abs(targetWeight - initialWeight);
    let currentDifference = Math.abs(currentWeight - initialWeight);

    // Определяем, надо ли худеть
    const isLosingWeight = initialWeight > targetWeight;

    // Если вес вышел за границы цели, корректируем прогресс
    if (
        (isLosingWeight && currentWeight > initialWeight) ||
        (!isLosingWeight && currentWeight < initialWeight)
    ) {
        currentDifference = 0; // Если ушли в другую сторону, прогресс = 0%
    }

    if (
        (isLosingWeight && currentWeight < targetWeight) ||
        (!isLosingWeight && currentWeight > targetWeight)
    ) {
        currentDifference = totalDifference; // Если достигли цели или перешли её, 100%
    }

    let progress = (currentDifference / totalDifference) * 100;
    progress = Math.min(progress, 100); // Ограничиваем 100%

    return (
        <div
            className={style.goalWeight}
            onClick={handleGoalClick}
            style={{ backgroundColor, color: colorText }}
        >
            <div className={style.title} >Прогресс цели</div>
            <div className={style.progress}>
                <div className={style.initialWeight}>{initialWeight} кг</div>
                <progress
                    value={progress}
                    max='100'
                    className={style.progressBar}
                />
                <div className={style.targetWeight}>{targetWeight} кг</div>
            </div>
            <div className={style.currentWeight}>
                <div className={style.title}>Текущий вес:</div>
                <div className={style.value}>{currentWeight} кг</div>
            </div>
        </div>
    );
}

export default CurrentGoalWeight;

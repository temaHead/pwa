import { Goal } from '../../../../../../../../../../types';
import style from './CurrentGoalWeight.module.scss';

interface CurrentGoalWeightProps {
    goal: Goal;
    currentWeight: number;
}

function CurrentGoalWeight(props: CurrentGoalWeightProps) {
    const { goal, currentWeight } = props;

    const initialWeight = Number(goal.initialWeight);
    const targetWeight = Number(goal.desiredWeight);

    const totalDifference = Math.abs(targetWeight - initialWeight);
    const currentDifference = Math.abs(currentWeight - initialWeight);
    const progress = (currentDifference / totalDifference) * 100;

    return (
        <div className={style.goalWeight}>
            <div className={style.title}>Прогресс цели</div>
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

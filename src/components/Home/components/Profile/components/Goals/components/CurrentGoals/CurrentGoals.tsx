import { useSelector } from 'react-redux';
import { RootState } from '../../../../../../../../store';
import CurrentGoalWeight from './components/CurrentGoalWeight/CurrentGoalWeight';
import CurrentGoalFat from './components/CurrentGoalFat/CurrentGoalFat';
import style from './CurrentGoals.module.scss';

function CurrentGoals() {
    const goals = useSelector((state: RootState) => state.goals.goals);
    const activeGoals = goals.filter((goal) => goal.goal.status === 'active');
    const user = useSelector((state: RootState) => state.user);

    const currentGoalsWeight = activeGoals.filter((goal) => goal.goal.type === 'weight');
    const currentGoalsFat = activeGoals.filter((goal) => goal.goal.type === 'fat');

    return (
        <>
            <div className={style.title}>Текущие цели ({activeGoals.length})</div>
            <div className={style.currentGoalsList}>
                {currentGoalsWeight.map((goal) => (
                    <CurrentGoalWeight
                        key={goal.id}
                        goal={goal.goal}
                        currentWeight={user.currentWeight || 0}
                    />
                ))}
                {currentGoalsFat.map((goal) => (
                    <CurrentGoalFat
                        key={goal.id}
                        goal={goal.goal}
                        bodyFat={user.bodyFat || 0}
                    />
                ))}
            </div>
        </>
    );
}

export default CurrentGoals;

import { useSelector } from 'react-redux';
import { RootState } from '../../../../../../../../store';
import CurrentGoalWeight from './components/CurrentGoalWeight/CurrentGoalWeight';

function CurrentGoals() {
    const goals = useSelector((state: RootState) => state.goals.goals);
    const activeGoals = goals.filter((goal) => goal.goal.status === 'active');
    const user = useSelector((state: RootState) => state.user);


    return (
        <div>
            {activeGoals.map((goal) => (
                <CurrentGoalWeight
                    key={goal.id}
                    goal={goal.goal}
                    currentWeight={user.currentWeight || 0}
                  
                />
            ))}
        </div>
    );
}

export default CurrentGoals;

import { useSelector } from 'react-redux';
import { RootState } from '../../../../../../store';
import Goal from './components/Goal/Goal';
import style from './Goals.module.scss';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

function Goals() {
    const navigate = useNavigate();
    const goals = useSelector((state: RootState) => state.goals.goals);

    const statusOrder = ['initial', 'done', 'pending', 'success', 'failed'];

    const sortedGoals = goals
        .filter((goal) => goal.goal.status !== 'active') // Исключаем цели с типом "active"
        .sort((a, b) => {
            // Сортируем по порядку, определенному в statusOrder
            return statusOrder.indexOf(a.goal.status) - statusOrder.indexOf(b.goal.status);
        });

    return (
        <div>
            <div className={style.goals}>
                <div
                    className={style.addGoal}
                    onClick={() => navigate('/addGoal')}
                >
                    <div className={style.circle}>
                        <div className={style.statusLine}>
                            <div className={style.content}>
                                <div className={style.icon}>
                                    <AddIcon />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {sortedGoals.map((goal) => (
                    <Goal
                        key={goal.id}
                        goal={goal}
                    />
                ))}
            </div>
            <div className={style.goals}></div>
        </div>
    );
}

export default Goals;

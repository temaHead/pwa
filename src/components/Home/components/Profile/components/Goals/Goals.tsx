import { useSelector } from 'react-redux';
import { RootState } from '../../../../../../store';
import Goal from './components/Goal/Goal';
import style from './Goals.module.scss';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { theme } from 'antd';

function Goals() {
    const navigate = useNavigate();
    const goals = useSelector((state: RootState) => state.goals.goals);
    const user = useSelector((state: RootState) => state.user);

    const statusOrder = ['initial', 'done', 'pending', 'success', 'failed'];

    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgContainer; // Автоматически подстраивается

    const sortedGoals = goals
        .filter((goal) => goal.goal.status)
        .sort((a, b) => {
            // Сортируем по порядку, определенному в statusOrder
            return statusOrder.indexOf(a.goal.status) - statusOrder.indexOf(b.goal.status);
        });

    return (
        <div>
            <div className={style.title}>Цели ({goals.length})</div>

            <div
                className={style.goals}
                style={{ backgroundColor }}
            >
                <div
                    className={style.addGoal}
                    onClick={() => navigate('/addGoal')}
                >
                    <div
                        className={style.circle}
                        onClick={() => navigate('/addGoal')}
                    >
                        <div className={style.statusLine}>
                            <div className={style.content}>
                                <PlusOutlined style={{ fontSize: 32 }} />
                            </div>
                        </div>
                    </div>
                </div>
                {sortedGoals.map((goal) => (
                    <Goal
                        key={goal.id}
                        goal={goal}
                        currentWeight={user.currentWeight || 0}
                        bodyFat={user.bodyFat || 0}
                    />
                ))}
            </div>
        </div>
    );
}

export default Goals;

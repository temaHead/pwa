import Goal from './components/Goal/Goal';
import style from './Goals.module.scss';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

function Goals() {
    const navigate = useNavigate();

    return (
        <div>
            <div className={style.goals}>
                <div className={style.addGoal} onClick={() => navigate('/addGoal')}>
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
                <Goal />
                <Goal />
                <Goal />
            </div>
        </div>
    );
}

export default Goals;

import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import Logout from '../../../Auth/Logout/Logout';
import style from './Profile.module.scss';
import { useNavigate } from 'react-router-dom';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { calculateAge } from '../../../Auth/SignUp/components/AddUser/utils';

function Profile() {
    const navigate = useNavigate();

    // Извлечение данных из Redux Store
    const user = useSelector((state: RootState) => state.user);

    const handleGoToRoom = () => {
        navigate('/room');
    };
    const handleGoToEditProfile = () => {
        navigate('/editProfile');
    };

    return (
        <div className={style.profile}>
            <div className={style.header}>
                <div
                    className={style.icon}
                    onClick={handleGoToRoom}
                >
                    {' '}
                    <ArrowBackIosIcon />
                </div>
                <div className={style.title}>Профиль</div>
                <div
                    className={style.icon}
                    onClick={handleGoToEditProfile}
                >
                    <EditRoundedIcon />
                </div>
            </div>
            <div className={style.avatar}>
                <div className={style.icon}>
                    <AccountCircleRoundedIcon fontSize='large' />
                </div>
                <div></div>
            </div>

            <div className={style.container}>
                <div className={style.userInfo}>
                    <div className={` ${style.item}`}>
                        <div className={style.value}>{`${user.currentWeight} кг`}</div>
                        <div className={style.label}>Вес</div>
                    </div>
                    <div className={`${style.height} ${style.item}`}>
                        <div className={style.value}>{`${user.height} см`}</div>
                        <div className={style.label}>Рост</div>
                    </div>
                    <div className={`${style.item}`}>
                        <div className={style.value}>{`${calculateAge(user.birthDate || '')} лет`}</div>
                        <div className={style.label}>Возраст</div>
                    </div>
                </div>
                <div className={style.currentGoals}>
                    <div className={style.title}>Текущие цели</div>
                    <div className={style.currentGoalsList}></div>
                </div>
                <div className={style.goals}>
                    <div className={style.title}>Цели</div>
                    <div className={style.goalsList}></div>
                </div>
            </div>
            <div className={style.logout}>
                <Logout />
            </div>
        </div>
    );
}
export default Profile;

import style from './Measurements.module.scss';
import { useNavigate } from 'react-router-dom';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
    getAllFatMeasuringAsync,
    getAllWeightMeasuringAsync,
} from '../../../../store/slices/measurementSlice';
import { formatTimestamp } from '../../../Auth/SignUp/components/AddUser/utils';

function Measurements() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);

    const userId = useSelector((state: RootState) => state.user.id); // Получение ID пользователя из хранилища

    useEffect(() => {
        if (userId) {
            dispatch(getAllFatMeasuringAsync(userId));
            dispatch(getAllWeightMeasuringAsync(userId));
        }
    }, [dispatch, userId]);

    const handleGoToRoom = () => {
        navigate('/room');
    };

    const handleGoToEditProfile = () => {
        navigate('/editProfile');
    };
    console.log(fatMeasuring);
    console.log(weightMeasuring);

    return (
        <div className={style.measurements}>
            <div className={style.header}>
                <div
                    className={style.icon}
                    onClick={handleGoToRoom}
                >
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
            <div className={style.filter}>Фильтр</div>
            <div className={style.measurementsList}>
                <h3>Жировые измерения</h3>
                <ul>
                    {fatMeasuring.map((item, index) => (
                        <>
                            <li key={index}>
                                {item.bodyFat}
                                {/* Здесь вы можете отформатировать данные под ваши нужды */}
                            </li>
                            <div>{formatTimestamp(item.timestamp.seconds, item.timestamp.nanoseconds)}</div>
                        </>
                    ))}
                </ul>
                <h3>Измерения веса</h3>
                <ul>
                    {weightMeasuring.map((item, index) => (
                        <>
                            <li key={index}>{item.weight}</li>
                            <div>{formatTimestamp(item.timestamp.seconds, item.timestamp.nanoseconds)}</div>
                        </>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Measurements;

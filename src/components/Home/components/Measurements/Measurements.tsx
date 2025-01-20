import style from './Measurements.module.scss';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
    getAllFatMeasuringAsync,
    getAllWeightMeasuringAsync,
} from '../../../../store/slices/measurementSlice';
import { formatTimestamp } from '../../../Auth/SignUp/components/AddUser/utils';
import AddMeasurement from './components/AddMeasurement/AddMeasurement';

function Measurements() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);

    const {id,gender } = useSelector((state: RootState) => state.user); // Получение ID пользователя из хранилища
    const [isModalOpen, setModalOpen] = useState(false);
    useEffect(() => {
        if (id) {
            dispatch(getAllFatMeasuringAsync(id));
            dispatch(getAllWeightMeasuringAsync(id));
        }
    }, [dispatch, id]);

    const handleGoToRoom = () => {
        navigate('/room');
    };

    const handleAddMeasurement = () => {
        setModalOpen(true);
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
                <div className={style.title}>Мои замеры</div>
                <div
                    className={style.icon}
                    onClick={handleAddMeasurement}
                >
                    <AddIcon />
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
            <AddMeasurement isOpen={isModalOpen} onClose={() => setModalOpen(false)} gender={gender} />
        </div>
    );
}

export default Measurements;

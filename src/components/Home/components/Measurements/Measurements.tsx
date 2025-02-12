import style from './Measurements.module.scss';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
    getAllBodyMeasuringAsync,
    getAllFatMeasuringAsync,
    getAllWeightMeasuringAsync,
} from '../../../../store/slices/measurementSlice';
import AddMeasurement from './components/AddMeasurement/AddMeasurement';
import FatMeasurement from './components/FatMeasurement/FatMeasurement';
import WeightMeasurement from './components/WeightMeasurement/WeightMeasurement';
import BodyMeasurement from './components/BodyMeasurement/BodyMeasurement';
import Filter from './components/Filter/Filter';

function Measurements() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const bodyMeasuring = useSelector((state: RootState) => state.measurements.bodyMeasuring);

    const filter = useSelector((state: RootState) => state.filter);

    const { id, gender, birthDate } = useSelector((state: RootState) => state.user); // Получение ID пользователя из хранилища
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getAllFatMeasuringAsync(id));
            dispatch(getAllWeightMeasuringAsync(id));
            dispatch(getAllBodyMeasuringAsync(id));
        }
    }, [dispatch, id]);

    const handleGoToRoom = () => {
        navigate('/room');
    };

    const handleAddMeasurement = () => {
        setModalOpen(true);
    };

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
            <div className={style.filter}>
                <Filter />
            </div>
            <div className={style.measurementsList}>
                {filter.showFat && fatMeasuring.length > 0 && (
                    <>
                        <h3>Измерения % жира в теле</h3>
                            {fatMeasuring.map((item) => (
                                <div key={item.id}>
                                    <FatMeasurement item={item} />
                                </div>
                            ))}
                    </>
                )}
                {filter.showWeight && weightMeasuring.length > 0 && (
                    <>
                        <h3>Измерения веса</h3>
                            {weightMeasuring.map((item) => (
                                <div key={item.id}>
                                    <WeightMeasurement item={item} />
                                </div>
                            ))}
                    </>
                )}
                {filter.showBody && bodyMeasuring.length > 0 && (
                    <>
                        <h3>Измерения тела</h3>
                            {bodyMeasuring.map((item) => (
                                <div key={item.id}>
                                    <BodyMeasurement item={item} />
                                </div>
                            ))}
                    </>
                )}
            </div>
            <AddMeasurement
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                gender={gender}
                birthDate={birthDate || ''}
            />
        </div>
    );
}

export default Measurements;

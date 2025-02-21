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
import { updateUserProfileAsync } from '../../../../store/slices/userSlice';
import CollapsibleSection from '../../../../shared/components/CollapsibleSection/CollapsibleSection';

function Measurements() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const bodyMeasuring = useSelector((state: RootState) => state.measurements.bodyMeasuring);

    const filter = useSelector((state: RootState) => state.filter);
    const user = useSelector((state: RootState) => state.user);

    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (user.id) {
            dispatch(getAllFatMeasuringAsync(user.id));
            dispatch(getAllWeightMeasuringAsync(user.id));
            dispatch(getAllBodyMeasuringAsync(user.id));
        }
    }, [dispatch, user.id]);

    const handleGoToRoom = () => {
        navigate('/room');
    };

    const handleAddMeasurement = () => {
        setModalOpen(true);
    };

    useEffect(() => {
        if (fatMeasuring.length === 0 && weightMeasuring.length === 0) return;
        const timeout = setTimeout(() => {
            const sortedFat = fatMeasuring
                .filter((item) => item.timestamp) // Оставляем только элементы с датой
                .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
            if (sortedFat.length > 0) {
                const latestFat = sortedFat[0]; // Берем самый новый элемент
                if (latestFat.bodyFat !== user.bodyFat) {
                    dispatch(updateUserProfileAsync({ ...user, bodyFat: latestFat.bodyFat }));
                }
            }
            const sortedWeight = weightMeasuring
                .filter((item) => item.timestamp) // Оставляем только элементы с датой
                .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
            if (sortedWeight.length > 0) {
                const latestWeight = sortedWeight[0]; // Берем самый новый элемент
                if (latestWeight.weight !== user.currentWeight) {
                    dispatch(updateUserProfileAsync({ ...user, currentWeight: latestWeight.weight }));
                }
            }
        }, 200); // Ждем 200 мс, чтобы стейт обновился
        return () => clearTimeout(timeout);
    }, [dispatch, fatMeasuring, weightMeasuring, user]);

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
                    <CollapsibleSection title='Измерения % жира в теле'>
                        {fatMeasuring.map((item) => (
                            <div key={item.id}>
                                <FatMeasurement item={item} />
                            </div>
                        ))}
                    </CollapsibleSection>
                )}
                {filter.showWeight && weightMeasuring.length > 0 && (
                    <CollapsibleSection title='Измерения веса'>
                        {weightMeasuring.map((item) => (
                            <div key={item.id}>
                                <WeightMeasurement item={item} />
                            </div>
                        ))}
                    </CollapsibleSection>
                )}
                {filter.showBody && bodyMeasuring.length > 0 && (
                    <CollapsibleSection title='Измерения тела'>
                        {bodyMeasuring.map((item) => (
                            <div key={item.id}>
                                <BodyMeasurement item={item} />
                            </div>
                        ))}
                    </CollapsibleSection>
                )}
            </div>
            <AddMeasurement
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                gender={user.gender}
                birthDate={user.birthDate || ''}
            />
        </div>
    );
}

export default Measurements;

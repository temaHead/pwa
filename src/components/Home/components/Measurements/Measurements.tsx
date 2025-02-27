import style from './Measurements.module.scss';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, LeftOutlined } from '@ant-design/icons';

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
import { theme } from 'antd';

function Measurements() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const bodyMeasuring = useSelector((state: RootState) => state.measurements.bodyMeasuring);
    const filters = useSelector((state: RootState) => state.filter.filters);
    const user = useSelector((state: RootState) => state.user);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;
    const colorIcon = token.colorIcon;
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
                .filter((item) => item.timestamp)
                .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
            if (sortedFat.length > 0) {
                const latestFat = sortedFat[0];
                if (latestFat.bodyFat !== user.bodyFat) {
                    dispatch(updateUserProfileAsync({ ...user, bodyFat: latestFat.bodyFat }));
                }
            }
            const sortedWeight = weightMeasuring
                .filter((item) => item.timestamp)
                .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
            if (sortedWeight.length > 0) {
                const latestWeight = sortedWeight[0];
                if (latestWeight.weight !== user.currentWeight) {
                    dispatch(updateUserProfileAsync({ ...user, currentWeight: latestWeight.weight }));
                }
            }
        }, 200);
        return () => clearTimeout(timeout);
    }, [dispatch, fatMeasuring, weightMeasuring, user]);

    const getComponentById = (id: string) => {
        switch (id) {
            case 'fat':
                return fatMeasuring.length > 0 ? (
                    <CollapsibleSection title='Измерения % жира в теле' defaultExpanded>
                        {fatMeasuring.map((item) => (
                            <div key={item.id}>
                                <FatMeasurement item={item} />
                            </div>
                        ))}
                    </CollapsibleSection>
                ) : null;
            case 'weight':
                return weightMeasuring.length > 0 ? (
                    <CollapsibleSection title='Измерения веса' defaultExpanded>
                        {weightMeasuring.map((item) => (
                            <div key={item.id}>
                                <WeightMeasurement item={item} />
                            </div>
                        ))}
                    </CollapsibleSection>
                ) : null;
            case 'body':
                return bodyMeasuring.length > 0 ? (
                    <CollapsibleSection title='Измерения тела' defaultExpanded>
                        {bodyMeasuring.map((item) => (
                            <div key={item.id}>
                                <BodyMeasurement item={item} />
                            </div>
                        ))}
                    </CollapsibleSection>
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className={style.measurements} style={{ backgroundColor, color: textColor }}>
            <div className={style.header}>
                <div className={style.icon} onClick={handleGoToRoom}>
                    <LeftOutlined style={{ color: colorIcon }} />
                </div>
                <div className={style.title}>Мои замеры</div>
                <div className={style.icon} onClick={handleAddMeasurement}>
                    <PlusOutlined style={{ color: colorIcon }} />
                </div>
            </div>
            <div className={style.filter}>
                <Filter />
            </div>
            <div className={style.measurementsList}>
                {filters
                    .filter(f => f.visible) // Отображаем только включенные фильтры
                    .map(f => (
                        <div key={f.id}>{getComponentById(f.id)}</div>
                    ))}
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

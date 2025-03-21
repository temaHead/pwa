import style from './Measurements.module.scss';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
    getAllBodyMeasuringAsync,
    getAllFatMeasuringAsync,
    getAllWeightMeasuringAsync,
    setBodyMeasurements,
    setFatMeasurements,
    setWeightMeasurements,
} from '../../../../store/slices/measurementSlice';
import AddMeasurement from './components/AddMeasurement/AddMeasurement';
import FatMeasurement from './components/FatMeasurement/FatMeasurement';
import WeightMeasurement from './components/WeightMeasurement/WeightMeasurement';
import BodyMeasurement from './components/BodyMeasurement/BodyMeasurement';
import Filter from './components/Filter/Filter';
import CollapsibleSection from '../../../../shared/components/CollapsibleSection/CollapsibleSection';
import { Spin, theme } from 'antd';
import Header from '../../../../shared/components/Header/Header';
import { getEntityFromIDB, saveEntityToIDB } from '../../../../shared/utils/idb';
import { updateUserProfileAsync } from '../../../../store/slices/userSlice';
import React from 'react';
import _ from 'lodash';

function Measurements() {
    const dispatch = useDispatch<AppDispatch>();

    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const bodyMeasuring = useSelector((state: RootState) => state.measurements.bodyMeasuring);
    const filters = useSelector((state: RootState) => state.filter.filters);
    const user = useSelector((state: RootState) => state.user);
    const { token } = theme.useToken();
    const backgroundColor = token.colorBgLayout;
    const textColor = token.colorTextBase;
    const colorIcon = token.colorIcon;
    const [isModalOpen, setModalOpen] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<'loading' | 'success' | 'idle'>('idle');

    const handleAddMeasurement = useCallback(() => {
        setModalOpen(true);
    }, []);

    useEffect(() => {
        const loadAndSyncData = async () => {
            setLoadingStatus('loading');
            const fatFromIDB = await getEntityFromIDB('fatStore');
            const weightFromIDB = await getEntityFromIDB('weightStore');
            const bodyFromIDB = await getEntityFromIDB('bodyStore');

            if (fatFromIDB) {
                dispatch(setFatMeasurements(fatFromIDB));
            }
            if (weightFromIDB) {
                dispatch(setWeightMeasurements(weightFromIDB));
            }
            if (bodyFromIDB) {
                dispatch(setBodyMeasurements(bodyFromIDB));
            }

            if (user.id) {
                await Promise.all([
                    dispatch(getAllFatMeasuringAsync(user.id)),
                    dispatch(getAllWeightMeasuringAsync(user.id)),
                    dispatch(getAllBodyMeasuringAsync(user.id)),
                ]);
            }

            // Добавляем задержку перед изменением статуса на success
            setTimeout(() => {
                setLoadingStatus('success'); // Данные успешно загружены
            }, 1000);
            setTimeout(() => setLoadingStatus('idle'), 2000);
        };

        loadAndSyncData();
    }, [dispatch, user.id]);

    useEffect(() => {
        const syncData = async () => {
            const fatFromIDB = await getEntityFromIDB('fatStore');
            if (!_.isEqual(fatFromIDB, fatMeasuring)) {
                const latestFat = fatMeasuring[0];
                if (latestFat && latestFat.bodyFat !== user.bodyFat) {
                    dispatch(updateUserProfileAsync({ ...user, bodyFat: latestFat.bodyFat }));
                }
                await saveEntityToIDB('fatStore', fatMeasuring);
            }

            const weightFromIDB = await getEntityFromIDB('weightStore');
            if (!_.isEqual(weightFromIDB, weightMeasuring)) {
                const latestWeight = weightMeasuring[0];
                if (latestWeight && latestWeight.weight !== user.currentWeight) {
                    dispatch(updateUserProfileAsync({ ...user, currentWeight: latestWeight.weight }));
                }
                await saveEntityToIDB('weightStore', weightMeasuring);
            }

            const bodyFromIDB = await getEntityFromIDB('bodyStore');
            if (!_.isEqual(bodyFromIDB, bodyMeasuring)) {
                await saveEntityToIDB('bodyStore', bodyMeasuring);
            }
        };

        syncData();
    }, [fatMeasuring, weightMeasuring, bodyMeasuring, user, dispatch]);

    const getComponentById = useCallback(
        (id: string) => {
            switch (id) {
                case 'showFat':
                    return fatMeasuring.length > 0 ? (
                        <CollapsibleSection
                            title='Измерения % жира в теле'
                            defaultExpanded
                        >
                            {fatMeasuring.map((item) => (
                                <div key={item.id}>
                                    <FatMeasurement item={item} />
                                </div>
                            ))}
                        </CollapsibleSection>
                    ) : null;
                case 'showWeight':
                    return weightMeasuring.length > 0 ? (
                        <CollapsibleSection
                            title='Измерения веса'
                            defaultExpanded
                        >
                            {weightMeasuring.map((item) => (
                                <div key={item.id}>
                                    <WeightMeasurement item={item} />
                                </div>
                            ))}
                        </CollapsibleSection>
                    ) : null;
                case 'showBody':
                    return bodyMeasuring.length > 0 ? (
                        <CollapsibleSection
                            title='Измерения тела'
                            defaultExpanded
                        >
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
        },
        [fatMeasuring, weightMeasuring, bodyMeasuring]
    );

    const headerStyle = useMemo(
        () => ({
            backgroundColor,
            color: textColor,
        }),
        [backgroundColor, textColor]
    );

    const iconStyle = useMemo(
        () => ({
            color: colorIcon,
        }),
        [colorIcon]
    );

    const filteredComponents = useMemo(
        () => filters.filter((f) => f.visible).map((f) => <div key={f.id}>{getComponentById(f.id)}</div>),
        [filters, getComponentById]
    );

    return (
        <div
            className={style.measurements}
            style={headerStyle}
        >
            <Header
                title={'Mои замеры'}
                onRightClick={handleAddMeasurement}
                rightIcon={
                    <>
                        {loadingStatus === 'loading' ? (
                            <Spin size='small' />
                        ) : loadingStatus === 'success' ? (
                            <CheckCircleOutlined style={{ color: 'green', fontSize: 20 }} />
                        ) : (
                            <PlusOutlined style={iconStyle} />
                        )}
                    </>
                }
            />
            <div className={style.filter}>
                <Filter />
            </div>
            <div className={style.measurementsList}>{filteredComponents}</div>
            <AddMeasurement
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                gender={user.gender}
                birthDate={user.birthDate || ''}
            />
        </div>
    );
}

export default React.memo(Measurements);

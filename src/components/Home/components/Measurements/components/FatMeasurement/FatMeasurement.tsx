import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { FatMeasuringData } from '../../../../../../types';
import {
    updateFatMeasuringAsync,
    deleteFatMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import { useSwipeable } from 'react-swipeable';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import style from './FatMeasurement.module.scss';
import Input from '../../../../../../shared/components/Input/Input';
import { format, parseISO } from 'date-fns';

interface FatMeasurementProps {
    item: FatMeasuringData;
}

const FatMeasurement: React.FC<FatMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();
    const gender = useSelector((state: RootState) => state.user.gender);

    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [showDeleteArea, setShowDeleteArea] = useState(false);
    const [editedMeasurements, setEditedMeasurements] = useState(item.measurements);
    const [editedBodyFat, setEditedBodyFat] = useState(item.bodyFat);
    const [editedTimestamp, setEditedTimestamp] = useState(item.timestamp);

    const filteredMeasurements =
        gender === 'male' ? ['chest', 'abdomen', 'thigh'] : ['thigh', 'tricep', 'waist'];

    const measurementLabels = {
        chest: 'Грудь',
        abdomen: 'Живот',
        thigh: 'Бедро',
        tricep: 'Трицепс',
        waist: 'Талия',
    };

    const handleInputChange = (field: keyof FatMeasuringData['measurements'], value: string) => {
        setEditedMeasurements((prev) => ({
            ...prev,
            [field]: value === '' ? null : parseFloat(value),
        }));
    };

    const handleSave = async () => {
        if (!item.id) {
            console.error('ID отсутствует, невозможно сохранить изменения');
            return;
        }

        try {
            await dispatch(
                updateFatMeasuringAsync({
                    id: item.id,
                    measurements: editedMeasurements,
                    bodyFat: editedBodyFat,
                    timestamp: editedTimestamp,
                })
            );
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
        }
    };

    const handleDelete = async () => {
        if (!item.id) {
            console.error('ID отсутствует, невозможно удалить замер');
            return;
        }

        try {
            await dispatch(deleteFatMeasuringAsync(item.id));
        } catch (error) {
            console.error('Ошибка при удалении замера:', error);
        }
    };

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setShowDeleteArea(true),
        onSwipedRight: () => setShowDeleteArea(false),
    });

    return (
        <div className={style.container}>
            <div className={`${style.deleteArea} ${showDeleteArea ? style.visible : ''}`}>
                <DeleteIcon
                    className={style.deleteIcon}
                    onClick={handleDelete}
                />
            </div>
            <div
                className={`${style.fatMeasurement} ${showDeleteArea ? style.swiped : ''}`}
                {...swipeHandlers}
            >
                <div className={style.content}>
                    <div className={style.header}>
                        <div className={style.leftRow}>
                            <div className={style.title}>% жира в теле:</div>
                            <div className={style.value}>
                                {isEditing ? (
                                    <Input
                                        name='bodyFat'
                                        type='number'
                                        value={editedBodyFat ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setEditedBodyFat(value === '' ? null : parseFloat(value));
                                        }}
                                        variant='standard'
                                    />
                                ) : (
                                    <div>{item.bodyFat} %</div>
                                )}
                            </div>
                        </div>

                        <div className={style.rightRow}>
                            <div className={style.date}>
                                {isEditing ? (
                                    <Input
                                        name='timestamp'
                                        type='date'
                                        value={editedTimestamp ?? ''}
                                        onChange={(e) => setEditedTimestamp(e.target.value)}
                                        variant='standard'
                                    />
                                ) : (
                                    <div>{format(parseISO(item.timestamp || ''), 'dd.MM.yyyy')}</div>
                                )}
                            </div>
                            <div className={style.icon}>
                                {!isEditing && (
                                    <div onClick={() => setIsEditing(true)}>
                                        <EditRoundedIcon />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className={style.toggleCollapse}
                        onClick={toggleCollapse}
                    >
                        <div className={style.title}>Замеры калипером: </div>
                        <div className={style.icon}>
                            {isCollapsed ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                        </div>
                    </div>

                    {/* Убрали условный рендеринг и добавили класс для анимации */}
                    <div className={`${style.measurements} ${!isCollapsed ? style.open : ''}`}>
                        {filteredMeasurements.map((key) => (
                            <div
                                key={key}
                                className={style.measurement}
                            >
                                <div className={style.title}>{measurementLabels[key as keyof typeof measurementLabels]}: </div>
                                {isEditing ? (
                                    <Input
                                        name={key}
                                        type='number'
                                        value={
                                            editedMeasurements[
                                                key as keyof FatMeasuringData['measurements']
                                            ] ?? ''
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                key as keyof FatMeasuringData['measurements'],
                                                e.target.value
                                            )
                                        }
                                        variant='standard'
                                    />
                                ) : (
                                    <div className={style.value}>
                                        {item.measurements[key as keyof FatMeasuringData['measurements']] ??
                                            'Не указано'}{' '}
                                        см
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <div className={style.actions}>
                            <Button
                                variant='contained'
                                color='error'
                                startIcon={<Close />}
                                onClick={() => setIsEditing(false)}
                            >
                                Отменить
                            </Button>
                            <Button
                                variant='contained'
                                color='success'
                                startIcon={<Check />}
                                onClick={handleSave}
                            >
                                Сохранить
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FatMeasurement;

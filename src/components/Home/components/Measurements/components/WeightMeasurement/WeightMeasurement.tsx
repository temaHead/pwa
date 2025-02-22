import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { WeightMeasuringData } from '../../../../../../types';
import {
    updateWeightMeasuringAsync,
    deleteWeightMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import style from './WeightMeasurement.module.scss';
import Input from '../../../../../../shared/components/Input/Input';
import { format, parseISO } from 'date-fns';

interface WeightMeasurementProps {
    item: WeightMeasuringData;
}

const WeightMeasurement: React.FC<WeightMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [isEditing, setIsEditing] = useState(false);
    const [editedWeight, setEditedWeight] = useState(item.weight);
    const [editedTimestamp, setEditedTimestamp] = useState(item.timestamp);

    const [translateX, setTranslateX] = useState(0);
    const startX = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const deltaX = e.touches[0].clientX - startX.current;
        const newTranslateX = Math.min(0, Math.max(-75, deltaX));
        setTranslateX(newTranslateX);
    };

    const handleTouchEnd = () => {
        if (translateX < -40) {
            setTranslateX(-75); // Закрываем
        } else {
            setTranslateX(0); // Возвращаем назад
        }
    };

    const handleSave = async () => {
        if (!item.id) {
            console.error('ID отсутствует, невозможно сохранить изменения');
            return;
        }

        try {
            await dispatch(
                updateWeightMeasuringAsync({
                    id: item.id,
                    weight: editedWeight,
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
            await dispatch(deleteWeightMeasuringAsync(item.id));
        } catch (error) {
            console.error('Ошибка при удалении замера:', error);
        }
    };

    const handleCancel = () => {
        setEditedWeight(item.weight);
        setEditedTimestamp(item.timestamp);
        setIsEditing(false);
    };

    return (
        <div className={style.container}>
            <div className={style.deleteArea}>
                <DeleteIcon
                    className={style.deleteIcon}
                    onClick={handleDelete}
                />
            </div>

            <div
                className={style.measurement}
                style={{ transform: `translateX(${translateX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className={style.content}>
                    <div className={style.header}>
                        <div className={style.leftRow}>
                            <div className={style.title}>Вес:</div>
                            <div className={style.value}>
                                {isEditing ? (
                                    <Input
                                        name='weight'
                                        type='number'
                                        value={editedWeight ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setEditedWeight(value === '' ? null : parseFloat(value));
                                        }}
                                        variant='standard'
                                    />
                                ) : (
                                    <div>{item.weight} кг</div>
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

                    {isEditing && (
                        <div className={style.actions}>
                            <Button
                                variant='contained'
                                color='error'
                                startIcon={<Close />}
                                onClick={handleCancel}
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

export default WeightMeasurement;

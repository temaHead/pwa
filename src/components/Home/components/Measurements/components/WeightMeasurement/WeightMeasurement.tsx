import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { WeightMeasuringData } from '../../../../../../types';
import { updateWeightMeasuringAsync, deleteWeightMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import { useSwipeable } from 'react-swipeable';
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
    const [showDeleteArea, setShowDeleteArea] = useState(false);
    const [editedWeight, setEditedWeight] = useState(item.weight);
    const [editedTimestamp, setEditedTimestamp] = useState(item.timestamp);

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
        setEditedWeight(item.weight); // Сброс к исходному значению
        setEditedTimestamp(item.timestamp); // Сброс даты
        setIsEditing(false); // Выход из режима редактирования
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setShowDeleteArea(true),
        onSwipedRight: () => setShowDeleteArea(false),
    });

    return (
        <div className={style.container}>
            {/* Красная область с кнопкой удаления */}
            <div className={`${style.deleteArea} ${showDeleteArea ? style.visible : ''}`}>
                <DeleteIcon
                    className={style.deleteIcon}
                    onClick={handleDelete}
                />
            </div>

            {/* Основной блок */}
            <div
                className={`${style.measurement} ${showDeleteArea ? style.swiped : ''}`}
                {...swipeHandlers}
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
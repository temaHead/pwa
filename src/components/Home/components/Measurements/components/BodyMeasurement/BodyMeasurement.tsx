import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { BodyMeasuringData } from '../../../../../../types';
import { updateBodyMeasuringAsync, deleteBodyMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import { useSwipeable } from 'react-swipeable';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import style from './BodyMeasurement.module.scss';
import Input from '../../../../../../shared/components/Input/Input';
import { format, parseISO } from 'date-fns';

interface BodyMeasurementProps {
    item: BodyMeasuringData;
}

const BodyMeasurement: React.FC<BodyMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [showDeleteArea, setShowDeleteArea] = useState(false);
    const [editedBody, setEditedBody] = useState({
        chest: item.bodyMeasuring?.chest || null,
        hips: item.bodyMeasuring?.hips || null,
        thigh: item.bodyMeasuring?.thigh || null,
        arms: item.bodyMeasuring?.arms || null,
        waist: item.bodyMeasuring?.waist || null,
    });
    const [editedTimestamp, setEditedTimestamp] = useState(item.timestamp);

    const handleInputChange = (field: keyof BodyMeasuringData['bodyMeasuring'], value: string) => {
        setEditedBody((prev) => ({
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
                updateBodyMeasuringAsync({
                    id: item.id,
                    bodyMeasuring: editedBody,
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
            await dispatch(deleteBodyMeasuringAsync(item.id));
        } catch (error) {
            console.error('Ошибка при удалении замера:', error);
        }
    };

    const handleCancel = () => {
        setEditedBody({
            chest: item.bodyMeasuring?.chest || null,
            hips: item.bodyMeasuring?.hips || null,
            thigh: item.bodyMeasuring?.thigh || null,
            arms: item.bodyMeasuring?.arms || null,
            waist: item.bodyMeasuring?.waist || null,
        });
        setEditedTimestamp(item.timestamp);
        setIsEditing(false);
    };

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => setShowDeleteArea(true),
        onSwipedRight: () => setShowDeleteArea(false),
    });

    const measurementLabels = {
        chest: 'Грудь',
        hips: 'Ягодицы',
        thigh: 'Бедро',
        arms: 'Руки',
        waist: 'Талия',
    };

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
                className={`${style.bodyMeasurement} ${showDeleteArea ? style.swiped : ''}`}
                {...swipeHandlers}
            >
                <div className={style.content}>
                    <div className={style.header}>
                        <div className={style.leftRow}>
                            <div className={style.title}>Замеры тела:</div>
                            
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
                        <div className={style.title}>Показать замеры</div>
                        <div className={style.icon}>
                            {isCollapsed ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                        </div>
                    </div>

                    {/* Убрали условный рендеринг и добавили класс для анимации */}
                    <div className={`${style.measurements} ${!isCollapsed ? style.open : ''}`}>
                        {Object.entries(measurementLabels).map(([key, label]) => (
                            <div
                                key={key}
                                className={style.measurement}
                            >
                                <div className={style.title}>{label}: </div>
                                {isEditing ? (
                                    <Input
                                        name={key}
                                        type='number'
                                        value={
                                            editedBody[key as keyof BodyMeasuringData['bodyMeasuring']] ?? ''
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                key as keyof BodyMeasuringData['bodyMeasuring'],
                                                e.target.value
                                            )
                                        }
                                        variant='standard'
                                    />
                                ) : (
                                    <div className={style.value}>
                                        {item.bodyMeasuring?.[key as keyof BodyMeasuringData['bodyMeasuring']] ?? 'Не указано'}{' '}
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

export default BodyMeasurement;
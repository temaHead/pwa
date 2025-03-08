import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { WeightMeasuringData } from '../../../../../../types';
import {
    updateWeightMeasuringAsync,
    deleteWeightMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import { Button, Input, Popconfirm, theme } from 'antd';
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { format, parseISO } from 'date-fns';
import style from './WeightMeasurement.module.scss';

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

    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;
    const colorBgContainer = token.colorBgContainer;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const deltaX = e.touches[0].clientX - startX.current;
        requestAnimationFrame(() => {
            setTranslateX(Math.min(0, Math.max(-75, deltaX)));
        });
    }, []);

    const handleTouchEnd = useCallback(() => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                setTranslateX(translateX < -40 ? -75 : 0);
            }, 10);
        });
    }, [translateX]);

    const handleSave = useCallback(async () => {
        if (!item.id) {
            console.error('ID отсутствует, невозможно сохранить изменения');
            return;
        }
        try {
            await dispatch(updateWeightMeasuringAsync({
                id: item.id,
                weight: editedWeight,
                timestamp: editedTimestamp,
            }));
            setIsEditing(false);
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
        }
    }, [dispatch, item.id, editedWeight, editedTimestamp]);

    const handleDelete = useCallback(async () => {
        if (!item.id) {
            console.error('ID отсутствует, невозможно удалить замер');
            return;
        }
        try {
            await dispatch(deleteWeightMeasuringAsync(item.id));
        } catch (error) {
            console.error('Ошибка при удалении замера:', error);
        }
    }, [dispatch, item.id]);

    const toggleEdit = useCallback(() => setIsEditing((prev) => !prev), []);

    const containerStyle = useMemo(
        () => ({ backgroundColor: colorBgContainer, color: textColor }),
        [colorBgContainer, textColor]
    );

    const measurementStyle = useMemo(
        () => ({ transform: `translateX(${translateX}px)`, backgroundColor }),
        [translateX, backgroundColor]
    );

    return (
        <div className={style.container} style={containerStyle}>
            <div className={style.deleteArea}>
                <Popconfirm
                    title="Удалить замер?"
                    onConfirm={handleDelete}
                    okText="Да"
                    cancelText="Нет"
                >
                    <DeleteOutlined className={style.deleteIcon} />
                </Popconfirm>
            </div>

            <div
                className={style.measurement}
                style={measurementStyle}
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
                                        type='number'
                                        value={editedWeight ?? ''}
                                        onChange={(e) => setEditedWeight(e.target.value ? parseFloat(e.target.value) : null)}
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
                                        type='date'
                                        value={editedTimestamp ?? ''}
                                        onChange={(e) => setEditedTimestamp(e.target.value)}
                                    />
                                ) : (
                                    <div>{format(parseISO(item.timestamp || ''), 'dd.MM.yyyy')}</div>
                                )}
                            </div>
                            <div className={style.icon}>
                                {!isEditing && (
                                    <EditOutlined onClick={toggleEdit} />
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className={style.actions}>
                            <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
                                Отменить
                            </Button>
                            <Button type='primary' icon={<CheckOutlined />} onClick={handleSave}>
                                Сохранить
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(WeightMeasurement);
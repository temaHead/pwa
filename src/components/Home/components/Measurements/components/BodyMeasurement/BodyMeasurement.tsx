import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { BodyMeasuringData } from '../../../../../../types';
import {
    updateBodyMeasuringAsync,
    deleteBodyMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import {
    DeleteOutlined,
    EditOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { Button, Input, theme } from 'antd';
import style from './BodyMeasurement.module.scss';
import { format, parseISO } from 'date-fns';

interface BodyMeasurementProps {
    item: BodyMeasuringData;
}

const BodyMeasurement: React.FC<BodyMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [editedBody, setEditedBody] = useState({
        chest: item.bodyMeasuring?.chest || null,
        hips: item.bodyMeasuring?.hips || null,
        thigh: item.bodyMeasuring?.thigh || null,
        arms: item.bodyMeasuring?.arms || null,
        waist: item.bodyMeasuring?.waist || null,
    });
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

    const handleInputChange = useCallback(
        (field: keyof BodyMeasuringData['bodyMeasuring'], value: string) => {
            setEditedBody((prev) => ({
                ...prev,
                [field]: value === '' ? null : parseFloat(value),
            }));
        },
        []
    );

    const handleSave = useCallback(async () => {
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
    }, [dispatch, item.id, editedBody, editedTimestamp]);

    const handleDelete = useCallback(async () => {
        if (!item.id) {
            console.error('ID отсутствует, невозможно удалить замер');
            return;
        }

        try {
            await dispatch(deleteBodyMeasuringAsync(item.id));
        } catch (error) {
            console.error('Ошибка при удалении замера:', error);
        }
    }, [dispatch, item.id]);

    const handleCancel = useCallback(() => {
        setEditedBody({
            chest: item.bodyMeasuring?.chest || null,
            hips: item.bodyMeasuring?.hips || null,
            thigh: item.bodyMeasuring?.thigh || null,
            arms: item.bodyMeasuring?.arms || null,
            waist: item.bodyMeasuring?.waist || null,
        });
        setEditedTimestamp(item.timestamp);
        setIsEditing(false);
    }, [item.bodyMeasuring, item.timestamp]);

    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    const measurementLabels = useMemo(
        () => ({
            chest: 'Грудь',
            hips: 'Ягодицы',
            thigh: 'Бедро',
            arms: 'Руки',
            waist: 'Талия',
        }),
        []
    );

    const containerStyle = useMemo(
        () => ({ backgroundColor: colorBgContainer, color: textColor }),
        [colorBgContainer, textColor]
    );

    const bodyMeasurementStyle = useMemo(
        () => ({ transform: `translateX(${translateX}px)`, backgroundColor }),
        [translateX, backgroundColor]
    );

    return (
        <div
            className={style.container}
            style={containerStyle}
        >
            <div className={style.deleteArea}>
                <DeleteOutlined
                    className={style.deleteIcon}
                    onClick={handleDelete}
                />
            </div>

            <div
                className={style.bodyMeasurement}
                style={bodyMeasurementStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className={style.content}>
                    <div className={style.header}>
                        <div className={style.leftRow}>
                            <div className={style.title}>Замеры тела</div>
                        </div>
                        <div className={style.rightRow}>
                            {isEditing ? (
                                <Input
                                    name='timestamp'
                                    type='date'
                                    value={editedTimestamp}
                                    onChange={(e) => setEditedTimestamp(e.target.value)}
                                />
                            ) : (
                                <span>{format(parseISO(item.timestamp || ''), 'dd.MM.yyyy')}</span>
                            )}
                            {!isEditing && (
                                <div onClick={() => setIsEditing(true)}>
                                    <EditOutlined />
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className={style.toggleCollapse}
                        onClick={toggleCollapse}
                    >
                        <div className={style.title}>{isCollapsed ? 'Показать' : 'Скрыть'}</div>
                        <div className={style.icon}>
                            {isCollapsed ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                        </div>
                    </div>

                    <div className={`${style.measurements} ${!isCollapsed ? style.open : ''}`}>
                        {Object.entries(measurementLabels).map(([key, label]) => (
                            <div
                                key={key}
                                className={style.measurement}
                            >
                                <div className={style.title}>{label}: </div>
                                {isEditing ? (
                                    <Input
                                        suffix='см'
                                        style={{ maxWidth: '80px' }}
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
                                    />
                                ) : (
                                    <div className={style.value}>
                                        {item.bodyMeasuring?.[
                                            key as keyof BodyMeasuringData['bodyMeasuring']
                                        ] ?? '-'}{' '}
                                        см
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <div className={style.actions}>
                            <Button
                                danger
                                icon={<CloseOutlined />}
                                onClick={handleCancel}
                            >
                                Отменить
                            </Button>
                            <Button
                                type='primary'
                                icon={<CheckOutlined />}
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

export default React.memo(BodyMeasurement);

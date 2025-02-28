import React, { useRef, useState } from 'react';
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
    CloseOutlined
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
    const [editedTimestamp, setEditedTimestamp] = useState(item.timestamp || '');
    const [translateX, setTranslateX] = useState(0);
    const startX = useRef(0);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;
    const colorBgContainer = token.colorBgContainer;
    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
         const deltaX = e.touches[0].clientX - startX.current;
         requestAnimationFrame(() => {
             setTranslateX(Math.min(0, Math.max(-75, deltaX)));
         });
     };
     
 
 const handleTouchEnd = () => {
     requestAnimationFrame(() => {
         setTimeout(() => {
             setTranslateX(translateX < -40 ? -75 : 0);
         }, 10);
     });
 };

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
        setEditedTimestamp(item.timestamp || '');
        setIsEditing(false);
    };

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    const measurementLabels: Record<string, string> = {
        chest: 'Грудь',
        hips: 'Ягодицы',
        thigh: 'Бедро',
        arms: 'Руки',
        waist: 'Талия',
    };

    return (
        <div className={style.container} style={{ backgroundColor: colorBgContainer, color: textColor }}>
            <div className={style.deleteArea}>
                <DeleteOutlined className={style.deleteIcon} onClick={handleDelete} />
            </div>

            <div
                className={style.bodyMeasurement}
                style={{ transform: `translateX(${translateX}px)`, backgroundColor }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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
                                        name="timestamp"
                                        type="date"
                                        value={editedTimestamp}
                                        onChange={(e) => setEditedTimestamp(e.target.value)}
                                    />
                                ) : (
                                    <div>{item.timestamp ? format(parseISO(item.timestamp), 'dd.MM.yyyy') : '-'}</div>
                                )}
                            </div>
                            <div className={style.icon}>
                                {!isEditing && (
                                    <div onClick={() => setIsEditing(true)}>
                                        <EditOutlined />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={style.toggleCollapse} onClick={toggleCollapse}>
                        <div className={style.title}>Показать замеры</div>
                        <div className={style.icon}>
                            {isCollapsed ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                        </div>
                    </div>

                    <div className={`${style.measurements} ${!isCollapsed ? style.open : ''}`}>
                        {Object.entries(measurementLabels).map(([key, label]) => (
                            <div key={key} className={style.measurement}>
                                <div className={style.title}>{label}: </div>
                                {isEditing ? (
                                    <Input
                                        name={key}
                                        type="number"
                                        value={editedBody[key as keyof BodyMeasuringData['bodyMeasuring']] ?? ''}
                                        onChange={(e) =>
                                            handleInputChange(key as keyof BodyMeasuringData['bodyMeasuring'], e.target.value)
                                        }
                                    />
                                ) : (
                                    <div className={style.value}>
                                        {item.bodyMeasuring?.[key as keyof BodyMeasuringData['bodyMeasuring']] ?? '-'} см
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <div className={style.actions}>
                            <Button danger icon={<CloseOutlined />} onClick={handleCancel}>
                                Отменить
                            </Button>
                            <Button type="primary" icon={<CheckOutlined />} onClick={handleSave}>
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

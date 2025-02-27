import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { FatMeasuringData } from '../../../../../../types';
import {
    updateFatMeasuringAsync,
    deleteFatMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import {
    DeleteOutlined,
    EditOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { Button, Input, Popconfirm, theme } from 'antd';
import style from './FatMeasurement.module.scss';
import { format, parseISO } from 'date-fns';

interface FatMeasurementProps {
    item: FatMeasuringData;
}

const FatMeasurement: React.FC<FatMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();
    const gender = useSelector((state: RootState) => state.user.gender);

    const [isEditing, setIsEditing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [editedMeasurements, setEditedMeasurements] = useState(item.measurements);
    const [editedBodyFat, setEditedBodyFat] = useState(item.bodyFat);
    const [editedTimestamp, setEditedTimestamp] = useState(item.timestamp);
    const [translateX, setTranslateX] = useState(0);
    const startX = useRef(0);
    const filteredMeasurements =
        gender === 'male' ? ['chest', 'abdomen', 'thigh'] : ['thigh', 'tricep', 'waist'];
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;
    const colorBgContainer = token.colorBgContainer;
    const measurementLabels = {
        chest: 'Грудь',
        abdomen: 'Живот',
        thigh: 'Бедро',
        tricep: 'Трицепс',
        waist: 'Талия',
    };

        const handleTouchStart = (e: React.TouchEvent) => {
            startX.current = e.touches[0].clientX;
        };
    
        const handleTouchMove = (e: React.TouchEvent) => {
            const deltaX = e.touches[0].clientX - startX.current;
            setTranslateX(Math.min(0, Math.max(-75, deltaX)));
        };
    
        const handleTouchEnd = () => {
            setTranslateX(translateX < -40 ? -75 : 0);
        };

    const handleInputChange = (field: keyof FatMeasuringData['measurements'], value: string) => {
        setEditedMeasurements((prev) => ({
            ...prev,
            [field]: value === '' ? null : parseFloat(value),
        }));
    };

    const handleSave = async () => {
        if (!item.id) return;
        await dispatch(
            updateFatMeasuringAsync({
                id: item.id,
                measurements: editedMeasurements,
                bodyFat: editedBodyFat,
                timestamp: editedTimestamp,
            })
        );
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!item.id) return;
        await dispatch(deleteFatMeasuringAsync(item.id));
    };

    const toggleCollapse = () => setIsCollapsed((prev) => !prev);

    return (
        <div
            className={style.container}
            style={{ backgroundColor: colorBgContainer, color: textColor }}
        >
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
            <div className={style.fatMeasurement}
             style={{ transform: `translateX(${translateX}px)`, backgroundColor}}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}
             >
                <div className={style.content}>
                    <div className={style.header}>
                        <div className={style.leftRow}>
                            <span className={style.title}>% жира в теле:</span>
                            {isEditing ? (
                                <Input
                                    type='number'
                                    value={editedBodyFat ?? ''}
                                    onChange={(e) =>
                                        setEditedBodyFat(
                                            e.target.value === '' ? null : parseFloat(e.target.value)
                                        )
                                    }
                                />
                            ) : (
                                <span>{item.bodyFat} %</span>
                            )}
                        </div>
                        <div className={style.rightRow}>
                            {isEditing ? (
                                <Input
                                    type='date'
                                    value={editedTimestamp ?? ''}
                                    onChange={(e) => setEditedTimestamp(e.target.value)}
                                />
                            ) : (
                                <span>{format(parseISO(item.timestamp || ''), 'dd.MM.yyyy')}</span>
                            )}
                            {!isEditing && <EditOutlined onClick={() => setIsEditing(true)} />}
                        </div>
                    </div>
                    <div
                        className={style.toggleCollapse}
                        onClick={toggleCollapse}
                    >
                        <span className={style.title}>Замеры калипером: </span>
                        {isCollapsed ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                    </div>
                    <div className={`${style.measurements} ${!isCollapsed ? style.open : ''}`}>
                        {filteredMeasurements.map((key) => (
                            <div
                                key={key}
                                className={style.measurement}
                            >
                                <span className={style.title}>
                                    {measurementLabels[key as keyof typeof measurementLabels]}:
                                </span>
                                {isEditing ? (
                                    <Input
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
                                    />
                                ) : (
                                    <span className={style.value}>
                                        {item.measurements[key as keyof FatMeasuringData['measurements']] ??
                                            'Не указано'}{' '}
                                        см
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    {isEditing && (
                        <div className={style.actions}>
                            <Button
                                icon={<CloseOutlined />}
                                onClick={() => setIsEditing(false)}
                                danger
                            >
                                Отменить
                            </Button>
                            <Button
                                icon={<CheckOutlined />}
                                onClick={handleSave}
                                type='primary'
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

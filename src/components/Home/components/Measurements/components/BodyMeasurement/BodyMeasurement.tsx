import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { BodyMeasuringData } from '../../../../../../types';
import style from './BodyMeasurement.module.scss';
import { updateBodyMeasuringAsync } from '../../../../../../store/slices/measurementSlice';

interface BodyMeasurementProps {
    item: BodyMeasuringData;
}

const BodyMeasurement: React.FC<BodyMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [isEditing, setIsEditing] = useState(false);
    const [editedBody, setEditedBody] = useState(item.measurements);

    const handleInputChange = (field: keyof BodyMeasuringData['measurements'], value: string) => {
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
                    measurements: editedBody,
                })
            );
            setIsEditing(false); // Выход из режима редактирования
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
        }
    };

    // Функция для отмены изменений
    const handleCancel = () => {
        setEditedBody(item.measurements); // Сброс к исходным значениям
        setIsEditing(false); // Выход из режима редактирования
    };

    const measurementLabels = {
        chest: 'Грудь',
        hips: 'Ягодицы',
        thigh: 'Бедро',
        abdomen: 'Живот',
        arms: 'Руки',
        waist: 'Талия',
    };

    return (
        <div className={style.fatMeasurement}>
            <div>Замеры :</div>

            {Object.entries(measurementLabels).map(([key, label]) => (
                <div key={key}>
                    <span>{label}: </span>
                    {isEditing ? (
                        <input
                            type="number"
                            value={editedBody[key as keyof BodyMeasuringData['measurements']] ?? ''}
                            onChange={(e) =>
                                handleInputChange(key as keyof BodyMeasuringData['measurements'], e.target.value)
                            }
                        />
                    ) : (
                        <span>
                            {item.measurements[key as keyof BodyMeasuringData['measurements']] ?? 'Не указано'} см
                        </span>
                    )}
                </div>
            ))}

            <div>{item.timestamp}</div>

            {isEditing ? (
                <div>
                    <button onClick={handleSave}>Сохранить</button>
                    <button onClick={handleCancel}>Отменить</button> {/* Кнопка "Отменить" */}
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)}>Редактировать</button>
            )}
        </div>
    );
};

export default BodyMeasurement;
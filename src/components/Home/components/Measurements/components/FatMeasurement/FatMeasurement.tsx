import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { FatMeasuringData } from '../../../../../../types';
import { updateFatMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import style from './FatMeasurement.module.scss';

interface FatMeasurementProps {
    item: FatMeasuringData;
}

const FatMeasurement: React.FC<FatMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [isEditing, setIsEditing] = useState(false);
    const [editedMeasurements, setEditedMeasurements] = useState(item.measurements);
    const [editedBodyFat, setEditedBodyFat] = useState(item.bodyFat);

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
                })
            );
            setIsEditing(false); // Выход из режима редактирования
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
        }
    };

    // Функция для отмены изменений
    const handleCancel = () => {
        setEditedMeasurements(item.measurements); // Сброс к исходным значениям
        setEditedBodyFat(item.bodyFat); // Сброс к исходному значению
        setIsEditing(false); // Выход из режима редактирования
    };

    const measurementLabels = {
        abdomen: 'Живот',
        chest: 'Грудь',
        thigh: 'Бедро',
        tricep: 'Трицепс',
        waist: 'Талия',
    };

    return (
        <div className={style.fatMeasurement}>
            <div>
                <span>Общий замер жира:</span>
                {isEditing ? (
                    <input
                        type="number"
                        value={editedBodyFat ?? ''} // Преобразуем null в пустую строку
                        onChange={(e) => {
                            const value = e.target.value;
                            setEditedBodyFat(value === '' ? null : parseFloat(value)); // Обратно преобразуем пустую строку в null
                        }}
                    />
                ) : (
                    <span>{item.bodyFat} %</span>
                )}
            </div>

            <div>Замеры калипером:</div>

            {Object.entries(measurementLabels).map(([key, label]) => (
                <div key={key}>
                    <span>{label}: </span>
                    {isEditing ? (
                        <input
                            type="number"
                            value={editedMeasurements[key as keyof FatMeasuringData['measurements']] ?? ''}
                            onChange={(e) =>
                                handleInputChange(key as keyof FatMeasuringData['measurements'], e.target.value)
                            }
                        />
                    ) : (
                        <span>
                            {item.measurements[key as keyof FatMeasuringData['measurements']] ?? 'Не указано'} см
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

export default FatMeasurement;
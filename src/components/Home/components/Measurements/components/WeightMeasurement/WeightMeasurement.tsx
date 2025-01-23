import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { WeightMeasuringData } from '../../../../../../types';
import { updateWeightMeasuringAsync } from '../../../../../../store/slices/measurementSlice'; // Предположим, что у вас есть такой action
import style from './WeightMeasurement.module.scss';

interface WeightMeasurementProps {
    item: WeightMeasuringData;
}

const WeightMeasurement: React.FC<WeightMeasurementProps> = ({ item }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [isEditing, setIsEditing] = useState(false);
    const [editedWeight, setEditedWeight] = useState(item.weight);

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
                })
            );
            setIsEditing(false); // Выход из режима редактирования
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
        }
    };

    // Функция для отмены изменений
    const handleCancel = () => {
        setEditedWeight(item.weight); // Сброс к исходному значению
        setIsEditing(false); // Выход из режима редактирования
    };

    return (
        <div className={style.measurement}>
            <div>
                <div>
                    Вес:{' '}
                    {isEditing ? (
                        <input
                            type="number"
                            value={editedWeight ?? ''} // Преобразуем null в пустую строку
                            onChange={(e) => {
                                const value = e.target.value;
                                setEditedWeight(value === '' ? null : parseFloat(value)); // Обратно преобразуем пустую строку в null
                            }}
                        />
                    ) : (
                        <span>{item.weight} кг</span>
                    )}
                </div>
                <div>{item.timestamp}</div>
            </div>

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

export default WeightMeasurement;
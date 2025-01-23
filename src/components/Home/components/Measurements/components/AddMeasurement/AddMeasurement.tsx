import React, { useCallback, useEffect, useState } from 'react';
import style from './AddMeasurement.module.scss';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Button } from '@mui/material';
import Input from '../../../../../../shared/components/Input/Input';
import dayjs from 'dayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import {
    addBodyMeasuringAsync,
    addFatMeasuringAsync,
    addWeightMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import { calculateBodyFat } from '../../../../../Auth/SignUp/components/AddUser/utils';

interface AddMeasurementProps {
    isOpen: boolean;
    onClose: () => void;
    gender: string | null; // Пол пользователя
    birthDate: string;
}
interface FormData {
    date: string;
    weight: number | null;
    chest: number | null;
    hips: number | null;
    thigh: number | null;
    waist: number | null;
    arms: number | null;
    bodyFat: number | null;
    chestCaliper: number | null;
    bellyCaliper: number | null;
    thighCaliper: number | null;
    tricepsCaliper: number | null;
    waistCaliper: number | null;
}



const AddMeasurement: React.FC<AddMeasurementProps> = ({ isOpen, onClose, gender, birthDate }) => {
    const dispatch = useDispatch<AppDispatch>();

    const [{ y }, api] = useSpring(() => ({ y: 100 }));

    const [formData, setFormData] = useState<FormData>({
        date: dayjs().format('YYYY.MM.DD HH:mm'),
        weight: null,
        chest: null,
        hips: null,
        thigh: null,
        waist: null,
        arms: null,
        bodyFat: null,
        chestCaliper: null,
        bellyCaliper: null,
        thighCaliper: null,
        tricepsCaliper: null,
        waistCaliper: null,
    });

    const measurementLabels = {
        chest: 'Грудь',
        hips: 'Ягодицы',
        thigh: 'Бедро',
        waist: 'Талия',
        arms: 'Руки',
        chestCaliper: 'Грудь',
        bellyCaliper: 'Живот',
        thighCaliper: 'Бедро',
        tricepsCaliper: 'Трицепс',
        waistCaliper: 'Талия',
    };

    // Обработчик изменения инпутов
    const handleSubFormInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const clearFormData = useCallback(() => {
        setFormData({
            date: dayjs().format('YYYY.MM.DD HH:mm'),
            weight: null,
            chest: null,
            hips: null,
            thigh: null,
            waist: null,
            arms: null,
            bodyFat: null,
            chestCaliper: null,
            bellyCaliper: null,
            thighCaliper: null,
            tricepsCaliper: null,
            waistCaliper: null,
        });
    }, []);

    // Функция проверки и расчета процента жира
    const handleCaliperInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const updatedFormData = {
            ...formData,
            [name]: value ? Number(value) : null,
        };
        setFormData(updatedFormData);

        // Проверка заполненности всех необходимых полей
        const requiredFields =
            gender === 'male'
                ? ['chestCaliper', 'bellyCaliper', 'thighCaliper']
                : ['thighCaliper', 'tricepsCaliper', 'waistCaliper'];

        const areAllFieldsFilled = requiredFields.every(
            (field) => updatedFormData[field as keyof typeof formData] !== null
        );

        if (areAllFieldsFilled && gender && birthDate) {
            const measurements =
                gender === 'male'
                    ? {
                          chest: updatedFormData.chestCaliper,
                          abdomen: updatedFormData.bellyCaliper,
                          thigh: updatedFormData.thighCaliper,
                      }
                    : {
                          tricep: updatedFormData.tricepsCaliper,
                          thigh: updatedFormData.thighCaliper,
                          waist: updatedFormData.waistCaliper,
                      };

            try {
                const bodyFat = calculateBodyFat(gender, measurements, birthDate);
                setFormData((prevState) => ({
                    ...prevState,
                    bodyFat: bodyFat,
                }));
            } catch (error) {
                console.error('Ошибка при расчете жира:', error);
            }
        }
    };

    const handleAddMeasurement = () => {
        if (formData.weight) {
            dispatch(
                addWeightMeasuringAsync({
                    weight: formData.weight,
                    timestamp: formData.date,
                })
            );
        }
        if (formData.bodyFat !== null ||
            formData.chestCaliper !== null ||
            formData.bellyCaliper !== null ||
            formData.thighCaliper !== null ||
            formData.tricepsCaliper !== null ||
            formData.waistCaliper !== null
        ) {
            dispatch(
                addFatMeasuringAsync({
                    bodyFat: Number(formData.bodyFat),
                    measurements: {
                        chest: Number(formData.chestCaliper),
                        abdomen: Number(formData.bellyCaliper),
                        thigh: Number(formData.thighCaliper),
                        tricep: Number(formData.tricepsCaliper),
                        waist: Number(formData.waistCaliper),
                    },
                    timestamp: formData.date,
                })
            );
        }
        if (
            formData.chest !== null ||
            formData.hips !== null ||
            formData.thigh !== null ||
            formData.arms !== null ||
            formData.waist !== null
        ) {
            dispatch(
                addBodyMeasuringAsync({
                    measurements: {
                        chest: Number(formData.chest),
                        hips: Number(formData.hips),
                        thigh: Number(formData.thigh),
                        arms: Number(formData.arms),
                        waist: Number(formData.waist),
                    },
                    timestamp: formData.date,
                })
            );
        }
        close();
        clearFormData();
    };

    const close = () => {
        api.start({ y: 100, onRest: onClose });
    };

    const open = useCallback(() => {
        api.start({ y: 0 });
    }, [api]);

    useEffect(() => {
        if (isOpen) open();
    }, [isOpen, open]);

    const bind = useDrag(
        ({ last, movement: [, my], cancel }) => {
            if (my > 200) cancel?.();
            api.start({ y: last ? (my > 50 ? 100 : 0) : my });
            if (last && my > 50) onClose();
        },
        { from: () => [0, y.get()] }
    );

    return (
        <>
            <div
                className={`${style.backdrop} ${isOpen ? style.visible : ''}`}
                onClick={close}
            ></div>
            <animated.div
                className={style.modal}
                style={{
                    transform: y.to((v) => `translateY(${v}%)`),
                    touchAction: 'none',
                }}
                {...bind()}
            >
                <div className={style.header}>
                    <h2>Добавить замер</h2>
                    <Button
                        onClick={close}
                        variant='contained'
                        color='secondary'
                    >
                        Закрыть
                    </Button>
                </div>
                <div className={style.content}>
                    <form>
                        <div className={style.fieldGroup}>
                            <div>Дата замера</div>
                            <MobileDateTimePicker
                                value={dayjs(formData.date)} // Преобразование строки в объект Day.js
                                onChange={(newValue) => {
                                    setFormData((prevState) => ({
                                        ...prevState,
                                        date: newValue ? newValue.format('DD.MM.YYYY HH:mm') : '', // Сохранение в ISO-формате
                                    }));
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                    
                                }}
                                openTo='day'
                                format='DD.MM.YYYY HH:mm' // Формат отображения
                            />
                        </div>
                        <div className={style.fieldGroup}>
                            <div>Замер веса</div>
                            <Input
                                name='weight'
                                value={formData.weight}
                                onChange={handleSubFormInputChange}
                                type='number'
                                placeholder='Введите вес (кг)'
                            />
                        </div>
                        <h3>Замеры лентой</h3>
                        {['chest', 'hips', 'thigh', 'waist', 'arms'].map((area) => (
                            <div
                                className={style.fieldGroup}
                                key={area}
                            >
                                <Input
                                    name={area}
                                    value={formData[area as keyof typeof formData]}
                                    onChange={handleSubFormInputChange}
                                    type='number'
                                    placeholder={`Введите замер (${measurementLabels[area as keyof typeof measurementLabels]})`}
                                    />
                            </div>
                        ))}
                        <h3>Замеры калипером</h3>
                        {(gender === 'male'
                            ? ['chestCaliper', 'bellyCaliper', 'thighCaliper']
                            : ['thighCaliper', 'tricepsCaliper', 'waistCaliper']
                        ).map((area) => (
                            <div
                                className={style.fieldGroup}
                                key={area}
                            >
                                <Input
                                    name={area}
                                    value={formData[area as keyof typeof formData]}
                                    onChange={handleCaliperInputChange}
                                    type='number'
                                    placeholder={`Введите замер (${measurementLabels[area as keyof typeof measurementLabels]})`}
                                />
                            </div>
                        ))}
                           <h3>Процент жира</h3>
                        <div className={style.fieldGroup}>
                            <Input
                                name='bodyFat'
                                value={formData.bodyFat}
                                onChange={handleSubFormInputChange}
                                type='number'
                                placeholder='Введите процент жира'
                            />
                        </div>
                       

                        <Button
                            type='button'
                            variant='contained'
                            color='primary'
                            className={style.saveButton}
                            onClick={handleAddMeasurement}
                        >
                            Сохранить
                        </Button>
                    </form>
                </div>
            </animated.div>
        </>
    );
};

export default AddMeasurement;

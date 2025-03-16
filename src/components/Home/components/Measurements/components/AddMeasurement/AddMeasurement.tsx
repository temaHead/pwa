import React, { useCallback, useEffect, useState } from 'react';
import style from './AddMeasurement.module.scss';
import { useSpring, animated } from '@react-spring/web';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import {
    addBodyMeasuringAsync,
    addFatMeasuringAsync,
    addWeightMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import { calculateBodyFat } from '../../../../../Auth/SignUp/components/AddUser/utils';
import { Button, Form, Input, theme } from 'antd';
import CollapsibleSection from '../../../../../../shared/components/CollapsibleSection/CollapsibleSection';

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

    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;

    const [{ y }, api] = useSpring(() => ({ y: 100 }));

    const [formData, setFormData] = useState<FormData>({
        date: dayjs().format('YYYY-MM-DD'),
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
            date: dayjs().format('YYYY-MM-DD'),
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
        if (
            formData.bodyFat !== null ||
            formData.chestCaliper !== null ||
            formData.bellyCaliper !== null ||
            formData.thighCaliper !== null ||
            formData.tricepsCaliper !== null ||
            formData.waistCaliper !== null
        ) {
            dispatch(
                addFatMeasuringAsync({
                    bodyFat: formData.bodyFat,
                    measurements: {
                        chest: formData.chestCaliper,
                        abdomen: formData.bellyCaliper,
                        thigh: formData.thighCaliper,
                        tricep: formData.tricepsCaliper,
                        waist: formData.waistCaliper,
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
                        chest: formData.chest,
                        hips: formData.hips,
                        thigh: formData.thigh,
                        arms: formData.arms,
                        waist: formData.waist,
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
                    backgroundColor,
                    color: textColor,
                }}
            >
                <div className={style.header}>
                    <h2>Добавить замер</h2>
                    <Button
                        onClick={close}
                        type='primary'
                        danger
                    >
                        Закрыть
                    </Button>
                </div>
                <div className={style.content}>
                    <div className={style.fieldGroup}>
                        <div>Дата замера</div>
                        <Input
                            name='date'
                            value={formData.date}
                            onChange={handleSubFormInputChange}
                            type='date'
                        />
                    </div>

                    <div className={style.fieldGroup}>
                        <Form layout='vertical'>
                            <Form.Item label='Введите вес (кг)'>
                                <Input
                                    name='weight'
                                    value={formData.weight || undefined}
                                    onChange={handleSubFormInputChange}
                                    type='number'
                                    placeholder='кг'
                                />
                            </Form.Item>
                        </Form>
                    </div>
                    <CollapsibleSection title='Замеры лентой'>
                        <Form layout='vertical'>
                            {['chest', 'hips', 'thigh', 'waist', 'arms'].map((area) => (
                                <div
                                    className={style.fieldGroup}
                                    key={area}
                                >
                                    <Form.Item
                                        label={measurementLabels[area as keyof typeof measurementLabels]}
                                    >
                                        <Input
                                            style={{ backgroundColor }}
                                            name={area}
                                            value={formData[area as keyof typeof formData] || undefined}
                                            onChange={handleSubFormInputChange}
                                            type='number'
                                            placeholder='см'
                                        />
                                    </Form.Item>
                                </div>
                            ))}
                        </Form>
                    </CollapsibleSection>
                    <CollapsibleSection title='Замеры жира'>
                        <Form layout='vertical'>
                            {(gender === 'male'
                                ? ['chestCaliper', 'bellyCaliper', 'thighCaliper']
                                : ['thighCaliper', 'tricepsCaliper', 'waistCaliper']
                            ).map((area) => (
                                <div
                                    className={style.fieldGroup}
                                    key={area}
                                >
                                    <Form.Item
                                        label={measurementLabels[area as keyof typeof measurementLabels]}
                                    >
                                        <Input
                                            style={{ backgroundColor }}
                                            name={area}
                                            value={formData[area as keyof typeof formData] || undefined}
                                            onChange={handleCaliperInputChange}
                                            type='number'
                                            placeholder='мм'
                                        />
                                    </Form.Item>
                                </div>
                            ))}
                            <div>
                                Процент жира подставится автоматически после заполнения замеров калипером
                            </div>
                            <div className={style.fieldGroup}>
                                <Input
                                    style={{ backgroundColor }}
                                    name='bodyFat'
                                    value={formData.bodyFat || undefined}
                                    onChange={handleSubFormInputChange}
                                    type='number'
                                    placeholder='Введите процент жира вручную'
                                />
                            </div>
                        </Form>
                    </CollapsibleSection>

                    <Button
                        type='primary'
                        className={style.saveButton}
                        onClick={handleAddMeasurement}
                    >
                        Сохранить
                    </Button>
                </div>
            </animated.div>
        </>
    );
};

export default AddMeasurement;

import React, { useState } from 'react';
import Input from '../../../../../shared/components/Input/Input';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Selector from '../../../../../shared/components/Selector/Selector';
import style from './AddUser.module.scss';
import { Button } from '@mui/material';
import { calculateBodyFat } from './utils';
import { addUserProfileAsync } from '../../../../../store/slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store';
import { useNavigate } from 'react-router-dom';

interface Step {
    id: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'number' | 'date' | 'select';
    required?: boolean;
    options?: { value: string; label: string }[];
    pattern?: RegExp;
}

interface SubFormField {
    id: string;
    label: string;
    placeholder: string;
    imageUrl: string;
}

const AddUser: React.FC = () => {
    const steps: Step[] = [
        {
            id: 'name',
            label: 'Введите ваше имя',
            placeholder: 'Ваше имя',
            required: true,
            pattern: /^[A-Za-zА-Яа-яёЁ\s]+$/,
            type: 'text',
        },
        {
            id: 'birthDate',
            label: 'Выберите дату рождения',
            placeholder: 'Дата рождения',
            type: 'date',
            required: true,
        },

        {
            id: 'height',
            label: 'Введите ваш рост',
            placeholder: 'Ваш рост (см)',
            type: 'number',
            pattern: /^\d+$/,
        },
        {
            id: 'currentWeight',
            label: 'Введите ваш текущий вес',
            placeholder: 'Ваш текущий вес (кг)',
            type: 'number',
            pattern: /^\d+$/,
            required: true,
        },
        {
            id: 'gender',
            label: 'Выберите ваш пол',
            placeholder: 'Ваш пол',
            type: 'select',
            required: true,
            options: [
                { value: 'male', label: 'Мужской' },
                { value: 'female', label: 'Женский' },
            ],
        },
        {
            id: 'bodyFat',
            label: 'Введите ваш процент жира',
            placeholder: 'Процент жира',
            type: 'number',
        },
    ];

    const maleSubForm: SubFormField[] = [
        // Изменение: добавлены поля для мужчин
        {
            id: 'chest',
            label: 'Измерьте складку между подмышкой и соском.',
            placeholder: 'Введите толщину складки на груди (мм)',
            imageUrl: '/calipers-chest.jpg',
        },
        {
            id: 'abdomen',
            label: 'Измерьте складку вертикально на 3 сантиметра в сторону от пупка.',
            placeholder: 'Введите толщину складки на животе (мм)',
            imageUrl: '/calipers-abdomen.jpg',
        },
        {
            id: 'thigh',
            label: 'Измерьте складку между коленом и бедром.',
            placeholder: 'Введите толщину складки на бедре (мм)',
            imageUrl: '/calipers-thigh.jpg',
        },
    ];

    const femaleSubForm: SubFormField[] = [
        // Изменение: добавлены поля для женщин
        {
            id: 'thigh',
            label: 'Измерьте складку между коленом и бедром.',
            placeholder: 'Введите толщину складки на бедре (мм)',
            imageUrl: '/public/calipers-thigh.jpg',
        },
        {
            id: 'tricep',
            label: 'Измерьте складку между локтем и плечом.',
            placeholder: 'Введите толщину складки на трицепсе (мм)',
            imageUrl: '/calipers-tricep.jpg',
        },
        {
            id: 'waist',
            label: 'Измерьте складку на 2 сантиметра выше подвздошной кости.',
            placeholder: 'Введите толщину складки на талии (мм)',
            imageUrl: '/calipers-waist.jpg',
        },
    ];

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [subFormData, setSubFormData] = useState<Record<string, number>>({});
    const [showSubForm, setShowSubForm] = useState(false);
    const [errors, setErrors] = useState<string>('');

    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user);

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value || '' }));
        setErrors('');
    };

    const handleSubFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSubFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const validateStep = () => {
        if (currentStep.required && !formData[currentStep.id]) {
            setErrors('Это поле обязательно для заполнения.');
            return false;
        }
        if (currentStep.pattern && !currentStep.pattern.test(formData[currentStep.id] || '')) {
            setErrors('Некорректный ввод.');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) return;

        if (!isLastStep) {
            setCurrentStepIndex((prev) => prev + 1);
        } else {
            const profileData = {
                profile: {
                    name: formData['name'] || null,
                    birthDate: formData['birthDate'] || null,
                    gender: formData['gender'] || null,
                    currentWeight: formData['currentWeight'] ? parseFloat(formData['currentWeight']) : null,
                    height: formData['height'] ? parseFloat(formData['height']) : null,
                    email: user.email,
                    id: user.id,
                    bodyFat: formData['bodyFat'] ? parseFloat(formData['bodyFat']) : null,
                },
                fatMeasuring: {
                    chest: subFormData['chest'] || null,
                    abdomen: subFormData['abdomen'] || null,
                    thigh: subFormData['thigh'] || null,
                    tricep: subFormData['tricep'] || null,
                    waist: subFormData['waist'] || null,
                },
            };
            dispatch(addUserProfileAsync(profileData))
                .unwrap() // Обрабатываем результат
                .then(() => {
                    navigate('/'); // Редирект после успешного сохранения
                })
                .catch((error) => {
                    console.error('Ошибка при сохранении данных:', error);
                });
            console.log('Данные сохранены:', formData, subFormData);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex((prev) => prev - 1);
            setErrors('');
        }
    };

    const handleSkip = () => {
        setCurrentStepIndex((prev) => prev + 1);
        setErrors('');
    };

    const handleCalculateBodyFat = () => {
        const gender = formData.gender;
        const birthDate = formData.birthDate;
        try {
            // Проверка и расчет процента жира
            const bodyFat = calculateBodyFat(gender, subFormData, birthDate);
            console.log(`Процент жира: ${bodyFat}%`);

            // Обновление состояния с результатом
            setFormData((prev) => ({ ...prev, bodyFat: bodyFat.toString() }));

            // Скрытие формы ввода
            setShowSubForm(false);
        } catch (error) {
            // Обработка ошибок (например, если данные некорректны)
            console.error((error as Error).message);
            alert(`Ошибка: ${(error as Error).message}`);
        }
    };

    const startSubForm = () => {
        setShowSubForm(true);
        setErrors('');
    };

    const subFormFields = formData.gender === 'male' ? maleSubForm : femaleSubForm; // Изменение: выбор полей субформы в зависимости от пола

    return (
        <div className={style.addUser}>
            <div className={style.header}>
                <div className={style.buttonBack}>
                    {currentStepIndex > 0 && (
                        <div onClick={handleBack}>
                            <ArrowBackIosIcon />
                        </div>
                    )}
                </div>
                <div className={style.stepCounter}>
                    Шаг {currentStepIndex + 1} из {steps.length}
                </div>
                <h2 className={style.title}>{currentStep.label}</h2>
            </div>
            {showSubForm && currentStep.id === 'bodyFat' ? (
                <div className={style.subForm}>
                    {subFormFields.map((field) => (
                        <div
                            key={field.id}
                            className={style.field}
                        >
                            <img
                                src={field.imageUrl}
                                alt={field.label}
                                style={{ maxWidth: '100%', marginBottom: '1rem' }}
                                className={style.img}
                            />
                            <label
                                htmlFor={field.id}
                                className={style.label}
                            >
                                {field.label}
                            </label>
                            <Input
                                name={field.id}
                                value={subFormData[field.id] || ''}
                                onChange={handleSubFormInputChange}
                                type='number'
                                placeholder={field.placeholder}
                            />
                        </div>
                    ))}
                    <Button
                        className={style.buttonCalculate}
                        onClick={handleCalculateBodyFat}
                        variant='contained'
                        color='info'
                    >
                        Рассчитать
                    </Button>
                </div>
            ) : currentStep.type === 'select' ? (
                <Selector
                    name={currentStep.id}
                    value={formData[currentStep.id] || ''}
                    onChange={handleInputChange}
                    options={currentStep.options || []}
                />
            ) : (
                <Input
                    name={currentStep.id}
                    type={currentStep.type || 'text'}
                    value={formData[currentStep.id] || ''}
                    onChange={handleInputChange}
                    placeholder={currentStep.placeholder}
                />
            )}
            {errors && <p style={{ color: 'red' }}>{errors}</p>}
            <div className={style.buttons}>
                {currentStep.id === 'bodyFat' && !showSubForm ? (
                    <Button
                        onClick={startSubForm}
                        variant='contained'
                        color='info'
                    >
                        Рассчитать самостоятельно
                    </Button>
                ) : null}
                {formData[currentStep.id] && (
                    <Button
                        onClick={handleNext}
                        disabled={currentStep.required && !formData[currentStep.id]}
                        variant='contained'
                        color='success'
                        fullWidth
                        size='large'
                    >
                        {isLastStep ? 'Сохранить' : 'Далее'}
                    </Button>
                )}
                {!currentStep.required && !isLastStep && !showSubForm && !formData[currentStep.id] && (
                    <Button
                        onClick={handleSkip}
                        color='info'
                    >
                        Пропустить
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AddUser;

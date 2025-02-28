import React, { useCallback, useMemo, useState } from 'react';
import style from './AddUser.module.scss';
import { calculateBodyFat } from './utils';
import { addUserProfileAsync } from '../../../../../store/slices/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../store';
import { useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import CustomSelect from '../../../../../shared/components/CustomSelect/CustomSelect';

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

    const maleSubForm = useMemo<SubFormField[]>(
        () => [
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
        ],
        []
    );

    const femaleSubForm = useMemo<SubFormField[]>(
        () => [
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
        ],
        []
    );

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

    const handleInputChange = useCallback(
        (name: string, value: string) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors('');
        },
        []
    );

    const handleSubFormInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSubFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }, []);

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
                    theme: user.theme,
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

    const handleCalculateBodyFat = useCallback(() => {
        try {
            const bodyFat = calculateBodyFat(formData.gender, subFormData, formData.birthDate);
            setFormData((prev) => ({ ...prev, bodyFat: bodyFat.toString() }));
            setShowSubForm(false);
        } catch (error) {
            alert(`Ошибка: ${(error as Error).message}`);
        }
    }, [formData.gender, subFormData, formData.birthDate]);

    const startSubForm = useCallback(() => {
        setShowSubForm(true);
        setErrors('');
    }, []);

    const subFormFields = useMemo(
        () => (formData.gender === 'male' ? maleSubForm : femaleSubForm),
        [formData.gender, maleSubForm, femaleSubForm]
    );

    return (
        <div className={style.addUser}>
            <div className={style.header}>
                <div className={style.buttonBack}>
                    {currentStepIndex > 0 && (
                        <div onClick={handleBack}>
                            <LeftOutlined />
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
                        type='primary'
                    >
                        Рассчитать
                    </Button>
                </div>
            ) : currentStep.type === 'select' ? (
                <CustomSelect
                value={formData[currentStep.id] ?? undefined}
                onChange={(value) => handleInputChange(currentStep.id, value)}
                options={currentStep.options || []}
            />
            
            
            ) : (
                <Input
                name={currentStep.id}
                type={currentStep.type || 'text'}
                value={formData[currentStep.id] || ''}
                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                placeholder={currentStep.placeholder}
            />
            )}
            {errors && <p style={{ color: 'red' }}>{errors}</p>}
            <div className={style.buttons}>
                {currentStep.id === 'bodyFat' && !showSubForm ? (
                    <Button
                        onClick={startSubForm}
                        type='primary'
                    >
                        Рассчитать самостоятельно
                    </Button>
                ) : null}
                {formData[currentStep.id] && (
                    <Button
                        onClick={handleNext}
                        disabled={currentStep.required && !formData[currentStep.id]}
                        type='primary'
                    >
                        {isLastStep ? 'Сохранить' : 'Далее'}
                    </Button>
                )}
                {!currentStep.required && !isLastStep && !showSubForm && !formData[currentStep.id] && (
                    <Button
                        onClick={handleSkip}
                        type='primary'
                    >
                        Пропустить
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AddUser;

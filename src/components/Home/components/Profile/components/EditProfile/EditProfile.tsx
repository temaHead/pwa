import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { AppDispatch, RootState } from '../../../../../../store';
import { updateUserProfileAsync } from '../../../../../../store/slices/userSlice';
import { UserProfile } from '../../../../../../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Select, Avatar, Typography, Flex } from 'antd';
import style from './EditProfile.module.scss';

const { Option } = Select;
const { Title } = Typography;

function EditProfile() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Данные пользователя (используем shallowEqual для предотвращения лишних ререндеров)
    const user = useSelector((state: RootState) => state.user, shallowEqual);

    // Локальное состояние профиля
    const [profile, setProfile] = useState<UserProfile>(user);

    // Синхронизация при изменении user
    useEffect(() => {
        setProfile(user);
    }, [user]);

    // Мемоизированное значение профиля
    const profileData = useMemo(() => profile, [profile]);

    // Обработчик изменения инпутов
    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Обработчик изменения селекта
    const handleSelectChange = useCallback(
        (name: string) => (value: string) => {
            setProfile((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setProfile((prev) => ({ ...prev, birthDate: event.target.value || null }));
    }, []);

    // Мемоизированное значение даты для DatePicker
    const dateValue = useMemo(() => profileData.birthDate || '', [profileData.birthDate]);

    // Обработчик сохранения
    const handleSave = useCallback(async () => {
        await dispatch(updateUserProfileAsync(profile));
        navigate('/profile');
    }, [dispatch, profile, navigate]);

    return (
        <div className={style.editProfile}>
            {/* Шапка */}
            <Flex
                justify='space-between'
                align='center'
                className={style.header}
            >
                <Button
                    type='text'
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/profile')}
                />
                <Title
                    level={4}
                    style={{ margin: 0 }}
                >
                    Редактировать профиль
                </Title>
            </Flex>

            {/* Аватар */}
            <Flex
                justify='center'
                className={style.avatar}
            >
                <Avatar
                    size={64}
                    icon={<UserOutlined />}
                />
            </Flex>

            {/* Форма */}
            <div className={style.container}>
                <Input
                    name='name'
                    value={profileData.name || ''}
                    onChange={handleInputChange}
                    placeholder='Имя'
                />

                <Input
                    type='date'
                    value={dateValue}
                    onChange={handleDateChange}
                    placeholder='Дата рождения'
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <Input
                    name='height'
                    value={profileData.height || ''}
                    onChange={handleInputChange}
                    placeholder='Рост (см)'
                    type='number'
                />

                <Input
                    name='currentWeight'
                    value={profileData.currentWeight || ''}
                    onChange={handleInputChange}
                    placeholder='Текущий вес (кг)'
                    type='number'
                />

                <Input
                    name='bodyFat'
                    value={profileData.bodyFat || ''}
                    onChange={handleInputChange}
                    placeholder='% жира'
                    type='number'
                />

                <Select
                    value={profileData.gender || undefined}
                    onChange={handleSelectChange('gender')}
                >
                    <Option value='Не выбран'>Не выбран</Option>
                    <Option value='Мужчина'>Мужчина</Option>
                    <Option value='Женщина'>Женщина</Option>
                </Select>
            </div>

            {/* Кнопка сохранения */}
            <Flex
                justify='center'
                className={style.buttonsWrapper}
            >
                <Button
                    type='primary'
                    onClick={handleSave}
                    block
                >
                    Сохранить
                </Button>
            </Flex>
        </div>
    );
}

export default EditProfile;

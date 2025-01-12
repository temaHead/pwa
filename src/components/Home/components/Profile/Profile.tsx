import { useDispatch, useSelector } from 'react-redux';
import { ChangeEvent, useState, useEffect } from 'react';
import { AppDispatch, RootState } from '../../../../store';
import Logout from '../../../Auth/Logout/Logout';
import { updateUserProfileAsync } from '../../../../store/slices/userSlice';
import { UserProfileType } from '../../../../types';
import style from './Profile.module.scss';
import Input from './components/Input/Input';
import Selector from './components/Selector/Selector';
import DatePicker from './components/DatePicker/DatePicker';
import { Button } from '@mui/material';
import { Cancel, Save, Edit } from '@mui/icons-material';


function Profile() {
    const dispatch = useDispatch<AppDispatch>();

    // Извлечение данных из Redux Store
    const user = useSelector((state: RootState) => state.user);

    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfileType>({
        name: user.name,
        birthDate: user.birthDate,
        currentWeight: user.currentWeight,
        initialWeight: user.initialWeight,
        desiredWeight: user.desiredWeight,
        gender: user.gender,
        height: user.height,
        email: user.email,
        id: user.id,
    });

    // Синхронизация состояния с данными из Redux Store
    useEffect(() => {
        setProfile({
            name: user.name,
            birthDate: user.birthDate,
            currentWeight: user.currentWeight,
            initialWeight: user.initialWeight,
            desiredWeight: user.desiredWeight,
            gender: user.gender,
            height: user.height,
            email: user.email,
            id: user.id,
        });
    }, [user]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Если редактируется имя, преобразуем первую букву в заглавную
        const updatedValue =
            name === 'name' && value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        setProfile((prev) => ({
            ...prev,
            [name]:
                name === 'height' ||
                name === 'currentWeight' ||
                name === 'desiredWeight' ||
                name === 'initialWeight'
                    ? Number(updatedValue) || null // Преобразование к числу
                    : updatedValue,
        }));
    };

    const handleSave = () => {
        // Приведение типов перед отправкой
        dispatch(updateUserProfileAsync(profile));
        setIsEditing(false);
    };

    return (
        <div className={style.profile}>
            <div className={style.buttonsWrapper}>
                {isEditing ? (
                    <>
                        <Button
                            variant='outlined'
                            color='error'
                            startIcon={<Cancel />}
                            onClick={() => setIsEditing(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant='contained'
                            color='success'
                            startIcon={<Save />}
                            onClick={handleSave}
                        >
                            Сохранить
                        </Button>
                    </>
                ) : (
                    <Button
                        variant='contained'
                        color='primary'
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                    >
                        Редактировать профиль
                    </Button>
                )}
            </div>

            <div className={style.container}>
                <Input
                    label='Имя'
                    name='name'
                    value={profile.name}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    type='name'
                />
                <DatePicker
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    label='Возраст'
                    placeholder='Дата рождения'
                    name='birthDate'
                    value={profile.birthDate}
                />

                <Input
                    label='Рост'
                    name='height'
                    value={profile.height}
                    postValue='см'
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    type='number'
                />
                <Input
                    label='Текущий вес'
                    name='currentWeight'
                    value={profile.currentWeight}
                    postValue='кг'
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    type='number'
                />
                <Input
                    label='Желаемый вес'
                    name='desiredWeight'
                    value={profile.desiredWeight}
                    postValue='кг'
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    type='number'
                />
                <Input
                    label='Начальный вес'
                    name='initialWeight'
                    value={profile.initialWeight}
                    postValue='кг'
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    type='number'
                />
                <Selector
                    name='gender'
                    value={profile.gender}
                    isEditing={isEditing}
                    onChange={handleInputChange}
                    label='Пол'
                    options={[
                        { value: 'Не выбран', label: 'Не выбран' },
                        { value: 'Мужчина', label: 'Мужчина' },
                        { value: 'Женщина', label: 'Женщина' },
                    ]}
                />
            </div>
            <div className={style.logout}>
                <Logout />
            </div>
        </div>
    );
}

export default Profile;

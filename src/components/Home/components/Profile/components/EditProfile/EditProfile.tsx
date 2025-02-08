import { useDispatch, useSelector } from 'react-redux';
import style from './EditProfile.module.scss';
import { Button } from '@mui/material';
import { useState, useEffect, ChangeEvent } from 'react';
import { AppDispatch, RootState } from '../../../../../../store';
import { updateUserProfileAsync } from '../../../../../../store/slices/userSlice';
import { UserProfile } from '../../../../../../types';
import Selector from '../../../../../../shared/components/Selector/Selector';
import Input from '../../../../../../shared/components/Input/Input';
import DatePicker from '../../../../../../shared/components/DatePicker/DatePicker';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

function EditProfile() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Извлечение данных из Redux Store
    const user = useSelector((state: RootState) => state.user);

    const [profile, setProfile] = useState<UserProfile>({
        name: user.name,
        birthDate: user.birthDate,
        currentWeight: user.currentWeight,
        gender: user.gender,
        height: user.height,
        email: user.email,
        id: user.id,
        bodyFat: user.bodyFat,
    });

    // Синхронизация состояния с данными из Redux Store
    useEffect(() => {
        setProfile({
            name: user.name,
            birthDate: user.birthDate,
            currentWeight: user.currentWeight,
            gender: user.gender,
            height: user.height,
            email: user.email,
            id: user.id,
            bodyFat: user.bodyFat,
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

    const handleSave = async () => {
        // Приведение типов перед отправкой
        await dispatch(updateUserProfileAsync(profile));
        navigate('/profile');

    };
    const handleGoToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className={style.editProfile}>
            <div className={style.header}>
                <div
                    className={style.icon}
                    onClick={handleGoToProfile}
                >
                    <ArrowBackIosIcon />
                </div>
                <div className={style.title}>Профиль</div>
            </div>
            <div className={style.avatar}>
                <div className={style.icon}>
                    <AccountCircleRoundedIcon fontSize='large' />
                </div>
                <div></div>
            </div>

            <div className={style.container}>
                <Input
                    label='Имя'
                    name='name'
                    value={profile.name}
                    onChange={handleInputChange}
                    type='name'
                />
                <DatePicker
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
                    onChange={handleInputChange}
                    type='number'
                />
                <Input
                    label='Текущий вес'
                    name='currentWeight'
                    value={profile.currentWeight}
                    postValue='кг'
                    onChange={handleInputChange}
                    type='number'
                />
                <Input
                    label='Текущий % жира'
                    name='bodyFat'
                    value={profile.bodyFat}
                    postValue='%'
                    onChange={handleInputChange}
                    type='number'
                />
                <Selector
                    name='gender'
                    value={profile.gender}
                    onChange={handleInputChange}
                    label='Пол'
                    options={[
                        { value: 'Не выбран', label: 'Не выбран' },
                        { value: 'Мужчина', label: 'Мужчина' },
                        { value: 'Женщина', label: 'Женщина' },
                    ]}
                />
            </div>
            <div className={style.buttonsWrapper}>
                <>
                    <Button
                        variant='contained'
                        color='success'
                        onClick={handleSave}
                        fullWidth
                    >
                        Сохранить
                    </Button>
                </>
            </div>
        </div>
    );
}

export default EditProfile;

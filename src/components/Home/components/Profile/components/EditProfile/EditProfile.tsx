import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { AppDispatch, RootState } from '../../../../../../store';
import { updateUserProfileAsync } from '../../../../../../store/slices/userSlice';
import { UserProfile } from '../../../../../../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Select, Avatar, Flex, Form } from 'antd';
import style from './EditProfile.module.scss';

const { Option } = Select;

function EditProfile() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const user = useSelector((state: RootState) => state.user, shallowEqual);
    const [profile, setProfile] = useState<UserProfile>(user);

    useEffect(() => {
        setProfile(user);
    }, [user]);

    const profileData = useMemo(() => profile, [profile]);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSelectChange = useCallback(
        (name: string) => (value: string) => {
            setProfile((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setProfile((prev) => ({ ...prev, birthDate: event.target.value || null }));
    }, []);

    const dateValue = useMemo(() => profileData.birthDate || '', [profileData.birthDate]);

    const handleSave = useCallback(async () => {
        await dispatch(updateUserProfileAsync(profile));
        navigate('/profile');
    }, [dispatch, profile, navigate]);

    return (
        <div className={style.editProfile}>
            <Flex
                justify='center'
                align='center'
                className={style.header}
            >
                <Button
                    type='text'
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/profile')}
                    className={style.icon}
                />
                <div className={style.title}>Редактировать профиль</div>
            </Flex>

            <Flex
                justify='center'
                className={style.avatar}
            >
                <Avatar
                    size={64}
                    icon={<UserOutlined />}
                />
            </Flex>

            <Form layout='vertical'>
                <Form.Item label='Имя'>
                    <Input
                        name='name'
                        value={profileData.name || ''}
                        onChange={handleInputChange}
                        placeholder='Введите имя'
                    />
                </Form.Item>

                <Form.Item label='Дата рождения'>
                    <Input
                        type='date'
                        value={dateValue}
                        onChange={handleDateChange}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item label='Рост (см)'>
                    <Input
                        name='height'
                        value={profileData.height || ''}
                        onChange={handleInputChange}
                        placeholder='Введите рост'
                        type='number'
                    />
                </Form.Item>

                <Form.Item label='Текущий вес (кг)'>
                    <Input
                        name='currentWeight'
                        value={profileData.currentWeight || ''}
                        onChange={handleInputChange}
                        placeholder='Введите текущий вес'
                        type='number'
                    />
                </Form.Item>

                <Form.Item label='% жира'>
                    <Input
                        name='bodyFat'
                        value={profileData.bodyFat || ''}
                        onChange={handleInputChange}
                        placeholder='Введите процент жира'
                        type='number'
                    />
                </Form.Item>

                <Form.Item label='Пол'>
                    <Select
                        value={profileData.gender || undefined}
                        onChange={handleSelectChange('gender')}
                        style={{ width: '100%' }}
                    >
                        <Option value='Не выбран'>Не выбран</Option>
                        <Option value='Мужчина'>Мужчина</Option>
                        <Option value='Женщина'>Женщина</Option>
                    </Select>
                </Form.Item>
            </Form>

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

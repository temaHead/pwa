import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import Logout from '../../../Auth/Logout/Logout';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, UserOutlined, BulbOutlined, LeftOutlined } from '@ant-design/icons';
import { Button, Typography, Flex, Avatar, Switch, theme } from 'antd';
import Goals from './components/Goals/Goals';
import { useEffect, useState } from 'react';
import { getAllGoalsAsync } from '../../../../store/slices/goalsSlice';
import CurrentGoals from './components/Goals/components/CurrentGoals/CurrentGoals';
import style from './Profile.module.scss';
import { updateUserProfileAsync } from '../../../../store/slices/userSlice';

const { Title, Text } = Typography;

function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Извлечение данных из Redux Store
    const user = useSelector((state: RootState) => state.user);
    const [userTheme, setUserTheme] = useState<'light' | 'dark'>(user.theme || 'light');
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;
    const colorIcon = token.colorIcon;
    useEffect(() => {
        if (user.id) dispatch(getAllGoalsAsync(user.id));
    }, [dispatch, user.id]);

    const toggleTheme = async () => {
        const newTheme: 'light' | 'dark' = userTheme === 'light' ? 'dark' : 'light';
        setUserTheme(newTheme);
        const updatedProfile = { ...user, theme: newTheme };
        await dispatch(updateUserProfileAsync(updatedProfile));
    };

    return (
        <div
            className={style.profile}
            style={{ backgroundColor, color: textColor }}
        >
            {/* Шапка профиля */}
            <Flex
                justify='space-between'
                align='center'
                className={style.header}
            >
                <Button
                    type='text'
                    icon={<LeftOutlined style={{ color: colorIcon }} />}
                    onClick={() => navigate('/room')}
                />
                <Title
                    level={4}
                    style={{ margin: 0 }}
                >
                    Профиль
                </Title>
                <Flex
                    align='center'
                    gap={8}
                >
                    <Button
                        type='text'
                        icon={<EditOutlined style={{ color: colorIcon }} />}
                        onClick={() => navigate('/editProfile')}
                    />
                </Flex>
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

            {/* Информация о пользователе */}
            <div className={style.container}>
                <Flex
                    justify='space-around'
                    className={style.userInfo}
                >
                    <div className={style.item}>
                        <Text type='secondary'>Вес</Text>
                        <Text strong>{`${user.currentWeight || 0} кг`}</Text>
                    </div>
                    <div className={`${style.item} ${style.height}`}>
                        <Text type='secondary'>Рост</Text>
                        <Text strong>{`${user.height || 0} см`}</Text>
                    </div>
                    <div className={style.item}>
                        <Text type='secondary'>% жира</Text>
                        <Text strong>{`${user.bodyFat || 0}`}</Text>
                    </div>
                </Flex>

                {/* Текущие цели */}
                <div className={style.currentGoals}>
                    <CurrentGoals />
                </div>

                {/* Список целей */}
                <div className={style.goals}>
                    <Title level={5}>Цели</Title>
                    <Goals />
                </div>
            </div>
            <div>
                <Switch
                    checked={userTheme === 'dark'}
                    onChange={toggleTheme}
                    checkedChildren={<BulbOutlined />}
                    unCheckedChildren={<BulbOutlined />}
                />
            </div>

            {/* Кнопка выхода */}
            <Flex
                justify='center'
                className={style.logout}
            >
                <Logout />
            </Flex>
            <Button
                type='default'
                block
                style={{ marginTop: '20px' }}
                onClick={() => {
                    localStorage.removeItem('skipPin');
                    localStorage.removeItem('pin');
                    sessionStorage.removeItem('pinVerified');
                }}
            >
                удалить пин код из локалстораж
            </Button>
            <Button
                type='default'
                block
                style={{ marginTop: '20px' }}
                onClick={() => {
                    localStorage.removeItem('faceID');
                    localStorage.removeItem('faceIDRegistered');
                }}
            >
                удалить face из локалстораж
            </Button>
        </div>
    );
}

export default Profile;

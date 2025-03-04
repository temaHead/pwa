import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, LeftOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Typography, Flex, Avatar, theme } from 'antd';
import Goals from './components/Goals/Goals';
import { useEffect } from 'react';
import { getAllGoalsAsync } from '../../../../store/slices/goalsSlice';
import CurrentGoals from './components/Goals/components/CurrentGoals/CurrentGoals';
import style from './Profile.module.scss';

const { Title, Text } = Typography;

function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Извлечение данных из Redux Store
    const user = useSelector((state: RootState) => state.user);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;
    const colorIcon = token.colorIcon;
    useEffect(() => {
        if (user.id) dispatch(getAllGoalsAsync(user.id));
    }, [dispatch, user.id]);

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
                    {user.name}
                </Title>
                <Flex
                    align='center'
                    gap={8}
                >
                    <Button
                        type='text'
                        icon={<SettingOutlined style={{ color: colorIcon }} />}
                        onClick={() => navigate('/settings')}
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

            {/* Кнопка выхода */}
            <Flex
                justify='center'
                className={style.logout}
            >
                <Button
                    type='primary'
                    onClick={() => navigate('/editProfile')}
                >
                    Редактировать
                </Button>
            </Flex>
        </div>
    );
}

export default Profile;

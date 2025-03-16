import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Typography, Flex, Avatar, theme, Spin } from 'antd';
import Goals from './components/Goals/Goals';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { getAllGoalsAsync, setGoals } from '../../../../store/slices/goalsSlice';
import CurrentGoals from './components/Goals/components/CurrentGoals/CurrentGoals';
import style from './Profile.module.scss';
import Header from '../../../../shared/components/Header/Header';
import { getEntityFromIDB, saveEntityToIDB } from '../../../../shared/utils/idb';
import _ from 'lodash';

const { Text } = Typography;

function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Извлечение данных из Redux Store
    const user = useSelector((state: RootState) => state.user);
    const { goals, loading } = useSelector((state: RootState) => state.goals);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const textColor = token.colorTextBase;
    const colorIcon = token.colorIcon;

    const [loadingStatus, setLoadingStatus] = useState<'loading' | 'success' | 'idle'>('idle');

    const loadAndSyncData = useCallback(async () => {
        setLoadingStatus('loading');
        const goalsFromIDB = await getEntityFromIDB('goalsStore');
        if (goalsFromIDB) {
            console.log('goalsFromIDB', goalsFromIDB);
            dispatch(setGoals(goalsFromIDB));
        }
        if (user.id) dispatch(getAllGoalsAsync(user.id));

        // Добавляем задержку перед изменением статуса на success
        setTimeout(() => {
            setLoadingStatus('success'); // Данные успешно загружены
        }, 1000);
        setTimeout(() => setLoadingStatus('idle'), 2000);
    }, [dispatch, user.id]);

    const syncData = useCallback(async () => {
        const goalsFromIDB = await getEntityFromIDB('goalsStore');
        if (!_.isEqual(goalsFromIDB, goals)) {
            console.log('сверили goalsFromIDB', goalsFromIDB);
            await saveEntityToIDB('goalsStore', goals);
        }
    }, [goals]);

    useEffect(() => {
        loadAndSyncData();
    }, [loadAndSyncData]);

    useEffect(() => {
        syncData();
    }, [syncData]);

    const headerStyle = useMemo(
        () => ({
            backgroundColor,
            color: textColor,
        }),
        [backgroundColor, textColor]
    );

    const iconStyle = useMemo(
        () => ({
            color: colorIcon,
        }),
        [colorIcon]
    );

    return (
        <div
            className={style.profile}
            style={headerStyle}
        >
            <Header
                title={user.name || 'Профиль'}
                onRightClick={() => navigate('/settings')}
                rightIcon={
                    <>
                        {loadingStatus === 'loading' ? (
                            <Spin size='small' />
                        ) : loadingStatus === 'success' ? (
                            <CheckCircleOutlined style={{ color: 'green', fontSize: 20 }} />
                        ) : (
                            <SettingOutlined style={iconStyle} />
                        )}
                    </>
                }
            />

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
                    <CurrentGoals
                        loading={loading}
                        goals={goals}
                    />
                </div>

                {/* Список целей */}
                <div className={style.goals}>
                    <Goals goals={goals} />
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

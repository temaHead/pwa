import { BulbOutlined, LockOutlined, SmileOutlined } from '@ant-design/icons';
import { Switch, theme } from 'antd';
import style from './Settings.module.scss';
import { AppDispatch, RootState } from '../../../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { setPin, setSkipPin, updateUserProfileAsync } from '../../../../../../store/slices/userSlice';
import Logout from '../../../../../Auth/Logout/Logout';
import CustomModal from '../../../../../../shared/components/CustomModal/CustomModal';
import Header from '../../../../../../shared/components/Header/Header';

function Settings() {
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const textColor = token.colorTextBase;
    const backgroundColor = token.colorBgContainer;
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.user);

    const [userTheme, setUserTheme] = useState<'light' | 'dark'>(user.theme || 'light');
    const [usePinCode, setUsePinCode] = useState<boolean>(!!localStorage.getItem('pin')); // Проверяем, есть ли пин-код
    const [useFaceID, setUseFaceID] = useState<boolean>(localStorage.getItem('faceIDRegistered') === 'true'); // Проверяем, зарегистрирован ли Face ID
    const [isFaceIDSupported, setIsFaceIDSupported] = useState<boolean>(false); // Поддержка Face ID

    // Один стейт для управления текущим открытым модальным окном
    const [activeModal, setActiveModal] = useState<'pinCode' | 'faceID' | null>(null);



    // Проверка поддержки платформенного аутентификатора
    const isPlatformAuthenticatorSupported = async () => {
        /// РАСКОММЕНТИРОВАТЬ ПОСЛЕ СТИЛИЗАЦИИ
        // try {
        //     const result = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        //     return result;
        // } catch (error) {
        //     console.error('Ошибка при проверке поддержки платформенного аутентификатора:', error);
        //     return false;
        // }
        return true;
    };

    const toggleTheme = async () => {
        const newTheme: 'light' | 'dark' = userTheme === 'light' ? 'dark' : 'light';
        setUserTheme(newTheme);
        const updatedProfile = { ...user, theme: newTheme };
        await dispatch(updateUserProfileAsync(updatedProfile));
    };

    const handlePinCodeToggle = () => {
        if (usePinCode) {
            // Если пин-код включен, показываем модальное окно для подтверждения
            setActiveModal('pinCode');
        } else {
            // Если пин-код выключен, включаем его без подтверждения
            togglePinCode();
        }
    };

    const togglePinCode = () => {
        if (usePinCode) {
            // Если свитч выключен, удаляем пин-код и добавляем skipPin
            localStorage.removeItem('pin');
            localStorage.setItem('skipPin', 'true');
            dispatch(setPin(null));
            dispatch(setSkipPin(true));
        } else {
            // Если свитч включен, добавляем пин-код (логику добавления пин-кода пока пропускаем)
            localStorage.removeItem('skipPin');
            localStorage.removeItem('pin');
            sessionStorage.removeItem('pinVerified');
            dispatch(setSkipPin(false));
            dispatch(setPin(null));
        }
        setUsePinCode(!usePinCode); // Обновляем состояние свитча
    };

    const handleFaceIDToggle = () => {
        if (useFaceID) {
            // Если Face ID включен, показываем модальное окно для подтверждения
            setActiveModal('faceID');
        } else {
            // Если Face ID выключен, включаем его без подтверждения
            toggleFaceID();
        }
    };

    const toggleFaceID = useCallback(async () => {
        if (useFaceID) {
            // Если свитч выключен, удаляем Face ID и добавляем skipFaceID
            localStorage.removeItem('faceID');
            localStorage.removeItem('faceIDRegistered');
            localStorage.setItem('skipFaceID', 'true');
            setUseFaceID(false); // Обновляем состояние свитча
        } else {
            try {
                const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                    challenge: crypto.getRandomValues(new Uint8Array(32)), // Генерация случайного challenge
                    rp: {
                        name: 'Sport App',
                        id: window.location.hostname, // Привязка к домену
                    },
                    user: {
                        id: new TextEncoder().encode(user.id || ''), // Уникальный идентификатор пользователя
                        name: user.email || 'UserEmail',
                        displayName: user.name || 'UserName',
                    },
                    pubKeyCredParams: [
                        {
                            type: 'public-key',
                            alg: -7, // ES256
                        },
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform', // Только встроенные аутентификаторы (Face ID/Touch ID)
                        userVerification: 'required', // Требуется проверка пользователя
                        requireResidentKey: true, // Требуется резидентный ключ (для удобства)
                    },
                    timeout: 60000, // Таймаут 60 секунд
                    attestation: 'none', // Отключаем attestation, так как он не нужен для Face ID
                };

                const credential = await navigator.credentials.create({
                    publicKey: publicKeyCredentialCreationOptions,
                });

                if (credential && credential instanceof PublicKeyCredential) {
                    // Сохраняем только необходимые данные
                    const credentialData = {
                        id: credential.id,
                        rawId: Array.from(new Uint8Array(credential.rawId)), // Преобразуем rawId в массив
                        response: {
                            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)), // Преобразуем clientDataJSON в массив
                        },
                        type: credential.type,
                    };

                    localStorage.setItem('faceID', JSON.stringify(credentialData));
                    localStorage.setItem('faceIDRegistered', 'true');
                    setUseFaceID(true); // Обновляем состояние свитча только после успешной регистрации
                }
            } catch (error) {
                console.error('Ошибка при регистрации Face ID:', error);
                alert('Ошибка при настройке Face ID. Пожалуйста, попробуйте снова.');
            }
        }
    },[ useFaceID, user.id, user.email, user.name ]);

    // Закрытие модального окна
    const handleCloseModal = () => {
        setActiveModal(null);
    };

    // Подтверждение действия в модальном окне
    const handleConfirmModal = () => {
        if (activeModal === 'pinCode') {
            togglePinCode(); // Выполняем отключение пин-кода
        } else if (activeModal === 'faceID') {
            toggleFaceID(); // Выполняем отключение Face ID
        }
        setActiveModal(null); // Закрываем модальное окно
    };

        // Проверяем поддержку Face ID при загрузке компонента
        useEffect(() => {
            const checkFaceIDSupport = async () => {
                const isSupported = await isPlatformAuthenticatorSupported();
                setIsFaceIDSupported(isSupported);
            };
    
            checkFaceIDSupport();
        }, []);
    
        // Автоматически отключаем Face ID, если пин-код отключен
        useEffect(() => {
            if (!usePinCode && useFaceID) {
                toggleFaceID(); // Отключаем Face ID, если пин-код отключен
            }
        }, [usePinCode, useFaceID, toggleFaceID]);

    return (
        <div
            className={style.editProfile}
            style={{ color: textColor }}
        >
            <Header
                title={'Настройки'}
                showBackButton
            />

            <div className={style.settingsContainer}>
                {/* Настройка темы */}
                <div
                    className={style.settingItem}
                    style={{ color: textColor, backgroundColor }}
                >
                    <div className={style.settingLabel}>
                        <BulbOutlined className={style.settingIcon} />
                        <span>Темная тема</span>
                    </div>
                    <Switch
                        checked={userTheme === 'dark'}
                        onChange={toggleTheme}
                    />
                </div>

                {/* Настройка пин-кода */}
                <div
                    className={style.settingItem}
                    style={{ color: textColor, backgroundColor }}
                >
                    <div className={style.settingLabel}>
                        <LockOutlined className={style.settingIcon} />
                        <span>Использовать пин-код</span>
                    </div>
                    <Switch
                        checked={usePinCode}
                        onChange={handlePinCodeToggle}
                    />
                </div>

                {/* Настройка Face ID (отображается только при поддержке) */}
                {isFaceIDSupported && (
                    <div
                        className={`${style.settingItem} ${!usePinCode ? style.disabled : ''}`}
                        style={{ color: textColor, backgroundColor }}
                    >
                        <div className={style.settingLabel}>
                            <SmileOutlined className={style.settingIcon} />
                            <span>Использовать Face ID</span>
                        </div>
                        <Switch
                            checked={useFaceID}
                            onChange={handleFaceIDToggle}
                            disabled={!usePinCode} // Дизейблим свич, если пин-код отключен
                        />
                    </div>
                )}
            </div>

            {/* Кнопка выхода */}
            <Logout />

            {/* Универсальное модальное окно */}
            <CustomModal
                isOpen={activeModal !== null}
                onClose={handleCloseModal}
                onOk={handleConfirmModal}
                title='Подтвердите действие'
                description={
                    activeModal === 'pinCode' && useFaceID
                        ? 'Вы уверены, что хотите удалить пин-код и Face ID для входа?'
                        : activeModal === 'pinCode'
                        ? 'Вы уверены, что хотите удалить пин-код для входа?'
                        : 'Вы уверены, что хотите удалить вход по Face ID?'
                }
                okText='Удалить'
                cancelText='Отмена'
            />
        </div>
    );
}

export default Settings;

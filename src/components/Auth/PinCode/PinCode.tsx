import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; // Для хеширования пин-кода
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import FaceIDInstallation from './components/FaceID';
import style from './PinCode.module.scss';
import FaceIdIcon from '/face.svg'; // Иконка Face ID
import Logout from '../Logout/Logout';
import { setPin, setSkipPin } from '../../../store/slices/userSlice';

const PinCodeInput = ({
    setPinVerified,
}: {
    setPinVerified: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
    const [firstPin, setFirstPin] = useState(''); // Первый ввод пин-кода
    const [secondPin, setSecondPin] = useState(''); // Второй ввод пин-кода
    const [isSecondInput, setIsSecondInput] = useState(false); // Флаг для второго ввода
    const [error, setError] = useState(false); // Флаг ошибки
    const [hasPin, setHasPin] = useState(false); // Флаг наличия пин-кода в localStorage
    const [faceIDRegistered, setFaceIDRegistered] = useState(
        localStorage.getItem('faceIDRegistered') === 'true'
    ); // Флаг наличия Face ID
    const [showFaceIdBanner, setShowFaceIdBanner] = useState(false);
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user);

    const isPlatformAuthenticatorSupported = async () => {
        try {
            const result = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            return result;
        } catch (error) {
            alert('Ошибка при проверке поддержки платформенного аутентификатора:');
            alert(error);
            return false;
        }
    };
    // Регистрация Face ID
    const registerFaceID = async () => {
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
                setFaceIDRegistered(true); // Обновляем состояние
                // Хешируем пин-код и сохраняем в localStorage
                const hashedPin = hashPin(firstPin);
                dispatch(setPin(hashedPin)); // Обновляем состояние пин-кода в Redux
                localStorage.setItem('pin', hashedPin);
                sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                setPinVerified('true');
                navigate('/');
            }
        } catch (error) {
            console.error('Ошибка при регистрации Face ID:', error);
            alert('Ошибка при настройке Face ID. Пожалуйста, попробуйте снова.');
        }
    };

    const skipFaceID = () => {
        localStorage.setItem('skipFaceID', 'true');
        dispatch(setSkipPin(true)); // Обновляем состояние skipPin в Redux

        const hashedPin = hashPin(firstPin);
        dispatch(setPin(hashedPin)); // Обновляем состояние пин-кода в Redux

        localStorage.setItem('pin', hashedPin);
        sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
        setPinVerified('true');
        setShowFaceIdBanner(false);
        navigate('/');
    };

    // Аутентификация с использованием Face ID
    const authenticateWithFaceID = async () => {
        try {
            const faceId = localStorage.getItem('faceID');
            if (faceId) {
                const credentialData = JSON.parse(faceId);

                const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                    challenge: crypto.getRandomValues(new Uint8Array(32)), // Генерация нового случайного challenge
                    timeout: 60000, // Таймаут 60 секунд
                    allowCredentials: [
                        {
                            id: new Uint8Array(credentialData.rawId), // Используем rawId
                            type: 'public-key',
                        },
                    ],
                    userVerification: 'required', // Требуется проверка пользователя (Face ID/Touch ID)
                    rpId: window.location.hostname, // Привязка к домену
                };

                const assertion = await navigator.credentials.get({
                    publicKey: publicKeyCredentialRequestOptions,
                });

                if (assertion && assertion instanceof PublicKeyCredential) {
                    // Проверяем, что ID аутентификатора совпадает
                    if (assertion.id === credentialData.id) {
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при аутентификации с использованием Face ID:', error);
        }
        alert('Ошибка аутентификации. Пожалуйста, попробуйте снова.');
        return false;
    };

    // Проверяем, есть ли пин-код в localStorage
    useEffect(() => {
        const storedPin = localStorage.getItem('pin');
        if (storedPin) {
            setHasPin(true); // Пин-код уже установлен
        }
    }, []);

    // Хеширование пин-кода
    const hashPin = (pin: string) => {
        return CryptoJS.SHA256(pin).toString(); // Хешируем пин-код
    };

    // Обработчик нажатия на цифру
    const handleNumberClick = (number: string) => {
        if (isSecondInput) {
            if (secondPin.length < 4) {
                setSecondPin(secondPin + number);
            }
        } else {
            if (firstPin.length < 4) {
                setFirstPin(firstPin + number);
            }
        }
    };

    // Обработчик удаления последнего символа
    const handleDeleteClick = () => {
        if (isSecondInput) {
            setSecondPin(secondPin.slice(0, -1));
        } else {
            setFirstPin(firstPin.slice(0, -1));
        }
    };

    // Проверка Face ID при наличии пин-кода и Face ID
    useEffect(() => {
        checkFaceID();
    }, [hasPin, faceIDRegistered, setPinVerified]);

    // Обработчик подтверждения пин-кода
    const handleSubmit = async () => {
        if (hasPin) {
            // Если пин-код уже есть, проверяем введённый пин-код
            const storedPin = localStorage.getItem('pin');
            const hashedPin = hashPin(firstPin);
            if (hashedPin === storedPin) {
                sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                setPinVerified('true');
            } else {
                setError(true);
                setTimeout(() => {
                    setError(false);
                    setFirstPin('');
                }, 2000); // Сбрасываем состояние через 2 секунды
            }
        } else {
            // Если пин-кода нет, переходим ко второму вводу
            if (!isSecondInput) {
                setIsSecondInput(true);
            } else {
                // Сравниваем два пин-кода
                if (firstPin === secondPin) {
                    console.log('Пин-коды совпадают');
                    // Предлагаем настроить Face ID
                    if (await isPlatformAuthenticatorSupported()) {
                        console.log('Face ID поддерживается');
                        setShowFaceIdBanner(true);
                    } else {
                        console.log('Face ID не поддерживается');
                        const hashedPin = hashPin(firstPin);
                        dispatch(setPin(hashedPin));
                        localStorage.setItem('pin', hashPin(firstPin)); // Сохраняем пин-код в localStorage
                        sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                        setPinVerified('true');
                        navigate('/');
                    }
                } else {
                    // Показываем ошибку
                    setError(true);
                    setTimeout(() => {
                        setError(false);
                        setFirstPin('');
                        setSecondPin('');
                        setIsSecondInput(false);
                    }, 2000); // Сбрасываем состояние через 2 секунды
                }
            }
        }
    };

    const checkFaceID = async () => {
        if (hasPin && faceIDRegistered) {
            const isAuthenticated = await authenticateWithFaceID();
            if (isAuthenticated) {
                sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                setPinVerified('true');
                navigate('/');
            } else {
                alert('Ошибка аутентификации с использованием Face ID.');
            }
        }
    };

    // Автоматическая проверка пин-кода после ввода 4 символов
    useEffect(() => {
        if (hasPin && firstPin.length === 4) {
            handleSubmit();
        } else if (!hasPin && isSecondInput && secondPin.length === 4) {
            handleSubmit();
        } else if (!hasPin && !isSecondInput && firstPin.length === 4) {
            handleSubmit();
        }
    }, [firstPin, hasPin, isSecondInput, secondPin]);

    return (
        <>
            {showFaceIdBanner ? (
                <FaceIDInstallation
                    onSetup={registerFaceID}
                    onSkip={skipFaceID}
                />
            ) : (
                <div className={style.pinCodeContainer}>
                    <div className={style.content}>
                        <div className={style.title}>
                            {hasPin
                                ? 'Введите пин-код для входа'
                                : isSecondInput
                                ? 'Введите пин-код повторно'
                                : 'Установите пин-код для входа'}
                        </div>
                        <div className={style.pinCodes}>
                            {/* Первый ряд точек */}
                            <div className={style.pinCode}>
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`${style.dot} ${
                                            index < firstPin.length ? style.filled : ''
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Второй ряд точек (если нужно) */}
                            <div className={style.pinCode}>
                                {!hasPin && isSecondInput && (
                                    <div
                                        className={style.pinCode}
                                        style={{
                                            color: error ? 'red' : 'inherit',
                                        }}
                                    >
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className={`${style.dot} ${
                                                    index < secondPin.length ? style.filled : ''
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Сообщение об ошибке */}
                        {error && (
                            <div
                                className={style.error}
                                style={{ color: 'red' }}
                            >
                                {hasPin ? 'Неверный пин-код' : 'Пин-коды не совпадают. Попробуйте ещё раз.'}
                            </div>
                        )}

                        {/* Кнопки с цифрами */}
                        <div className={style.numberPad}>
                            <div className={style.numberPadRow}>
                                {[1, 2, 3].map((number) => (
                                    <Button
                                        key={number}
                                        className={style.pinButton}
                                        shape='circle'
                                        type='text'
                                        onClick={() => handleNumberClick(number.toString())}
                                    >
                                        {number}
                                    </Button>
                                ))}
                            </div>
                            <div className={style.numberPadRow}>
                                {[4, 5, 6].map((number) => (
                                    <Button
                                        key={number}
                                        className={style.pinButton}
                                        shape='circle'
                                        type='text'
                                        onClick={() => handleNumberClick(number.toString())}
                                    >
                                        {number}
                                    </Button>
                                ))}
                            </div>
                            <div className={style.numberPadRow}>
                                {[7, 8, 9].map((number) => (
                                    <Button
                                        key={number}
                                        className={style.pinButton}
                                        shape='circle'
                                        type='text'
                                        onClick={() => handleNumberClick(number.toString())}
                                    >
                                        {number}
                                    </Button>
                                ))}
                            </div>
                            <div className={style.numberPadRow}>
                                <Logout
                                    className={`${style.pinButton} ${style.pinButtonExit}`}
                                    shape='circle'
                                    type='text'
                                >
                                    Выйти
                                </Logout>
                                <Button
                                    className={style.pinButton}
                                    shape='circle'
                                    type='text'
                                    onClick={() => handleNumberClick('0')}
                                >
                                    0
                                </Button>
                                {firstPin.length > 0 || secondPin.length > 0 ? (
                                    <Button
                                        className={`${style.pinButton} ${style.pinButtonDelete}`}
                                        shape='circle'
                                        danger
                                        type='text'
                                        icon={<ArrowLeftOutlined />}
                                        onClick={handleDeleteClick}
                                    />
                                ) : (
                                    <Button
                                        className={`${style.pinButton} ${style.pinButtonFaceID} ${
                                            !faceIDRegistered && style.disabled
                                        }`}
                                        shape='circle'
                                        type='text'
                                        onClick={checkFaceID}
                                        disabled={!faceIDRegistered}
                                    >
                                        {' '}
                                        <img
                                            src={FaceIdIcon}
                                            alt='Face ID Icon'
                                            style={{ width: '30px', height: '30px' }}
                                        />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Кнопка "Пропустить" (только если пин-код не установлен) */}
                        {!hasPin && !isSecondInput && (
                            <Button
                                type='text'
                                block
                                style={{ marginTop: '20px' }}
                                onClick={() => {
                                    localStorage.setItem('skipPin', 'true');
                                    dispatch(setSkipPin(true));
                                    navigate('/');
                                }}
                            >
                                Пропустить
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PinCodeInput;

import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; // Для хеширования пин-кода
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import FaceIDInstallation from './components/FaceID';

const { Title } = Typography;

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
                localStorage.setItem('pin', hashedPin);
                sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                setPinVerified('true');
                navigate('/');
                alert('Face ID успешно настроен!');
            }
        } catch (error) {
            console.error('Ошибка при регистрации Face ID:', error);
            alert('Ошибка при настройке Face ID. Пожалуйста, попробуйте снова.');
        }
    };

    const skipFaceID = () => {
        localStorage.setItem('skipFaceID', 'true');
        const hashedPin = hashPin(firstPin);
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
                alert('Аутентификация с использованием Face ID');
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
                        alert('Аутентификация прошла успешно!');
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
        const checkFaceID = async () => {
            if (hasPin && faceIDRegistered) {
                const isAuthenticated = await authenticateWithFaceID();
                if (isAuthenticated) {
                    sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                    setPinVerified('true');
                } else {
                    alert('Ошибка аутентификации с использованием Face ID.');
                }
            }
        };

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
                        // setShowFaceIdBanner(true);

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
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                    }}
                >
                    <Card style={{ width: 300, textAlign: 'center' }}>
                        <Title level={4}>
                            {hasPin
                                ? 'Введите пин-код'
                                : isSecondInput
                                ? 'Введите повторно'
                                : 'Установите пин-код'}
                        </Title>

                        {/* Первый ряд точек */}
                        <div style={{ margin: '20px 0', fontSize: '24px', letterSpacing: '10px' }}>
                            {firstPin.split('').map((_, index) => (
                                <span key={index}>•</span>
                            ))}
                        </div>

                        {/* Второй ряд точек (если нужно) */}
                        {!hasPin && isSecondInput && (
                            <div
                                style={{
                                    margin: '20px 0',
                                    fontSize: '24px',
                                    letterSpacing: '10px',
                                    color: error ? 'red' : 'inherit',
                                }}
                            >
                                {secondPin.split('').map((_, index) => (
                                    <span key={index}>•</span>
                                ))}
                            </div>
                        )}

                        {/* Сообщение об ошибке */}
                        {error && (
                            <div style={{ color: 'red', marginBottom: '10px' }}>
                                {hasPin ? 'Неверный пин-код' : 'Пин-код не совпадает. Попробуйте ещё раз.'}
                            </div>
                        )}

                        {/* Кнопки с цифрами */}
                        <Row gutter={[16, 16]}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                                <Col
                                    span={8}
                                    key={number}
                                >
                                    <Button
                                        type='primary'
                                        block
                                        onClick={() => handleNumberClick(number.toString())}
                                    >
                                        {number}
                                    </Button>
                                </Col>
                            ))}
                            <Col span={8}>
                                <Button
                                    block
                                    disabled
                                    style={{ visibility: 'hidden' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Button
                                    type='primary'
                                    block
                                    onClick={() => handleNumberClick('0')}
                                >
                                    0
                                </Button>
                            </Col>
                            <Col span={8}>
                                {(firstPin.length > 0 || secondPin.length > 0) && (
                                    <Button
                                        type='primary'
                                        block
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={handleDeleteClick}
                                    />
                                )}
                            </Col>
                        </Row>

                        {/* Кнопка "Пропустить" (только если пин-код не установлен) */}
                        {!hasPin && !isSecondInput && (
                            <Button
                                type='default'
                                block
                                style={{ marginTop: '20px' }}
                                onClick={() => {
                                    localStorage.setItem('skipPin', 'true');
                                    navigate('/');
                                }}
                            >
                                Пропустить
                            </Button>
                        )}
                    </Card>
                </div>
            )}
        </>
    );
};

export default PinCodeInput;

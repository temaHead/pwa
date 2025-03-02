import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; // Для хеширования пин-кода
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

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
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user);

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
                    authenticatorAttachment: 'platform', // Использование встроенного аутентификатора (Face ID/Touch ID)
                    userVerification: 'required', // Требуется проверка пользователя
                },
                timeout: 60000, // Таймаут 60 секунд
                attestation: 'direct',
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            });

            if (credential) {
                // Сохраняем данные в localStorage (небезопасно!)
                localStorage.setItem('faceID', JSON.stringify(credential));
                localStorage.setItem('faceIDRegistered', 'true');
                setFaceIDRegistered(true); // Обновляем состояние
                alert('Face ID успешно настроен!');
            }
        } catch (error) {
            console.error('Ошибка при регистрации Face ID:', error);
            alert('Ошибка при настройке Face ID. Пожалуйста, попробуйте снова.');
        }
    };

    // Аутентификация с использованием Face ID
    const authenticateWithFaceID = async () => {
        try {
            const faceId = localStorage.getItem('faceID');
            if (faceId) {
                const credential = JSON.parse(faceId);

                const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                    challenge: credential.response.clientDataJSON, // Используем clientDataJSON как challenge (небезопасно!)
                    timeout: 60000, // Таймаут 60 секунд
                    allowCredentials: [], // Пустой массив, чтобы разрешить любой аутентификатор
                    userVerification: 'required', // Требуется проверка пользователя (Face ID/Touch ID)
                    rpId: window.location.hostname, // Привязка к домену
                };

                const assertion = await navigator.credentials.get({
                    publicKey: publicKeyCredentialRequestOptions,
                });

                if (assertion) {
                    // Проверяем, что assertion совпадает с сохранённым credential (небезопасно!)
                    if (JSON.stringify(assertion) === faceId) {
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при аутентификации с использованием Face ID:', error);
        }
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

    // Обработчик подтверждения пин-кода
    const handleSubmit = async () => {
        if (hasPin) {
            // Если пин-код уже есть, проверяем введённый пин-код
            const storedPin = localStorage.getItem('pin');
            const hashedPin = hashPin(firstPin);
            if (hashedPin === storedPin) {
                sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                setPinVerified('true');

                // Если Face ID настроен, предлагаем аутентификацию
                if (faceIDRegistered) {
                    const isAuthenticated = await authenticateWithFaceID();
                    if (isAuthenticated) {
                        navigate('/');
                    } else {
                        alert('Ошибка аутентификации с использованием Face ID.');
                    }
                } else {
                    // Предлагаем настроить Face ID
                    const shouldRegisterFaceID = window.confirm('Хотите настроить Face ID для быстрой аутентификации?');
                    if (shouldRegisterFaceID) {
                        await registerFaceID();
                    }
                    navigate('/');
                }
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
                    // Хешируем пин-код и сохраняем в localStorage
                    const hashedPin = hashPin(firstPin);
                    localStorage.setItem('pin', hashedPin);
                    sessionStorage.setItem('pinVerified', 'true'); // Сохраняем флаг успешного ввода
                    setPinVerified('true');

                    // Предлагаем настроить Face ID
                    const shouldRegisterFaceID = window.confirm('Хотите настроить Face ID для быстрой аутентификации?');
                    if (shouldRegisterFaceID) {
                        await registerFaceID();
                    }
                    navigate('/');
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Card style={{ width: 300, textAlign: 'center' }}>
                <Title level={4}>
                    {hasPin ? 'Введите пин-код' : isSecondInput ? 'Введите повторно' : 'Установите пин-код'}
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
                        <Col span={8} key={number}>
                            <Button
                                type="primary"
                                block
                                onClick={() => handleNumberClick(number.toString())}
                            >
                                {number}
                            </Button>
                        </Col>
                    ))}
                    <Col span={8}>
                        <Button block disabled style={{ visibility: 'hidden' }} />
                    </Col>
                    <Col span={8}>
                        <Button
                            type="primary"
                            block
                            onClick={() => handleNumberClick('0')}
                        >
                            0
                        </Button>
                    </Col>
                    <Col span={8}>
                        {(firstPin.length > 0 || secondPin.length > 0) && (
                            <Button
                                type="primary"
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
                        type="default"
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
    );
};

export default PinCodeInput;
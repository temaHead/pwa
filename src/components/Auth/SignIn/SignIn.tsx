import React from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import style from './SignIn.module.scss';
import icon from '../../../assets/close-line-icon.svg';
import { setUser } from '../../../store/slices/userSlice';
import { doc, getDoc } from 'firebase/firestore';
import { Button, Form, Input, message } from 'antd';
import { saveUserToIDB } from '../../../shared/utils/idb';

const SignIn = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm(); // Хук для управления формой
    const [error, setError] = React.useState('');

    const handleSubmit = async (values: { email: string; password: string }) => {
        const { email, password } = values;

        try {
            // Вход с помощью email и пароля
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                const userId = userCredential.user.uid;

                // Получение данных пользователя из Firestore
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const user = {
                        email: userCredential.user.email,
                        id: userId,
                        token: userCredential.user.refreshToken,
                        name: userData.name || '',
                        birthDate: userData.birthDate || '',
                        currentWeight: userData.currentWeight || null,
                        initialWeight: userData.initialWeight || null,
                        desiredWeight: userData.desiredWeight || null,
                        gender: userData.gender || '',
                        height: userData.height || null,
                    };

                    // Сохранение данных пользователя в Redux
                    dispatch(setUser(user));

                    // Сохранение ID в локальное хранилище
                    window.localStorage.setItem('id', userId);

                    // Сохранение данных пользователя в IndexedDB
                    await saveUserToIDB(user);

                    // Очистка полей формы
                    form.resetFields();
                    setError('');

                    // Навигация на главную страницу
                    message.success(`Добро пожаловать, ${user.name}`);
                    navigate('/');
                } else {
                    setError('Профиль пользователя не найден');
                }
            }
        } catch (error) {
            console.log(error);
            setError('Пользователь с таким e-mail не найден');
            message.error('Ошибка при входе');
        }
    };

    return (
        <div className={style.signInPage}>
            <div className={style.header}>
                <div className={style.iconWrapper}>
                    <Link to='/start'>
                        <img
                            src={icon}
                            alt='iconCross'
                        />
                    </Link>
                </div>
            </div>
            <div className={style.title}>Авторизация</div>

            <Form
                form={form}
                className={style.form}
                onFinish={handleSubmit} // Используем onFinish вместо onSubmit
                layout='vertical'
            >
                <Form.Item
                    label='E-mail'
                    name='email'
                    rules={[
                        { required: true, message: 'Пожалуйста, введите ваш email' },
                        { type: 'email', message: 'Введите корректный email' },
                    ]}
                >
                    <Input type='email' />
                </Form.Item>

                <Form.Item
                    label='Пароль'
                    name='password'
                    rules={[
                        { required: true, message: 'Пожалуйста, введите пароль' },
                        { min: 7, message: 'Пароль должен содержать минимум 7 символов' },
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button
                        type='primary'
                        htmlType='submit'
                        className={style.button}
                    >
                        Войти
                    </Button>
                </Form.Item>
            </Form>

            {error && <div className={style.error}>{error}</div>}

            <Button
                type='text'
                onClick={() => navigate('/signUp')}
            >
                Создать аккаунт
            </Button>
        </div>
    );
};

export default SignIn;

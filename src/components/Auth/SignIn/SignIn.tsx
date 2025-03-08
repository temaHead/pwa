// src/components/Auth.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import style from './SignIn.module.scss';
import icon from '../../../assets/close-line-icon.svg';
import { setUser } from '../../../store/slices/userSlice';
import { doc, getDoc } from 'firebase/firestore';
import { Button, Form, Input } from 'antd';
import { saveUserToIDB } from '../../../shared/utils/idb';

const SignIn = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
                    setEmail('');
                    setPassword('');
                    setError('');

                    // Навигация на главную страницу
                    navigate('/');
                } else {
                    setError('Профиль пользователя не найден');
                }
            }
        } catch (error) {
            console.log(error);
            setError('Пользователь с таким e-mail не найден');
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
            <form
                className={style.form}
                onSubmit={handleSubmit}
            >
                <Form.Item>
                    <Input
                        type='email'
                        placeholder='E-mail'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name='email'
                    />
                </Form.Item>

                <Form.Item>
                    <Input.Password
                        placeholder='Пароль'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        name='password'
                    />
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
            </form>
            {error && <div className={style.error}>{error}</div>}
            <Link to='/signUp'>
                <button
                    type='button'
                    className={style.buttonSignUp}
                >
                    Создать аккаунт
                </button>
            </Link>
        </div>
    );
};

export default SignIn;

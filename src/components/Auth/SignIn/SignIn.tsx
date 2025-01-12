// src/components/Auth.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import style from './SignIn.module.scss';

import icon from '../../../assets/close-line-icon.svg';
import { setUser } from '../../../store/slices/userSlice';

const SignIn = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                console.log(userCredential);
                dispatch(
                    setUser({
                        email: userCredential.user.email,
                        id: userCredential.user.uid,
                        token: userCredential.user.refreshToken,
                    })
                );
                window.localStorage.setItem('id', userCredential.user.uid);

                setEmail('');
                setPassword('');
                setError('');
                navigate('/');
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
                <input
                    className={style.input}
                    type='email'
                    placeholder='E-mail'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    className={style.input}
                    type='password'
                    placeholder='Пароль'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    className={style.buttonSubmit}
                    type='submit'
                >
                    {' '}
                    Login
                </button>
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

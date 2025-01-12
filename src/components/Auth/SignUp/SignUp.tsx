// src/components/Auth.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../store/slices/userSlice';
import style from './SignUp.module.scss';
import icon from '../../../assets/close-line-icon.svg';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SignUp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPassConfirm] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            setError('Пароли не совпадают');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                console.log(userCredential);
                const { email, uid } = userCredential.user;
                try {
                    await setDoc(doc(db, 'users', uid), {
                        email: email,
                        name: 'name',
                        uid: uid,
                    });
                    // Теперь проверим, что документ действительно был добавлен в Firestore
                    const userDocRef = doc(db, 'users', uid);
                    const userDoc = await getDoc(userDocRef);
                    console.log(userDoc);

                    if (userDoc.exists()) {
                        console.log('Пользователь успешно добавлен в Firestore:', userDoc.data());
                    } else {
                        console.log('Не удалось найти пользователя в Firestore');
                    }
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
                    setPassConfirm('');
                    setError('');
                    navigate('/');
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={style.signUpPage}>
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
            <div className={style.title}>Регистрация</div>

            <form
                className={style.form}
                onSubmit={handleSubmit}
            >
                <input
                    className={style.input}
                    type='email'
                    placeholder='Email'
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
                <input
                    className={style.input}
                    type='password'
                    placeholder='Повторите пароль'
                    value={passwordConfirm}
                    onChange={(e) => setPassConfirm(e.target.value)}
                    required
                />
                <button
                    className={style.buttonSubmit}
                    type='submit'
                >
                    {' '}
                    Зарегистрироваться
                </button>
            </form>
            {error && <div className={style.error}>{error}</div>}
            <Link to='/signIn'>
                <button
                    type='button'
                    className={style.buttonSignIn}
                >
                    У меня уже есть аккаунт
                </button>
            </Link>
        </div>
    );
};

export default SignUp;

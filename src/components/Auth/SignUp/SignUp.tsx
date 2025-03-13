import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../store/slices/userSlice';
import style from './SignUp.module.scss';
import icon from '../../../assets/close-line-icon.svg';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button, Form, Input, message } from 'antd';
import { saveUserToIDB } from '../../../shared/utils/idb';

const SignUp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm(); // Хук для управления формой
    const [error, setError] = useState('');

    const handleSubmit = async (values: { email: string; password: string; passwordConfirm: string }) => {
        const { email, password, passwordConfirm } = values;

        // Проверка совпадения паролей
        if (password !== passwordConfirm) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential) {
                const { email, uid } = userCredential.user;
                try {
                    await setDoc(doc(db, 'users', uid), {
                        email: email,
                        id: uid,
                    });

                    // Проверка, что документ был добавлен в Firestore
                    const userDocRef = doc(db, 'users', uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        console.log('Пользователь успешно добавлен в Firestore:', userDoc.data());
                    } else {
                        console.log('Не удалось найти пользователя в Firestore');
                    }

                    dispatch(
                        setUser({
                            email: userCredential.user.email,
                            id: userCredential.user.uid,
                        })
                    );

                    // Сохранение данных пользователя в IndexedDB
                    await saveUserToIDB(userDoc.data());

                    window.localStorage.setItem('id', userCredential.user.uid);
                    setError('');
                    message.success('Регистрация прошла успешно!');
                    window.location.reload();
                } catch (error) {
                    console.log(error);
                    message.error('Ошибка при добавлении пользователя в Firestore');
                }
            }
        } catch (error) {
            console.log(error);
            message.error('Ошибка при регистрации');
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

                <Form.Item
                    label='Повторите пароль'
                    name='passwordConfirm'
                    dependencies={['password']} // Зависимость от поля password
                    rules={[
                        { required: true, message: 'Пожалуйста, повторите пароль' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Пароли не совпадают'));
                            },
                        }),
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <button
                        className={style.buttonSubmit}
                        type='submit'
                    >
                        Зарегистрироваться
                    </button>
                </Form.Item>
            </Form>

            {error && <div className={style.error}>{error}</div>}

            <Button
                type='text'
                onClick={() => navigate('/signIn')}
            >
                У меня уже есть аккаунт
            </Button>
        </div>
    );
};

export default SignUp;

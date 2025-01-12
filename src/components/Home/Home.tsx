import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import style from './Home.module.scss';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import Header from './components/Header/Header';
import NavBar from './components/NavBar/NavBar';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/userSlice';
const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const id = window.localStorage.getItem('id');
    const [isAuth, setIsAuth] = useState<boolean>(false);

    useEffect(() => {
        // Проверяем, есть ли id в localStorage
        if (!id) {
            navigate('/start');
        } else {
            // Устанавливаем слушатель на состояние авторизации
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser && firebaseUser.uid === id) {
                    try {
                        // Загружаем данные пользователя из Firestore
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            // Обновляем состояние с данными пользователя
                            dispatch(
                                setUser({
                                    email: firebaseUser.email,
                                    id: firebaseUser.uid,
                                    token: firebaseUser.refreshToken,
                                    name: userDoc.data()?.name || null,
                                    birthDate: userDoc.data()?.birthDate || null,
                                    currentWeight: userDoc.data()?.currentWeight || null,
                                    initialWeight: userDoc.data()?.initialWeight || null,
                                    desiredWeight: userDoc.data()?.desiredWeight || null,
                                    gender: userDoc.data()?.gender || null,
                                    height: userDoc.data()?.height || null,
                                })
                            );
                            setIsAuth(true);
                        } else {
                            console.log('Документ пользователя не найден в базе данных');
                        }
                    } catch (error) {
                        console.error('Ошибка при загрузке данных пользователя:', error);
                    }
                } else {
                    console.log('Пользователь не авторизован или id не совпадает');
                    window.localStorage.removeItem('id');
                }
            });

            // Очистка при размонтировании компонента
            return () => unsubscribe();
        }
    }, [id]);

    if (!isAuth) {
        return null;
    }

    return (
        <div className={style.homePage}>
            <Header />
            <Outlet />
            <NavBar />
        </div>
    );
};

export default Home;

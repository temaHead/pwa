// src/components/Auth.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './Home.module.scss';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import Header from './components/Header/Header';
import Desktop from './components/Desktop/Desktop';
import NavBar from './components/NavBar/NavBar';
interface User {
    email: string | null;
    id: string;
    token: string;
    name: string;
}
const Home = () => {
    const navigate = useNavigate();

    const id = window.localStorage.getItem('id');
    const [user, setUser] = useState<User | null>(null);

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
                            setUser({
                                email: firebaseUser.email,
                                id: firebaseUser.uid,
                                token: firebaseUser.refreshToken,
                                name: userDoc.data()?.name || 'Без имени',
                            });
                        } else {
                            console.log('Документ пользователя не найден в базе данных');
                        }
                    } catch (error) {
                        console.error('Ошибка при загрузке данных пользователя:', error);
                    }
                } else {
                    console.log('Пользователь не авторизован или id не совпадает');
                }
            });

            // Очистка при размонтировании компонента
            return () => unsubscribe();
        }
    }, [id, navigate]);

    if (!user) {
        return null;
    }

    return (
        <div className={style.homePage}>
            <Header name= {user.name}/>
            <Desktop/>
            <NavBar/>
        </div>
    );
};

export default Home;

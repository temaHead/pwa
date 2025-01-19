import './App.css';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import SignIn from './components/Auth/SignIn/SignIn';
import SignUp from './components/Auth/SignUp/SignUp';
import './firebase';
import Home from './components/Home/Home';
import Start from './components/Start/Start';
import Room from './components/Home/components/Room/Room';
import Measurements from './components/Home/components/Measurements/Measurements';
import Profile from './components/Home/components/Profile/Profile';
import Desktop from './components/Home/components/Desktop/Desktop';
import EditProfile from './components/Home/components/Profile/components/EditProfile/EditProfile';
import AddUser from './components/Auth/SignUp/components/AddUser/AddUser';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setUser } from './store/slices/userSlice';
import { auth, db } from './firebase';

function App() {
    const user = useSelector((state: RootState) => state.user);

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
    }, [dispatch, id, navigate]);

    if (!isAuth) {
        return null;
    }
    return (
        <Routes>
            <Route
                path='/'
                element={user && user.currentWeight ? <Home /> : <Navigate to='/addUser' />}
            >
                <Route
                    path=''
                    element={<Desktop />}
                >
                    <Route
                        index
                        element={<Room />}
                    />
                    <Route
                        path='room'
                        element={<Room />}
                    />
                    <Route
                        path='/measurements'
                        element={<Measurements />}
                    />
                    <Route
                        path='/profile'
                        element={<Profile />}
                    />
                    <Route
                        path='/editProfile'
                        element={<EditProfile />}
                    />
                </Route>
            </Route>
            <Route
                path='/start'
                element={<Start />}
            />
            <Route
                path='/signIn'
                element={<SignIn />}
            />
            <Route
                path='/signUp'
                element={<SignUp />}
            />
            <Route
                path='/addUser'
                element={user && user.currentWeight ? <Navigate to='/' /> : <AddUser />}
            />
        </Routes>
    );
}

export default App;

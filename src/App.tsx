import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import './firebase';
import Home from './components/Home/Home';
import Start from './components/Start/Start';
import Room from './components/Home/components/Room/Room';
import Measurements from './components/Home/components/Measurements/Measurements';
import Desktop from './components/Home/components/Desktop/Desktop';
import EditProfile from './components/Home/components/Profile/components/EditProfile/EditProfile';
import AddUser from './components/Auth/SignUp/components/AddUser/AddUser';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { lazy, Suspense, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setUser } from './store/slices/userSlice';
import { auth, db } from './firebase';
import LoadingSpinner from './shared/components/LoadingSpinner/LoadingSpinner';
import AddGoal from './components/Home/components/Profile/components/Goals/components/AddGoal/AddGoal';

const SignIn = lazy(() => import('./components/Auth/SignIn/SignIn'));
const SignUp = lazy(() => import('./components/Auth/SignUp/SignUp'));
const Profile= lazy(() => import('./components/Home/components/Profile/Profile'));

function App() {
    const user = useSelector((state: RootState) => state.user);

    const dispatch = useDispatch();

    const id = window.localStorage.getItem('id');
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Добавляем состояние загрузки

    useEffect(() => {
        setLoading(true); // Запускаем загрузку
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser && firebaseUser.uid === id) {
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
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
                    }
                } catch (error) {
                    console.error('Ошибка при загрузке данных пользователя:', error);
                }
            } else {
                setIsAuth(false);
                window.localStorage.removeItem('id');
            }
            setLoading(false); // Завершаем загрузку
        });

        return () => unsubscribe();
    }, [dispatch, id]);

    if (loading) {
        return <LoadingSpinner />; // Показываем индикатор загрузки
    }

    return (
        <Routes>
            <Route
                path='/'
                element={
                    !loading ? (
                        isAuth ? (
                            user?.currentWeight ? (
                                <Home />
                            ) : (
                                <Navigate to='/addUser' />
                            )
                        ) : (
                            <Navigate to='/start' />
                        )
                    ) : (
                    <LoadingSpinner />
                    )
                }
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
                    <Route
                        path='/addGoal'
                        element={<AddGoal />}
                    />
                </Route>
            </Route>
            <Route
                path='/start'
                element={isAuth ? <Navigate to='/' /> : <Start />}
            />
            <Route
                path='/signIn'
                element={
                    isAuth ? (
                        <Navigate to='/' />
                    ) : (
                        <Suspense fallback={<LoadingSpinner />}>
                            <SignIn />
                        </Suspense>
                    )
                }
            />
            <Route
                path='/signUp'
                element={
                    isAuth ? (
                        <Navigate to='/' />
                    ) : (
                        <Suspense fallback={<LoadingSpinner />}>
                            <SignUp />
                        </Suspense>
                    )
                }
            />
            <Route
                path='/addUser'
                element={user && user.currentWeight ? <Navigate to='/' /> : <AddUser />}
            />
        </Routes>
    );
}

export default App;

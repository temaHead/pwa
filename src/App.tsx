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
import GoalEditing from './components/Home/components/Profile/components/Goals/components/GoalEditing/GoalEditing';
import { ConfigProvider, ThemeConfig } from 'antd'; // Импорт Ant Design ConfigProvider
import ruRU from 'antd/locale/ru_RU'; // Локализация Ant Design на русский

const SignIn = lazy(() => import('./components/Auth/SignIn/SignIn'));
const SignUp = lazy(() => import('./components/Auth/SignUp/SignUp'));
const Profile = lazy(() => import('./components/Home/components/Profile/Profile'));

function App() {
    const user = useSelector((state: RootState) => state.user);
    const themeMode = useSelector((state: RootState) => state.user.theme); // Получаем тему из Redux

    const themeConfig: ThemeConfig = {
        token: {
            colorPrimary: themeMode === 'dark' ? '#1890ff' : '#1677ff', 
            colorBgBase: themeMode === 'dark' ? '#131720' : '#ffffff',
            colorTextBase: themeMode === 'dark' ? '#ffffff' : '#000000',
            colorBgLayout: themeMode === 'dark' ? '#131720' : '#edf2f5',
            colorBgContainer: themeMode === 'dark' ? '#1f2636' : '#ffffff',
            colorPrimaryActive: themeMode === 'dark' ? '#1890ff' : '#e9e9e9',
            colorIcon: themeMode === 'dark' ? '#b7b8bc' : '#bebfc1',
        },
    };

    const dispatch = useDispatch();
    const id = window.localStorage.getItem('id');
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Состояние загрузки

    useEffect(() => {
        setLoading(true);
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
                                bodyFat: userDoc.data()?.bodyFat || null,
                                theme: userDoc.data()?.theme || 'light', // Загружаем тему
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
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dispatch, id]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <ConfigProvider
            locale={ruRU}
            theme={themeConfig}
        >
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
                    <Route path='' element={<Desktop />}>
                        <Route index element={<Room />} />
                        <Route path='room' element={<Room />} />
                        <Route path='/measurements' element={<Measurements />} />
                        <Route path='/profile' element={<Profile />} />
                        <Route path='/editProfile' element={<EditProfile />} />
                        <Route path='/addGoal' element={<AddGoal />} />
                        <Route path='/goalEditing/:goalId' element={<GoalEditing />} />
                    </Route>
                </Route>
                <Route path='/start' element={isAuth ? <Navigate to='/' /> : <Start />} />
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
                <Route path='/addUser' element={user && user.currentWeight ? <Navigate to='/' /> : <AddUser />} />
            </Routes>
        </ConfigProvider>
    );
}

export default App;

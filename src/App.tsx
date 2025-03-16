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
import { lazy, Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setUser } from './store/slices/userSlice';
import { auth, db } from './firebase';
import LoadingSpinner from './shared/components/LoadingSpinner/LoadingSpinner';
import AddGoal from './components/Home/components/Profile/components/Goals/components/AddGoal/AddGoal';
import GoalEditing from './components/Home/components/Profile/components/Goals/components/GoalEditing/GoalEditing';
import { ConfigProvider, ThemeConfig } from 'antd'; // Импорт Ant Design ConfigProvider
import ruRU from 'antd/locale/ru_RU'; // Локализация Ant Design на русский
import PinCodeInput from './components/Auth/PinCode/PinCode';
import Settings from './components/Home/components/Profile/components/Settings/Settings';
import { deleteUserFromIDB, getUserFromIDB, saveUserToIDB } from './shared/utils/idb';

const SignIn = lazy(() => import('./components/Auth/SignIn/SignIn'));
const SignUp = lazy(() => import('./components/Auth/SignUp/SignUp'));
const Profile = lazy(() => import('./components/Home/components/Profile/Profile'));

function App() {
    const user = useSelector((state: RootState) => state.user);
    const themeMode = user.theme; // Получаем тему из Redux
    const pin = user.pin; // Получаем пин-код из Redux
    const skipPin = user.skipPin; // Получаем skipPin из Redux

    // Мемоизация конфигурации темы
    const themeConfig: ThemeConfig = useMemo(
        () => ({
            token: {
                colorPrimary: themeMode === 'dark' ? '#1890ff' : '#1677ff',
                colorBgBase: themeMode === 'dark' ? '#131720' : '#ffffff',
                colorTextBase: themeMode === 'dark' ? '#ffffff' : '#000000',
                colorBgLayout: themeMode === 'dark' ? '#131720' : '#edf2f5',
                colorBgContainer: themeMode === 'dark' ? '#1f2636' : '#ffffff',
                colorPrimaryActive: themeMode === 'dark' ? '#1890ff' : '#e9e9e9',
                colorIcon: themeMode === 'dark' ? '#b7b8bc' : '#bebfc1',
                colorLinkActive: themeMode === 'dark' ? '#d8ce04' : '#2196f3',
                colorInfoTextActive: themeMode === 'dark' ? '#d8ce04' : '#2196f3',
            },
        }),
        [themeMode]
    );

    const dispatch = useDispatch();
    const id = window.localStorage.getItem('id');
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true); // Состояние загрузки
    const [pinVerified, setPinVerified] = useState(sessionStorage.getItem('pinVerified'));

    // Мемоизация функции загрузки пользователя
    const loadUser = useCallback(async () => {
        const userFromIDB = await getUserFromIDB();
    
        if (userFromIDB) {
            dispatch(setUser(userFromIDB));
            setIsAuth(true);
            setLoading(false); // ✅ Скрываем лоадер сразу после IndexedDB
        }
    
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser || firebaseUser.uid !== id) {
                setIsAuth(false);
                localStorage.clear();
                sessionStorage.clear();
                await deleteUserFromIDB();
                setLoading(false);
                return;
            }
    
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
    
                if (userDoc.exists()) {
                    const userData = {
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
                        theme: localStorage.getItem('theme') || 'light',
                    };
    
                    if (JSON.stringify(userFromIDB) !== JSON.stringify(userData)) {
                        dispatch(setUser(userData));
                        await saveUserToIDB(userData);
                    }
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
            }
    
            setLoading(false);
        });
    
        return () => unsubscribe();
    }, [dispatch, id, setIsAuth]);

    useEffect(() => {
        setLoading(true);
        loadUser();
    }, [loadUser]);

    useEffect(() => {
        console.log('isAuth:', isAuth);
        console.log('user:', user);
        console.log('loading:', loading);
    }, [isAuth, user, loading, dispatch]);

    useEffect(() => {
        const handleFocusIn = () => {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        };
    
        const handleFocusOut = () => {
            setTimeout(() => {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }, 300); // Даем время клавиатуре скрыться
        };
    
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
    
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
        };
    }, []);
    

    // Мемоизация маршрутов
    const routes = useMemo(
        () => (
            <Routes>
                <Route
                    path='/'
                    element={
                        !loading ? (
                            isAuth ? (
                                user.name ? (
                                    (pin && pinVerified) || skipPin ? (
                                        <Home />
                                    ) : (
                                        <Navigate to='/pin' />
                                    )
                                ) : (
                                    <Navigate to='/addUser' />
                                )
                            ) : (
                                <Navigate to='/start' />
                            )
                        ) : (
                            <div>'loading'</div>
                        )
                    }
                >
                    <Route
                        path=''
                        element={<Desktop />}
                    >
                        <Route
                            index
                            element={
                                <Navigate
                                    to='/measurements'
                                    replace
                                />
                            }
                        />
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
                        <Route
                            path='/goalEditing/:goalId'
                            element={<GoalEditing />}
                        />
                        <Route
                            path='/settings'
                            element={<Settings />}
                        />
                    </Route>
                </Route>
                <Route
                    path='/pin'
                    element={
                        (pin && pinVerified) || skipPin ? (
                            <Navigate to='/' />
                        ) : (
                            <PinCodeInput setPinVerified={setPinVerified} />
                        )
                    }
                />
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
                    element={isAuth ? <AddUser /> : <Navigate to='/' />}
                />
            </Routes>
        ),
        [loading, isAuth, user, pin, pinVerified, skipPin]
    );

    return (
        <ConfigProvider
            locale={ruRU}
            theme={themeConfig}
        >
            {loading ? <LoadingSpinner /> : routes}
        </ConfigProvider>
    );
}

export default App;

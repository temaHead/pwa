import { doc, getDoc } from 'firebase/firestore';
import { setUser } from '../store/slices/userSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

// Функция для получения данных пользователя из Firestore
const getUserData = async (LocalUid: string) => {
    onAuthStateChanged(auth, async(firebaseUser)=>{
        if(firebaseUser && firebaseUser.uid === LocalUid){
            try {
                console.log(db)
                const userDocRef = doc(db, 'users', firebaseUser.uid); // Проверяем, что uid действительно передается
                console.log(userDocRef)
                const userDoc = await getDoc(userDocRef);
                console.log(userDoc)
                                if (userDoc.exists()) {
                    setUser({
                        email: firebaseUser.email,
                        id: firebaseUser.uid,
                        token: firebaseUser.refreshToken,
                        name: userDoc.data()?.name || 'Без имени',
                    });
                    return firebaseUser
                } else {
                    console.log('Документ пользователя не найден в базе данных');
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error);
            }
        }

    })

};
export default getUserData;
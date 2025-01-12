import { doc, DocumentData, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UserProfile {
    name: string | null;
    birthDate: string | null; // Или используйте Date, если хотите работать с датой как объектом
    currentWeight: number | null;
    initialWeight: number | null;
    desiredWeight: number | null;
    gender: string | null;
    height: number | null;
  }

export async function updateUserProfile(profile: UserProfile, id: string): Promise<DocumentData> {
    try {
        const userRef = doc(db, 'users', id);
         await setDoc(userRef, profile, { merge: true });
         const newData = await getDoc(userRef);
        return newData.data() as DocumentData;
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        throw error;
    }
}

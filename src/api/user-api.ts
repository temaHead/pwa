import { doc, DocumentData, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FatMeasuring, UserProfile } from '../types';
import { addFatMeasuring, addGoal, addWeightMeasuring } from './measurement-api';

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

export async function addUserProfile(
    profile: UserProfile,
    id: string,
    fatMeasuring?: FatMeasuring
): Promise<DocumentData> {
    try {
        const userRef = doc(db, 'users', id);
        await setDoc(userRef, profile);
        const newData = await getDoc(userRef);
        if (profile.desiredWeight) {
            await addGoal(profile.desiredWeight, id);
        }
        if (profile.bodyFat && fatMeasuring) {
            await addFatMeasuring(profile.bodyFat, fatMeasuring, id);
        }
        if (profile.currentWeight) {
            await addWeightMeasuring(profile.currentWeight, id);
        }
        return newData.data() as DocumentData;
    } catch (error) {
        console.error('Ошибка добавления профиля:', error);
        throw error;
    }
}

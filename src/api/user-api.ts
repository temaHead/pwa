import {
    addDoc,
    collection,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { FatMeasuring, FatMeasuringData, UserProfile, WeightMeasuringData } from '../types';

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

// Функция для добавления замеров жира в коллекцию FatMeasuring
export async function addFatMeasuring(bodyFat: number, fatMeasuring: FatMeasuring, userId: string) {
    try {
        const fatMeasuringRef = collection(db, 'fatMeasuring');
        await addDoc(fatMeasuringRef, {
            userId,
            bodyFat,
            measurements: fatMeasuring,
            timestamp: new Date(), // Сохраняем текущую дату для замера
        });
        console.log('Замеры жира успешно добавлены');
    } catch (error) {
        console.error('Ошибка добавления замеров жира:', error);
        throw error;
    }
}

// Функция для добавления замеров веса в коллекцию WeightMeasuring
export async function addWeightMeasuring(weight: number, userId: string) {
    try {
        const weightMeasuringRef = collection(db, 'weightMeasuring');
        await addDoc(weightMeasuringRef, {
            userId,
            weight,
            timestamp: new Date(), // Сохраняем текущую дату для замера
        });
        console.log('Замеры веса успешно добавлены');
    } catch (error) {
        console.error('Ошибка добавления замеров веса:', error);
        throw error;
    }
}

// Функция для добавления цели в коллекцию Goals
export async function addGoal(goal: unknown, userId: string) {
    try {
        const goalRef = collection(db, 'goals');
        await addDoc(goalRef, {
            userId,
            goal,
            timestamp: new Date(), // Сохраняем текущую дату для цели
        });
        console.log('Цель успешно добавлена');
    } catch (error) {
        console.error('Ошибка добавления цели:', error);
        throw error;
    }
}

// Функция для получения всех замеров жира из коллекции FatMeasuring
export async function getAllFatMeasuring(userId: string): Promise<FatMeasuringData[]> {
    try {
        const q = query(collection(db, 'fatMeasuring'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const fatMeasuringData = querySnapshot.docs.map((doc) => doc.data() as FatMeasuringData);
        return fatMeasuringData;
    } catch (error) {
        console.error('Ошибка получения замеров жира:', error);
        throw error;
    }
}

// Функция для получения всех замеров веса из коллекции WeightMeasuring
export async function getAllWeightMeasuring(userId: string): Promise<WeightMeasuringData[]> {
    try {
        const q = query(collection(db, 'weightMeasuring'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const weightMeasuringData = querySnapshot.docs.map((doc) => doc.data() as WeightMeasuringData);
        return weightMeasuringData;
    } catch (error) {
        console.error('Ошибка получения замеров веса:', error);
        throw error;
    }
}

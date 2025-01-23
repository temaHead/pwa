import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { BodyMeasuring, BodyMeasuringData, FatMeasuring, FatMeasuringData, WeightMeasuringData } from "../types";
import { db } from "../firebase";
import dayjs from "dayjs";

// Функция для добавления замеров жира в коллекцию FatMeasuring
export async function addFatMeasuring(
    bodyFat: number,
    fatMeasuring: FatMeasuring,
    userId: string,
    timestamp?: string
): Promise<FatMeasuringData> {
    try {
        const fatMeasuringRef = collection(db, 'fatMeasuring');
        const formattedTimestamp = timestamp ?? dayjs().format('DD.MM.YYYY HH:mm');
        const docRef =await addDoc(fatMeasuringRef, {
            userId,
            bodyFat,
            measurements: fatMeasuring,
            timestamp: formattedTimestamp,
        });
        console.log('Замеры жира успешно добавлены');
        return {
            id: docRef.id,
            bodyFat,
            measurements: fatMeasuring,
            timestamp: formattedTimestamp,
        };
    } catch (error) {
        console.error('Ошибка добавления замеров жира:', error);
        throw error;
    }
}

export async function updateFatMeasuring(
    id: string,
    measurements: FatMeasuring,
    bodyFat: number | null
): Promise<void> {
    try {
        const docRef = doc(db, 'fatMeasuring', id);
        await updateDoc(docRef, { measurements, bodyFat });
        console.log('Замеры жира успешно обновлены');
    } catch (error) {
        console.error('Ошибка обновления замеров жира:', error);
        throw error;
    }
}


// Функция для добавления замеров веса в коллекцию WeightMeasuring
export async function addWeightMeasuring(
    weight: number,
    userId: string,
    timestamp?: string
): Promise<WeightMeasuringData> {
    try {
        const weightMeasuringRef = collection(db, 'weightMeasuring');
        const formattedTimestamp = timestamp ?? dayjs().format('DD.MM.YYYY HH:mm');

        const docRef = await addDoc(weightMeasuringRef, {
            userId,
            weight,
            timestamp: formattedTimestamp,
        });
        console.log('Замеры веса успешно добавлены');
        return {
            id: docRef.id,
            weight,
            timestamp: formattedTimestamp,
        };
    } catch (error) {
        console.error('Ошибка добавления замеров веса:', error);
        throw error;
    }
}

// Функция для обновления замеров веса в коллекции WeightMeasuring
export async function updateWeightMeasuring(
    id: string,
    weight: number | null
): Promise<void> {
    try {
        const docRef = doc(db, 'weightMeasuring', id);
        await updateDoc(docRef, { weight });
        console.log('Замеры веса успешно обновлены');
    } catch (error) {
        console.error('Ошибка обновления замеров веса:', error);
        throw error;
    }
}

// Функция для добавления измерения лентой
export async function addBodyMeasuring(
    bodyMeasuring: BodyMeasuring,
    userId: string,
    timestamp?: string
): Promise<BodyMeasuringData> {
    try {
        const bodyMeasuringRef = collection(db, 'bodyMeasuring');
        const formattedTimestamp = timestamp ?? dayjs().format('DD.MM.YYYY HH:mm');
         const docRef =await addDoc(bodyMeasuringRef, {
            userId,
            bodyMeasuring,
            timestamp: formattedTimestamp,
        });
        console.log('Измерение лентой успешно добавлено');
        return {
            id: docRef.id,
            measurements: bodyMeasuring,
            timestamp: formattedTimestamp,
        };
    } catch (error) {
        console.error('Ошибка добавления измерения лентой:', error);
        throw error;
    }
}

 export async function updateBodyMeasuring(
    id: string,
    measurements: BodyMeasuring
 ): Promise<void> {
    try {
        const docRef = doc(db, 'bodyMeasuring', id);
        await updateDoc(docRef, { measurements });
        console.log('Измерение лентой успешно обновлено');
    }catch (error) {
        console.error('Ошибка обновления измерения лентой:', error);
        throw error;
    
    }
} 

// Функция для добавления цели в коллекцию Goals
export async function addGoal(goal: unknown, userId: string) {
    try {
        const goalRef = collection(db, 'goals');
        const formattedTimestamp = dayjs().format('DD.MM.YYYY HH:mm');

        await addDoc(goalRef, {
            userId,
            goal,
            timestamp: formattedTimestamp,
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

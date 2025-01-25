import dayjs from 'dayjs';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Goal, GoalData } from '../types';

export async function addGoal(userId: string, goal: Goal, timestamp?: string): Promise<GoalData> {
    try {
        const goalsRef = collection(db, 'goals');
        const formattedTimestamp = timestamp ?? dayjs().format('YYYY-MM-DD');

        const docRef = await addDoc(goalsRef, {
            userId,
            goal,
            timestamp: formattedTimestamp,
        });
        console.log('Цель успешно добавлена');
        return {
            id: docRef.id,
            goal,
            timestamp: formattedTimestamp,
        };
    } catch (error) {
        console.error('Ошибка добавления цели:', error);
        throw error;
    }
}

export async function updateGoal(id: string, goal: Goal, timestamp?: string): Promise<void> {
    try {
        const docRef = doc(db, 'goals', id);
        await updateDoc(docRef, { goal, timestamp });
        console.log('Цель успешно обновлена');
    } catch (error) {
        console.error('Ошибка обновления цели:', error);
    }
}

export async function deleteGoal(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'goals', id);
        await deleteDoc(docRef);
        console.log('Цель успешно удалена');
    } catch (error) {
        console.error('Ошибка удаления цели:', error);
    }
}

export async function getAllGoals(userId: string): Promise<GoalData[]> {
    try {
        const q = query(collection(db, 'goals'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const goalsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as GoalData[];
        return goalsData;
    } catch (error) {
        console.error('Ошибка получения целей:', error);
        throw error;
    }
}

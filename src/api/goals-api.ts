import dayjs from 'dayjs';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Goal, GoalData } from '../types';

export async function addGoal(userId: string, goal: Goal, timestamp?: string): Promise<GoalData> {
    try {
        const goalsRef = collection(db, 'goals');
        const formattedTimestamp = timestamp ?? dayjs().format('YYYY-MM-DD');
           // Формируем объект данных для записи в базу
           const goalData: Partial<Goal> & {
            startDate: string;
            endDate: string;
            type: 'weight' | 'fat' | '';
            status: 'active' | 'done' | 'failed' | 'pending' | 'success' | 'initial';
            timestamp: string;
        } = {
            startDate: goal.startDate,
            endDate: goal.endDate,
            type: goal.type,
            status: goal.status,
            timestamp: formattedTimestamp,
        };

        // Добавляем поля в зависимости от типа цели
        if (goal.type === 'weight') {
            goalData.currentWeight = goal.currentWeight || null;
            goalData.desiredWeight = goal.desiredWeight || null;
            goalData.initialWeight = goal.initialWeight || null;
        } else if (goal.type === 'fat') {
            goalData.currentFat = goal.currentFat || null;
            goalData.desiredFat = goal.desiredFat || null;
            goalData.initialFat = goal.initialFat || null;
        }

        const docRef = await addDoc(goalsRef, {
             goal: goalData as Goal,
              timestamp: formattedTimestamp,
              userId,
             });
        console.log('Цель успешно добавлена');
        return {
            id: docRef.id,
            goal: goalData as Goal, // Приводим тип к Goal
            timestamp: formattedTimestamp,
        };
    } catch (error) {
        console.error('Ошибка добавления цели:', error);
        throw error;
    }
}

export async function updateGoal(id: string, goal: Goal): Promise<void> {
    try {
        const docRef = doc(db, 'goals', id);
        await updateDoc(docRef, { goal });
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

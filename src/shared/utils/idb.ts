// src/utils/idb.js
import { openDB } from 'idb';

// Открытие базы данных для конкретной сущности
const openDBForEntity = async (dbName: string) => {
    return openDB(dbName, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('data')) {
                db.createObjectStore('data');
            }
        },
    });
};

// Сохранение данных для конкретной сущности
export const saveEntityToIDB = async (dbName: string, data: unknown) => {
    const db = await openDBForEntity(dbName);
    await db.put('data', data, 'currentData');
};

// Получение данных для конкретной сущности
export const getEntityFromIDB = async (dbName: string) => {
    const db = await openDBForEntity(dbName);
    return db.get('data', 'currentData');
};

// Удаление данных для конкретной сущности
export const deleteEntityFromIDB = async (dbName: string) => {
    const db = await openDBForEntity(dbName);
    await db.delete('data', 'currentData');
};

// Функции для работы с пользователем (оставляем как есть)
const openUserDB = async () => {
    return openDB('userStore', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('user')) {
                db.createObjectStore('user');
            }
        },
    });
};

export const saveUserToIDB = async (userData: unknown) => {
    const db = await openUserDB();
    await db.put('user', userData, 'currentUser');
};

export const getUserFromIDB = async () => {
    const db = await openUserDB();
    return db.get('user', 'currentUser');
};

export const deleteUserFromIDB = async () => {
    const db = await openUserDB();
    await db.delete('user', 'currentUser');
};

interface Measurements {
    chest?: number | null; // Грудь
    abdomen?: number | null; // Живот
    thigh?: number | null; // Бедро
    tricep?: number | null; // Трицепс
    waist?: number | null; // Талия
}

/**
 * Проверяет корректность измерений
 * @param gender Пол пользователя
 * @param measurements Объект с измерениями кожных складок
 */
function validateMeasurements(gender: string, measurements: Measurements): void {
    const requiredFields = gender === 'male' ? ['chest', 'abdomen', 'thigh'] : ['tricep', 'thigh', 'waist'];

    for (const field of requiredFields) {
        if (!measurements[field as keyof Measurements]) {
            throw new Error(
                `Для ${gender === 'male' ? 'мужчин' : 'женщин'} необходимо указать: ${requiredFields.join(
                    ', '
                )}.`
            );
        }
    }
}

/**
 * Расчет плотности тела для мужчин
 * @param sumOfSkinFolds Сумма толщины кожных складок
 * @param age Возраст
 * @returns Плотность тела
 */
function calculateMaleBodyDensity(sumOfSkinFolds: number, age: number): number {
    return 1.10938 - 0.0008267 * sumOfSkinFolds + 0.0000016 * Math.pow(sumOfSkinFolds, 2) - 0.0002574 * age;
}

/**
 * Расчет плотности тела для женщин
 * @param sumOfSkinFolds Сумма толщины кожных складок
 * @param age Возраст
 * @returns Плотность тела
 */
function calculateFemaleBodyDensity(sumOfSkinFolds: number, age: number): number {
    return 1.0994921 - 0.0009929 * sumOfSkinFolds + 0.0000023 * Math.pow(sumOfSkinFolds, 2) - 0.0001392 * age;
}

/**
 * Основная функция для расчета процента жира в организме
 * @param gender Пол пользователя: "male" или "female"
 * @param measurements Объект с измерениями кожных складок в миллиметрах
 * @param age Возраст пользователя
 * @returns Процент жира в организме
 */
export function calculateBodyFat(gender: string, measurements: Measurements, birthDate: string): number {
    validateMeasurements(gender, measurements);
    const age = calculateAge(birthDate);

    const sumOfSkinFolds =
        gender === 'male'
            ? (measurements.chest || 0) + (measurements.abdomen || 0) + (measurements.thigh || 0)
            : (measurements.tricep || 0) + (measurements.thigh || 0) + (measurements.waist || 0);

    const bodyDensity =
        gender === 'male'
            ? calculateMaleBodyDensity(sumOfSkinFolds, age)
            : calculateFemaleBodyDensity(sumOfSkinFolds, age);

    // Формула расчета процента жира
    return parseFloat((495 / bodyDensity - 450).toFixed(2));
}

// Функция для вычисления возраста по дате рождения
export const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth();
    if (month < birth.getMonth() || (month === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

export function formatTimestamp(seconds: number, nanoseconds: number): string {
    // Создаем объект Date на основе секунд
    const date = new Date(seconds * 1000 + nanoseconds / 1e6);
    // Форматируем дату
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

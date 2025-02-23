export interface FatMeasurement {
    timestamp: string;
    bodyFat: number;
}

export interface WeightMeasurement {
    timestamp: string;
    weight: string;
}

export const calculatePureWeight = (
    fatMeasurements: FatMeasurement[],
    weightMeasurements: WeightMeasurement[]
): Array<WeightMeasurement & { pureWeight?: number }> => {
    // Если нет данных о жире, возвращаем только вес и дату
    if (fatMeasurements.length === 0) {
        return weightMeasurements.map(({ timestamp, weight }) => ({
            timestamp,
            weight
        }));
    }

    // Сортируем данные по дате (от старых к новым)
    const sortedFat = [...fatMeasurements].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const sortedWeight = [...weightMeasurements].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return sortedWeight.map((weightEntry) => {
        const weightDate = new Date(weightEntry.timestamp).getTime();
        let closestFat: FatMeasurement | undefined = sortedFat[0];

        for (const fatEntry of sortedFat) {
            const fatDate = new Date(fatEntry.timestamp).getTime();
            if (fatDate <= weightDate) {
                closestFat = fatEntry; // Берем ближайший предыдущий замер жира
            } else {
                break;
            }
        }

        // Парсим вес и проверяем корректность
        const weight = parseFloat(weightEntry.weight);
        if (isNaN(weight)) {
            console.warn(`Некорректный вес: ${weightEntry.weight} для даты ${weightEntry.timestamp}`);
            return { timestamp: weightEntry.timestamp, weight: weightEntry.weight };
        }

        // Если данных о жире для данной даты нет, возвращаем только вес и дату
        if (!closestFat) {
            return { timestamp: weightEntry.timestamp, weight: weightEntry.weight };
        }

        // Рассчитываем чистую массу
        const pureWeight = weight - (weight * closestFat.bodyFat / 100);

        return {
            timestamp: weightEntry.timestamp,
            weight: weightEntry.weight,
            pureWeight: parseFloat(pureWeight.toFixed(2)) // Округляем до 2 знаков
        };
    });
};

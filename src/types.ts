export type UserProfile = {
    name: string | null;
    birthDate: string | null;
    currentWeight: number | null;
    initialWeight: number | null;
    desiredWeight: number | null;
    gender: string | null;
    height: number | null;
    email: string | null;
    id: string | null;
    bodyFat: number | null;
};

export type FatMeasuring = {
    chest: number | null;
    abdomen: number | null;
    thigh: number | null;
    tricep: number | null;
    waist: number | null;
};

export type WeightMeasuringData = {
    weight: number | null;
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
};

export type FatMeasuringData = {
    bodyFat: number | null;
    measurements: FatMeasuring;
    timestamp: {
        seconds: number;
        nanoseconds: number;
    };
};

export type Measurements = {
    fatMeasuring: FatMeasuringData[]; // Массив объектов с данными о замерах жира
    weightMeasuring: WeightMeasuringData[]; // Массив объектов с данными о замерах веса
};

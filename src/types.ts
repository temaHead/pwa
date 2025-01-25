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

export type BodyMeasuring = {
    chest: number | null;
    hips: number | null;
    thigh: number | null;
    arms: number | null;
    waist: number | null;
};

export type WeightMeasuringData = {
    id: string;
    weight: number | null;
    timestamp: string | undefined;
};

export type FatMeasuringData = {
    id: string;
    bodyFat: number | null;
    measurements: FatMeasuring;
    timestamp: string | undefined;
};
export type BodyMeasuringData = {
    id: string;
    bodyMeasuring: BodyMeasuring;
    timestamp: string | undefined;
};

export type Measurements = {
    fatMeasuring: FatMeasuringData[]; // Массив объектов с данными о замерах жира
    weightMeasuring: WeightMeasuringData[]; // Массив объектов с данными о замерах веса
    bodyMeasuring: BodyMeasuringData[];
};

export type Goal = {
    userId: string;
    startDate: string;
    endDate: string;
    daysToComplete: number;
    type: 'weight' | 'body' | 'fat';
    currentWeight?: number | null;
    desiredWeight?: number | null;
    currentBody?: BodyMeasuring | null;
    desiredBody?: BodyMeasuring | null;
    currentFat?: number | null;
    desiredFat?: number | null;
    currentCaliper?: FatMeasuring | null;
    desiredCaliper?: FatMeasuring | null;
};


export type GoalData={
    id: string;
    goal: Goal
    timestamp: string
}
export type UserProfile = {
    name: string | null;
    birthDate: string | null;
    currentWeight: number | null;
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
    startDate: string;
    endDate: string;
    type: 'weight' | 'fat' | ''; 
    currentWeight?: number | null;
    desiredWeight?: number | null;
    initialWeight?: number | null;
    currentFat?: number | null;
    desiredFat?: number | null;
    initialFat?: number | null;
    status: 'active' | 'done' | 'failed' | 'pending'| 'success'| 'initial';
};


export type GoalData={
    id: string;
    goal: Goal
    timestamp: string
}
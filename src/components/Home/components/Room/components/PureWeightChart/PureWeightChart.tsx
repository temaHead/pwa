import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeightMeasuringData } from '../../../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { getAllWeightMeasuringAsync, getAllFatMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import style from './PureWeightChart.module.scss';

interface PureWeightChartProps {
    data?: WeightMeasuringData[]; // Данные с весом
}

const PureWeightChart: React.FC<PureWeightChartProps> = () => {
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const { id } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch<AppDispatch>();

    // Загружаем данные о весе и жире
    useEffect(() => {
        if (id) {
            dispatch(getAllWeightMeasuringAsync(id));
            dispatch(getAllFatMeasuringAsync(id));
        }
    }, [dispatch, id]);

    // Объединяем данные о весе и жире по дате
    const chartData = weightMeasuring.map((weightItem) => {
        const fatItem = fatMeasuring.find(
            (fat) => fat.timestamp === weightItem.timestamp
        );

        const bodyFatPercentage = fatItem?.bodyFat || 0; // Процент жира
        const weight = weightItem.weight !== null ? weightItem.weight : 0;

        const pureWeight = weight * (1 - bodyFatPercentage / 100); // Чистый вес

        return {
            date: new Date(weightItem.timestamp || 0).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), // Форматируем дату
            weight: weightItem.weight, // Общий вес
            pureWeight: pureWeight, // Чистый вес
        };
    });

    return (
        <div className={style.pureWeightChart}>
            <div>График изменения веса и чистой массы тела</div>
            <div className={style.chartContainer}>
                <ResponsiveContainer>
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='date' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type='monotone'
                            dataKey='weight'
                            stroke='#8884d8'
                            activeDot={{ r: 8 }}
                            name='Вес'
                        />
                        <Line
                            type='monotone'
                            dataKey='pureWeight'
                            stroke='#82ca9d'
                            activeDot={{ r: 8 }}
                            name='Чистая масса'
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PureWeightChart;
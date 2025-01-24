import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeightMeasuringData } from '../../../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { getAllWeightMeasuringAsync } from '../../../../../../store/slices/measurementSlice';

import style from './WeightChart.module.scss';

interface WeightChartProps {
    data?: WeightMeasuringData[]; // Данные с весом
}

const WeightChart: React.FC<WeightChartProps> = () => {
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const { desiredWeight, id } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch<AppDispatch>();

    // Преобразуем данные для графика
    const chartData = weightMeasuring.map((item) => ({
        date: new Date(item.timestamp || 0).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), // Форматируем дату
        weight: item.weight, // Вес
        desiredWeight,
    }));

    useEffect(() => {
        if (id) {
            dispatch(getAllWeightMeasuringAsync(id));
        }
    }, [dispatch, id]);

    return (
        <div className={style.weightChart}>
            <div>График изменения веса</div>
            <div className={style.weightContainer}>
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
                            dataKey='desiredWeight'
                            stroke='#ff7300' // Оранжевый цвет
                            strokeDasharray='5 5' // Пунктирная линия
                            name='Желаемый вес'
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeightChart;

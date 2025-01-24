import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FatMeasuringData } from '../../../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { getAllFatMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import style from './FatChart.module.scss';

interface FatChartProps {
    data?: FatMeasuringData[]; // Данные с замерами жира
}

const FatChart: React.FC<FatChartProps> = () => {
    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const dispatch = useDispatch<AppDispatch>();
    const { id } = useSelector((state: RootState) => state.user);

    const [visibleLines, setVisibleLines] = React.useState({
        chest: true,
        abdomen: true,
        thigh: true,
        tricep: true,
        waist: true,
        bodyFat: true,
    });

    // Преобразуем данные для графика
    const chartData = fatMeasuring.map((item) => ({
        date: new Date(item.timestamp || 0).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), // Форматируем дату
        chest: item.measurements.chest, // Грудь
        abdomen: item.measurements.abdomen, // Живот
        thigh: item.measurements.thigh, // Бедро
        tricep: item.measurements.tricep, // Трицепс
        waist: item.measurements.waist, // Талия
        bodyFat: item.bodyFat, // Процент жира
    }));

    useEffect(() => {
        if (id) {
            dispatch(getAllFatMeasuringAsync(id));
        }
    }, [dispatch, id]);

    const handleToggleLine = (key: keyof typeof visibleLines) => {
        setVisibleLines((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className={style.chart}>
            <div>График замеров жира и калипера</div>
            <div style={{ marginBottom: '20px' }}>
                {Object.keys(visibleLines).map((key) => (
                    <label
                        key={key}
                        style={{ marginRight: '10px' }}
                    >
                        <input
                            type='checkbox'
                            checked={visibleLines[key as keyof typeof visibleLines]}
                            onChange={() => handleToggleLine(key as keyof typeof visibleLines)}
                        />
                        {key === 'bodyFat' ? '% жира' : key}
                    </label>
                ))}
            </div>
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
                        {visibleLines.chest && (
                            <Line
                                type='monotone'
                                dataKey='chest'
                                stroke='#8884d8'
                                activeDot={{ r: 8 }}
                                name='Грудь'
                            />
                        )}
                        {visibleLines.abdomen && (
                            <Line
                                type='monotone'
                                dataKey='abdomen'
                                stroke='#82ca9d'
                                activeDot={{ r: 8 }}
                                name='Живот'
                            />
                        )}
                        {visibleLines.thigh && (
                            <Line
                                type='monotone'
                                dataKey='thigh'
                                stroke='#ffc658'
                                activeDot={{ r: 8 }}
                                name='Бедро'
                            />
                        )}
                        {visibleLines.tricep && (
                            <Line
                                type='monotone'
                                dataKey='tricep'
                                stroke='#ff7300'
                                activeDot={{ r: 8 }}
                                name='Трицепс'
                            />
                        )}
                        {visibleLines.waist && (
                            <Line
                                type='monotone'
                                dataKey='waist'
                                stroke='#413ea0'
                                activeDot={{ r: 8 }}
                                name='Талия'
                            />
                        )}
                        {visibleLines.bodyFat && (
                            <Line
                                type='monotone'
                                dataKey='bodyFat'
                                stroke='#ff0000'
                                strokeDasharray='5 5'
                                activeDot={{ r: 8 }}
                                name='% жира'
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FatChart;

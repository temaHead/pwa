import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BodyMeasuringData } from '../../../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { getAllBodyMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import style from './BodyChart.module.scss';

interface BodyChartProps {
    data?: BodyMeasuringData[]; // Данные с замерами тела
}

const BodyChart: React.FC<BodyChartProps> = () => {
    const bodyMeasuring = useSelector((state: RootState) => state.measurements.bodyMeasuring);
    const dispatch = useDispatch<AppDispatch>();
    const { id } = useSelector((state: RootState) => state.user);

    const [visibleLines, setVisibleLines] = React.useState({
        chest: true,
        hips: true,
        thigh: true,
        arms: true,
        waist: true,
    });

    // Преобразуем данные для графика
    const chartData = bodyMeasuring.map((item) => ({
        date: new Date(item.timestamp || 0).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }), // Форматируем дату
        chest: item.bodyMeasuring.chest, // Грудь
        hips: item.bodyMeasuring.hips, // Бедра
        thigh: item.bodyMeasuring.thigh, // Бедро
        arms: item.bodyMeasuring.arms, // Руки
        waist: item.bodyMeasuring.waist, // Талия
    }));

    useEffect(() => {
        if (id) {
            dispatch(getAllBodyMeasuringAsync(id));
        }
    }, [dispatch, id]);

    const handleToggleLine = (key: keyof typeof visibleLines) => {
        setVisibleLines((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className={style.bodyChart}>
            <div>График замеров тела</div>
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
                        {key === 'chest' && 'Грудь'}
                        {key === 'hips' && 'Бедра'}
                        {key === 'thigh' && 'Бедро'}
                        {key === 'arms' && 'Руки'}
                        {key === 'waist' && 'Талия'}
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
                        {visibleLines.hips && (
                            <Line
                                type='monotone'
                                dataKey='hips'
                                stroke='#82ca9d'
                                activeDot={{ r: 8 }}
                                name='Бедра'
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
                        {visibleLines.arms && (
                            <Line
                                type='monotone'
                                dataKey='arms'
                                stroke='#ff7300'
                                activeDot={{ r: 8 }}
                                name='Руки'
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
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BodyChart;

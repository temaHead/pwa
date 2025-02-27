import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import {
    getAllWeightMeasuringAsync,
    getAllFatMeasuringAsync,
} from '../../../../../../store/slices/measurementSlice';
import style from './PureWeightChart.module.scss';
import { calculatePureWeight, FatMeasurement, WeightMeasurement } from './utils';
import { theme } from 'antd';

const PureWeightChart: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const fatMeasuring = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const { id } = useSelector((state: RootState) => state.user);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const colorText = token.colorTextBase; // Автоматически подстраивается
    const [visibleLines, setVisibleLines] = useState({
        Вес: true,
        'Чистая масса': true,
    });

    useEffect(() => {
        if (id) {
            dispatch(getAllWeightMeasuringAsync(id));
            dispatch(getAllFatMeasuringAsync(id));
        }
    }, [dispatch, id]);
    // Вычисляем чистую массу тела
    const pureData = useMemo(() => {
        if (weightMeasuring.length === 0) return []; // Ждём загрузки веса

        const validFatMeasuring: FatMeasurement[] = fatMeasuring
            .filter((entry) => entry.timestamp && entry.bodyFat !== null) // Убираем пустые данные
            .map(({ timestamp, bodyFat }) => ({
                timestamp: timestamp as string,
                bodyFat: bodyFat as number,
            }));

        const validWeightMeasuring: WeightMeasurement[] = weightMeasuring
            .filter((entry) => entry.timestamp && entry.weight !== null) // Фильтруем пустые записи
            .map(({ timestamp, weight }) => ({ timestamp: timestamp as string, weight: String(weight) })); // Преобразуем в string

        return calculatePureWeight(validFatMeasuring, validWeightMeasuring);
    }, [weightMeasuring, fatMeasuring]);

    const areaBaseline = useMemo(() => {
        const values = pureData
            .flatMap(({ weight, pureWeight }) =>
                Object.keys(visibleLines)
                    .filter((key) => visibleLines[key as keyof typeof visibleLines]) // Берем только активные линии
                    .map((key) => (key === 'Вес' ? parseFloat(weight) : pureWeight))
            )
            .filter((val) => val !== undefined && val !== null); // Исключаем null/undefined

        return values.length > 0 ? Math.min(...values) : 0;
    }, [pureData, visibleLines]);

    console.log(pureData, 'pureData');

    // Подготовка данных для графика
    const chartData = useMemo(() => {
        return [
            {
                id: 'Вес',
                data: pureData.map(({ timestamp, weight }) => ({
                    x: new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                    y: weight,
                })),
            },
            {
                id: 'Чистая масса',
                data: pureData.map(({ timestamp, pureWeight }) => ({
                    x: new Date(timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                    y: pureWeight,
                })),
            },
        ].filter((series) => visibleLines[series.id as keyof typeof visibleLines]);
    }, [pureData, visibleLines]);
    console.log(chartData, 'chartData');

    return (
        <div className={style.pureWeightChart}>
            <div>График изменения веса и чистой массы тела</div>
            <div className={style.controls}>
                {(Object.keys(visibleLines) as Array<keyof typeof visibleLines>).map((key) => (
                    <label
                        key={key}
                        className={style.checkboxLabel}
                    >
                        <input
                            type='checkbox'
                            checked={visibleLines[key]}
                            onChange={() => setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }))}
                        />
                        {key === 'Вес' ? 'Вес' : 'Чистая масса'}
                    </label>
                ))}
            </div>
            <div className={style.chartContainer}>
                <ResponsiveLine
                    data={chartData}
                    margin={{ top: 50, right: 20, bottom: 100, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                    curve='monotoneX'
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -30,
                        legend: 'Дата',
                        legendOffset: 50,
                        legendPosition: 'middle',
                    }}
                    axisLeft={{
                        tickSize: 0,
                        tickPadding: 15,
                        tickRotation: 0,
                        legend: 'Вес / Чистая масса',
                        legendOffset: -45,
                        legendPosition: 'middle',
                    }}
                    enableGridX={false}
                    enableGridY={false}
                    colors={{ scheme: 'nivo' }}
                    lineWidth={4}
                    pointSize={11}
                    enablePoints={true}
                    pointBorderWidth={2}
                    enablePointLabel={true}
                    pointLabel='data.yFormatted'
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-10}
                    enableArea={true}
                    areaBlendMode='normal'
                    areaBaselineValue={areaBaseline}
                    areaOpacity={0.15}
                    useMesh={true}
                    enableSlices='x'
                    motionConfig='wobbly'
                    legends={[
                        {
                            anchor: 'bottom-left',
                            direction: 'row',
                            translateY: 90,
                            translateX: -20,
                            itemsSpacing: 40,
                            itemWidth: 80,
                            itemHeight: 20,
                            itemOpacity: 0.75,
                            symbolSize: 12,
                            symbolShape: 'circle',
                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1,
                                    },
                                },
                            ],
                        },
                    ]}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: colorText,
                                    fontSize: 12,
                                },
                            },
                            legend: {
                                text: {
                                    fill: colorText, // Белый цвет текста для легенды оси
                                    fontSize: 14,
                                },
                            },
                        },
                        grid: {
                            line: {
                                stroke: colorText,
                                strokeWidth: 1,
                                strokeDasharray: '4 4',
                            },
                        },
                        legends: {
                            text: {
                                fontWeight: 'bold',
                                fontSize: 13,
                                fill: colorText,
                            },
                        },
                        dots: {
                            text: {
                                fontSize: 13,
                                fill: colorText,
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default PureWeightChart;

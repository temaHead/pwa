import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { getAllFatMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import style from './FatChart.module.scss';
import { FatMeasuringData } from '../../../../../../types';
import { Switch, theme } from 'antd';

const FatChart: React.FC = () => {
    const fatMeasurements = useSelector((state: RootState) => state.measurements.fatMeasuring);
    const dispatch = useDispatch<AppDispatch>();
    const { id, gender } = useSelector((state: RootState) => state.user);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const colorText = token.colorTextBase; // Автоматически подстраивается
    const colorBackground = token.colorBgLayout;

    const defaultVisibleLines =
        gender === 'male'
            ? { chest: true, abdomen: true, thigh: true, bodyFat: true }
            : { thigh: true, tricep: true, waist: true, bodyFat: true };

    const [visibleLines, setVisibleLines] = useState(defaultVisibleLines);

    const fatMeasuringSorted = useMemo(() => {
        if (!Array.isArray(fatMeasurements) || fatMeasurements.length === 0) {
            return []; // Возвращаем пустой массив, если данных нет
        }

        return [...fatMeasurements].sort(
            (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );
    }, [fatMeasurements]);

    const LABELS_MAP: Record<string, string> = useMemo(() => {
        return {
            chest: 'Грудь',
            abdomen: 'Живот',
            thigh: 'Бедро',
            tricep: 'Трицепс',
            waist: 'Талия',
            bodyFat: '% жира',
        };
    }, []);

    // Вычисление минимального значения среди видимых серий
    const areaBaseline = useMemo(() => {
        const values = fatMeasuringSorted
            .flatMap((item) =>
                Object.keys(visibleLines)
                    .filter((key) => visibleLines[key as keyof typeof visibleLines]) // Берем только активные линии
                    .map((key) =>
                        key === 'bodyFat'
                            ? item.bodyFat
                            : item.measurements[key as keyof FatMeasuringData['measurements']]
                    )
            )
            .filter((val) => val !== undefined && val !== null); // Исключаем null/undefined

        return values.length > 0 ? Math.min(...values) : 0;
    }, [fatMeasuringSorted, visibleLines]);

    const chartData = useMemo(
        () =>
            (Object.keys(visibleLines) as Array<keyof FatMeasuringData['measurements'] | 'bodyFat'>)
                .map((key) => {
                    // Создаём новый массив с данными для графика
                    const data = fatMeasuringSorted.map((item) => {
                        const value =
                            key === 'bodyFat'
                                ? item.bodyFat
                                : item.measurements[key as keyof FatMeasuringData['measurements']];
    
                        // Если данных нет (значение undefined или null), ставим null для пропуска
                        return {
                            x: new Date(item.timestamp || 0).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                            }),
                            y: value ?? null, // Пропуск данных будет интерпретирован как null
                        };
                    });
    
                    return {
                        id: LABELS_MAP[key] || key,
                        data,
                    };
                })
                .filter(
                    (series) =>
                        visibleLines[
                            Object.keys(LABELS_MAP).find(
                                (key) => LABELS_MAP[key] === series.id
                            ) as keyof typeof visibleLines
                        ]
                ),
        [LABELS_MAP, fatMeasuringSorted, visibleLines]
    );
    
    console.log(chartData);

    const handleToggleLine = (key: keyof typeof visibleLines) => {
        setVisibleLines((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    useEffect(() => {
        if (id) {
            dispatch(getAllFatMeasuringAsync(id));
        }
    }, [dispatch, id]);

    if (!fatMeasuringSorted.length) return null;

    return (
        <div className={style.chart}>
            <div className={style.chartTitle}>📊 График замеров жира</div>
            <div className={style.switchContainer}>
                {Object.keys(visibleLines).map((key) => {
                    return (
                        <Switch
                            key={key}
                            checked={visibleLines[key as keyof typeof visibleLines]}
                            onChange={() => handleToggleLine(key as keyof typeof visibleLines)}
                            checkedChildren={LABELS_MAP[key] || key}
                            unCheckedChildren={LABELS_MAP[key] || key}
                        />
                    );
                })}
            </div>
            <div className={style.chartContainer}>
                <ResponsiveLine
                    data={chartData}
                    margin={{ top: 40, right: 20, bottom: 130, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false,
                        reverse: false,
                    }}
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
                        legend: 'мм / % жира',
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
                    areaOpacity={0.1}
                    useMesh={true}
                    enableSlices='x'
                    motionConfig='wobbly'
                    legends={[
                        {
                            anchor: 'bottom-left',
                            direction: 'row',
                            translateY: 90,
                            translateX: -20,
                            itemsSpacing: 0,
                            itemWidth: 80,
                            itemDirection: 'top-to-bottom',
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
                        tooltip: {
                            container: {
                                background: colorBackground,
                                color: colorText,
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default FatChart;

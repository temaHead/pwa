import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { getAllBodyMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import style from './BodyChart.module.scss';
import { BodyMeasuring } from '../../../../../../types';
import { Switch, theme } from 'antd';

const BodyChart: React.FC = () => {
    const bodyMeasuring = useSelector((state: RootState) => state.measurements.bodyMeasuring);
    const dispatch = useDispatch<AppDispatch>();
    const { id } = useSelector((state: RootState) => state.user);
    const { token } = theme.useToken();
    const colorText = token.colorTextBase;
    const colorBackground = token.colorBgLayout;

    const LABELS_MAP: Record<string, string> = useMemo(() => {
        return {
            chest: 'Грудь',
            hips: 'Ягодицы',
            thigh: 'Бедро',
            arms: 'Бицепс',
            waist: 'Талия',
        };
    }, []);

    const defaultVisibleLines = {
        chest: true,
        hips: true,
        thigh: true,
        arms: true,
        waist: true,
    };
    const [visibleLines, setVisibleLines] = useState(defaultVisibleLines);

    const bodyMeasuringSorted = useMemo(() => {
        if (!Array.isArray(bodyMeasuring) || bodyMeasuring.length === 0) {
            return [];
        }
        return [...bodyMeasuring].sort(
            (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );
    }, [bodyMeasuring]);

    const chartData = useMemo(
        () =>
            Object.keys(visibleLines)
                .map((key) => ({
                    id: LABELS_MAP[key] || key,
                    data: bodyMeasuringSorted.map((item) => ({
                        x: new Date(item.timestamp || 0).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                        }),
                        y: item.bodyMeasuring[key as keyof typeof visibleLines],
                    })),
                }))
                .filter(
                    (series) =>
                        visibleLines[
                            Object.keys(LABELS_MAP).find(
                                (key) => LABELS_MAP[key] === series.id
                            ) as keyof typeof visibleLines
                        ]
                ),
        [LABELS_MAP, bodyMeasuringSorted, visibleLines]
    );

    const areaBaseline = useMemo(() => {
        const values = bodyMeasuringSorted.flatMap((item) =>
            (Object.keys(visibleLines) as Array<keyof BodyMeasuring>)
                .filter((key) => visibleLines[key]) // Берем только активные линии
                .map((key) => item.bodyMeasuring[key] ?? null)
        );

        return values.length > 0 ? Math.min(...values.filter((val): val is number => val !== null)) : 0;
    }, [bodyMeasuringSorted, visibleLines]);

    const handleToggleLine = (key: keyof typeof visibleLines) => {
        setVisibleLines((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    useEffect(() => {
        if (id) {
            dispatch(getAllBodyMeasuringAsync(id));
        }
    }, [dispatch, id]);

    if (!bodyMeasuringSorted.length) return;

    return (
        <div className={style.chart}>
            <div className={style.chartTitle}>📊 График замеров тела</div>
            <div className={style.switchContainer}>
                {Object.keys(visibleLines).map((key) => (
                    <Switch
                        key={key}
                        checked={visibleLines[key as keyof typeof visibleLines]}
                        onChange={() => handleToggleLine(key as keyof typeof visibleLines)}
                        checkedChildren={LABELS_MAP[key] || key}
                        unCheckedChildren={LABELS_MAP[key] || key}
                    />
                ))}
            </div>
            <div className={style.chartContainer}>
                <ResponsiveLine
                    data={chartData}
                    margin={{ top: 50, right: 20, bottom: 110, left: 60 }}
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
                        legend: 'см',
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
                            translateX: -50,
                            itemsSpacing: 0,
                            itemWidth: 70,
                            itemHeight: 20,
                            itemDirection: 'top-to-bottom',
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

export default BodyChart;

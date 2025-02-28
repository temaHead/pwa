import React, { useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import { getAllWeightMeasuringAsync } from '../../../../../../store/slices/measurementSlice';
import style from './WeightChart.module.scss';
import { theme } from 'antd';

const WeightChart: React.FC = () => {
    const weightMeasuring = useSelector((state: RootState) => state.measurements.weightMeasuring);
    const { id } = useSelector((state: RootState) => state.user);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const colorText = token.colorTextBase; // Автоматически подстраивается
    const colorBackground = token.colorBgLayout;

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (id) {
            dispatch(getAllWeightMeasuringAsync(id));
        }
    }, [dispatch, id]);

    const areaBaseline = Math.min(...weightMeasuring.map((item) => item.weight || 0));

    const chartData = [
        {
            id: 'Вес',
            data: weightMeasuring
                .slice() // Создаем копию массива, чтобы не мутировать `weightMeasuring`
                .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()) // Сортируем по дате
                .map((item) => ({
                    x: new Date(item.timestamp || 0).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                    }),
                    y: item.weight,
                })),
        },
    ];

    return (
        <div className={style.weightChart}>
            <div className={style.chartTitle}>📉 График изменения веса</div>
            <div className={style.weightContainer}>
                <ResponsiveLine
                    data={chartData}
                    margin={{ top: 50, right: 20, bottom: 80, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: true,
                        reverse: false,
                    }}
                    curve='monotoneX' // Гладкая интерполяция
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -30,
                        legend: 'Дата',
                        legendOffset: 50,
                        legendPosition: 'middle',
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 15,
                        tickRotation: 0,
                        legend: 'Вес (кг)',
                        legendOffset: -45,
                        legendPosition: 'middle',
                    }}
                    enableGridX={false}
                    enableGridY={false}
                    colors={{ scheme: 'nivo' }}
                    lineWidth={4}
                    pointSize={11} // Увеличенные точки
                    enablePoints={true}
                    pointBorderWidth={2}
                    enablePointLabel={true}
                    pointLabel='data.yFormatted'
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-10}
                    enableArea={true} // Заливка под графиком
                    areaBlendMode='normal'
                    areaOpacity={0.18}
                    areaBaselineValue={areaBaseline}
                    fill={[{ match: { id: 'Вес' }, id: 'gradientWeight' }]}
                    useMesh={true} // Улучшенное взаимодействие
                    enableSlices='x' // Выделение всей вертикальной области при наведении
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
                    motionConfig='wobbly'
                    legends={[
                        {
                            anchor: 'bottom-left', // Располагаем легенду внизу
                            direction: 'row', // Горизонтальное расположение
                            justify: false,
                            translateX: 0,
                            translateY: 80, // Отступ вниз
                            itemsSpacing: 10,
                            itemDirection: 'left-to-right',
                            itemWidth: 120,
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
                />
            </div>
        </div>
    );
};

export default WeightChart;

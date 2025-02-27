import React from 'react';
import { useSelector } from 'react-redux';
import WeightChart from './components/WeightChart/WeightChart';
import FatChart from './components/FatChart/FatChart';
import BodyChart from './components/BodyChart/BodyChart';
import GraphFilter from './components/GraphFilter/GraphFilter';
import style from './Room.module.scss';
import { RootState } from '../../../../store';
import PureWeightChart from './components/PureWeightChart/PureWeightChart';
import { theme } from 'antd';

const Room: React.FC = () => {
    const widgets = useSelector((state: RootState) => state.widgets.widgets);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const colorText = token.colorTextBase; // Автоматически подстраивается
    const colorBgContainer = token.colorBgContainer;


    const getGraphComponent = (id: string) => {
        switch (id) {
            case 'weight':
                return <WeightChart />;
            case 'fat':
                return <FatChart />;
            case 'body':
                return <BodyChart />;
            case 'pureWeight':
                return <PureWeightChart />;
            default:
                return null;
        }
    };

    return (
        <div className={style.room}>
            <div className={style.title} style={{ color: colorText }} >
                Мои графики
            </div>
            <GraphFilter />
            <div className={style.graphsContainer}>
                {widgets
                    .filter((widget) => widget.visible) // Показываем только включенные графики
                    .map((widget) => (
                        <div
                            key={widget.id}
                            className={style.graphWrapper}
                            style={{ backgroundColor: colorBgContainer, color: colorText }}
                        >
                            {getGraphComponent(widget.id)}
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Room;

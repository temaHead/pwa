import React from 'react';
import { useSelector } from 'react-redux';
import WeightChart from './components/WeightChart/WeightChart';
import FatChart from './components/FatChart/FatChart';
import BodyChart from './components/BodyChart/BodyChart';
import GraphFilter from './components/GraphFilter/GraphFilter';
import style from './Room.module.scss';
import { RootState } from '../../../../store';
import PureWeightChart from './components/PureWeightChart/PureWeightChart';

const Room: React.FC = () => {
    const widgets = useSelector((state: RootState) => state.widgets.widgets);

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
            <GraphFilter />
            <div className={style.graphsContainer}>
                {widgets
                    .filter((widget) => widget.visible) // Показываем только включенные графики
                    .map((widget) => (
                        <div
                            key={widget.id}
                            className={style.graphWrapper}
                        >
                            {getGraphComponent(widget.id)}
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Room;

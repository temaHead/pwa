import React, { useState, useEffect, CSSProperties } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
    DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd';
import { Button, Checkbox } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check'; // Иконка "Применить"
import DeleteIcon from '@mui/icons-material/Delete'; // Иконка "Сбросить"
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Иконка для перетаскивания
import style from './GraphFilter.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../../../store';
import {
    fetchWidgetsAsync,
    saveWidgetsAsync,
    resetWidgetsAsync,
} from '../../../../../../store/slices/widgetsSlice';
import CollapsibleSection from '../../../../../../shared/components/CollapsibleSection/CollapsibleSection';

interface WidgetSettings {
    id: string;
    label: string;
    visible: boolean;
}

// Стили для перетаскиваемого элемента
const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggableProvidedDraggableProps['style'] | undefined // Разрешаем undefined
): CSSProperties => ({
    userSelect: 'none', // Допустимое значение для userSelect
    padding: '8px',
    margin: '0 0 8px 0',
    background: isDragging ? '#2196F3' : '#fff', // Синий фон при перетаскивании
    color: isDragging ? '#fff' : '#000', // Белый текст при перетаскивании
    borderRadius: '4px',
    boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none', // Тень при перетаскивании
    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s', // Плавные переходы
    ...(draggableStyle || {}), // Если draggableStyle undefined, используем пустой объект
});
const GraphFilter: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.id);
    const savedWidgets = useSelector((state: RootState) => state.widgets.widgets);

    const [widgets, setWidgets] = useState<WidgetSettings[]>([
        { id: 'weight', label: 'График веса', visible: true },
        { id: 'fat', label: 'График жира', visible: true },
        { id: 'body', label: 'График замеров', visible: true },
        { id: 'pureWeight', label: 'График чистой массы тела', visible: true },
    ]);

    // Загружаем настройки виджетов при монтировании компонента
    useEffect(() => {
        if (userId) {
            dispatch(fetchWidgetsAsync(userId));
        }
    }, [dispatch, userId]);

    // Применяем сохраненные настройки виджетов
    useEffect(() => {
        if (savedWidgets) {
            setWidgets(savedWidgets);
        }
    }, [savedWidgets]);

    const handleWidgetChange = (id: string) => {
        setWidgets((prev) =>
            prev.map((widget) => (widget.id === id ? { ...widget, visible: !widget.visible } : widget))
        );
    };

    const handleSaveWidgets = () => {
        if (userId) {
            dispatch(saveWidgetsAsync({ userId, widgets }));
        }
    };

    const handleResetWidgets = () => {
        if (userId) {
            dispatch(resetWidgetsAsync(userId));
        }
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(widgets);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setWidgets(items);
    };

    return (
        <div className={style.filter}>
            <CollapsibleSection title='Настройки виджетов'>
                <div className={style.filterContent}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId='widgets'>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={style.widgetsList}
                                >
                                    {widgets.map((widget, index) => (
                                        <Draggable
                                            key={widget.id}
                                            draggableId={widget.id}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}
                                                    className={style.widgetItem}
                                                >
                                                    <Checkbox
                                                        checked={widget.visible}
                                                        onChange={() => handleWidgetChange(widget.id)}
                                                    />
                                                    <div className={style.content}>
                                                        <div className={style.label}>{widget.label}</div>
                                                        <div className={style.dragHandle}>
                                                            <MoreVertIcon />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <div className={style.filterButtons}>
                        <Button
                            variant='contained'
                            className={style.applyButton}
                            onClick={handleSaveWidgets}
                            startIcon={<CheckIcon />} // Иконка "Применить"
                        >
                            Сохранить
                        </Button>
                        <Button
                            variant='contained'
                            className={style.resetButton}
                            onClick={handleResetWidgets}
                            startIcon={<DeleteIcon />} // Иконка "Сбросить"
                        >
                            Сбросить
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default GraphFilter;

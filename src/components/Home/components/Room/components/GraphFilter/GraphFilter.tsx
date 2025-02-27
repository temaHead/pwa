import React, { useState, useEffect, useCallback, CSSProperties, memo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button, Checkbox, theme } from 'antd';
import { CheckOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
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

const getItemStyle = (
    isDragging: boolean,
    draggableStyle: CSSProperties | undefined,
    backgroundColor: string
): CSSProperties => ({
    userSelect: 'none',
    padding: '8px 10px',
    marginBottom: '8px',
    background: isDragging ? 'rgba(200, 200, 200, 0.5)' : backgroundColor,
    color: '#000',
    borderRadius: '8px',
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
    opacity: isDragging ? 0.6 : 1,
    backdropFilter: isDragging ? 'blur(4px)' : 'none',
    display: 'flex',
    justifyContent: 'space-between',
    ...draggableStyle,
});

const GraphFilter: React.FC = memo(() => {
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.id);
    const savedWidgets = useSelector((state: RootState) => state.widgets.widgets);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const colorIcon = token.colorIcon;
    const colorText = token.colorTextBase;

    const [widgets, setWidgets] = useState<WidgetSettings[]>([
        { id: 'weight', label: 'График веса', visible: true },
        { id: 'fat', label: 'График жира', visible: true },
        { id: 'body', label: 'График замеров', visible: true },
        { id: 'pureWeight', label: 'График чистой массы тела', visible: true },
    ]);

    useEffect(() => {
        if (userId) {
            dispatch(fetchWidgetsAsync(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (savedWidgets) {
            setWidgets(savedWidgets);
        }
    }, [savedWidgets]);

    const handleWidgetChange = useCallback((id: string) => {
        setWidgets((prev) =>
            prev.map((widget) => (widget.id === id ? { ...widget, visible: !widget.visible } : widget))
        );
    }, []);

    const handleSaveWidgets = useCallback(() => {
        if (userId) {
            dispatch(saveWidgetsAsync({ userId, widgets }));
        }
    }, [dispatch, userId, widgets]);

    const handleResetWidgets = useCallback(() => {
        if (userId) {
            dispatch(resetWidgetsAsync(userId));
        }
    }, [dispatch, userId]);

    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) return;

            const items = Array.from(widgets);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);

            setWidgets(items);
        },
        [widgets]
    );

    return (
        <div style={{ color: colorText }}>
            <CollapsibleSection title='Настройки виджетов'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId='widgets'>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
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
                                                    provided.draggableProps.style,
                                                    backgroundColor
                                                )}
                                            >
                                                <Checkbox
                                                    checked={widget.visible}
                                                    onChange={() => handleWidgetChange(widget.id)}
                                                >
                                                    {widget.label}
                                                </Checkbox>
                                                <HolderOutlined
                                                    style={{
                                                        marginLeft: '8px',
                                                        cursor: 'grab',
                                                        color: colorIcon,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        danger
                        onClick={handleResetWidgets}
                        icon={<DeleteOutlined />}
                    >
                        Сбросить
                    </Button>
                    <Button
                        type='primary'
                        onClick={handleSaveWidgets}
                        icon={<CheckOutlined />}
                    >
                        Сохранить
                    </Button>
                </div>
            </CollapsibleSection>
        </div>
    );
});

export default GraphFilter;

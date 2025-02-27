import React, { useState, useEffect, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, theme } from 'antd';
import { CheckOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
    DraggableProvidedDraggableProps,
} from '@hello-pangea/dnd';
import style from './Filter.module.scss';
import { AppDispatch, RootState } from '../../../../../../store';
import {
    fetchFilterAsync,
    resetFilterAsync,
    saveFilterAsync,
} from '../../../../../../store/slices/filterSlice';
import CollapsibleSection from '../../../../../../shared/components/CollapsibleSection/CollapsibleSection';

interface FilterOption {
    id: string;
    label: string;
    visible: boolean;
}

// Стили для перетаскиваемых элементов
const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggableProvidedDraggableProps['style'] | undefined,
    backgroundColor: string
): CSSProperties => ({
    userSelect: 'none',
    padding: '8px',
    marginBottom: '8px',
    background: isDragging ? 'rgba(200, 200, 200, 0.5)' : backgroundColor,
    borderRadius: '8px',
    boxShadow: isDragging ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
    opacity: isDragging ? 0.6 : 1,
    backdropFilter: isDragging ? 'blur(4px)' : 'none',
    ...(draggableStyle || {}),
});

const Filter: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.id);
    const savedFilter = useSelector((state: RootState) => state.filter.filters);
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    const colorIcon = token.colorIcon;
    const colorText = token.colorTextBase;
    const [filters, setFilters] = useState<FilterOption[]>([
        { id: 'showFat', label: 'Показать жировые измерения', visible: true },
        { id: 'showWeight', label: 'Показать измерения веса', visible: true },
        { id: 'showBody', label: 'Показать измерения лентой', visible: true },
    ]);

    useEffect(() => {
        if (userId) {
            dispatch(fetchFilterAsync(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (savedFilter) {
            setFilters(savedFilter);
        }
    }, [savedFilter]);

    const handleFilterChange = (id: string) => {
        setFilters((prev) =>
            prev.map((filter) => (filter.id === id ? { ...filter, visible: !filter.visible } : filter))
        );
    };

    const handleSaveFilter = () => {
        if (userId) {
            dispatch(saveFilterAsync({ userId, filters }));
        }
    };

    const handleResetFilter = () => {
        if (userId) {
            dispatch(resetFilterAsync(userId));
        }
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(filters);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFilters(items);
    };

    return (
        <div className={style.filter} style={{ color: colorText }}>
            <CollapsibleSection title='Фильтры'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId='filters'>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={style.filterList}
                            >
                                {filters.map((filter, index) => (
                                    <Draggable
                                        key={filter.id}
                                        draggableId={filter.id}
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
                                                    backgroundColor,
                                                    
                                                )}
                                                className={style.filterItem}
                                            >
                                                <Checkbox
                                                    checked={filter.visible}
                                                    onChange={() => handleFilterChange(filter.id)}
                                                />
                                                <div className={style.content}>
                                                    <div className={style.label}>{filter.label}</div>
                                                    <div className={style.dragHandle}>
                                                        <HolderOutlined
                                                            style={{
                                                                marginLeft: '8px',
                                                                cursor: 'grab',
                                                                color: colorIcon,
                                                            }}
                                                        />
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
                        onClick={handleResetFilter}
                        icon={<DeleteOutlined />}
                        danger
                    >
                        Сбросить
                    </Button>
                    <Button
                        type='primary'
                        onClick={handleSaveFilter}
                        icon={<CheckOutlined />}
                    >
                        Сохранить
                    </Button>
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default Filter;

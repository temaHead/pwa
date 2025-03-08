import React, { useState, useEffect, CSSProperties, useCallback } from 'react';
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
    setFiltersFromIDB,
} from '../../../../../../store/slices/filterSlice';
import CollapsibleSection from '../../../../../../shared/components/CollapsibleSection/CollapsibleSection';
import { getEntityFromIDB, saveEntityToIDB } from '../../../../../../shared/utils/idb';
import _ from 'lodash';

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

    // Мемоизация стилей для перетаскиваемых элементов
    const getItemStyleMemoized = useCallback(
        (isDragging: boolean, draggableStyle: DraggableProvidedDraggableProps['style'] | undefined) =>
            getItemStyle(isDragging, draggableStyle, backgroundColor),
        [backgroundColor]
    );

    useEffect(() => {
        const loadAndSyncData = async () => {
            // Загрузка данных из IndexedDB
            const filterFromIDB = await getEntityFromIDB('filterStore');
            if (filterFromIDB) {
                dispatch(setFiltersFromIDB(filterFromIDB)); // Предполагается, что у вас есть action для установки измерений жира
            }
            if (userId) {
                dispatch(fetchFilterAsync(userId));
            }
        };
        loadAndSyncData();
    }, [dispatch, userId]);

    // синхронизация данных с бэкендом и сохранение в IndexedDB
    useEffect(() => {
        if (userId) {
            const syncData = async () => {
                // Сравниваем данные из IndexedDB с данными из бэкенда для каждой сущности
                const filterFromIDB = await getEntityFromIDB('filterStore');
                if (!_.isEqual(filterFromIDB, filters)) {
                    await saveEntityToIDB('filterStore', filters);
                }
            };
            syncData();
        }
    }, [dispatch, userId, filters]);

    useEffect(() => {
        if (savedFilter) {
            setFilters(savedFilter);
        }
    }, [savedFilter]);

    // Обработчик изменения видимости фильтра
    const handleFilterChange = useCallback((id: string) => {
        setFilters((prev) =>
            prev.map((filter) => (filter.id === id ? { ...filter, visible: !filter.visible } : filter))
        );
    }, []);

    // Обработчик сохранения фильтров
    const handleSaveFilter = useCallback(() => {
        if (userId) {
            dispatch(saveFilterAsync({ userId, filters }));
        }
    }, [dispatch, userId, filters]);

    // Обработчик сброса фильтров
    const handleResetFilter = useCallback(() => {
        if (userId) {
            dispatch(resetFilterAsync(userId));
        }
    }, [dispatch, userId]);

    // Обработчик завершения перетаскивания
    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) return;

            const items = Array.from(filters);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0, reorderedItem);

            setFilters(items);
        },
        [filters]
    );

    return (
        <div
            className={style.filter}
            style={{ color: colorText }}
        >
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
                                                style={getItemStyleMemoized(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
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

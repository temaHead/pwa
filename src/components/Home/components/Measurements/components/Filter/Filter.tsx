import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Checkbox, FormControlLabel } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check'; // Иконка "Применить"
import DeleteIcon from '@mui/icons-material/Delete'; // Иконка "Сбросить"
import style from './Filter.module.scss';
import { AppDispatch, RootState } from '../../../../../../store';
import {
    fetchFilterAsync,
    resetFilterAsync,
    saveFilterAsync,
} from '../../../../../../store/slices/filterSlice';
import CollapsibleSection from '../../../../../../shared/components/CollapsibleSection/CollapsibleSection';

const Filter: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.id);
    const savedFilter = useSelector((state: RootState) => state.filter);

    const [filters, setFilters] = useState({
        showFat: true,
        showWeight: true,
        showBody: true,
    });

    // Загружаем фильтр при монтировании компонента
    useEffect(() => {
        if (userId) {
            dispatch(fetchFilterAsync(userId));
        }
    }, [dispatch, userId]);

    // Применяем сохраненный фильтр
    useEffect(() => {
        if (savedFilter) {
            setFilters(savedFilter);
        }
    }, [savedFilter]);

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setFilters((prev) => ({
            ...prev,
            [name]: checked,
        }));
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

    return (
        <div className={style.filter}>
            <CollapsibleSection title='Фильтр'>
                <div className={style.filterContent}>
                    <div className={style.filterOptions}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='showFat'
                                    checked={filters.showFat}
                                    onChange={handleFilterChange}
                                />
                            }
                            label='Показать жировые измерения'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='showWeight'
                                    checked={filters.showWeight}
                                    onChange={handleFilterChange}
                                />
                            }
                            label='Показать измерения веса'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='showBody'
                                    checked={filters.showBody}
                                    onChange={handleFilterChange}
                                />
                            }
                            label='Показать измерения лентой'
                        />
                    </div>
                    <div className={style.filterButtons}>
                        <Button
                            variant='contained'
                            className={style.applyButton}
                            onClick={handleSaveFilter}
                            startIcon={<CheckIcon />} // Иконка "Применить"
                        >
                            Применить
                        </Button>
                        <Button
                            variant='contained'
                            className={style.resetButton}
                            onClick={handleResetFilter}
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

export default Filter;

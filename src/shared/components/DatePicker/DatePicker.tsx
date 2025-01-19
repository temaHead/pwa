import  { ChangeEvent } from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import style from './DatePicker.module.scss';

function DatePicker({
    name,
    value,
    onChange,
    placeholder,
}: {
    name: string;
    value: string | null;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    label: string;
    placeholder?: string
}) {
    // Преобразование значения в формат Day.js для работы с MUI DatePicker
    const dateValue = value ? dayjs(value) : null;

    return (
        <div className={style.datePicker}>
                <MuiDatePicker
                    label={placeholder}
                    value={dateValue}
                    onChange={(newValue: Dayjs | null) => {
                        onChange({
                            target: {
                                name,
                                value: newValue ? newValue.format('YYYY-MM-DD') : '',
                            },
                        } as ChangeEvent<HTMLInputElement>);
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            variant: 'outlined',
                        },
                    }}
                />
        </div>
    );
}

export default DatePicker;

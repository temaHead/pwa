import  { ChangeEvent } from 'react';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers';
import { Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import style from './DatePicker.module.scss';




// Функция для вычисления возраста по дате рождения
const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth();
    if (month < birth.getMonth() || (month === birth.getMonth() && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

function DatePicker({
    name,
    value,
    isEditing,
    onChange,
    label,
    placeholder,
}: {
    name: string;
    value: string | null;
    isEditing: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    label: string;
    placeholder?: string
}) {
    // Преобразование значения в формат Day.js для работы с MUI DatePicker
    const dateValue = value ? dayjs(value) : null;

    return (
        <div className={style.datePicker}>
            {isEditing ? (
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
            ) : (
                <Typography variant="body1">
                    <strong>{label}:</strong>{' '}
                    {value ? `${calculateAge(value)} лет` : 'Не указана'}
                </Typography>
            )}
        </div>
    );
}

export default DatePicker;

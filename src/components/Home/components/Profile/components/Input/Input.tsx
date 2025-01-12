import { TextField, Typography } from '@mui/material';
import { ChangeEvent } from 'react';
import style from './Input.module.scss';


interface InputProps {
    name: string;
    value: string | number | null;
    isEditing: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: string;
    postValue?: string | number | null;
    type?: string;
}

const Input = ({
    name,
    value,
    isEditing,
    onChange,
    label,
    type = 'text',
    postValue = '',
}: InputProps) => (
    <div className={style.input}>
        {isEditing ? (
            <TextField
                variant="outlined"
                fullWidth
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                label={label}
                InputLabelProps={{ shrink: true }}
            />
        ) : (
            <Typography variant="body1">
                <strong>{label}:</strong> {value ? `${value} ${postValue}` : 'Не указано'}
            </Typography>
        )}
    </div>
);

export default Input;

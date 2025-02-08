import { TextField, TextFieldVariants, Typography } from '@mui/material';
import { ChangeEvent } from 'react';
import style from './Input.module.scss';

interface InputProps {
    name: string;
    value: string | number | null;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
    postValue?: string | number | null;
    type?: string;
    variant?: TextFieldVariants | undefined;
    error?: string;
}

const Input = ({ name, value, onChange, label, type, placeholder, variant, error }: InputProps) => (
    <div className={style.input}>
        <TextField
            variant={variant || 'outlined'}
            fullWidth
            type={type || 'text'}
            name={name}
            value={value || ''}
            onChange={onChange}
            label={label}
            InputLabelProps={{ shrink: true }}
            placeholder={placeholder}
            error={!!error}
        />
        {error && (
            <Typography
                variant='caption'
                color='error'
                className={style.errorText}
            >
                {error}
            </Typography>
        )}
    </div>
);

export default Input;

import { TextField, TextFieldVariants } from '@mui/material';
import { ChangeEvent } from 'react';
import style from './Input.module.scss';


interface InputProps {
    name: string;
    value: string | number | null;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string
    postValue?: string | number | null;
    type?: string;
    variant?: TextFieldVariants | undefined
}

const Input = ({
    name,
    value,
    onChange,
    label,
    type = 'text',
    placeholder,
    variant
}: InputProps) => (
    <div className={style.input}>
            <TextField
                variant={variant || 'outlined'}
                fullWidth
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                label={label}
                InputLabelProps={{ shrink: true }}
                placeholder={placeholder}
            />
    </div>
);

export default Input;

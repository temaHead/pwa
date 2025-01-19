import { TextField } from '@mui/material';
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
}

const Input = ({
    name,
    value,
    onChange,
    label,
    type = 'text',
    placeholder
}: InputProps) => (
    <div className={style.input}>
            <TextField
                variant="outlined"
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

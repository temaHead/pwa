import { ChangeEvent } from 'react';
import { Select, MenuItem, Typography, FormControl, InputLabel } from '@mui/material';
import style from './Selector.module.scss';

function Selector({
    name,
    value,
    isEditing,
    onChange,
    label,
    options,
}: {
    name: string;
    value: string | number | null;
    isEditing: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    label: string;
    options: { value: string; label: string }[];
}) {
    return (
        <div className={style.selector}>
            {isEditing ? (
                <FormControl
                    fullWidth
                    variant='outlined'
                >
                    <InputLabel id={`${name}-label`}>{label}</InputLabel>
                    <Select
                        labelId={`${name}-label`}
                        name={name}
                        value={value || ''}
                        onChange={(e) => {
                            onChange({
                                target: { name, value: e.target.value },
                            } as ChangeEvent<HTMLInputElement>);
                        }}
                        label={label}
                    >
                        {options.map((option) => (
                            <MenuItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <Typography variant='body1'>
                    <strong>{label}:</strong> {value || 'Не указан'}
                </Typography>
            )}
        </div>
    );
}

export default Selector;

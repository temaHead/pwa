import React from 'react';
import style from './LoadingSpinner.module.scss'; // Подключаем стили

const LoadingSpinner: React.FC = () => {
    return (
        <div className={style.spinnerContainer}>
            <div className={style.spinner}></div>
        </div>
    );
};

export default LoadingSpinner;
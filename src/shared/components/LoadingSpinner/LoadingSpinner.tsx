import React from 'react';
import style from './LoadingSpinner.module.scss'; // Подключаем стили
import { theme } from 'antd';

const LoadingSpinner: React.FC = () => {
    const { token } = theme.useToken();
    const backgroundColor = token.colorBgLayout;
    return (
        <div className={style.spinnerContainer} style={{ backgroundColor }}>
            <div className={style.spinner}></div>
        </div>
    );
};

export default LoadingSpinner;

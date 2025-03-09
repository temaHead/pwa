import React from 'react';
import style from './EmptyGoal.module.scss';
import { theme } from 'antd';

function EmptyGoal() {
    const { token } = theme.useToken(); // Получаем цвета текущей темы
    const textColor = token.colorTextBase;
    const backgroundColor = token.colorBgContainer;
    return (
        <div
            className={style.emptyGoal}
            style={{ backgroundColor, color: textColor }}
        >
            <div className={style.body}>
                <div className={style.title}>У вас нет активных целей</div>
                <div className={style.text}>
                    Пожалуйста, создайте новую, чтобы начать отслеживать прогресс.
                </div>
            </div>
        </div>
    );
}

export default React.memo(EmptyGoal);

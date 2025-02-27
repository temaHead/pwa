import { theme } from 'antd';
import style from './Desktop.module.scss';
import { Outlet } from "react-router-dom";


function Desktop() {
  const { token } = theme.useToken(); // Получаем цвета текущей темы
  const backgroundColor = token.colorBgLayout; 
  return <div className={style.desktop} style={{ backgroundColor }}>
    <Outlet />
  </div>;
}

export default Desktop;

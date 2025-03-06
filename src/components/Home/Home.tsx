import { Outlet } from 'react-router-dom';
import style from './Home.module.scss';
import NavBar from './components/NavBar/NavBar';
import { theme } from 'antd';
const Home = () => {
        const { token } = theme.useToken(); // Получаем цвета текущей темы
        const backgroundColor = token.colorBgLayout; // Автоматически подстраивается
    return (
        <div className={style.homePage} style={{ backgroundColor }}>
            <Outlet />
            <NavBar />
        </div>
    );
};

export default Home;

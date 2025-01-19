import { Outlet } from 'react-router-dom';
import style from './Home.module.scss';
import NavBar from './components/NavBar/NavBar';
const Home = () => {
    return (
        <div className={style.homePage}>
            <Outlet />
            <NavBar />
        </div>
    );
};

export default Home;

import style from './NavBar.module.scss';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <div className={style.navBar}>
            <Link to='/room'>
                <div className={style.page}>Личный кабинет</div>
            </Link>
            <Link to='/measurements'>
                <div className={style.page}>Мои замеры</div>
            </Link>
            <Link to='/profile'>
                <div className={style.page}>Профиль</div>
            </Link>
        </div>
    );
}

export default NavBar;

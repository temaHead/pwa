// src/components/Auth.js
import { Link } from 'react-router-dom';
import style from "./Start.module.scss";
import icon from '../../../public/icon512_rounded.png';


const Start = () => {
    return (
        <div className={style.startPage}>
            <div className={style.iconApp}>
                <img className={style.icon} src={icon} alt="iconApp"/>
            </div>
            <div className={style.nameApp}>Мой дневник</div>
            <div className={style.buttonWrapper}>
                <Link
                className={style.button}
                to='/SignIn'
            >
                <div className={style.buttonTitle}>Войти</div>
            </Link>
            </div>
        </div>
    );
};

export default Start;

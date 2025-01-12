import style from './Header.module.scss';
import icon from '../../../../../public/icon512_maskable.png';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

function Header() {
    const {name}=useSelector((state: RootState) => state.user);
    return <div className={style.header}>
        <div className={style.iconWrapper}>
            <img src={icon} alt="icon" />
        </div>
        <div className={style.name}>{name}</div>
    </div>;
}

export default Header;

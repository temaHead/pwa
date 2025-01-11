import React from 'react';
import style from './Header.module.scss';
import icon from '../../../../../public/icon512_maskable.png';



type HeaderProps = {
    name: string;
};

function Header(props: HeaderProps) {
    const { name } = props;
    return <div className={style.header}>
        <div className={style.iconWrapper}>
            <img src={icon} alt="icon" />
        </div>
        <div className={style.name}>{name}</div>
    </div>;
}

export default Header;

import React from "react";
import style from './Desktop.module.scss';
import { Outlet } from "react-router-dom";


function Desktop() {
  return <div className={style.desktop}>
    <Outlet />
  </div>;
}

export default Desktop;


import Block1 from './components/Block1/Block1';
import Block2 from './components/Block2/Block2';
import Block3 from './components/Block3/Block3';
import style from './Room.module.scss';

function Room() {
  return <div className={style.room}>
    <Block1 />
    <Block2 />
    <Block3 />
  </div>;
}

export default Room;

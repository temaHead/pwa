import style from './Goal.module.scss';

const status = ['active', 'done'];

function Goal() {
    return (
        <div className={style.goal}>
            <div className={style.circle}>
                <div className={`${style.statusLine} ${style[status[0]]}`}>
                    <div className={style.content}>
                        <div className={style.title}>
                            похудеть
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Goal;
import { Goal } from "../../../../../../../../../../types";
import style from "./CurrentGoalFat.module.scss";

interface CurrentGoalFatProps {
  goal: Goal;
  bodyFat: number;
}

function CurrentGoalFat( props: CurrentGoalFatProps) {  
  const { goal, bodyFat } = props;
  

  const initialFat =  Number(goal.initialFat) // 45
  const targetFat = Number( goal.desiredFat) // 55

  // Рассчитываем прогресс в процентах
  const totalDifference = Math.abs(targetFat - initialFat);
  const currentDifference = Math.abs(bodyFat - initialFat);
  const progress = (currentDifference / totalDifference) * 100;

  return (
    <div className={style.goalFat}>
    <div className={style.title}>Прогресс цели</div>
    <div className={style.progress}>
        <div className={style.initialFat}>{initialFat} %</div>
        <progress
            value={progress}
            max='100'
            className={style.progressBar}
        />
        <div className={style.targetFat}>{targetFat} %</div>
    </div>
    <div className={style.currentFat}>
        <div className={style.title}>Текущий % жира:</div>
        <div className={style.value}>{bodyFat}%</div>
    </div>
</div>
  );
}

export default CurrentGoalFat;